<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendTaskAssignedNotification implements ShouldQueue
{
    use Queueable;

    public Task $task;
    public User $user;
    /**
     * Create a new job instance.
     */
    public function __construct(Task $task, User $user)
    {
        $this->task = $task;
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // email notif
        // Mail::raw(
        //     "Hi {$this->user->name}, task '{$this->task->title}' has been assigned to you.",
        //     fn($msg) => $msg->to($this->user->email)->subject('New Task Assigned')
        // );
        Log::info("Task '{$this->task->title}' assigned to {$this->user->email}");

    }
}
