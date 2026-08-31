<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Events\CommentCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Task $task)
    {
        return response()->json(
            $task->comments()->with('user')->latest()->get()
        );
    }

    public function store(Request $request, Task $task)
    {
        $request->validate(['comment' => 'required|string']);

        $comment = $task->comments()->create([
            'user_id' => Auth::id(),
            'comment' => $request->comment,
        ]);
        
        broadcast(new CommentCreated($comment->load('user')))->toOthers();

        return response()->json($comment->load('user'), 201);
    }

    public function destroy(TaskComment $comment)
    {
        $comment->delete();
        return response()->json(['message' => 'Deleted']);
    }
}