# Task Manager

A full-stack task management app built with a Laravel API and a React/Vite frontend. Admin users manage employees and tasks, while employees view assigned work and move tasks through the workflow.

## Current Features

### Admin

- View task totals for all tasks, pending tasks, and completed tasks.
- Create, edit, filter, paginate, and delete tasks.
- Assign one or more employees to each task from the admin dashboard.
- Manage employee accounts from `/admin/users`.
- Update profile details, password, and profile photo.

### Employee

- Register an employee account from `/register`.
- View only tasks assigned to the authenticated employee.
- Move tasks from `pending` to `in_progress`, then to `completed`.
- Update profile details, password, and profile photo.

### Shared

- Laravel Sanctum bearer-token authentication.
- Spatie role middleware for admin and employee API access.
- React route protection using the stored token and role.
- Profile photo uploads through Spatie Media Library.

## Tech Stack

### Backend

- Laravel 13
- PHP 8.3+
- SQLite by default in `.env.example`
- Laravel Sanctum
- Spatie Laravel Permission
- Spatie Laravel Media Library

### Frontend

- React 19
- Vite 8
- React Router 7
- TanStack React Query 5
- Axios
- Material UI 9

## Project Structure

```txt
task-manager/
├── README.md
├── docs/
│   ├── API_ENDPOINTS.md
│   ├── DATABASE_SCHEMA.md
│   └── SYSTEM_WALKTHROUGH.md
├── task-manager-backend/
│   ├── app/Http/Controllers/
│   ├── app/Models/
│   ├── database/migrations/
│   ├── database/seeders/
│   └── routes/api.php
└── task-manager-frontend/
    ├── src/App.jsx
    ├── src/config/api.jsx
    └── src/components/
```

## Setup

### Backend

```bash
cd task-manager-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

The API runs at:

```txt
http://127.0.0.1:8000/api
```

The default `.env.example` uses SQLite. If the SQLite database file does not exist, create `task-manager-backend/database/database.sqlite` before running migrations.

### Frontend

```bash
cd task-manager-frontend
npm install
npm run dev
```

The React app usually runs at:

```txt
http://localhost:5173
```

The API base URL is defined in:

```txt
task-manager-frontend/src/config/api.jsx
```

## Important Seed Data Note

The current `DatabaseSeeder.php` only creates:

```txt
test@example.com
```

It does not create the required `admin` and `employee` roles, and it does not create the login form's sample `admin@test.com` account. For a fresh install, create these before using the app:

- Role: `admin`
- Role: `employee`
- At least one user assigned to the `admin` role

Employee self-registration and admin-created employees both call `assignRole('employee')`, so the `employee` role must already exist.

## Frontend Routes

| Route | Component | Access |
| --- | --- | --- |
| `/` | Redirect to `/login` | Public |
| `/login` | `Login.jsx` | Public |
| `/register` | `Register.jsx` | Public |
| `/admin/dashboard` | `AdminDashboard.jsx` | Admin |
| `/admin/users` | `UserManagement.jsx` | Admin |
| `/employee/dashboard` | `EmployeeDashboard.jsx` | Employee |
| `/profile` | `ProfilePage.jsx` | Authenticated |

## API Summary

Base URL:

```txt
http://127.0.0.1:8000/api
```

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Register an employee account |
| `POST` | `/login` | Public | Log in and receive a Sanctum token |
| `POST` | `/logout` | Authenticated | Delete the current token |
| `GET` | `/profile/{id}` | Authenticated | Get profile data and photo URL |
| `PATCH` | `/profile/{id}` | Authenticated | Update name, email, and optional password |
| `POST` | `/profile/{id}/photo` | Authenticated | Upload a profile photo |
| `GET` | `/users` | Admin | List users with roles |
| `POST` | `/users` | Admin | Create an employee |
| `PUT` | `/users/{id}` | Admin | Update an employee |
| `DELETE` | `/users/{id}` | Admin | Delete a non-admin user |
| `GET` | `/tasks` | Admin | List all tasks with assignees |
| `POST` | `/tasks` | Admin | Create a task |
| `PUT` | `/tasks/{id}` | Admin | Update a task and assignments |
| `DELETE` | `/tasks/{id}` | Admin | Delete a task |
| `GET` | `/my-tasks` | Employee | List tasks assigned to the authenticated employee |
| `PATCH` | `/tasks/{id}/status` | Employee | Update an assigned task status |

## Task Statuses

The app uses these statuses:

- `pending`
- `in_progress`
- `completed`

Admins can choose all three statuses when creating or editing tasks. Employees can start a pending task, then complete an in-progress task.

## Documentation

Detailed docs are in:

- `docs/API_ENDPOINTS.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/SYSTEM_WALKTHROUGH.md`

## Common Commands

### Backend

```bash
php artisan serve
php artisan migrate
php artisan migrate:fresh
php artisan db:seed
php artisan storage:link
php artisan test
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
