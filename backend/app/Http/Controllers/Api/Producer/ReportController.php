<?php

namespace App\Http\Controllers\Api\Producer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $producer = $request->attributes->get('producer') ?? $request->user()->producer()->firstOrFail();

        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();
        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : Carbon::now()->endOfDay();
        $granularity = in_array($request->query('granularity'), ['day', 'week', 'month'], true)
            ? $request->query('granularity')
            : 'day';
        $eventId = $request->query('event_id');

        $base = Order::where('producer_id', $producer->id)
            ->whereBetween('created_at', [$from, $to]);

        if ($eventId) {
            $base->where('event_id', $eventId);
        }

        $paid = (clone $base)->where('status', OrderStatus::Paid);
        $pending = (clone $base)->where('status', OrderStatus::Pending);

        $totalRevenue = (float) (clone $paid)->sum('total');
        $totalPlatformFee = (float) (clone $paid)->sum('platform_fee');
        $orderCount = (clone $base)->count();
        $paidCount = (clone $paid)->count();
        $pendingCount = (clone $pending)->count();
        $conversion = $orderCount > 0 ? round($paidCount / $orderCount * 100, 2) : 0.0;

        $ticketsQuery = Ticket::whereHas('lot.event', function ($q) use ($producer, $eventId) {
            $q->where('producer_id', $producer->id);
            if ($eventId) {
                $q->where('id', $eventId);
            }
        });

        $ticketsIssued = (clone $ticketsQuery)->count();
        $ticketsRedeemed = (clone $ticketsQuery)->whereNotNull('used_at')->count();

        $format = match ($granularity) {
            'month' => '%Y-%m',
            'week' => '%x-W%v',
            default => '%Y-%m-%d',
        };

        $series = (clone $paid)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as bucket"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('SUM(platform_fee) as platform_fee'),
                DB::raw('COUNT(*) as orders'),
            )
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();

        return response()->json([
            'data' => [
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
                'granularity' => $granularity,
                'event_id' => $eventId ? (int) $eventId : null,
                'totals' => [
                    'revenue' => $totalRevenue,
                    'platform_fee' => $totalPlatformFee,
                    'net' => round($totalRevenue - $totalPlatformFee, 2),
                    'orders' => $orderCount,
                    'paid_orders' => $paidCount,
                    'pending_orders' => $pendingCount,
                    'conversion_percent' => $conversion,
                    'tickets_issued' => $ticketsIssued,
                    'tickets_redeemed' => $ticketsRedeemed,
                ],
                'series' => $series,
            ],
        ]);
    }
}
