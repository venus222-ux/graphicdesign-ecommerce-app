<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MongoLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
public function index(Request $request)
{
    $perPage = $request->input('per_page', 10); // default 10, adjustable
    $search = $request->input('search');

    $query = Product::with('category')
        ->latest();

    if ($search) {
        $query->where('title', 'like', "%{$search}%")
              ->orWhere('short_description', 'like', "%{$search}%");
    }

    $products = $query->paginate($perPage);

    return $products; // Laravel automatically returns { data, current_page, last_page, per_page, total, ... }
}


/**
     * Get paginated upload logs
     */
    public function logs(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');

        $query = MongoLog::query()->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('ip', 'like', "%{$search}%")
                  ->orWhere('uploaded_by', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Delete a single log entry
     */
    public function deleteLog($id)
    {
        $log = MongoLog::find($id);

        if (!$log) {
            return response()->json(['message' => 'Log not found'], 404);
        }

        $log->delete();

        return response()->json(['message' => 'Log deleted successfully']);
    }

    /**
     * Export all logs to CSV
     */
    public function exportLogs(Request $request)
    {
        $search = $request->input('search');

        $query = MongoLog::query()->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('ip', 'like', "%{$search}%")
                  ->orWhere('uploaded_by', 'like', "%{$search}%");
            });
        }

        $logs = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="upload_logs_' . now()->format('Y-m-d_His') . '.csv"',
        ];

        $columns = ['Date', 'File Name', 'Size (MB)', 'MIME', 'Product ID', 'IP', 'Uploaded By', 'User Agent'];

        $callback = function () use ($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at,
                    $log->file_name,
                    round($log->size / (1024 * 1024), 2), // MB
                    $log->mime,
                    $log->product_id,
                    $log->ip,
                    $log->uploaded_by,
                    $log->user_agent,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

        //Read and Delete Users
    public function users()
{
    // Return users with their roles (using Spatie)
    $users = User::with('roles')->get();
    return response()->json($users);
}

public function deleteUser($id)
{
    $user = User::findOrFail($id);

    // Prevent admin from deleting themselves
    if ($user->id === auth()->id()) {
        return response()->json(['message' => 'Cannot delete your own account'], 403);
    }

    $user->delete();
    return response()->json(['message' => 'User deleted successfully']);
}
}
