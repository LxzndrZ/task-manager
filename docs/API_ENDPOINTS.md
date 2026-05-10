# API Endpoint Documentation

Base API URL used by React: `http://127.0.0.1:8000/api`

Frontend config: `task-manager-frontend/src/config/api.jsx`

Authentication uses Laravel Sanctum bearer tokens. After login, React stores:

- `token` in `localStorage`
- `user` in `localStorage`
- `role` in `localStorage`

Protected requests send:

```http
Authorization: Bearer {token}
```

## Route Summary

| Method | Endpoint | Auth | Role | Backend Handler | Frontend Usage |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/register` | No | Public | `AuthController@register` | `Register.jsx` |
| `POST` | `/login` | No | Public | `AuthController@login` | `Login.jsx` |
| `POST` | `/logout` | Yes | Any authenticated user | `AuthController@logout` | Not currently called by React |
| `GET` | `/profile/{id}` | Yes | Any authenticated user | `UserController@profile` | `Login.jsx`, `AdminDashboard.jsx`, `EmployeeDashboard.jsx`, `ProfilePage.jsx` |
| `PATCH` | `/profile/{id}` | Yes | Any authenticated user | `UserController@updateProfile` | `ProfilePage.jsx` |
| `POST` | `/profile/{id}/photo` | Yes | Any authenticated user | `UserController@uploadProfilePhoto` | `ProfilePage.jsx` |
| `GET` | `/users` | Yes | Admin | `UserController@index` | `AdminDashboard.jsx`, `UserManagement.jsx` |
| `POST` | `/users` | Yes | Admin | `UserController@store` | `UserManagement.jsx` |
| `PUT` | `/users/{id}` | Yes | Admin | `UserController@update` | `UserManagement.jsx` |
| `DELETE` | `/users/{id}` | Yes | Admin | `UserController@destroy` | `UserManagement.jsx` |
| `GET` | `/tasks` | Yes | Admin | `TaskController@index` | `AdminDashboard.jsx` |
| `POST` | `/tasks` | Yes | Admin | `TaskController@store` | `AdminDashboard.jsx` |
| `PUT` | `/tasks/{id}` | Yes | Admin | `TaskController@update` | `AdminDashboard.jsx` |
| `DELETE` | `/tasks/{id}` | Yes | Admin | `TaskController@destroy` | `AdminDashboard.jsx` |
| `GET` | `/my-tasks` | Yes | Employee | `TaskController@myTasks` | `EmployeeDashboard.jsx` |
| `PATCH` | `/tasks/{id}/status` | Yes | Employee | `TaskController@updateStatus` | `EmployeeDashboard.jsx` |

## Authentication Endpoints

### `POST /login`

Used by: `task-manager-frontend/src/components/Login.jsx`

When it runs:

1. User submits the login form.
2. React sends `email` and `password`.
3. Laravel validates the credentials.
4. If credentials are valid, Laravel returns the authenticated user, role data, and Sanctum token.
5. React immediately calls `GET /profile/{id}` using the returned token.
6. React merges the login user data with profile data.
7. React saves `token`, `user`, and `role` to `localStorage`.
8. React redirects admins to `/admin/dashboard` and employees to `/employee/dashboard`.

Request body:

```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

Success response:

```json
{
  "message": "Logged in successfully",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@test.com",
    "roles": [
      {
        "id": 1,
        "name": "admin"
      }
    ]
  },
  "token": "plain-text-sanctum-token"
}
```

Failure response:

- `401` when credentials are invalid.
- React displays `Invalid email or password.`

### `POST /register`

Used by: `task-manager-frontend/src/components/Register.jsx`

What it does:

1. React validates name, email, password length, and password confirmation.
2. React sends `name`, `email`, `password`, and `password_confirmation`.
3. Laravel validates `name`, `email`, and `password`.
4. Creates a new user.
5. Assigns the `employee` role.
6. Creates and returns a Sanctum token.
7. React displays a success message and redirects to `/login`.

Request body:

```json
{
  "name": "Employee Name",
  "email": "employee@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Success response:

- `201 Created`
- Returns `message`, `user` with roles, and `token`.

### `POST /logout`

Used by: route exists, but React currently does not call it.

Current frontend behavior:

- `AdminDashboard.jsx` and `EmployeeDashboard.jsx` log out by clearing `localStorage` and navigating to `/login`.
- The backend token is not deleted because `/logout` is not called.

What the backend route does:

1. Requires `Authorization: Bearer {token}`.
2. Deletes the current Sanctum access token.
3. Returns `Logged out successfully`.

## Profile Endpoints

### `GET /profile/{id}`

Used by:

- `Login.jsx` after successful login
- `AdminDashboard.jsx` on dashboard load
- `EmployeeDashboard.jsx` on dashboard load
- `ProfilePage.jsx` on profile page load

When it runs:

1. React reads `token` and user id from login data or `localStorage`.
2. React sends a bearer-authenticated request.
3. Laravel finds the user by `{id}`.
4. Laravel returns basic profile fields and `photo_url`.
5. React uses this data for dashboard avatars and the profile form.

Success response:

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@test.com",
  "email_verified_at": null,
  "created_at": "2026-05-10T00:00:00.000000Z",
  "updated_at": "2026-05-10T00:00:00.000000Z",
  "photo_url": "http://127.0.0.1:8000/storage/..."
}
```

### `PATCH /profile/{id}`

Used by: `task-manager-frontend/src/components/ProfilePage.jsx`

When it runs:

1. User opens `/profile`.
2. React loads the profile with `GET /profile/{id}` and fills the form.
3. User edits name, email, and optionally password, then submits the profile form.
4. React sends `name`, `email`, and `password` only when a new password is entered.
5. Laravel validates optional `name`, optional unique `email`, and optional `password`.
6. Laravel updates only the provided fields.
7. React updates the stored user in `localStorage`.
8. React clears the password fields.
9. React invalidates the React Query `profile` cache and displays success.

Request body currently sent by React:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123"
}
```

React omits `password` when the user leaves the new password field blank. Password confirmation is checked on the frontend before the request.

### `POST /profile/{id}/photo`

Used by: `task-manager-frontend/src/components/ProfilePage.jsx`

When it runs:

1. User chooses an image file in the profile page.
2. User submits the photo upload form.
3. React creates `FormData`.
4. React appends the selected file as `photo`.
5. React sends `multipart/form-data`.
6. Laravel validates that `photo` is an image and is no larger than 2048 KB.
7. Laravel clears the existing `profile_photo` media collection.
8. Laravel stores the new image in the `profile_photo` media collection.
9. React updates `localStorage.user.photo_url`, invalidates the profile cache, clears the selected file, and displays success.

Request body:

```http
Content-Type: multipart/form-data

photo: selected image file
```

Success response:

```json
{
  "message": "Profile photo uploaded successfully",
  "photo_url": "http://127.0.0.1:8000/storage/..."
}
```

## Admin User Management Endpoints

These routes require:

- A valid Sanctum token.
- The authenticated user must have the `admin` role.

### `GET /users`

Used by:

- `AdminDashboard.jsx` to load employees for task assignment.
- `UserManagement.jsx` to list employees.

When it runs in `AdminDashboard.jsx`:

1. Dashboard mounts.
2. `fetchEmployees()` sends `GET /users`.
3. Laravel returns all users with roles.
4. React filters users whose role list contains `employee`.
5. Filtered employees populate the task assignment dropdowns.

When it runs in `UserManagement.jsx`:

1. User opens `/admin/users`.
2. React Query sends `GET /users`.
3. Laravel returns all users with roles.
4. React filters employees and displays employee cards.

Success response:

```json
[
  {
    "id": 2,
    "name": "Employee",
    "email": "employee@example.com",
    "roles": [
      {
        "id": 2,
        "name": "employee"
      }
    ]
  }
]
```

### `POST /users`

Used by: `task-manager-frontend/src/components/UserManagement.jsx`

When it runs:

1. Admin fills out the Create Employee form.
2. React checks that `name`, `email`, and `password` are not blank.
3. React sends the form data.
4. Laravel validates the fields and unique email.
5. Laravel creates the user with a hashed password.
6. Laravel assigns the `employee` role.
7. React clears the form, displays success, and invalidates the `users` query.

Request body:

```json
{
  "name": "Employee Name",
  "email": "employee@example.com",
  "password": "password123"
}
```

Success response:

- `201 Created`
- Returns the created user with roles.

### `PUT /users/{id}`

Used by: `task-manager-frontend/src/components/UserManagement.jsx`

When it runs:

1. Admin clicks `Edit` on an employee card.
2. React fills the edit form with the employee name and email.
3. Admin submits the edit form.
4. React checks that name and email are not blank.
5. React sends `name`, `email`, and `password`.
6. Laravel validates required name, required unique email, and optional password.
7. Laravel updates the user.
8. If `password` is not empty, Laravel hashes and saves it.
9. React exits edit mode, displays success, and invalidates the `users` query.

Request body:

```json
{
  "name": "Updated Employee",
  "email": "updated.employee@example.com",
  "password": ""
}
```

Note: React sends an empty string when the admin leaves the password field blank. The backend only changes the password if this value is not empty.

### `DELETE /users/{id}`

Used by: `task-manager-frontend/src/components/UserManagement.jsx`

When it runs:

1. Admin clicks `Delete`.
2. React asks for confirmation with `window.confirm`.
3. If confirmed, React sends `DELETE /users/{id}`.
4. Laravel finds the user.
5. Laravel blocks deletion if the user has the `admin` role.
6. Laravel deletes non-admin users.
7. React displays success and invalidates the `users` query.

Success response:

```json
{
  "message": "User deleted successfully."
}
```

Admin deletion failure:

```json
{
  "message": "Admin users cannot be deleted."
}
```

## Admin Task Management Endpoints

These routes require:

- A valid Sanctum token.
- The authenticated user must have the `admin` role.

### `GET /tasks`

Used by: `task-manager-frontend/src/components/AdminDashboard.jsx`

When it runs:

1. Admin dashboard loads.
2. React Query sends `GET /tasks`.
3. Laravel returns all tasks with assigned users.
4. React calculates dashboard stats from the response.
5. React renders each task card and its assigned users.

Success response:

```json
[
  {
    "id": 1,
    "title": "Prepare Report",
    "description": "Monthly status report",
    "status": "pending",
    "users": [
      {
        "id": 2,
        "name": "Employee"
      }
    ]
  }
]
```

### `POST /tasks`

Used by: `task-manager-frontend/src/components/AdminDashboard.jsx`

When it runs:

1. Admin fills out the Create Task form.
2. React validates that title exists, status exists, and at least one employee is selected.
3. React sends task data with `user_ids`.
4. Laravel validates title, optional description, optional status, and optional user ids.
5. Laravel creates the task.
6. Laravel syncs assigned users through the task-user pivot table.
7. React clears the form, displays success, and invalidates the `tasks` query.

Request body:

```json
{
  "title": "Prepare Report",
  "description": "Monthly status report",
  "status": "pending",
  "user_ids": [2, 3]
}
```

Backend accepts these statuses:

- `pending`
- `in_progress`
- `completed`

The current React create and edit forms expose all three statuses.

### `PUT /tasks/{id}`

Used by: `task-manager-frontend/src/components/AdminDashboard.jsx`

When it runs:

1. Admin clicks `Edit` on a task.
2. React fills the edit form with task title, description, status, and assigned user ids.
3. Admin submits the edit form.
4. React validates title, status, and at least one assigned employee.
5. React sends the edited task data.
6. Laravel validates required title, required status, and required `user_ids`.
7. Laravel updates the task.
8. Laravel syncs assigned users.
9. React exits edit mode, displays success, and invalidates the `tasks` query.

Request body:

```json
{
  "title": "Updated Report",
  "description": "Updated details",
  "status": "completed",
  "user_ids": [2]
}
```

Note: Unlike task creation and employee status updates, the backend update method currently validates `status` as a required string but does not restrict it to `pending`, `in_progress`, or `completed`.

### `DELETE /tasks/{id}`

Used by: `task-manager-frontend/src/components/AdminDashboard.jsx`

When it runs:

1. Admin clicks `Delete`.
2. React asks for confirmation with `window.confirm`.
3. If confirmed, React sends `DELETE /tasks/{id}`.
4. Laravel finds the task.
5. Laravel detaches assigned users from the pivot table.
6. Laravel deletes the task.
7. React displays success and invalidates the `tasks` query.

Success response:

```json
{
  "message": "Task deleted successfully"
}
```

## Employee Task Endpoints

These routes require:

- A valid Sanctum token.
- The authenticated user must have the `employee` role.

### `GET /my-tasks`

Used by: `task-manager-frontend/src/components/EmployeeDashboard.jsx`

When it runs:

1. Employee dashboard loads.
2. React Query sends `GET /my-tasks`.
3. Laravel reads the authenticated user from the Sanctum token.
4. Laravel returns that user's assigned tasks with task users loaded.
5. React calculates dashboard stats and renders the assigned task cards.

Success response:

```json
[
  {
    "id": 1,
    "title": "Prepare Report",
    "description": "Monthly status report",
    "status": "pending",
    "users": [
      {
        "id": 2,
        "name": "Employee"
      }
    ]
  }
]
```

### `PATCH /tasks/{id}/status`

Used by: `task-manager-frontend/src/components/EmployeeDashboard.jsx`

When it runs:

1. Employee clicks `Start Task` on a pending task or `Complete Task` on an in-progress task.
2. React sends the task id and the next status.
3. Laravel validates the status.
4. Laravel finds the task by `{id}`.
5. Laravel checks that the authenticated employee is assigned to the task.
6. Laravel updates the task status.
7. React invalidates the `my-tasks` query so the dashboard reloads the assigned tasks.
8. The button changes by status and becomes disabled when the task status is already `completed`.

Request body:

```json
{
  "status": "in_progress"
}
```

Backend accepts these statuses:

- `pending`
- `in_progress`
- `completed`

Current React behavior sends `in_progress` from pending tasks and `completed` from in-progress tasks.

## React Query Cache Behavior

React Query is used in:

- `AdminDashboard.jsx`
- `EmployeeDashboard.jsx`
- `ProfilePage.jsx`
- `UserManagement.jsx`

Important query keys:

| Query Key | Data | Invalidated After |
| --- | --- | --- |
| `["profile", user.id]` | Logged-in user's profile | Profile update, profile photo upload |
| `["tasks"]` | All tasks for admin dashboard | Create task, update task, delete task |
| `["my-tasks"]` | Employee's assigned tasks | Employee updates task status |
| `["users"]` | All users for admin user management | Create user, update user, delete user |

## Frontend Routes and API Calls

### `/login`

Component: `Login.jsx`

API flow:

1. `POST /login`
2. `GET /profile/{id}`
3. Save login state to `localStorage`
4. Redirect by role

### `/register`

Component: `Register.jsx`

API flow:

1. `POST /register`
2. Show success message
3. Redirect to `/login`

### `/admin/dashboard`

Component: `AdminDashboard.jsx`

API flow on load:

1. `GET /profile/{id}`
2. `GET /tasks`
3. `GET /users`

API flow on task create:

1. `POST /tasks`
2. Invalidate `["tasks"]`
3. Reload task list

API flow on task update:

1. `PUT /tasks/{id}`
2. Invalidate `["tasks"]`
3. Reload task list

API flow on task delete:

1. `DELETE /tasks/{id}`
2. Invalidate `["tasks"]`
3. Reload task list

### `/employee/dashboard`

Component: `EmployeeDashboard.jsx`

API flow on load:

1. `GET /profile/{id}`
2. `GET /my-tasks`

API flow on updating task status:

1. `PATCH /tasks/{id}/status`
2. Invalidate `["my-tasks"]`
3. Reload assigned task list

### `/profile`

Component: `ProfilePage.jsx`

API flow on load:

1. `GET /profile/{id}`

API flow on profile update:

1. `PATCH /profile/{id}`
2. Update `localStorage.user`
3. Invalidate `["profile", user.id]`

API flow on photo upload:

1. `POST /profile/{id}/photo`
2. Update `localStorage.user.photo_url`
3. Invalidate `["profile", user.id]`

### `/admin/users`

Component: `UserManagement.jsx`

API flow on load:

1. `GET /users`
2. Filter employees in React

API flow on employee create:

1. `POST /users`
2. Invalidate `["users"]`
3. Reload employee list

API flow on employee update:

1. `PUT /users/{id}`
2. Invalidate `["users"]`
3. Reload employee list

API flow on employee delete:

1. `DELETE /users/{id}`
2. Invalidate `["users"]`
3. Reload employee list

## Notes and Potential Improvements

- React logout clears local state but does not call `POST /logout`, so Sanctum tokens remain valid until they expire or are manually removed.
- `PUT /tasks/{id}` does not restrict `status` to the same allowed list used by create and status update.
- `GET /users` returns all users to admins, then React filters employees. This is fine for small apps, but an employee-only endpoint or query parameter could reduce client-side filtering later.
