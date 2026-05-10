import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function AppNavbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToDashboard = () => {
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/employee/dashboard");
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar
        sx={{
          maxWidth: 1100,
          width: "100%",
          mx: "auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, cursor: "pointer" }}
          onClick={goToDashboard}
        >
          Task Manager
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button onClick={goToDashboard}>Dashboard</Button>

          {role === "admin" && (
            <Button onClick={() => navigate("/admin/users")}>
              Manage Users
            </Button>
          )}

          <Button onClick={() => navigate("/profile")}>Profile</Button>

          <Button color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppNavbar;