import { useEffect, useState } from 'react';
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
  Avatar,
} from '@mui/material';
import API_URL from '../config/api';

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
          photo_url: updatedUser.photo_url || storedUser.photo_url,
        })
      );

      queryClient.invalidateQueries({ queryKey: ['profile', storedUser.id] });

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

export default ProfilePage;