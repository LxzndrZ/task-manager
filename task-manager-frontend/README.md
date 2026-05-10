# Task Manager Frontend

React/Vite frontend for the Task Manager app.

## Stack

- React 19
- Vite 8
- React Router 7
- TanStack React Query 5
- Axios
- Material UI 9

## Setup

```bash
npm install
npm run dev
```

The app usually runs at:

```txt
http://localhost:5173
```

The backend API URL is configured in:

```txt
src/config/api.jsx
```

Current value:

```txt
http://127.0.0.1:8000/api
```

## Routes

| Route | Component | Access |
| --- | --- | --- |
| `/` | Redirect to `/login` | Public |
| `/login` | `Login.jsx` | Public |
| `/register` | `Register.jsx` | Public |
| `/admin/dashboard` | `AdminDashboard.jsx` | Admin |
| `/admin/users` | `UserManagement.jsx` | Admin |
| `/employee/dashboard` | `EmployeeDashboard.jsx` | Employee |
| `/profile` | `ProfilePage.jsx` | Authenticated |

## Local State

After login, the app stores these values in `localStorage`:

- `token`
- `user`
- `role`

Protected frontend routes check these values before rendering. API authorization still depends on Laravel Sanctum and backend role middleware.

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
