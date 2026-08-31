<?php

namespace App\Jobs;

use App\Models\Task;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class BulkUpdateTaskStatus implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $taskIds,
        public string $status
    ) {}


    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Task::whereIn('id', $this->taskIds)->update(['status' => $this->status]);
    }
    
}
