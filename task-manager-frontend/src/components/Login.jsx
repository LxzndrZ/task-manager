import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
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

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(fullUser));
      localStorage.setItem("role", role);

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch {
      setError("Invalid email or password.");
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
      }}
    >
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            Login
          </Typography>

          <Typography sx={{ mb: 3, color: "text.secondary" }}>
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
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate("/register")}
            >
              Create an account
            </Button>
            
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
