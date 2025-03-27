import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Divider,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSnackbar } from "notistack";
import { getProjectById } from "../../api/projectApi";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../../api/sprintApi";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

// Component chính
const ProjectSprints = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const { canEditProject, canDeleteProject } = usePermissions();

  const [sprints, setSprints] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "planning",
    goal: "",
  });

  // Tải dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin dự án
        const projectResult = await getProjectById(projectId);
        if (projectResult.success) {
          setProject(projectResult.data);
        } else {
          setError(projectResult.message);
          return;
        }

        // Lấy danh sách sprint
        const sprintsResult = await getSprints(projectId);
        if (sprintsResult.success) {
          setSprints(sprintsResult.data || []);
        } else {
          setError(sprintsResult.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "planning",
      goal: "",
    });
  };

  // Mở dialog tạo sprint
  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  // Đóng dialog tạo sprint
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  // Mở dialog edit sprint
  const handleOpenEditDialog = (sprint) => {
    setSelectedSprint(sprint);
    setFormData({
      name: sprint.name,
      description: sprint.description,
      startDate: format(new Date(sprint.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(sprint.endDate), "yyyy-MM-dd"),
      status: sprint.status,
      goal: sprint.goal || "",
    });
    setOpenEditDialog(true);
  };

  // Đóng dialog edit sprint
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedSprint(null);
    resetForm();
  };

  // Mở dialog xác nhận xóa
  const handleOpenDeleteDialog = (sprint) => {
    setSelectedSprint(sprint);
    setOpenDeleteDialog(true);
  };

  // Đóng dialog xác nhận xóa
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSprint(null);
  };

  // Validate form
  const validateForm = () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.startDate ||
      !formData.endDate
    ) {
      enqueueSnackbar("Vui lòng điền đầy đủ thông tin", { variant: "error" });
      return false;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      enqueueSnackbar("Ngày kết thúc phải sau ngày bắt đầu", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  // Tạo sprint mới
  const handleCreateSprint = async () => {
    try {
      if (!validateForm()) return;

      const sprintData = { ...formData };

      const result = await createSprint(projectId, sprintData);

      if (result.success) {
        enqueueSnackbar("Sprint đã được tạo thành công", {
          variant: "success",
        });
        setSprints((prev) => [...prev, result.data]);
        handleCloseCreateDialog();
      } else {
        // Hiển thị thông báo lỗi
        if (result.errors && result.errors.length > 0) {
          // Nếu có danh sách lỗi chi tiết, hiển thị từng lỗi
          result.errors.forEach((error) => {
            enqueueSnackbar(error, { variant: "error" });
          });
        } else {
          // Hiển thị thông báo lỗi chung
          enqueueSnackbar(result.message || "Không thể tạo sprint", {
            variant: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error creating sprint:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi tạo sprint", { variant: "error" });
    }
  };

  // Cập nhật sprint
  const handleUpdateSprint = async () => {
    try {
      if (!validateForm()) return;

      const result = await updateSprint(
        projectId,
        selectedSprint._id,
        formData
      );

      if (result.success) {
        enqueueSnackbar("Sprint đã được cập nhật thành công", {
          variant: "success",
        });
        setSprints((prev) =>
          prev.map((s) =>
            s._id === selectedSprint._id ? { ...s, ...formData } : s
          )
        );
        handleCloseEditDialog();
      } else {
        enqueueSnackbar(result.message || "Không thể cập nhật sprint", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error updating sprint:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi cập nhật sprint", {
        variant: "error",
      });
    }
  };

  // Xóa sprint
  const handleDeleteSprint = async () => {
    try {
      const result = await deleteSprint(projectId, selectedSprint._id);

      if (result.success) {
        enqueueSnackbar("Sprint đã được xóa thành công", {
          variant: "success",
        });
        setSprints((prev) => prev.filter((s) => s._id !== selectedSprint._id));
        handleCloseDeleteDialog();
      } else {
        enqueueSnackbar(result.message || "Không thể xóa sprint", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting sprint:", error);
      enqueueSnackbar("Đã xảy ra lỗi khi xóa sprint", { variant: "error" });
    }
  };

  // Xem danh sách task trong sprint
  const handleViewSprintTasks = (sprintId) => {
    navigate(`/projects/${projectId}/sprints/${sprintId}/tasks`);
  };

  // Helper để định dạng ngày
  const formatDate = (date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: vi });
  };

  // Helper để lấy màu chip trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "planning":
        return { bg: "#e3f2fd", color: "#1976d2" };
      case "active":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      case "completed":
        return { bg: "#ede7f6", color: "#5e35b1" };
      default:
        return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  // Helper để lấy label trạng thái
  const getStatusLabel = (status) => {
    switch (status) {
      case "planning":
        return "Lên kế hoạch";
      case "active":
        return "Đang hoạt động";
      case "completed":
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" ml={1}>
            Sprint - {project?.name}
          </Typography>
        </Box>
        {canEditProject(project) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Tạo Sprint mới
          </Button>
        )}
      </Box>

      {/* Danh sách Sprint */}
      {sprints.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            Dự án chưa có sprint nào
          </Typography>
          {canEditProject(project) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Tạo Sprint đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sprints.map((sprint) => (
            <Grid item xs={12} md={6} lg={4} key={sprint._id}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleViewSprintTasks(sprint._id)}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography variant="h6" gutterBottom>
                      {sprint.name}
                    </Typography>
                    <Box>
                      <Chip
                        label={getStatusLabel(sprint.status)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(sprint.status).bg,
                          color: getStatusColor(sprint.status).color,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "60px",
                    }}
                  >
                    {sprint.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarIcon
                      fontSize="small"
                      color="action"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(sprint.startDate)} -{" "}
                      {formatDate(sprint.endDate)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box mb={1.5}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={0.5}
                    >
                      <Typography variant="body2">Tiến độ công việc</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {sprint.taskCount?.completed || 0}/
                        {sprint.taskCount?.total || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        sprint.taskCount?.total
                          ? (sprint.taskCount.completed /
                              sprint.taskCount.total) *
                            100
                          : 0
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  <Box display="flex" justifyContent="flex-end">
                    {canEditProject(project) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(sprint);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}

                    {canDeleteProject(project) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(sprint);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog tạo Sprint mới */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo Sprint mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tên Sprint"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="description"
            label="Mô tả"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="startDate"
                label="Ngày bắt đầu"
                type="date"
                fullWidth
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="endDate"
                label="Ngày kết thúc"
                type="date"
                fullWidth
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              <MenuItem value="planning">Lên kế hoạch</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            name="goal"
            label="Mục tiêu Sprint"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={formData.goal}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Hủy</Button>
          <Button
            onClick={handleCreateSprint}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.description ||
              !formData.startDate ||
              !formData.endDate
            }
          >
            Tạo Sprint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog edit Sprint */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Sprint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tên Sprint"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="description"
            label="Mô tả"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="startDate"
                label="Ngày bắt đầu"
                type="date"
                fullWidth
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="endDate"
                label="Ngày kết thúc"
                type="date"
                fullWidth
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              <MenuItem value="planning">Lên kế hoạch</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            name="goal"
            label="Mục tiêu Sprint"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={formData.goal}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button
            onClick={handleUpdateSprint}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.description ||
              !formData.startDate ||
              !formData.endDate
            }
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa Sprint</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sprint "{selectedSprint?.name}"?
          </Typography>
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Lưu ý: Hành động này sẽ gỡ tất cả các công việc khỏi sprint này.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            onClick={handleDeleteSprint}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectSprints;
