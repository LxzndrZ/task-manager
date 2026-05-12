import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Avatar,
  Pagination,
} from "@mui/material";
import API_URL from "../config/api";
import StatusChip from "../components/StatusChip";
import { clearAuthSession, getAuthToken, getAuthUser } from "../utils/authSession";

function EmployeeDashboard() {
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tasksPerPage = 5;

  const token = getAuthToken();
  const user = getAuthUser();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/profile`, {
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
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/my-tasks`, {
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

  const pageCount = Math.ceil(tasks.length / tasksPerPage);

  const paginatedTasks = useMemo(() => {
    const startIndex = (page - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;

    return tasks.slice(startIndex, endIndex);
  }, [tasks, page]);

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
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
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

      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Work
          </Typography>
          <Typography color="text.secondary">
            Tasks currently assigned to you.
          </Typography>
        </Box>

        {tasks.length === 0 && (
          <Card>
            <CardContent>
              <Typography>No assigned tasks yet.</Typography>
            </CardContent>
          </Card>
        )}

        {paginatedTasks.map((task) => (
          <Card key={task.id} sx={{ mb: 2 }}>
            <CardContent
              sx={{
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
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6">{task.title}</Typography>

                <Typography color="text.secondary">
                  {task.description || "No description"}
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

                {task.status === "pending" && (
                  <Button
                    variant="contained"
                    onClick={() => updateTaskStatus(task.id, "in_progress")}
                    disabled={updateTaskStatusMutation.isPending}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Start Task
                  </Button>
                )}

                {task.status === "in_progress" && (
                  <Button
                    variant="contained"
                    onClick={() => updateTaskStatus(task.id, "completed")}
                    disabled={updateTaskStatusMutation.isPending}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Complete Task
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}

        {tasks.length > tasksPerPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
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

export default EmployeeDashboard;
