<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Jobs\SendTaskAssignedNotification;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['assignedUser', 'creator']);

        if ($request->status)   $query->where('status', $request->status);
        if ($request->priority) $query->where('priority', $request->priority);
        if ($request->search)   $query->where('title', 'like', "%{$request->search}%");

        $sortBy  = $request->sort_by  ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'status'           => 'in:todo,in_progress,done',
            'priority'         => 'in:low,medium,high',
            'assigned_user_id' => 'nullable|exists:users,id',
            'due_date'         => 'nullable|date',
        ]);

        $task = Task::create([...$data, 'created_by' => Auth::id()]);

        if ($task->assigned_user_id) {
            $user = User::find($task->assigned_user_id);
            SendTaskAssignedNotification::dispatch($task, $user);
        }

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'            => 'nullable|string|max:255',
            'description'      => 'nullable|string',
            'status'           => 'nullable|in:todo,in_progress,done',
            'priority'         => 'nullable|in:low,medium,high',
            'assigned_user_id' => 'nullable|exists:users,id',
            'due_date'         => 'nullable|date',
        ]);

        $task->update($data);

        if ($task->assigned_user_id) {
            $user = User::find($task->assigned_user_id);
            SendTaskAssignedNotification::dispatch($task, $user);
        }
        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }
}
