const AUTH_KEYS = ["token", "user", "role"];

export function getAuthToken() {
  return sessionStorage.getItem("token");
}

export function getAuthRole() {
  return sessionStorage.getItem("role");
}

export function getAuthUser() {
  const storedUser = sessionStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    clearAuthSession();
    return null;
  }
}

export function setAuthSession({ token, user, role }) {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));
  sessionStorage.setItem("role", role);
}

export function updateAuthUser(user) {
  sessionStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthSession() {
  AUTH_KEYS.forEach((key) => sessionStorage.removeItem(key));
}
