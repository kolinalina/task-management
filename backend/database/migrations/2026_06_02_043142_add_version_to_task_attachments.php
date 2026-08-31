<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('task_attachments', function (Blueprint $table) {
            $table->string('thumbnail_path')->nullable()->after('mime_type');
            $table->integer('version')->default(1)->after('thumbnail_path');
            $table->string('virus_scan_status')->default('pending')->after('version');
            $table->string('original_name')->nullable()->after('file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_attachments', function (Blueprint $table) {
            //
        });
    }
};
