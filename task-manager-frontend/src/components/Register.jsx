import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import API_URL from "../config/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess("Registration successful. You can now log in.");
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch {
      setError("Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f6f8",
        p: 2,
      }}
    >
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            Register
          </Typography>

          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            Create an employee account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister}>
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

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              value={passwordConfirmation}
              onChange={(event) =>
                setPasswordConfirmation(event.target.value)
              }
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Register;