import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Avatar,
} from '@mui/material';
import API_URL from '../config/api';
import StatusChip from './StatusChip';


function EmployeeDashboard() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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
    queryKey: ["my-tasks", user.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/my-tasks/${user.id}`, {
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
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      const response = await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks", user.id] });
    },
    onError: () => {
      setError("Failed to update task status.");
    },
  });

  const updateTaskStatus = (taskId, newStatus) => {
    setError("");

    updateTaskStatusMutation.mutate({
      taskId,
      newStatus,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
              Employee Dashboard
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

      {tasksLoading && (
        <Alert severity="info" sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
          Loading tasks...
        </Alert>
      )}

      {tasksError && (
        <Alert severity="error" sx={{ maxWidth: 1000, mx: "auto", mb: 2 }}>
          Failed to load assigned tasks.
        </Alert>
      )}

      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary">My Tasks</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.total}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Pending</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.pending}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Completed</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {taskStats.completed}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        {tasks.length === 0 && (
          <Card>
            <CardContent>
              <Typography>No assigned tasks yet.</Typography>
            </CardContent>
          </Card>
        )}

        {tasks.map((task) => (
          <Card key={task.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{task.title}</Typography>

              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {task.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <StatusChip status={task.status} />
              </Box>

              <Button
                variant="contained"
                onClick={() => updateTaskStatus(task.id, "completed")}
                disabled={
                  task.status === "completed" ||
                  updateTaskStatusMutation.isPending
                }
              >
                {task.status === "completed"
                  ? "Completed"
                  : "Mark as Completed"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default EmployeeDashboard;