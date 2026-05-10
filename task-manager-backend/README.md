# Task Manager Backend

Laravel API for the Task Manager app.

## Stack

- Laravel 13
- PHP 8.3+
- Laravel Sanctum for bearer-token auth
- Spatie Laravel Permission for `admin` and `employee` roles
- Spatie Media Library for profile photos
- MySQL by default from `.env.example`

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

The default `.env.example` uses MySQL. Create a MySQL database, then update `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env`.

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

## Seed Data

Run:

```bash
php artisan db:seed
```

The current seeder creates:

| Role | Email | Password |
| --- | --- | --- |
| `admin` | `admin@test.com` | `password123` |
| `employee` | `employee@test.com` | `password123` |
| `employee` | `employee2@test.com` | `password123` |

## Commands

```bash
php artisan serve
php artisan migrate
php artisan migrate:fresh
php artisan db:seed
php artisan storage:link
php artisan test
```
