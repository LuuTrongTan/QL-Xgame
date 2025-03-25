/**
 * Sidebar Component - Thanh điều hướng bên trái của ứng dụng
 * Hiển thị menu điều hướng và các tùy chọn
 */

import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  Assignment as ProjectIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  ExpandMore,
  Star as StarIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

// Cấu hình kích thước cố định
const NAVBAR_HEIGHT = 64; // Chiều cao của navbar

/**
 * @param {Object} props - Component props
 * @param {boolean} props.mobileOpen - Trạng thái đóng/mở trên mobile
 * @param {boolean} props.desktopOpen - Trạng thái đóng/mở trên desktop
 * @param {Function} props.onDrawerToggle - Hàm xử lý đóng/mở
 * @param {number} props.width - Chiều rộng của sidebar
 */
const Sidebar = ({ mobileOpen, desktopOpen, onDrawerToggle, width }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Kiểm tra route hiện tại
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Nội dung của sidebar
  const drawer = (
    <Box sx={{ height: "100%" }}>
      <Toolbar /> {/* Khoảng trống cho navbar */}
      <Box sx={{ overflow: "auto" }}>
        <List>
          {/* Menu Home */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/dashboard");
                if (isMobile) onDrawerToggle();
              }}
              selected={isActive("/dashboard")}
              sx={{
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          {/* Menu Projects */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/projects");
                if (isMobile) onDrawerToggle();
              }}
              selected={isActive("/projects")}
              sx={{
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon>
                <ProjectIcon />
              </ListItemIcon>
              <ListItemText primary="Dự án" />
            </ListItemButton>
          </ListItem>

          {/* Menu Tasks */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/calendar");
                if (isMobile) onDrawerToggle();
              }}
              selected={isActive("/calendar")}
              sx={{
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon>
                <CalendarIcon />
              </ListItemIcon>
              <ListItemText primary="Lịch" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, bgcolor: "rgba(255, 255, 255, 0.12)" }} />

          {/* Menu Reports */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/reports");
                if (isMobile) onDrawerToggle();
              }}
              selected={isActive("/reports")}
              sx={{
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon>
                <ReportIcon />
              </ListItemIcon>
              <ListItemText primary="Báo cáo" />
            </ListItemButton>
          </ListItem>

          {/* Menu Settings */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/settings");
                if (isMobile) onDrawerToggle();
              }}
              selected={isActive("/settings")}
              sx={{
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Cài đặt" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: width },
        flexShrink: { sm: 0 },
      }}
    >
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: width,
            backgroundColor: "#212121", // Professional dark gray
            color: "white",
            height: "100vh",
            position: "fixed",
            top: NAVBAR_HEIGHT,
            borderRight: "none",
            transition: "transform 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
            transform: desktopOpen ? "none" : `translateX(-${width}px)`,
            "& .MuiListItemButton-root": {
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              },
            },
            "& .MuiListItemIcon-root": {
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: width,
            backgroundColor: "#212121", // Professional dark gray
            color: "white",
            top: NAVBAR_HEIGHT,
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            "& .MuiListItemButton-root": {
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              },
            },
            "& .MuiListItemIcon-root": {
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
