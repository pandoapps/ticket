<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Link de Pagamento</title>
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .header { background: #16a34a; color: #fff; padding: 28px 32px; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 6px 0 0; font-size: 14px; opacity: .85; }
  .body { padding: 28px 32px; }
  .body p { color: #444; line-height: 1.6; }
  .amount { font-size: 28px; font-weight: 700; color: #16a34a; margin: 16px 0; }
  .items { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0; }
  .items .item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #374151; }
  .items .item:not(:last-child) { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px; }
  .btn { display: inline-block; background: #16a34a; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 16px 0; }
  .pix-code { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px; word-break: break-all; font-family: monospace; font-size: 12px; color: #166534; margin: 12px 0; }
  .qr-wrapper { text-align: center; margin: 16px 0; }
  .qr-wrapper img { max-width: 200px; border: 1px solid #e5e7eb; border-radius: 6px; }
  .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
  h2 { font-size: 16px; color: #111827; margin-top: 24px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>{{ $order->event?->name }}</h1>
    <p>Seu ingresso está quase garantido!</p>
  </div>
  <div class="body">
    <p>Olá, <strong>{{ $order->customer?->name }}</strong>!</p>
    <p>O produtor reservou {{ $order->items?->sum('quantity') }} ingresso(s) para você. Finalize o pagamento para garantir seu lugar.</p>

    <div class="items">
      @foreach($order->items ?? [] as $item)
        <div class="item">
          <span>{{ $item->lot?->name }} × {{ $item->quantity }}</span>
          <span>R$ {{ number_format($item->subtotal, 2, ',', '.') }}</span>
        </div>
      @endforeach
    </div>

    <div class="amount">Total: R$ {{ number_format($order->total, 2, ',', '.') }}</div>

    <a href="{{ $frontendUrl }}/pagar/{{ $order->payment_token }}" class="btn">Escolher forma de pagamento</a>
    <p style="font-size:13px;color:#6b7280;margin-top:8px;">
      Você poderá pagar via PIX ou Cartão de Crédito diretamente na página de pagamento.
    </p>

    <p style="font-size:13px;color:#9ca3af;margin-top:24px;">
      Este link expira em {{ $order->expires_at ? \Carbon\Carbon::parse($order->expires_at)->format('d/m/Y \à\s H:i') : '30 minutos' }}.
      Após o pagamento confirmado, seu ingresso será enviado automaticamente.
    </p>
  </div>
  <div class="footer">
    Em caso de dúvidas, entre em contato com o produtor do evento.
  </div>
</div>
</body>
</html>
