<?php

namespace App\Jobs;

use App\Models\TaskAttachment;
use App\Services\FileUploadService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessFileUpload implements ShouldQueue
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
        $status = $service->simulateVirusScan($this->attachment->file_path);

        $this->attachment->update(['virus_scan_status' => $status]);

        if ($status === 'infected') {
            \Storage::disk('local')->delete($this->attachment->file_path);
            $this->attachment->delete();
        }
    }
}
