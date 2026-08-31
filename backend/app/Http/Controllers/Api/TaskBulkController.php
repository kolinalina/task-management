<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Jobs\BulkUpdateTaskStatus;
use App\Jobs\ExportTasksReport;

class TaskBulkController extends Controller
{
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'task_ids' => 'required|array',
            'status'   => 'required|in:todo,in_progress,done',
        ]);

        BulkUpdateTaskStatus::dispatch($request->task_ids, $request->status);

        return response()->json(['message' => 'Bulk update queued']);
    }

    public function export(Request $request)
    {
        $format = $request->format ?? 'csv';
        ExportTasksReport::dispatch($format);

        return response()->json(['message' => "Export {$format} queued"]);
    }
}
