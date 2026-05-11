import { Navigate } from 'react-router-dom';
import { getAuthRole, getAuthToken } from '../utils/authSession';

function ProtectedRoute({ children, allowedRole }) {
  const token = getAuthToken();
  const role = getAuthRole();

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

export default ProtectedRoute;
