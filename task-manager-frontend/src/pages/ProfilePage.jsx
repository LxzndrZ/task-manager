import { useEffect, useState } from "react";
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
  Avatar,
  Divider,
} from "@mui/material";
import API_URL from "../config/api";
import {
  getAuthRole,
  getAuthToken,
  getAuthUser,
  updateAuthUser,
} from "../utils/authSession";

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const token = getAuthToken();
  const storedUser = getAuthUser();
  const role = getAuthRole();
  const roleLabel = role === "admin" ? "Admin" : "Employee";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", storedUser.id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `${API_URL}/profile`,
        {
          name,
          email,
          ...(password ? { password } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    },
    onSuccess: (updatedUser) => {
      updateAuthUser({
        ...storedUser,
        name: updatedUser.name,
        email: updatedUser.email,
        photo_url: updatedUser.photo_url || storedUser.photo_url,
      });

      queryClient.invalidateQueries({ queryKey: ["profile", storedUser.id] });

      setMessage("Profile updated successfully.");
      setError("");
      setPassword("");
      setPasswordConfirmation("");
    },
    onError: () => {
      setError("Failed to update profile.");
      setMessage("");
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("photo", photo);

      const response = await axios.post(
        `${API_URL}/profile/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },
    onSuccess: (data) => {
      const photoUrl = data.photo_url || data.user?.photo_url;

      if (photoUrl) {
        updateAuthUser({
          ...storedUser,
          photo_url: photoUrl,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["profile", storedUser.id] });

      setMessage("Profile photo uploaded successfully.");
      setError("");
      setPhoto(null);
    },
    onError: () => {
      setError("Failed to upload profile photo.");
      setMessage("");
    },
  });

  const handleUpdateProfile = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    updateProfileMutation.mutate();
  };

  const handleUploadPhoto = (event) => {
    event.preventDefault();

    if (!photo) {
      setError("Please choose a photo first.");
      return;
    }

    uploadPhotoMutation.mutate();
  };

  const goBack = () => {
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/employee/dashboard");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", p: 4 }}>
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Profile
          </Typography>
          <Typography color="text.secondary">
            Manage your account details.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={goBack}>
          Back to Dashboard
        </Button>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        {isLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading profile...
          </Alert>
        )}

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load profile.
          </Alert>
        )}

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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "320px 1fr",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 1,
                }}
              >
                <Avatar
                  src={profile?.photo_url || storedUser?.photo_url}
                  sx={{ width: 112, height: 112, mb: 1 }}
                />

                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {name || storedUser?.name}
                </Typography>
                <Typography color="text.secondary">
                  {email || storedUser?.email}
                </Typography>
                <Typography color="text.secondary">Role: {roleLabel}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box component="form" onSubmit={handleUploadPhoto}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Profile Photo
                </Typography>

                <Button variant="outlined" component="label" fullWidth>
                  Choose Photo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhoto(event.target.files[0])}
                  />
                </Button>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    minHeight: 24,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {photo?.name || "No file chosen"}
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={uploadPhotoMutation.isPending}
                >
                  {uploadPhotoMutation.isPending
                    ? "Uploading..."
                    : "Upload Photo"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Account Information
              </Typography>

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

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Change Password
                </Typography>

                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  margin="normal"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  helperText="Leave blank to keep current password"
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  margin="normal"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;
