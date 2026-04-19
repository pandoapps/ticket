<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\EventStatus;
use App\Enums\OrderStatus;
use App\Enums\ProducerStatus;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Order;
use App\Models\Producer;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $from = Carbon::now()->subDays(30)->startOfDay();

        $paid = Order::where('status', OrderStatus::Paid);

        $gmvSeries = (clone $paid)
            ->where('created_at', '>=', $from)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d') as bucket"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('SUM(platform_fee) as platform_fee'),
            )
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();

        return response()->json([
            'data' => [
                'gmv' => (float) (clone $paid)->sum('total'),
                'platform_fee_total' => (float) (clone $paid)->sum('platform_fee'),
                'orders_paid' => (clone $paid)->count(),
                'tickets_sold' => Ticket::count(),
                'events_published' => Event::where('status', EventStatus::Published->value)->count(),
                'events_total' => Event::count(),
                'producers_total' => Producer::count(),
                'producers_pending' => Producer::where('status', ProducerStatus::Pending->value)->count(),
                'customers_total' => User::where('role', 'customer')->count(),
                'gmv_series' => $gmvSeries,
            ],
        ]);
    }
}
