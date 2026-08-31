<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessFileUpload;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function __construct(private FileUploadService $uploadService) {}

    public function index(Task $task)
    {
        return response()->json($task->attachments);
    }

    public function store(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $file   = $request->file('file');
        $errors = $this->uploadService->validateFile($file);

        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        // Check versioning — same original name = new version
        $existingVersion = TaskAttachment::where('task_id', $task->id)
            ->where('original_name', $file->getClientOriginalName())
            ->max('version') ?? 0;

        $version    = $existingVersion + 1;
        $fileData   = $this->uploadService->store($file, $task->id, $version);

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            ...$fileData,
            'virus_scan_status' => 'pending',
        ]);

        // Dispatch background job
        ProcessFileUpload::dispatch($attachment);

        return response()->json($attachment, 201);
    }

    // Chunked upload untuk file >50MB
    public function chunk(Request $request, Task $task)
    {
        $request->validate([
            'file'         => 'required|file',
            'chunk_index'  => 'required|integer',
            'total_chunks' => 'required|integer',
            'file_name'    => 'required|string',
        ]);

        $chunkDir  = storage_path("app/chunks/task_{$task->id}");
        $chunkPath = "{$chunkDir}/{$request->file_name}.part{$request->chunk_index}";

        if (!is_dir($chunkDir)) mkdir($chunkDir, 0755, true);

        $request->file('file')->move($chunkDir, "{$request->file_name}.part{$request->chunk_index}");

        // Semua chunk sudah upload? Gabungkan
        if ($request->chunk_index + 1 === $request->total_chunks) {
            $finalPath = "attachments/task_{$task->id}/{$request->file_name}";
            $output    = Storage::disk('local')->path($finalPath);

            if (!is_dir(dirname($output))) mkdir(dirname($output), 0755, true);

            $out = fopen($output, 'wb');
            for ($i = 0; $i < $request->total_chunks; $i++) {
                $chunk = fopen("{$chunkDir}/{$request->file_name}.part{$i}", 'rb');
                stream_copy_to_stream($chunk, $out);
                fclose($chunk);
                unlink("{$chunkDir}/{$request->file_name}.part{$i}");
            }
            fclose($out);

            $attachment = TaskAttachment::create([
                'task_id'           => $task->id,
                'file_name'         => $request->file_name,
                'original_name'     => $request->file_name,
                'file_path'         => $finalPath,
                'file_size'         => Storage::disk('local')->size($finalPath),
                'mime_type'         => mime_content_type($output),
                'version'           => 1,
                'virus_scan_status' => 'pending',
                'uploaded_at'       => now(),
            ]);

            ProcessFileUpload::dispatch($attachment);

            return response()->json(['message' => 'File assembled', 'attachment' => $attachment], 201);
        }

        return response()->json(['message' => "Chunk {$request->chunk_index} received"]);
    }

    public function download(TaskAttachment $attachment)
    {
        if (!Storage::disk('local')->exists($attachment->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('local')->download(
            $attachment->file_path,
            $attachment->original_name ?? $attachment->file_name
        );
    }

    public function destroy(TaskAttachment $attachment)
    {
        Storage::disk('local')->delete($attachment->file_path);
        if ($attachment->thumbnail_path) {
            Storage::disk('local')->delete($attachment->thumbnail_path);
        }
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted']);
    }
}