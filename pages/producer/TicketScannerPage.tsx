import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { producerNav } from './nav';
import { ticketRedemptionService, type RedemptionResult } from '@services/ticketRedemptionService';
import { formatDateTime } from '@utils/format';

const SCANNER_ID = 'ticket-scanner-region';
const COOLDOWN_MS = 1200;

type Flash = 'success' | 'warn' | 'error' | null;

export function TicketScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const lockRef = useRef(false);
  const toast = useToast();

  useEffect(
    () => () => {
      void stopScannerSilently(scannerRef.current);
      scannerRef.current = null;
    },
    [],
  );

  async function startScanner() {
    if (scanning || starting) return;
    setStarting(true);

    try {
      const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false });
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras().catch(() => [] as { id: string; label: string }[]);
      if (!cameras.length) {
        throw new Error('Nenhuma câmera disponível ou permissão negada.');
      }
      const rear = cameras.find((c) => /back|rear|environment|traseir/i.test(c.label));
      const cameraId = rear?.id ?? cameras[0].id;

      await scanner.start(
        cameraId,
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decoded) => {
          void handleScan(decoded);
        },
        () => undefined,
      );
      setScanning(true);
    } catch (err) {
      await stopScannerSilently(scannerRef.current);
      scannerRef.current = null;
      setScanning(false);
      toast.error(err instanceof Error ? err.message : 'Não foi possível acessar a câmera.');
    } finally {
      setStarting(false);
    }
  }

  async function stopScanner() {
    await stopScannerSilently(scannerRef.current);
    scannerRef.current = null;
    setScanning(false);
    lastCodeRef.current = null;
    lockRef.current = false;
  }

  async function handleScan(decoded: string) {
    const trimmed = decoded.trim();
    if (lockRef.current || trimmed === lastCodeRef.current) return;
    lockRef.current = true;
    lastCodeRef.current = trimmed;
    await processCode(trimmed);
    setTimeout(() => {
      lockRef.current = false;
      lastCodeRef.current = null;
    }, COOLDOWN_MS);
  }

  async function processCode(code: string) {
    setProcessing(true);
    try {
      const res = await ticketRedemptionService.redeem(code);
      setResult(res);
      if (res.status === 'ok') {
        beep(880);
        setFlash('success');
        toast.success('Ingresso validado automaticamente.');
      } else if (res.status === 'already_used') {
        beep(440, 180, 'square');
        setFlash('warn');
        toast.error('Ingresso já utilizado.');
      } else {
        beep(220, 250, 'square');
        setFlash('error');
        toast.error(res.message);
      }
      setTimeout(() => setFlash(null), 900);
    } catch (err) {
      setFlash('error');
      setTimeout(() => setFlash(null), 900);
      toast.error(err instanceof Error ? err.message : 'Erro ao validar ingresso.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleManualSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    setManualCode('');
    await processCode(code);
  }

  const flashRing =
    flash === 'success'
      ? 'ring-4 ring-emerald-400/80 shadow-[0_0_60px_rgba(16,185,129,0.55)]'
      : flash === 'warn'
      ? 'ring-4 ring-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.5)]'
      : flash === 'error'
      ? 'ring-4 ring-rose-500/80 shadow-[0_0_60px_rgba(244,63,94,0.5)]'
      : 'ring-1 ring-white/10';

  return (
    <AppLayout title="Produtor" nav={producerNav}>
      <PageHeader
        title="Leitor de ingressos"
        description="A câmera valida cada ingresso automaticamente assim que o QR Code é lido."
        action={
          scanning ? (
            <button onClick={stopScanner} className="btn btn-secondary">
              Parar câmera
            </button>
          ) : (
            <button onClick={startScanner} disabled={starting} className="btn btn-primary">
              <Icons.ticket className="h-4 w-4" />
              {starting ? 'Abrindo câmera...' : 'Iniciar câmera'}
            </button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass-card overflow-hidden p-6 lg:col-span-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">Leitura automática</p>

          <div
            className={`relative mx-auto mt-3 aspect-square w-full max-w-md overflow-hidden rounded-xl bg-slate-900/90 shadow-inner transition-all duration-300 ${flashRing}`}
          >
            <div
              id={SCANNER_ID}
              className="absolute inset-0 h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
            />

            {!scanning && !starting && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-sm text-white/70">
                <Icons.ticket className="mb-3 h-10 w-10 opacity-70" />
                Clique em “Iniciar câmera”. Cada QR lido é validado automaticamente.
              </div>
            )}
            {starting && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10 text-center text-sm text-white/80">
                Abrindo câmera...
              </div>
            )}
            {scanning && processing && (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center bg-black/40 p-2 text-xs font-medium text-white">
                Validando...
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Ou digite o código manualmente
            </p>
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="UUID do ingresso"
                className="input font-mono"
              />
              <button type="submit" disabled={processing} className="btn btn-primary">
                Validar
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <ResultPanel result={result} processing={processing} />
        </div>
      </div>
    </AppLayout>
  );
}

async function stopScannerSilently(scanner: Html5Qrcode | null) {
  if (!scanner) return;
  try {
    if (scanner.isScanning) await scanner.stop();
    scanner.clear();
  } catch {
    /* noop */
  }
}

function beep(freq = 880, durationMs = 140, type: OscillatorType = 'sine') {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
    osc.onended = () => ctx.close();
  } catch {
    /* noop */
  }
}

function ResultPanel({ result, processing }: { result: RedemptionResult | null; processing: boolean }) {
  if (processing) {
    return (
      <div className="glass-card flex h-full items-center justify-center p-10 text-sm text-slate-500">
        Validando...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card flex h-full flex-col items-center justify-center p-10 text-center">
        <Icons.ticket className="h-12 w-12 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Aguardando leitura</p>
        <p className="mt-1 text-xs text-slate-500">Posicione o QR Code na frente da câmera.</p>
      </div>
    );
  }

  const gradient =
    result.status === 'ok'
      ? 'from-emerald-500 to-teal-600'
      : result.status === 'already_used'
      ? 'from-amber-500 to-orange-600'
      : 'from-rose-500 to-red-600';

  return (
    <div className="glass-card overflow-hidden p-0 animate-fade-up">
      <div className={`bg-gradient-to-br p-5 text-white ${gradient}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
          {result.status === 'ok'
            ? 'Ingresso validado'
            : result.status === 'already_used'
            ? 'Já utilizado'
            : result.status === 'forbidden'
            ? 'Não pertence a você'
            : 'Código inválido'}
        </p>
        <h3 className="mt-1 text-lg font-semibold">{result.message}</h3>
      </div>

      {result.data && (
        <div className="space-y-3 p-5 text-sm">
          <Row label="Evento" value={result.data.event.name} />
          <Row label="Data" value={formatDateTime(result.data.event.starts_at)} />
          <Row label="Local" value={result.data.event.venue_name ?? 'Online'} />
          <Row label="Ingresso" value={result.data.lot.name} />
          <div className="border-t border-white/60 pt-3">
            <Row label="Cliente" value={result.data.customer.name} />
            <Row label="E-mail" value={result.data.customer.email} />
          </div>
          {result.data.used_at && (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-xs text-slate-600">
              Validado em {formatDateTime(result.data.used_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
