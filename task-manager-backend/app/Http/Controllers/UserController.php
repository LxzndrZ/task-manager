<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::with('roles')->get());
    }

    public function profile($id)
{
    $user = User::findOrFail($id);

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'email_verified_at' => $user->email_verified_at,
        'created_at' => $user->created_at,
        'updated_at' => $user->updated_at,
        'photo_url' => $user->getFirstMediaUrl('profile_photo'),
    ]);
}
    
    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
    'id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'email_verified_at' => $user->email_verified_at,
    'created_at' => $user->created_at,
    'updated_at' => $user->updated_at,
    'photo_url' => $user->getFirstMediaUrl('profile_photo'),
]);
    }

    public function uploadProfilePhoto(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $user->clearMediaCollection('profile_photo');

        $user
            ->addMediaFromRequest('photo')
            ->toMediaCollection('profile_photo');

        return response()->json([
            'message' => 'Profile photo uploaded successfully',
            'photo_url' => $user->getFirstMediaUrl('profile_photo'),
        ]);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);

    $user->assignRole('employee');

    return response()->json($user->load('roles'), 201);
}

public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'password' => 'nullable|string|min:8',
    ]);

    $user->name = $validated['name'];
    $user->email = $validated['email'];

    if (!empty($validated['password'])) {
        $user->password = Hash::make($validated['password']);
    }

    $user->save();

    return response()->json($user->load('roles'));
}

public function destroy($id)
{
    $user = User::findOrFail($id);

    if ($user->hasRole('admin')) {
        return response()->json([
            'message' => 'Admin users cannot be deleted.'
        ], 403);
    }

    $user->delete();

    return response()->json([
        'message' => 'User deleted successfully.'
    ]);
}
}
