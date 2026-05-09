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
}
