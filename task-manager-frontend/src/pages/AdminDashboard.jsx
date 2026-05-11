import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Pagination,
} from "@mui/material";
import API_URL from "../config/api";
import StatusChip from "../components/StatusChip";
import { clearAuthSession, getAuthToken, getAuthUser } from "../utils/authSession";

function AdminDashboard() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [employeeIds, setEmployeeIds] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editEmployeeIds, setEditEmployeeIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const [page, setPage] = useState(1);
  const tasksPerPage = 5;

  const token = getAuthToken();
  const user = getAuthUser();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/profile/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesEmployee =
        employeeFilter === "all" ||
        task.users?.some((user) => user.id === Number(employeeFilter));

      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [tasks, searchTerm, statusFilter, employeeFilter]);

  const pageCount = Math.ceil(filteredTasks.length / tasksPerPage);

  const paginatedTasks = useMemo(() => {
    const startIndex = (page - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;

    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, page]);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setEmployeeIds([]);
      setShowCreateForm(false);

      setSuccess("Task created successfully.");
      setError("");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      setError("Failed to create task.");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await axios.put(
        `${API_URL}/tasks/${editingTaskId}`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      setEditingTaskId(null);
      setEditTitle("");
      setEditDescription("");
      setEditStatus("pending");
      setEditEmployeeIds([]);

      setSuccess("Task updated successfully.");
      setError("");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      setError("Failed to update task.");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    onSuccess: () => {
      setSuccess("Task deleted successfully.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      setError("Failed to delete task.");
    },
  });

  const createTask = (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!status) {
      setError("Status is required.");
      return;
    }

    if (employeeIds.length === 0) {
      setError("Please assign at least one employee.");
      return;
    }

    createTaskMutation.mutate({
      title,
      description,
      status,
      user_ids: employeeIds.map(Number),
    });
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const employeeUsers = response.data.filter((user) =>
        user.roles?.some((role) => role.name === "employee"),
      );

      setEmployees(employeeUsers);
    } catch {
      setError("Failed to load employees.");
    }
  };

  const handleLogout = async () => {
    const token = getAuthToken();

    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch {
      console.log("Backend logout failed, clearing local session.");
    } finally {
      clearAuthSession();
      navigate("/login");
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditEmployeeIds(task.users?.map((user) => user.id) || []);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("pending");
    setEditEmployeeIds([]);
  };

  const saveEditTask = (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (!editTitle.trim()) {
      setError("Title is required.");
      return;
    }

    if (!editStatus) {
      setError("Status is required.");
      return;
    }

    if (editEmployeeIds.length === 0) {
      setError("Please assign at least one employee.");
      return;
    }

    updateTaskMutation.mutate({
      title: editTitle,
      description: editDescription,
      status: editStatus,
      user_ids: editEmployeeIds.map(Number),
    });
  };

  const deleteTask = (taskId) => {
    const confirmed = window.confirm("Delete this task?");

    if (!confirmed) return;

    setError("");
    setSuccess("");
    deleteTaskMutation.mutate(taskId);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, employeeFilter]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", p: 4 }}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={profile?.photo_url || user?.photo_url}
            sx={{ width: 56, height: 56 }}
          />

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome, {user?.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate("/profile")}>
            Profile
          </Button>

          <Button variant="outlined" onClick={() => navigate("/admin/users")}>
            Manage Users
          </Button>

          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
          {success}
        </Alert>
      )}

      {tasksLoading && (
        <Alert severity="info" sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
          Loading tasks...
        </Alert>
      )}

      {tasksError && (
        <Alert severity="error" sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
          Failed to load tasks.
        </Alert>
      )}

      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary">Total Tasks</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.total}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Pending Tasks</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.pending}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">In Progress Tasks</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.inProgress}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Completed Tasks</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.completed}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Hide Create Task Form" : "Show Create Task Form"}
        </Button>
      </Box>

      {showCreateForm && (
        <Card sx={{ maxWidth: 1000, mx: "auto", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create Task
            </Typography>

            <Box component="form" onSubmit={createTask}>
              <TextField
                fullWidth
                label="Title"
                margin="normal"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <TextField
                fullWidth
                label="Description"
                margin="normal"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Assign Employees</InputLabel>
                <Select
                  multiple
                  value={employeeIds}
                  label="Assign Employees"
                  onChange={(event) => setEmployeeIds(event.target.value)}
                  renderValue={(selected) =>
                    employees
                      .filter((employee) => selected.includes(employee.id))
                      .map((employee) => employee.name)
                      .join(", ")
                  }
                >
                  {employees.length === 0 && (
                    <MenuItem disabled>No employees found</MenuItem>
                  )}

                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ maxWidth: 1000, mx: "auto", mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filter Tasks
          </Typography>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 2 }}
          >
            <TextField
              fullWidth
              label="Search by title"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={employeeFilter}
                label="Employee"
                onChange={(event) => setEmployeeFilter(event.target.value)}
              >
                <MenuItem value="all">All Employees</MenuItem>

                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            All Tasks
          </Typography>
        </Box>

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent>
              <Typography>No matching tasks found.</Typography>
            </CardContent>
          </Card>
        )}

        {paginatedTasks.map((task) => (
          <Card key={task.id} sx={{ mb: 2 }}>
            <CardContent
              sx={
                editingTaskId === task.id
                  ? undefined
                  : {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: {
                        xs: "flex-start",
                        md: "center",
                      },
                      gap: 2,
                      flexDirection: {
                        xs: "column",
                        md: "row",
                      },
                    }
              }
            >
              {editingTaskId === task.id ? (
                <Box component="form" onSubmit={saveEditTask}>
                  <TextField
                    fullWidth
                    label="Title"
                    margin="normal"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    margin="normal"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editStatus}
                      label="Status"
                      onChange={(event) => setEditStatus(event.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Assign Employees</InputLabel>
                    <Select
                      multiple
                      value={editEmployeeIds}
                      label="Assign Employees"
                      onChange={(event) =>
                        setEditEmployeeIds(event.target.value)
                      }
                      renderValue={(selected) =>
                        employees
                          .filter((employee) => selected.includes(employee.id))
                          .map((employee) => employee.name)
                          .join(", ")
                      }
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateTaskMutation.isPending}
                    >
                      {updateTaskMutation.isPending ? "Saving..." : "Save"}
                    </Button>

                    <Button variant="outlined" onClick={cancelEditTask}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6">{task.title}</Typography>

                    <Typography color="text.secondary">
                      {task.description || "No description"}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      Assigned to:{" "}
                      {task.users?.length
                        ? task.users.map((user) => user.name).join(", ")
                        : "No assigned user"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexShrink: 0,
                      alignSelf: {
                        xs: "stretch",
                        md: "center",
                      },
                      justifyContent: {
                        xs: "space-between",
                        md: "flex-end",
                      },
                    }}
                  >
                    <StatusChip status={task.status} />

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => startEditTask(task)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteTask(task.id)}
                        disabled={deleteTaskMutation.isPending}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length > tasksPerPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 3 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
