# Task Manager

A full-stack web application for managing tasks with role-based access control. Admins can create and assign tasks to employees, while employees can view their assigned tasks and update their status.

## 🎯 Features

### Admin Dashboard
- 📊 View task statistics (total, pending, completed)
- ✏️ Create, edit, and delete tasks
- 👥 Assign multiple employees to tasks
- 🎯 Update task status and descriptions
- 📋 View all employees and tasks

### Employee Dashboard
- 📋 View assigned tasks only
- 📊 Track personal task statistics
- ✅ Mark tasks as completed
- 🔍 View task details and assignments

### User Management
- 👤 User authentication (login/register)
- 🔐 Role-based access control (Admin/Employee)
- 📝 Profile management
- 🖼️ Profile photo upload

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 13
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (API tokens)
- **Authorization**: Spatie Laravel Permission
- **Media Handling**: Spatie Laravel MediaLibrary
- **Build Tool**: Vite

### Frontend
- **Framework**: React 19
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Build Tool**: Vite

## 📋 Prerequisites

- **PHP**: 8.3 or higher
- **Node.js**: 18 or higher
- **Composer**: Latest version
- **MySQL**: 5.7 or higher

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/LxzndR/task-manager.git
cd task-manager
```

### 2. Setup Backend

```bash
cd task-manager-backend

# Install dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Create storage symlink for uploads
php artisan storage:link

# Start the development server
php artisan serve
```

The backend will run on `http://127.0.0.1:8000`

### 3. Setup Frontend

```bash
cd task-manager-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

## 🔐 Default Test Credentials

```
Email: admin@test.com
Password: password123
```

## 📁 Project Structure

```
task-manager/
├── task-manager-backend/          # Laravel API
│   ├── app/
│   │   ├── Models/               # Eloquent models (User, Task)
│   │   ├── Http/
│   │   │   └── Controllers/      # API controllers
│   │   └── Providers/            # Service providers
│   ├── database/
│   │   ├── migrations/           # Database schema
│   │   ├── factories/            # Seeders
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php              # API routes
│   └── config/                   # Configuration files
│
└── task-manager-frontend/         # React SPA
    ├── src/
    │   ├── App.jsx              # Main component (routes, pages)
    │   ├── main.jsx             # Entry point
    │   └── assets/              # Static assets
    ├── public/                  # Public files
    └── vite.config.js          # Vite configuration
```

## 🔌 API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |

### Authenticated Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logout` | User logout |
| GET | `/api/profile/{id}` | Get user profile |
| PATCH | `/api/profile/{id}` | Update profile |
| POST | `/api/profile/{id}/photo` | Upload profile photo |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

### Employee Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/my-tasks/{userId}` | Get assigned tasks |
| PATCH | `/api/tasks/{id}/status` | Update task status |

## 🗄️ Database Schema

### Users
- `id` - Primary key
- `name` - User name
- `email` - Unique email
- `password` - Hashed password
- `timestamps`

### Tasks
- `id` - Primary key
- `title` - Task title
- `description` - Task description
- `status` - pending/completed
- `timestamps`

### Task-User (Pivot)
- `id` - Primary key
- `task_id` - Foreign key to tasks
- `user_id` - Foreign key to users
- `timestamps`

## 🔄 Authentication Flow

1. User logs in with email/password
2. Backend validates credentials and returns API token
3. Token stored in localStorage
4. Frontend includes token in all API requests via `Authorization: Bearer {token}` header
5. Backend validates token for each request

## 📱 Frontend Routing

```
/                    → Redirect to /login
/login               → Login page
/register            → Register page
/admin/dashboard     → Admin panel (requires admin role)
/employee/dashboard  → Employee panel (requires employee role)
/profile             → User profile (authenticated)
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ API token authentication (Sanctum)
- ✅ Role-based access control
- ✅ CSRF protection
- ✅ Secure file uploads
- ✅ Input validation and sanitization

## 🧪 Available Scripts

### Backend
```bash
php artisan serve              # Start dev server
php artisan migrate            # Run migrations
php artisan migrate:refresh    # Reset database
php artisan storage:link       # Create storage symlink
```

### Frontend
```bash
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run preview                 # Preview production build
npm run lint                    # Run ESLint
```

## 📦 Dependencies

### Backend Key Packages
- `laravel/framework` - Web framework
- `laravel/sanctum` - API authentication
- `spatie/laravel-permission` - Role-based access
- `spatie/laravel-medialibrary` - File uploads
- `laravel/tinker` - REPL

### Frontend Key Packages
- `react` - UI library
- `react-router-dom` - Routing
- `@tanstack/react-query` - Server state management
- `@mui/material` - UI components
- `axios` - HTTP client

## 🐛 Troubleshooting

### Backend won't start
```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Regenerate app key
php artisan key:generate

# Ensure database exists and is accessible
php artisan migrate
```

### Frontend won't start
```bash
# Clear node modules
rm -rf node_modules
npm install

# Clear cache
npm run dev
```

### CORS Issues
- Backend runs on `http://127.0.0.1:8000`
- Frontend runs on `http://localhost:5173`
- Ensure CORS is properly configured in Laravel

## 📝 Future Enhancements

- [ ] Task categories/tags
- [ ] Task priority levels
- [ ] Task comments and activity logs
- [ ] Email notifications
- [ ] Task deadlines and reminders
- [ ] Dashboard analytics and reports
- [ ] Dark mode
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**LxzndR** - GitHub: [@LxzndR](https://github.com/LxzndR)

**Built with ❤️ using Laravel and React**
