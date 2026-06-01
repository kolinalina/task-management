<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // 5 Users
        $users = [
            ['name' => 'Admin User',  'email' => 'admin@test.com',  'role' => 'admin'],
            ['name' => 'Rina Rania', 'email' => 'rina@test.com',  'role' => 'user'],
            ['name' => 'Roni Muh',   'email' => 'roni@test.com',   'role' => 'user'],
            ['name' => 'Dina Kirana', 'email' => 'dina@test.com',  'role' => 'user'],
            ['name' => 'Farel Bramastya',  'email' => 'farel@test.com',   'role' => 'user'],
        ];

        foreach ($users as $u) {
            User::create([...$u, 'password' => Hash::make('password123')]);
        }

        // 15 Tasks
        $statuses   = ['todo', 'in_progress', 'done'];
        $priorities = ['low', 'medium', 'high'];

        for ($i = 1; $i <= 15; $i++) {
            Task::create([
                'title'            => "Task #$i",
                'description'      => "Description for task $i",
                'status'           => $statuses[array_rand($statuses)],
                'priority'         => $priorities[array_rand($priorities)],
                'assigned_user_id' => rand(2, 5),
                'created_by'       => 1,
                'due_date'         => now()->addDays(rand(1, 30)),
            ]);
        }

        // 10 Comments
        for ($i = 0; $i < 10; $i++) {
            TaskComment::create([
                'task_id' => rand(1, 15),
                'user_id' => rand(1, 5),
                'comment' => "This is comment number $i",
            ]);
        }
    }
}
