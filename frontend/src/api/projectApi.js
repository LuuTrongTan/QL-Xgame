import API from "./api";
import axios from "axios";
import { getToken } from "../utils/auth";

// Lấy danh sách projects
export const getProjects = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.isArchived !== undefined)
      queryParams.append("isArchived", params.isArchived);

    const response = await API.get(`/projects?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết một project
export const getProjectById = async (projectId) => {
  try {
    const response = await API.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tạo project mới
export const createProject = async (projectData) => {
  try {
    const response = await API.post("/projects", projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật project
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await API.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Xóa project
export const deleteProject = async (projectId) => {
  try {
    const response = await API.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mời thành viên vào dự án qua email
export const inviteMember = async (projectId, email, role) => {
  try {
    const response = await API.post(`/projects/${projectId}/invite`, {
      email,
      role,
    });
    return response.data;
  } catch (error) {
    console.error("Error inviting member:", error);
    throw error;
  }
};

// Thêm thành viên trực tiếp vào dự án
export const addMember = async (projectId, email, role) => {
  try {
    const response = await API.post(`/projects/${projectId}/members`, {
      email,
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Xóa thành viên khỏi project
export const removeMember = async (projectId, memberId) => {
  try {
    const response = await API.delete(
      `/projects/${projectId}/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật role của thành viên trong project
export const updateMemberRole = async (projectId, memberId, role) => {
  try {
    const response = await API.put(
      `/projects/${projectId}/members/${memberId}`,
      { role }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get tasks for a specific project
export const getProjectTasks = async (projectId) => {
  try {
    const response = await API.get(`/tasks?project=${projectId}`);
    if (response && response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    throw error;
  }
};

// Create a new task for a project
export const createProjectTask = async (projectId, taskData) => {
  try {
    const response = await API.post("/tasks", {
      ...taskData,
      projectId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project task:", error);
    throw error;
  }
};

// Cập nhật task trong project
export const updateProjectTask = async (projectId, taskId, taskData) => {
  try {
    const response = await API.put(`/tasks/${taskId}`, {
      ...taskData,
      projectId,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Xóa task trong project
export const deleteProjectTask = async (projectId, taskId) => {
  try {
    const response = await API.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật trạng thái của task (di chuyển giữa các cột)
export const updateTaskStatus = async (projectId, taskId, status) => {
  try {
    const response = await API.patch(`/tasks/${taskId}/status`, {
      status,
      projectId,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// Lưu trữ dự án
export const archiveProject = async (projectId) => {
  try {
    const response = await API.post(`/projects/${projectId}/archive`);
    return response.data;
  } catch (error) {
    console.error("Error archiving project:", error);
    throw error;
  }
};

// Khôi phục dự án đã lưu trữ
export const restoreProject = async (projectId) => {
  try {
    const response = await API.post(`/projects/${projectId}/restore`);
    return response.data;
  } catch (error) {
    console.error("Error restoring project:", error);
    throw error;
  }
};
