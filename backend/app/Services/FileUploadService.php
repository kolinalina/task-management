<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class FileUploadService
{
    const MAX_SIZE        = 52428800; // 50MB
    const CHUNK_THRESHOLD = 52428800; // 50MB

    const ALLOWED_TYPES = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Videos
        'video/mp4', 'video/webm', 'video/avi',
    ];

    public function validateFile(UploadedFile $file): array
    {
        $errors = [];

        if ($file->getSize() > self::MAX_SIZE) {
            $errors[] = 'File size exceeds 50MB limit';
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_TYPES)) {
            $errors[] = 'File type not allowed';
        }

        return $errors;
    }

    public function store(UploadedFile $file, int $taskId, int $version = 1): array
    {
        $originalName = $file->getClientOriginalName();
        $extension    = $file->getClientOriginalExtension();
        $fileName     = Str::uuid() . '.' . $extension;
        $path         = "attachments/task_{$taskId}/{$fileName}";

        Storage::disk('local')->put($path, file_get_contents($file));

        $thumbnailPath = null;
        if (str_starts_with($file->getMimeType(), 'image/')) {
            $thumbnailPath = $this->generateThumbnail($file, $taskId, $fileName);
        }

        return [
            'file_name'      => $fileName,
            'original_name'  => $originalName,
            'file_path'      => $path,
            'file_size'      => $file->getSize(),
            'mime_type'      => $file->getMimeType(),
            'thumbnail_path' => $thumbnailPath,
            'version'        => $version,
            'uploaded_at'    => now(),
        ];
    }

    private function generateThumbnail(UploadedFile $file, int $taskId, string $fileName): string
    {
        $thumbnailName = 'thumb_' . $fileName;
        $thumbnailPath = "attachments/task_{$taskId}/thumbnails/{$thumbnailName}";

        $image = Image::read($file->getPathname())
            ->scale(width: 300);

        Storage::disk('local')->put($thumbnailPath, $image->toJpeg());

        return $thumbnailPath;
    }

    public function simulateVirusScan(string $filePath): string
    {
        // scan delay
        $suspiciousExtensions = ['exe', 'bat', 'sh', 'php'];
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        if (in_array(strtolower($extension), $suspiciousExtensions)) {
            return 'infected';
        }

        return 'clean';
    }
}