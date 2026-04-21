<?php

namespace App\Observers;

use App\Models\TicketLot;
use App\Services\AbacatePay\AbacatePayService;
use Illuminate\Support\Facades\Log;

class TicketLotObserver
{
    public bool $afterCommit = true;

    public function __construct(private readonly AbacatePayService $abacate) {}

    public function created(TicketLot $lot): void
    {
        $this->safe('create', $lot, function () use ($lot) {
            $this->abacate->syncProductForLot($lot);
        });
    }

    public function updated(TicketLot $lot): void
    {
        if (! $lot->wasChanged(['name', 'price'])) {
            return;
        }

        $this->safe('update', $lot, function () use ($lot) {
            $this->abacate->removeProductForLot($lot);
            $this->abacate->syncProductForLot($lot);
        });
    }

    public function deleted(TicketLot $lot): void
    {
        $this->safe('delete', $lot, function () use ($lot) {
            $this->abacate->removeProductForLot($lot);
        });
    }

    private function safe(string $operation, TicketLot $lot, \Closure $callback): void
    {
        try {
            $callback();
        } catch (\Throwable $e) {
            Log::warning('AbacatePay auto-sync failed', [
                'operation' => $operation,
                'lot_id' => $lot->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
