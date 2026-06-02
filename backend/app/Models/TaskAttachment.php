<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskAttachment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'task_id',
        'file_name',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'thumbnail_path',
        'version',
        'virus_scan_status',
        'uploaded_at',
    ];
}
