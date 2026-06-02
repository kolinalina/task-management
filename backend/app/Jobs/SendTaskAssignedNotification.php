<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendTaskAssignedNotification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // email notif
        Mail::raw(
            "Hi {$this->user->name}, task '{$this->task->title}' has been assigned to you.",
            fn($msg) => $msg->to($this->user->email)->subject('New Task Assigned')
        );
    }
}
