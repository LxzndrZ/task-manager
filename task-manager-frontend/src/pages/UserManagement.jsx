import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import API_URL from '../config/api';
import { getAuthToken } from '../utils/authSession';

function UserManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = getAuthToken();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const employeesPerPage = 5;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });

  const employees = users.filter((user) =>
    user.roles?.some((role) => role.name === 'employee')
  );

  const pageCount = Math.ceil(employees.length / employeesPerPage);

  const paginatedEmployees = employees.slice(
    (page - 1) * employeesPerPage,
    page * employeesPerPage
  );

  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    onSuccess: () => {
      setName('');
      setEmail('');
      setPassword('password123');
      setShowCreateForm(false);
      setSuccess('Employee created successfully.');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      setError('Failed to create employee.');
      setSuccess('');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await axios.put(
        `${API_URL}/users/${editingUserId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      setEditingUserId(null);
      setEditName('');
      setEditEmail('');
      setEditPassword('');
      setSuccess('Employee updated successfully.');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      setError('Failed to update employee.');
      setSuccess('');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    onSuccess: () => {
      setSuccess('Employee deleted successfully.');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      setError('Failed to delete employee.');
      setSuccess('');
    },
  });

  const createEmployee = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    createUserMutation.mutate({
      name,
      email,
      password,
    });
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditName('');
    setEditEmail('');
    setEditPassword('');
  };

  const saveEditUser = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!editName.trim()) {
      setError('Name is required.');
      return;
    }

    if (!editEmail.trim()) {
      setError('Email is required.');
      return;
    }

    updateUserMutation.mutate({
      name: editName,
      email: editEmail,
      password: editPassword,
    });
  };

  const deleteUser = (userId) => {
    const confirmed = window.confirm('Delete this employee?');

    if (!confirmed) return;

    setError('');
    setSuccess('');
    deleteUserMutation.mutate(userId);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', p: 4 }}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: 'auto',
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            User Management
          </Typography>
          <Typography color="text.secondary">
            Create and manage employee accounts.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
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

      {isLoading && (
        <Alert severity="info" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
          Loading employees...
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
          Failed to load employees.
        </Alert>
      )}

      <Box sx={{ maxWidth: 1000, mx: 'auto', mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Hide Create Employee Form' : 'Show Create Employee Form'}
        </Button>
      </Box>

      {showCreateForm && (
        <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create Employee
            </Typography>

            <Box
              component="form"
              onSubmit={createEmployee}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr 1fr auto',
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={createUserMutation.isPending}
                sx={{ height: 56, whiteSpace: 'nowrap' }}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6">Employees</Typography>
                <Typography color="text.secondary">
                  {employees.length} registered employee
                  {employees.length === 1 ? '' : 's'}
                </Typography>
              </Box>
            </Box>

            {employees.length === 0 ? (
              <Typography>No employees found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        {editingUserId === employee.id ? (
                          <TableCell colSpan={3}>
                            <Box
                              component="form"
                              onSubmit={saveEditUser}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                  xs: '1fr',
                                  md: '1fr 1fr 1fr auto',
                                },
                                gap: 2,
                                alignItems: 'center',
                              }}
                            >
                              <TextField
                                fullWidth
                                label="Name"
                                value={editName}
                                onChange={(event) =>
                                  setEditName(event.target.value)
                                }
                              />

                              <TextField
                                fullWidth
                                label="Email"
                                value={editEmail}
                                onChange={(event) =>
                                  setEditEmail(event.target.value)
                                }
                              />

                              <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={editPassword}
                                onChange={(event) =>
                                  setEditPassword(event.target.value)
                                }
                                placeholder="Leave blank to keep old password"
                              />

                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  disabled={updateUserMutation.isPending}
                                  sx={{ height: 56 }}
                                >
                                  {updateUserMutation.isPending
                                    ? 'Saving...'
                                    : 'Save'}
                                </Button>

                                <Button
                                  variant="outlined"
                                  onClick={cancelEditUser}
                                  sx={{ height: 56 }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700 }}>
                                {employee.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 1,
                                  justifyContent: 'flex-end',
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  onClick={() => startEditUser(employee)}
                                >
                                  Edit
                                </Button>

                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => deleteUser(employee.id)}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {employees.length > employeesPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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

export default UserManagement;
