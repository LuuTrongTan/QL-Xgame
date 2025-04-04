import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ListItemAvatar,
  Avatar,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TaskIcon from "@mui/icons-material/Task";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import {
  getSprintById,
  deleteSprint,
  removeTaskFromSprint,
  getProjectById,
  getSprintMembers,
  addMemberToSprint,
  removeMemberFromSprint,
  getAvailableUsersForSprint,
} from "../../api/sprintApi";
import SprintFormDialog from "../../components/sprints/SprintFormDialog";
import TaskSelectionDialog from "../../components/sprints/TaskSelectionDialog";
import { useSnackbar } from "notistack";
import BackButton from "../../components/common/BackButton";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import ActionButtons from "../../components/common/ActionButtons";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getStatusColor = (status) => {
  switch (status) {
    case "planning":
      return "info";
    case "active":
      return "success";
    case "completed":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "planning":
      return "Lên kế hoạch";
    case "active":
      return "Đang thực hiện";
    case "completed":
      return "Hoàn thành";
    default:
      return status;
  }
};

const getTaskStatusIcon = (status) => {
  switch (status) {
    case "todo":
      return <PendingIcon color="info" />;
    case "in_progress":
      return <AccessTimeIcon color="warning" />;
    case "done":
      return <CheckCircleIcon color="success" />;
    default:
      return <TaskIcon />;
  }
};

const getTaskStatusText = (status) => {
  switch (status) {
    case "todo":
      return "Cần làm";
    case "in_progress":
      return "Đang làm";
    case "done":
      return "Hoàn thành";
    default:
      return status;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "error";
    default:
      return "default";
  }
};

const getPriorityText = (priority) => {
  switch (priority) {
    case "low":
      return "Thấp";
    case "medium":
      return "Trung bình";
    case "high":
      return "Cao";
    default:
      return priority;
  }
};

const SprintDetail = () => {
  const { projectId, sprintId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false);
  const [openRemoveTaskDialog, setOpenRemoveTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const { user } = useAuth();
  const {
    canEditSprint,
    canDeleteSprint,
    canManageSprintMembers,
    canViewSprint,
  } = usePermissions();
  const [debugMode, setDebugMode] = useState(false);

  // Thêm state quản lý thành viên
  const [sprintMembers, setSprintMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchSprintDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy thông tin project trước
        const projectResponse = await getProjectById(projectId);
        if (!projectResponse.success) {
          throw new Error(
            projectResponse.message || "Không thể tải thông tin dự án"
          );
        }

        // Lấy thông tin sprint
        const response = await getSprintById(projectId, sprintId);
        console.log("Dữ liệu sprint nhận từ API:", response.data);

        if (!response.success || !response.data) {
          throw new Error(response.message || "Không thể tải thông tin sprint");
        }

        // Kiểm tra quyền truy cập sử dụng usePermissions hook
        const hasViewPermission = canViewSprint(projectResponse.data);
        const isSprintMember = response.data.members?.some(
          (member) => member.user._id === user.id
        );

        if (!hasViewPermission && !isSprintMember) {
          enqueueSnackbar("Bạn không có quyền xem sprint này", {
            variant: "error",
          });
          navigate(`/projects/${projectId}/sprints`);
          return;
        }

        setSprint(response.data);
      } catch (err) {
        console.error("Error fetching sprint details:", err);
        setError(err.message || "Có lỗi xảy ra khi tải thông tin sprint");
      } finally {
        setLoading(false);
      }
    };

    fetchSprintDetails();
  }, [projectId, sprintId, refresh]);

  // Fetch danh sách thành viên của sprint
  const fetchSprintMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await getSprintMembers(projectId, sprintId);
      if (response.success) {
        setSprintMembers(response.data);
      } else {
        console.error("Lỗi khi lấy danh sách thành viên:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Mở dialog thêm thành viên
  const handleOpenAddMemberDialog = async () => {
    try {
      const response = await getAvailableUsersForSprint(projectId, sprintId);
      if (response.success) {
        setAvailableUsers(response.data);
        setOpenAddMemberDialog(true);
      } else {
        enqueueSnackbar(
          response.message || "Không thể lấy danh sách người dùng",
          { variant: "error" }
        );
      }
    } catch (error) {
      enqueueSnackbar("Không thể lấy danh sách người dùng", {
        variant: "error",
      });
    }
  };

  // Đóng dialog thêm thành viên
  const handleCloseAddMemberDialog = () => {
    setOpenAddMemberDialog(false);
    setSelectedUser(null);
  };

  // Thêm thành viên vào sprint
  const handleAddMember = async () => {
    if (!selectedUser) {
      enqueueSnackbar("Vui lòng chọn người dùng", { variant: "warning" });
      return;
    }

    try {
      const response = await addMemberToSprint(
        projectId,
        sprintId,
        selectedUser._id
      );
      if (response.success) {
        enqueueSnackbar("Thêm thành viên thành công", { variant: "success" });
        setRefresh((prev) => prev + 1);
        handleCloseAddMemberDialog();
      } else {
        enqueueSnackbar(response.message || "Không thể thêm thành viên", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Không thể thêm thành viên", { variant: "error" });
    }
  };

  // Xóa thành viên khỏi sprint
  const handleRemoveMember = async (userId) => {
    try {
      const response = await removeMemberFromSprint(
        projectId,
        sprintId,
        userId
      );
      if (response.success) {
        enqueueSnackbar("Đã xóa thành viên khỏi sprint", {
          variant: "success",
        });
        setRefresh((prev) => prev + 1);
      } else {
        enqueueSnackbar(response.message || "Không thể xóa thành viên", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Không thể xóa thành viên", { variant: "error" });
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenAddTaskDialog = () => {
    setOpenAddTaskDialog(true);
  };

  const handleCloseAddTaskDialog = () => {
    setOpenAddTaskDialog(false);
  };

  const handleOpenRemoveTaskDialog = (task) => {
    setSelectedTask(task);
    setOpenRemoveTaskDialog(true);
  };

  const handleCloseRemoveTaskDialog = () => {
    setOpenRemoveTaskDialog(false);
    setSelectedTask(null);
  };

  const handleDeleteSprint = async () => {
    try {
      // Kiểm tra quyền xóa
      if (!canDeleteSprint(sprint?.project)) {
        enqueueSnackbar("Bạn không có quyền xóa sprint này", {
          variant: "error",
        });
        handleCloseDeleteDialog();
        return;
      }

      await deleteSprint(projectId, sprintId);
      enqueueSnackbar("Sprint đã được xóa thành công", { variant: "success" });
      navigate(`/projects/${projectId}/sprints`);
    } catch (error) {
      enqueueSnackbar(error.message || "Không thể xóa sprint", {
        variant: "error",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleRemoveTask = async () => {
    if (!selectedTask) return;

    try {
      await removeTaskFromSprint(projectId, sprintId, selectedTask._id);
      enqueueSnackbar("Task đã được gỡ khỏi sprint thành công", {
        variant: "success",
      });
      setRefresh((prev) => prev + 1);
    } catch (error) {
      enqueueSnackbar(error.message || "Không thể gỡ task khỏi sprint", {
        variant: "error",
      });
    } finally {
      handleCloseRemoveTaskDialog();
    }
  };

  const handleFormSuccess = () => {
    setRefresh((prev) => prev + 1);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  const goBack = () => {
    navigate(`/projects/${projectId}/sprints`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <BackButton
          label="Quay lại danh sách sprint"
          onClick={goBack}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  if (!sprint) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Không tìm thấy thông tin sprint</Alert>
        <BackButton
          label="Quay lại danh sách sprint"
          onClick={goBack}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <BackButton label="Quay lại" onClick={goBack} />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {sprint.name}
        </Typography>
        <ActionButtons
          canEdit={canEditSprint(sprint?.project)}
          canDelete={canDeleteSprint(sprint?.project)}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
          editTooltip="Bạn không có quyền chỉnh sửa sprint này"
          deleteTooltip="Bạn không có quyền xóa sprint này"
          useIcons={false}
          variant="outlined"
        />
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Mô tả
            </Typography>
            <Typography variant="body1" paragraph>
              {sprint.description}
            </Typography>

            {sprint.goal && (
              <>
                <Typography variant="h6" gutterBottom>
                  Mục tiêu
                </Typography>
                <Typography variant="body1" paragraph>
                  {sprint.goal}
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin Sprint
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getStatusLabel(sprint.status)}
                      color={getStatusColor(sprint.status)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Thời gian
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(sprint.startDate)} -{" "}
                      {formatDate(sprint.endDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng task
                    </Typography>
                    <Typography variant="body1">
                      {sprint.tasks ? sprint.tasks.length : 0} nhiệm vụ
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Phần Thành viên Sprint */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Thành viên Sprint</Typography>
        {canManageSprintMembers(sprint) && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddMemberDialog}
          >
            Thêm thành viên
          </Button>
        )}
      </Box>

      {loadingMembers ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : sprintMembers && sprintMembers.length > 0 ? (
        <Card sx={{ mb: 4 }}>
          <List>
            {sprintMembers.map((member) => (
              <ListItem
                key={member.user._id}
                secondaryAction={
                  canManageSprintMembers(sprint) && (
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveMember(member.user._id)}
                      size="small"
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar alt={member.user.name} src={member.user.avatar}>
                    {member.user.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.user.name}
                  secondary={member.user.email}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      ) : (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" align="center">
              Chưa có thành viên nào trong sprint này. Hãy thêm thành viên!
            </Typography>
          </CardContent>
        </Card>
      )}

      {sprint && (
        <SprintFormDialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          projectId={projectId}
          onSuccess={handleFormSuccess}
          sprint={sprint}
          isEditing
          disabled={!canEditSprint(sprint?.project)}
        />
      )}

      {/* Dialog thêm thành viên */}
      <Dialog open={openAddMemberDialog} onClose={handleCloseAddMemberDialog}>
        <DialogTitle>Thêm thành viên vào Sprint</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableUsers || []}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={selectedUser}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Thành viên"
                fullWidth
                margin="normal"
              />
            )}
            sx={{ minWidth: 300, mt: 1 }}
          />
          <Typography variant="caption" color="textSecondary">
            Nếu người dùng chưa thuộc dự án, họ sẽ tự động được thêm vào dự án.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddMemberDialog}>Hủy</Button>
          <Button
            onClick={handleAddMember}
            color="primary"
            variant="contained"
            disabled={!selectedUser}
          >
            Thêm thành viên
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xóa Sprint</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sprint "{sprint?.name}"? Tất cả các nhiệm
            vụ sẽ được gỡ khỏi sprint này, nhưng không bị xóa. Hành động này
            không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            onClick={handleDeleteSprint}
            color="error"
            disabled={!canDeleteSprint(sprint?.project)}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SprintDetail;
