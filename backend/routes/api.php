<?php

use App\Http\Controllers\Api\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProducerController as AdminProducerController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Customer\CouponController as CustomerCouponController;
use App\Http\Controllers\Api\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\Customer\PublicEventController;
use App\Http\Controllers\Api\Customer\TicketController as CustomerTicketController;
use App\Http\Controllers\Api\Producer\CouponController as ProducerCouponController;
use App\Http\Controllers\Api\Producer\CredentialController;
use App\Http\Controllers\Api\Producer\CustomersController as ProducerCustomersController;
use App\Http\Controllers\Api\Producer\EventController as ProducerEventController;
use App\Http\Controllers\Api\Producer\ProducerProfileController;
use App\Http\Controllers\Api\Producer\ReportController as ProducerReportController;
use App\Http\Controllers\Api\Producer\SalesController as ProducerSalesController;
use App\Http\Controllers\Api\Producer\TicketController as ProducerTicketController;
use App\Http\Controllers\Api\Producer\TicketLotController;
use App\Http\Controllers\Api\Producer\TicketRedemptionController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::put('me', [AuthController::class, 'updateProfile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('public')->group(function () {
    Route::get('events', [PublicEventController::class, 'index']);
    Route::get('events/{slug}', [PublicEventController::class, 'show']);
});

Route::post('customer/coupons/validate', [CustomerCouponController::class, 'validate']);

Route::post('webhooks/abacate-pay', [WebhookController::class, 'abacatePay'])->middleware('throttle:webhook');

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('customer')->group(function () {
        Route::get('orders', [CustomerOrderController::class, 'index']);
        Route::post('orders', [CustomerOrderController::class, 'store']);
        Route::get('orders/{order}', [CustomerOrderController::class, 'show']);
        Route::get('tickets', [CustomerTicketController::class, 'index']);
        Route::get('tickets/{ticket}', [CustomerTicketController::class, 'show']);
    });

    Route::prefix('producer')->group(function () {
        Route::get('profile', [ProducerProfileController::class, 'show']);
        Route::post('profile', [ProducerProfileController::class, 'register']);

        Route::middleware('producer.approved')->group(function () {
            Route::get('credentials', [CredentialController::class, 'show']);
            Route::put('credentials', [CredentialController::class, 'update']);

            Route::get('events', [ProducerEventController::class, 'index']);
            Route::post('events', [ProducerEventController::class, 'store']);
            Route::get('events/{event}', [ProducerEventController::class, 'show']);
            Route::put('events/{event}', [ProducerEventController::class, 'update']);
            Route::delete('events/{event}', [ProducerEventController::class, 'destroy']);
            Route::post('events/{event}/publish', [ProducerEventController::class, 'publish']);
            Route::post('events/{event}/unpublish', [ProducerEventController::class, 'unpublish']);

            Route::get('events/{event}/lots', [TicketLotController::class, 'index']);
            Route::post('events/{event}/lots', [TicketLotController::class, 'store']);
            Route::put('lots/{lot}', [TicketLotController::class, 'update']);
            Route::post('lots/{lot}/toggle-active', [TicketLotController::class, 'toggleActive']);
            Route::post('lots/{lot}/sync', [TicketLotController::class, 'sync']);
            Route::delete('lots/{lot}', [TicketLotController::class, 'destroy']);

            Route::get('sales', [ProducerSalesController::class, 'index']);
            Route::get('sales/summary', [ProducerSalesController::class, 'summary']);
            Route::get('sales/{order}', [ProducerSalesController::class, 'show']);

            Route::get('customers', [ProducerCustomersController::class, 'index']);

            Route::get('reports', [ProducerReportController::class, 'index']);

            Route::get('tickets', [ProducerTicketController::class, 'index']);
            Route::get('tickets/{ticket}', [ProducerTicketController::class, 'show']);
            Route::post('tickets/redeem', [TicketRedemptionController::class, 'redeem']);

            Route::get('coupons', [ProducerCouponController::class, 'index']);
            Route::post('coupons', [ProducerCouponController::class, 'store']);
            Route::get('coupons/{coupon}', [ProducerCouponController::class, 'show']);
            Route::put('coupons/{coupon}', [ProducerCouponController::class, 'update']);
            Route::delete('coupons/{coupon}', [ProducerCouponController::class, 'destroy']);
        });
    });

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard', AdminDashboardController::class);

        Route::get('users', [AdminUserController::class, 'index']);
        Route::put('users/{user}', [AdminUserController::class, 'update']);
        Route::delete('users/{user}', [AdminUserController::class, 'destroy']);

        Route::get('producers', [AdminProducerController::class, 'index']);
        Route::get('producers/{producer}', [AdminProducerController::class, 'show']);
        Route::put('producers/{producer}', [AdminProducerController::class, 'update']);
        Route::delete('producers/{producer}', [AdminProducerController::class, 'destroy']);
        Route::post('producers/{producer}/approve', [AdminProducerController::class, 'approve']);
        Route::post('producers/{producer}/block', [AdminProducerController::class, 'block']);

        Route::get('events', [AdminEventController::class, 'index']);
        Route::put('events/{event}', [AdminEventController::class, 'update']);
        Route::delete('events/{event}', [AdminEventController::class, 'destroy']);

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::put('orders/{order}', [AdminOrderController::class, 'update']);
        Route::delete('orders/{order}', [AdminOrderController::class, 'destroy']);

        Route::get('settings', [AdminSettingsController::class, 'show']);
        Route::put('settings', [AdminSettingsController::class, 'update']);

        Route::get('coupons', [AdminCouponController::class, 'index']);
        Route::post('coupons', [AdminCouponController::class, 'store']);
        Route::get('coupons/{coupon}', [AdminCouponController::class, 'show']);
        Route::put('coupons/{coupon}', [AdminCouponController::class, 'update']);
        Route::delete('coupons/{coupon}', [AdminCouponController::class, 'destroy']);

        Route::get('audit-logs', [AdminAuditLogController::class, 'index']);
    });
});
