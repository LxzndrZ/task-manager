import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
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
  Chip,
} from '@mui/material';

const API_URL = 'http://127.0.0.1:8000/api';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
  event.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    const { user, token } = response.data;
    const role = user.roles?.[0]?.name;

    const profileResponse = await axios.get(`${API_URL}/profile/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fullUser = {
      ...user,
      ...profileResponse.data,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(fullUser));
    localStorage.setItem('role', role);

    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  } catch {
    setError('Invalid email or password.');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f4f6f8',
      }}
    >
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            Login
          </Typography>

          <Typography sx={{ mb: 3, color: 'text.secondary' }}>
            Sign in to your task manager account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function Register() {
  return <h1>Register Page</h1>;
}

function StatusChip({ status }) {
  return (
    <Chip
      label={status === 'completed' ? 'Completed' : 'Pending'}
      color={status === 'completed' ? 'success' : 'warning'}
      size="small"
      sx={{ mt: 1 }}
    />
  );
}

function AdminDashboard() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [employeeIds, setEmployeeIds] = useState([2]);
  const [employees, setEmployees] = useState([]);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [editEmployeeIds, setEditEmployeeIds] = useState([]);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const { data: profile } = useQuery({
  queryKey: ['profile', user.id],
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
    queryKey: ['tasks'],
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
      pending: tasks.filter((task) => task.status === 'pending').length,
      completed: tasks.filter((task) => task.status === 'completed').length,
    };
  }, [tasks]);

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
  setTitle('');
  setDescription('');
  setStatus('pending');
  setEmployeeIds([2]);

  setSuccess('Task created successfully.');
  setError('');

  queryClient.invalidateQueries({ queryKey: ['tasks'] });
},
  onError: () => {
    setError('Failed to create task.');
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
      }
    );

    return response.data;
  },
  onSuccess: () => {
  setEditingTaskId(null);
  setEditTitle('');
  setEditDescription('');
  setEditStatus('pending');
  setEditEmployeeIds([]);

  setSuccess('Task updated successfully.');
  setError('');

  queryClient.invalidateQueries({ queryKey: ['tasks'] });
},
  onError: () => {
    setError('Failed to update task.');
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
    setSuccess('Task deleted successfully.');
    setError('');
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
  onError: () => {
    setError('Failed to delete task.');
  },
});
  
  const createTask = (event) => {
  event.preventDefault();
  setSuccess('');
  setError('');

  if (!title.trim()) {
    setError('Title is required.');
    return;
  }

  if (!status) {
    setError('Status is required.');
    return;
  }

  if (employeeIds.length === 0) {
    setError('Please assign at least one employee.');
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
      user.roles?.some((role) => role.name === 'employee')
    );

    setEmployees(employeeUsers);
  } catch {
    setError('Failed to load employees.');
  }
};

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const startEditTask = (task) => {
  setEditingTaskId(task.id);
  setEditTitle(task.title);
  setEditDescription(task.description || '');
  setEditStatus(task.status);
  setEditEmployeeIds(task.users?.map((user) => user.id) || []);
};

const cancelEditTask = () => {
  setEditingTaskId(null);
  setEditTitle('');
  setEditDescription('');
  setEditStatus('pending');
  setEditEmployeeIds([]);
};

const saveEditTask = (event) => {
  event.preventDefault();
  setSuccess('');
  setError('');

  if (!editTitle.trim()) {
    setError('Title is required.');
    return;
  }

  if (!editStatus) {
    setError('Status is required.');
    return;
  }

  if (editEmployeeIds.length === 0) {
    setError('Please assign at least one employee.');
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
  const confirmed = window.confirm('Delete this task?');

  if (!confirmed) return;

  setError('');
  setSuccess('');
  deleteTaskMutation.mutate(taskId);
};

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', p: 4 }}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

        <Box sx={{ display: 'flex', gap: 1 }}>
  <Button variant="outlined" onClick={() => navigate('/profile')}>
    Profile
  </Button>

  <Button variant="outlined" color="error" onClick={handleLogout}>
    Logout
  </Button>
</Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
  <Alert severity="success" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
    {success}
  </Alert>
)}

      {tasksLoading && (
  <Alert severity="info" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
    Loading tasks...
  </Alert>
)}

{tasksError && (
  <Alert severity="error" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
    Failed to load tasks.
  </Alert>
)}

      <Box
  sx={{
    maxWidth: 1000,
    mx: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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
      <Typography color="text.secondary">Completed Tasks</Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {taskStats.completed}
      </Typography>
    </CardContent>
  </Card>
</Box>


      <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3 }}>
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
    <MenuItem value="completed">Completed</MenuItem>
  </Select>
</FormControl>

        <FormControl fullWidth margin="normal">
    <InputLabel>Assign Employees</InputLabel>
    <Select
  multiple
  value={editEmployeeIds}
  label="Assign Employees"
  onChange={(event) => setEditEmployeeIds(event.target.value)}
  renderValue={(selected) =>
    employees
      .filter((employee) => selected.includes(employee.id))
      .map((employee) => employee.name)
      .join(', ')
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
  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
</Button>
    </Box>
  </CardContent>
</Card>


      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

        {tasks.length === 0 && (
  <Card>
    <CardContent>
      <Typography>No tasks available.</Typography>
    </CardContent>
  </Card>
)}

        {tasks.map((task) => (
          <Card key={task.id} sx={{ mb: 2 }}>
            <CardContent>
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
    <MenuItem value="completed">Completed</MenuItem>
  </Select>
</FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Assign Employees</InputLabel>
        <Select
          multiple
          value={editEmployeeIds}
          label="Assign Employees"
          onChange={(event) => setEditEmployeeIds(event.target.value)}
          renderValue={(selected) =>
            employees
              .filter((employee) => selected.includes(employee.id))
              .map((employee) => employee.name)
              .join(', ')
          }
        >
          {employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {employee.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={updateTaskMutation.isPending}
        >
          {updateTaskMutation.isPending ? 'Saving...' : 'Save'}
        </Button>

        <Button variant="outlined" onClick={cancelEditTask}>
          Cancel
        </Button>
      </Box>
    </Box>
  ) : (
    <>
      <Typography variant="h6">{task.title}</Typography>

      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {task.description}
      </Typography>

      <StatusChip status={task.status} />

      <Typography sx={{ mt: 1 }}>
        Assigned to:{' '}
        {task.users?.length
          ? task.users.map((user) => user.name).join(', ')
          : 'No assigned user'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button variant="outlined" onClick={() => startEditTask(task)}>
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
    </>
  )}
</CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  
}

function EmployeeDashboard() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const { data: profile } = useQuery({
  queryKey: ['profile', user.id],
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
      queryKey: ['my-tasks', user.id],
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
      pending: tasks.filter((task) => task.status === 'pending').length,
      completed: tasks.filter((task) => task.status === 'completed').length,
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
      }
    );

    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['my-tasks', user.id] });
  },
  onError: () => {
    setError('Failed to update task status.');
  },
});
  
  const updateTaskStatus = (taskId, newStatus) => {
  setError('');

  updateTaskStatusMutation.mutate({
    taskId,
    newStatus,
  });
};

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', p: 4 }}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

<Box sx={{ display: 'flex', gap: 1 }}>
  <Button variant="outlined" onClick={() => navigate('/profile')}>
    Profile
  </Button>

  <Button variant="outlined" color="error" onClick={handleLogout}>
    Logout
  </Button>
</Box>
</Box>
      {error && (
        <Alert severity="error" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
          {error}
        </Alert>
      )}

      {tasksLoading && (
  <Alert severity="info" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
    Loading tasks...
  </Alert>
)}

{tasksError && (
  <Alert severity="error" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
    Failed to load assigned tasks.
  </Alert>
)}

      <Box
  sx={{
    maxWidth: 1000,
    mx: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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

      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
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
  onClick={() => updateTaskStatus(task.id, 'completed')}
  disabled={task.status === 'completed' || updateTaskStatusMutation.isPending}
>
  {task.status === 'completed' ? 'Completed' : 'Mark as Completed'}
</Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}


function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }

    return <Navigate to="/employee/dashboard" />;
  }

  return children;
}

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const role = localStorage.getItem('role');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', storedUser.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/profile/${storedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `${API_URL}/profile/${storedUser.id}`,
        {
          name,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (updatedUser) => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          name: updatedUser.name,
          email: updatedUser.email,
        })
      );

      setMessage('Profile updated successfully.');
      setError('');
    },
    onError: () => {
      setError('Failed to update profile.');
      setMessage('');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await axios.post(
        `${API_URL}/profile/${storedUser.id}/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
  const photoUrl = data.photo_url || data.user?.photo_url;

  if (photoUrl) {
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...storedUser,
        photo_url: photoUrl,
      })
    );
  }

  queryClient.invalidateQueries({ queryKey: ['profile', storedUser.id] });

  setMessage('Profile photo uploaded successfully.');
  setError('');
  setPhoto(null);
},
    onError: () => {
      setError('Failed to upload profile photo.');
      setMessage('');
    },
  });

  const handleUpdateProfile = (event) => {
    event.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleUploadPhoto = (event) => {
    event.preventDefault();

    if (!photo) {
      setError('Please choose a photo first.');
      return;
    }

    uploadPhotoMutation.mutate();
  };

  const goBack = () => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', p: 4 }}>
      <Box sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
        <Button variant="outlined" onClick={goBack}>
          Back to Dashboard
        </Button>
      </Box>

      <Card sx={{ maxWidth: 700, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Profile
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Manage your account details.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
  <Avatar
    src={profile?.photo_url || storedUser?.photo_url}
    sx={{ width: 80, height: 80 }}
  />

  <Box>
    <Typography sx={{ fontWeight: 700 }}>
      {name || storedUser?.name}
    </Typography>
    <Typography color="text.secondary">
      {email || storedUser?.email}
    </Typography>
  </Box>
</Box>

          {isLoading && <Alert severity="info">Loading profile...</Alert>}
          {isError && <Alert severity="error">Failed to load profile.</Alert>}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleUpdateProfile}>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>

          <Box component="form" onSubmit={handleUploadPhoto} sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Profile Photo
            </Typography>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files[0])}
            />

            <Box>
              <Button
                type="submit"
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={uploadPhotoMutation.isPending}
              >
                {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;