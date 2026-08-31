<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Task;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ExportTasksReport implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $format = 'csv')
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tasks = Task::with(['assignedUser', 'creator'])->get();

        if ($this->format === 'csv') {
            $this->exportCsv($tasks);
        } else {
            $this->exportPdf($tasks);
        }
    }

    private function exportCsv($tasks): void
    {
        $csv = "ID,Title,Status,Priority,Assigned To,Due Date\n";
        foreach ($tasks as $task) {
            $csv .= "{$task->id},{$task->title},{$task->status},{$task->priority},{$task->assignedUser?->name},{$task->due_date}\n";
        }
        Storage::disk('local')->put('exports/tasks_' . now()->timestamp . '.csv', $csv);
    }

    private function exportPdf($tasks): void
    {
        $pdf = Pdf::loadView('exports.tasks', ['tasks' => $tasks]);
        Storage::disk('local')->put('exports/tasks_' . now()->timestamp . '.pdf', $pdf->output());
    }
}
