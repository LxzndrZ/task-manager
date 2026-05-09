<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
class TaskController extends Controller
{
    public function index()
    {
        return response()->json(Task::with('users')->get());
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'status' => 'nullable|string|in:pending,in_progress,completed',
        'user_ids' => 'nullable|array',
        'user_ids.*' => 'exists:users,id',
    ]);

    $task = Task::create([
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'status' => $validated['status'] ?? 'pending',
    ]);

    if (isset($validated['user_ids'])) {
        $task->users()->sync($validated['user_ids']);
    }

    return response()->json($task->load('users'), 201);
}

    public function updateStatus(Request $request, $id)
{
    $validated = $request->validate([
        'status' => 'required|string|in:pending,in_progress,completed',
    ]);

    $task = Task::findOrFail($id);

    $task->update([
        'status' => $validated['status'],
    ]);

    return response()->json($task);
}
    public function myTasks($userId)
    {
        $user = \App\Models\User::findOrFail($userId);

        return response()->json($user->tasks->load('users'));
    }

    public function update(Request $request, $id)
{
    $task = Task::findOrFail($id);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'status' => 'required|string',
        'user_ids' => 'required|array',
        'user_ids.*' => 'exists:users,id',
    ]);

    $task->update([
        'title' => $validated['title'],
        'description' => $validated['description'],
        'status' => $validated['status'],
    ]);

    $task->users()->sync($validated['user_ids']);

    return response()->json(
        $task->load('users')
    );
}
  public function destroy($id)
{
    $task = Task::findOrFail($id);

    $task->users()->detach();

    $task->delete();

    return response()->json([
        'message' => 'Task deleted successfully',
    ]);
}
}
