# Task Manager Backend

Laravel API for the Task Manager app.

## Stack

- Laravel 13
- PHP 8.3+
- Laravel Sanctum for bearer-token auth
- Spatie Laravel Permission for `admin` and `employee` roles
- Spatie Media Library for profile photos
- SQLite by default from `.env.example`

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

If using the default SQLite config, make sure this file exists before migration:

```txt
database/database.sqlite
```

## API Base

```txt
http://127.0.0.1:8000/api
```

## Main Files

| File | Purpose |
| --- | --- |
| `routes/api.php` | Public, authenticated, admin, and employee API routes |
| `app/Http/Controllers/AuthController.php` | Register, login, logout |
| `app/Http/Controllers/UserController.php` | Profiles, profile photos, employee management |
| `app/Http/Controllers/TaskController.php` | Task CRUD, assigned task list, status updates |
| `app/Models/User.php` | User model with Sanctum, roles, media, and task relationship |
| `app/Models/Task.php` | Task model with assigned user relationship |

## Seed Data Warning

The current seeder only creates `test@example.com`. It does not create the `admin` and `employee` roles or an admin account. A fresh database needs those records before login, registration, or employee creation will work correctly.

## Commands

```bash
php artisan serve
php artisan migrate
php artisan migrate:fresh
php artisan db:seed
php artisan storage:link
php artisan test
```
