<!DOCTYPE html>
<html lang="pt-BR" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>{{ $event->name }} | {{ $siteName }}</title>
  <meta name="description" content="{{ $description }}">
  <meta name="robots" content="index, follow">

  {{-- Open Graph --}}
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{ $eventUrl }}">
  <meta property="og:title" content="{{ $event->name }}">
  <meta property="og:description" content="{{ $description }}">
  <meta property="og:site_name" content="{{ $siteName }}">
  <meta property="og:locale" content="pt_BR">
  @if($image)
  <meta property="og:image" content="{{ $image }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{{ $event->name }}">
  @endif

  {{-- Twitter Card --}}
  <meta name="twitter:card" content="{{ $image ? 'summary_large_image' : 'summary' }}">
  <meta name="twitter:title" content="{{ $event->name }}">
  <meta name="twitter:description" content="{{ $description }}">
  @if($image)
  <meta name="twitter:image" content="{{ $image }}">
  @endif

  {{-- Canonical --}}
  <link rel="canonical" href="{{ $eventUrl }}">

  {{-- JSON-LD --}}
  <script type="application/ld+json">{!! $ldJson !!}</script>

  {{-- Redirect regular browsers to the React SPA --}}
  <script>
    (function () {
      var ua = navigator.userAgent || '';
      var isBot = /(bot|crawler|spider|whatsapp|facebook|twitter|telegram|slack|discord|google|bing|apple|pinterest|linkedin|iframely)/i.test(ua);
      if (!isBot) {
        window.location.replace('{{ $eventUrl }}');
      }
    })();
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f1a;
      color: #e8e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      overflow: hidden;
      max-width: 560px;
      width: 100%;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .banner {
      width: 100%;
      aspect-ratio: 21/9;
      object-fit: cover;
      display: block;
    }
    .banner-placeholder {
      width: 100%;
      aspect-ratio: 21/9;
      background: linear-gradient(135deg, #d97757 0%, #e8a87c 50%, #c06040 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
    }
    .body { padding: 28px 28px 32px; }
    .badge {
      display: inline-block;
      background: rgba(217, 119, 87, 0.15);
      color: #e8a87c;
      border: 1px solid rgba(217, 119, 87, 0.3);
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 12px;
      margin-bottom: 14px;
    }
    h1 { font-size: 22px; font-weight: 700; line-height: 1.3; color: #ffffff; margin-bottom: 10px; }
    .desc { font-size: 14px; line-height: 1.6; color: #a0a0c0; margin-bottom: 20px; }
    .meta { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #c0c0d8;
    }
    .meta-item svg { flex-shrink: 0; color: #d97757; }
    .price-row {
      background: rgba(217, 119, 87, 0.08);
      border: 1px solid rgba(217, 119, 87, 0.2);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .price-label { font-size: 12px; color: #a0a0c0; text-transform: uppercase; letter-spacing: 0.08em; }
    .price-value { font-size: 18px; font-weight: 700; color: #e8a87c; }
    .cta {
      display: block;
      width: 100%;
      padding: 14px;
      background: #d97757;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      border-radius: 12px;
      transition: background 0.2s;
    }
    .cta:hover { background: #c06040; }
    .producer {
      margin-top: 16px;
      font-size: 12px;
      color: #606080;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    @if($image)
      <img class="banner" src="{{ $image }}" alt="{{ $event->name }}" loading="eager">
    @else
      <div class="banner-placeholder">🎟️</div>
    @endif

    <div class="body">
      <span class="badge">{{ $event->venue_type?->value === 'online' ? 'Evento Online' : 'Evento Presencial' }}</span>
      <h1>{{ $event->name }}</h1>
      @if($description)
        <p class="desc">{{ $description }}</p>
      @endif

      <div class="meta">
        @if($startFormatted)
        <div class="meta-item">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ ucfirst($startFormatted) }}</span>
        </div>
        @endif
        @if($venueInfo)
        <div class="meta-item">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ $venueInfo }}@if($event->venue_address && $event->venue_address !== $venueInfo) — {{ $event->venue_address }}@endif</span>
        </div>
        @endif
      </div>

      <div class="price-row">
        <span class="price-label">Ingressos</span>
        <span class="price-value">{{ $priceLabel }}</span>
      </div>

      <a class="cta" href="{{ $eventUrl }}">Garantir meu ingresso →</a>

      <p class="producer">Organizado por <strong>{{ $producerName }}</strong></p>
    </div>
  </div>
</body>
</html>
