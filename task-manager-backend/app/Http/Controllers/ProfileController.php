<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($this->profileResponse($request->user()));
    }

    public function update(Request $request)
    {
        $user = $request->user();

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

        return response()->json($this->profileResponse($user));
    }

    public function uploadPhoto(Request $request)
    {
        $user = $request->user();

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

    private function profileResponse($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'photo_url' => $user->getFirstMediaUrl('profile_photo'),
        ];
    }
}
