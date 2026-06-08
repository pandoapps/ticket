<?php

namespace App\Http\Controllers;

use App\Enums\EventStatus;
use App\Models\Event;
use Illuminate\Http\Response;

class EventOgController extends Controller
{
    public function show(string $slug): Response
    {
        $event = Event::with(['producer', 'lots' => fn ($q) => $q->where('is_active', true)->orderBy('price')])
            ->where('slug', $slug)
            ->where('status', EventStatus::Published->value)
            ->where('is_active', true)
            ->first();

        if (! $event) {
            return response(view('og.not-found')->render(), 404)->header('Content-Type', 'text/html; charset=utf-8');
        }

        $baseUrl  = rtrim(config('app.url'), '/');
        $eventUrl = "{$baseUrl}/eventos/{$event->slug}";

        $description = $event->short_description
            ?? (mb_strlen((string) $event->description) > 160
                ? mb_substr((string) $event->description, 0, 157) . '...'
                : (string) $event->description);

        $image = $event->banner_url ?? $event->header_url ?? null;

        $producerName = $event->producer?->company_name ?? config('app.name');
        $siteName     = config('app.name', 'Ticketeira');

        $startDate = $event->starts_at?->toIso8601String() ?? '';
        $endDate   = $event->ends_at?->toIso8601String() ?? $startDate;

        $startFormatted = $event->starts_at
            ? $event->starts_at->setTimezone('America/Sao_Paulo')->locale('pt_BR')->isoFormat('dddd, D [de] MMMM [de] YYYY [às] HH:mm')
            : '';

        $venueInfo = $event->venue_type?->value === 'online'
            ? 'Evento Online'
            : ($event->venue_name ?? '');

        $venueAddress = $event->venue_address ?? $venueInfo;

        $activeLots  = $event->lots?->filter(fn ($l) => $l->isOnSale()) ?? collect();
        $minPrice    = $activeLots->min('price') ?? 0;
        $hasFreeLots = $activeLots->contains(fn ($l) => $l->price == 0);
        $priceLabel  = $hasFreeLots && $activeLots->count() === 1
            ? 'Gratuito'
            : ($minPrice > 0 ? 'A partir de R$ ' . number_format((float) $minPrice, 2, ',', '.') : 'Gratuito');

        $offersJson = $minPrice > 0
            ? json_encode([
                '@type'         => 'Offer',
                'price'         => number_format((float) $minPrice, 2, '.', ''),
                'priceCurrency' => 'BRL',
                'availability'  => 'https://schema.org/InStock',
                'url'           => $eventUrl,
            ])
            : json_encode([
                '@type'         => 'Offer',
                'price'         => '0',
                'priceCurrency' => 'BRL',
                'availability'  => $activeLots->isNotEmpty() ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                'url'           => $eventUrl,
            ]);

        $locationJson = $event->venue_type?->value === 'online'
            ? json_encode(['@type' => 'VirtualLocation', 'url' => $eventUrl])
            : json_encode(['@type' => 'Place', 'name' => e($venueInfo), 'address' => e($venueAddress)]);

        $ldJson = json_encode([
            '@context'    => 'https://schema.org',
            '@type'       => 'Event',
            'name'        => $event->name,
            'description' => $description,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'eventStatus' => 'https://schema.org/EventScheduled',
            'eventAttendanceMode' => $event->venue_type?->value === 'online'
                ? 'https://schema.org/OnlineEventAttendanceMode'
                : 'https://schema.org/OfflineEventAttendanceMode',
            'location'    => json_decode((string) $locationJson),
            'image'       => $image ? [$image] : [],
            'url'         => $eventUrl,
            'organizer'   => [
                '@type' => 'Organization',
                'name'  => $producerName,
            ],
            'offers'      => json_decode((string) $offersJson),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

        $html = view('og.event', compact(
            'event',
            'eventUrl',
            'description',
            'image',
            'producerName',
            'siteName',
            'startFormatted',
            'venueInfo',
            'priceLabel',
            'ldJson',
        ))->render();

        return response($html, 200)
            ->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Cache-Control', 'public, max-age=300');
    }
}
