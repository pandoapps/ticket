import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// ── Paleta fiel ao Ticketeira ──────────────────────────────────────────────
const C = {
  brand500: '#3b61ff',
  brand600: '#2541f5',
  brand700: '#1d31dc',
  accent400: '#e879f9',
  accent500: '#d946ef',
  accent600: '#c026d3',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  white: '#ffffff',
  green: '#16a34a',
};

const APP_BG =
  'radial-gradient(1200px 600px at -10% -20%, rgba(125,123,255,0.35), transparent 60%), ' +
  'radial-gradient(900px 500px at 110% 10%, rgba(217,70,239,0.25), transparent 55%), ' +
  'radial-gradient(800px 500px at 50% 120%, rgba(59,97,255,0.25), transparent 60%), ' +
  'linear-gradient(180deg, #f7f8ff 0%, #eef0ff 100%)';

const DARK_BG = 'linear-gradient(135deg, #080a22 0%, #14083a 45%, #071530 100%)';
const GRAD_BTN = `linear-gradient(90deg, ${C.brand600}, ${C.accent600})`;
const FONT = "'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', sans-serif";

// ── Helpers ────────────────────────────────────────────────────────────────
function cl(frame: number, fr: [number, number], to: [number, number]) {
  return interpolate(frame, fr, to, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function fadeSeq(frame: number, inEnd: number, outStart: number, total: number) {
  return interpolate(
    frame,
    [0, inEnd, outStart, total],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

// ── Shared UI Atoms ────────────────────────────────────────────────────────

const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.65)',
      border: '1px solid rgba(255,255,255,0.55)',
      borderRadius: 16,
      boxShadow: '0 10px 30px -10px rgba(30,42,138,0.2), 0 2px 6px -2px rgba(30,42,138,0.1)',
      ...style,
    }}
  >
    {children}
  </div>
);

const Input: React.FC<{
  label: string;
  value: string;
  active?: boolean;
  cursor?: boolean;
  style?: React.CSSProperties;
}> = ({ label, value, active, cursor, style }) => (
  <div style={{ ...style }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.slate600,
        marginBottom: 5,
        letterSpacing: '0.01em',
      }}
    >
      {label}
    </div>
    <div
      style={{
        padding: '9px 13px',
        borderRadius: 11,
        border: active ? `1.5px solid ${C.brand500}` : '1.5px solid rgba(200,210,255,0.7)',
        background: active ? C.white : 'rgba(255,255,255,0.7)',
        fontSize: 13,
        color: value ? C.slate900 : C.slate400,
        minHeight: 38,
        boxShadow: active ? '0 0 0 3px rgba(59,97,255,0.12)' : undefined,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {value || (!active ? <span style={{ color: C.slate400 }}>—</span> : '')}
      {cursor && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: 14,
            background: C.brand600,
            marginLeft: 1,
            borderRadius: 1,
          }}
        />
      )}
    </div>
  </div>
);

const Btn: React.FC<{
  label: string;
  primary?: boolean;
  scale?: number;
  style?: React.CSSProperties;
}> = ({ label, primary, scale = 1, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 22px',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transform: `scale(${scale})`,
      background: primary ? GRAD_BTN : 'rgba(255,255,255,0.7)',
      color: primary ? C.white : C.slate700,
      border: primary ? 'none' : '1px solid rgba(200,210,255,0.5)',
      boxShadow: primary ? '0 4px 14px rgba(37,65,245,0.35)' : undefined,
      ...style,
    }}
  >
    {label}
  </div>
);

// Sidebar nav
const NavItem: React.FC<{ label: string; icon: string; active?: boolean }> = ({
  label,
  icon,
  active,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 11,
      fontSize: 13,
      fontWeight: 500,
      background: active ? GRAD_BTN : 'transparent',
      color: active ? C.white : C.slate600,
      marginBottom: 2,
    }}
  >
    <span style={{ fontSize: 15 }}>{icon}</span>
    {label}
  </div>
);

const Sidebar: React.FC<{ active: string }> = ({ active }) => (
  <div
    style={{
      position: 'absolute',
      top: 14,
      left: 14,
      bottom: 14,
      width: 188,
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(255,255,255,0.55)',
      borderRadius: 22,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 30px -10px rgba(30,42,138,0.22)',
      padding: '18px 14px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: FONT,
    }}
  >
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.25em',
          color: C.brand600,
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        Ticketeira
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.slate900 }}>Painel do Produtor</div>
    </div>
    <NavItem label="Dashboard" icon="📊" active={active === 'dashboard'} />
    <NavItem label="Eventos" icon="🎭" active={active === 'eventos'} />
    <NavItem label="Ingressos" icon="🎫" active={active === 'ingressos'} />
    <NavItem label="PDV" icon="🖥️" active={active === 'pos'} />
    <NavItem label="Relatórios" icon="📈" active={active === 'relatorios'} />
    <NavItem label="Clientes" icon="👥" active={active === 'clientes'} />
  </div>
);

const Content: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 216,
      right: 0,
      bottom: 0,
      padding: '26px 30px',
      fontFamily: FONT,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const PageTitle: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h1 style={{ fontSize: 20, fontWeight: 700, color: C.slate900, margin: 0 }}>{title}</h1>
    <p style={{ fontSize: 12, color: C.slate500, margin: '3px 0 0 0' }}>{sub}</p>
  </div>
);

const Toast: React.FC<{ message: string; opacity: number }> = ({ message, opacity }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 28,
      right: 28,
      background: C.green,
      color: C.white,
      padding: '11px 18px',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600,
      opacity,
      boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: FONT,
    }}
  >
    ✓ {message}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// CENA 1 — Abertura (frames 0–149, 5s)
// ══════════════════════════════════════════════════════════════════════════════
const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const iconScale = spring({ frame: Math.max(0, frame - 5), fps: 30, config: { damping: 10, stiffness: 120 } });
  const line1Opacity = cl(frame, [20, 45], [0, 1]);
  const line1Y = cl(frame, [20, 45], [24, 0]);
  const line2Opacity = cl(frame, [55, 80], [0, 1]);
  const line2Y = cl(frame, [55, 80], [24, 0]);
  const globalOut = cl(frame, [128, 149], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        background: DARK_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        opacity: globalOut,
      }}
    >
      {/* glow orbs */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,65,245,0.28) 0%, transparent 65%)',
          top: '50%',
          left: '28%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,38,211,0.22) 0%, transparent 65%)',
          top: '15%',
          right: '10%',
          pointerEvents: 'none',
        }}
      />

      {/* icon */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 30,
          transform: `scale(${iconScale})`,
          filter: 'drop-shadow(0 0 24px rgba(59,97,255,0.85))',
          lineHeight: 1,
        }}
      >
        🎫
      </div>

      {/* linha 1 */}
      <div
        style={{
          maxWidth: 820,
          textAlign: 'center',
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          padding: '0 24px',
        }}
      >
        <p
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.35,
            margin: 0,
          }}
        >
          Está cansado de pagar taxas abusivas para vender seus ingressos?
        </p>
      </div>

      {/* linha 2 */}
      <div
        style={{
          maxWidth: 820,
          textAlign: 'center',
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          marginTop: 22,
          padding: '0 24px',
        }}
      >
        <p
          style={{
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.3,
            margin: 0,
            background: `linear-gradient(90deg, ${C.accent400}, ${C.brand500}, ${C.accent400})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } as React.CSSProperties}
        >
          Então crie agora mesmo seu próprio portal de vendas!
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 2 — Brand reveal (frames 150–209, 2s)
// ══════════════════════════════════════════════════════════════════════════════
const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleSpring = spring({ frame, fps, config: { damping: 11, stiffness: 140 } });
  const opacity = fadeSeq(frame, 20, 45, 60);

  return (
    <AbsoluteFill
      style={{
        background: APP_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        opacity,
      }}
    >
      <div style={{ textAlign: 'center', transform: `scale(${scaleSpring})` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: GRAD_BTN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              boxShadow: '0 8px 28px rgba(37,65,245,0.45)',
            }}
          >
            🎫
          </div>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.28em',
                color: C.brand600,
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              Apresentando
            </div>
            <div
              style={{
                fontSize: 50,
                fontWeight: 800,
                color: C.slate900,
                letterSpacing: '-1.5px',
                lineHeight: 1,
              }}
            >
              Ticketeira
            </div>
          </div>
        </div>
        <p style={{ fontSize: 17, color: C.slate500, margin: 0, fontWeight: 400 }}>
          Sua plataforma completa de venda de ingressos
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 3 — Dashboard (frames 210–359, 5s)
// ══════════════════════════════════════════════════════════════════════════════
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  delay?: number;
  accent?: string;
}> = ({ label, value, icon, delay = 0, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 11, stiffness: 180 } });

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.68)',
        border: '1px solid rgba(255,255,255,0.55)',
        borderRadius: 14,
        padding: '16px 18px',
        transform: `scale(${sc})`,
        boxShadow: '0 10px 28px -8px rgba(30,42,138,0.18)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: C.slate500, fontWeight: 500, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </div>
          <div
            style={{
              fontSize: 21,
              fontWeight: 700,
              color: accent ?? C.slate900,
            }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, rgba(37,65,245,0.12), rgba(192,38,211,0.12))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = fadeSeq(frame, 18, 132, 150);
  const y = cl(frame, [0, 25], [18, 0]);

  const revenue = Math.round(cl(frame, [15, 100], [0, 45780]));
  const tickets = Math.round(cl(frame, [20, 105], [0, 324]));
  const orders = Math.round(cl(frame, [18, 102], [0, 152]));
  const net = Math.round(cl(frame, [15, 100], [0, 41200]));

  const chartH = 155;
  const bars = [0.32, 0.55, 0.48, 0.72, 0.61, 0.85, 0.78, 0.93, 0.88, 1.0];
  const months = ['17/5', '18/5', '19/5', '20/5', '21/5', '22/5', '23/5', '24/5', '25/5', '26/5'];

  return (
    <AbsoluteFill style={{ background: APP_BG, opacity, fontFamily: FONT }}>
      <Sidebar active="dashboard" />
      <Content>
        <div style={{ transform: `translateY(${y}px)` }}>
          <PageTitle title="Dashboard" sub="Visão geral das suas vendas" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard label="Receita Bruta" value={`R$ ${revenue.toLocaleString('pt-BR')}`} icon="💰" delay={0} />
            <StatCard label="Receita Líquida" value={`R$ ${net.toLocaleString('pt-BR')}`} icon="✅" delay={4} accent={C.green} />
            <StatCard label="Ingressos" value={tickets.toString()} icon="🎫" delay={8} />
            <StatCard label="Pedidos Pagos" value={orders.toString()} icon="📦" delay={12} />
          </div>

          <GlassCard style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.slate800, marginBottom: 14 }}>
              Receita dos últimos 10 dias
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: chartH }}>
              {bars.map((v, i) => {
                const h = Math.max(3, cl(frame, [40 + i * 5, 110 + i * 3], [0, v]) * chartH);
                return (
                  <div
                    key={i}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: h,
                        background: GRAD_BTN,
                        borderRadius: '6px 6px 0 0',
                        opacity: 0.82,
                      }}
                    />
                    <span style={{ fontSize: 10, color: C.slate400, fontWeight: 500 }}>{months[i]}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </Content>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 4 — Criar Evento (frames 360–539, 6s)
// ══════════════════════════════════════════════════════════════════════════════
const CreateEventScene: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = fadeSeq(frame, 16, 165, 180);
  const y = cl(frame, [0, 22], [22, 0]);

  const NAME = 'Show de Rock Nacional';
  const nameChars = Math.floor(cl(frame, [18, 72], [0, NAME.length]));

  const DESC = 'Uma noite incrível com as melhores bandas do Brasil!';
  const descChars = Math.floor(cl(frame, [85, 128], [0, DESC.length]));

  const VENUE = 'Arena São Paulo — Portão 4';
  const venueChars = Math.floor(cl(frame, [98, 138], [0, VENUE.length]));

  const showDate = frame >= 75;
  const showBtns = cl(frame, [145, 158], [0, 1]);
  const btnScale = cl(frame, [158, 168], [1, 0.94]);
  const toastOpacity = cl(frame, [168, 180], [0, 1]);

  return (
    <AbsoluteFill style={{ background: APP_BG, opacity, fontFamily: FONT }}>
      <Sidebar active="eventos" />
      <Content>
        <div style={{ transform: `translateY(${y}px)` }}>
          <PageTitle title="Novo Evento" sub="Preencha os dados do evento" />

          <GlassCard style={{ padding: '24px 28px', maxWidth: 620 }}>
            <Input
              label="Nome do evento *"
              value={NAME.slice(0, nameChars)}
              active={frame >= 18 && frame < 78}
              cursor={frame >= 18 && frame < 78}
              style={{ marginBottom: 16 }}
            />
            <Input
              label="Descrição curta"
              value={DESC.slice(0, descChars)}
              active={frame >= 85 && frame < 132}
              cursor={frame >= 85 && frame < 132}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <Input
                label="Data de início *"
                value={showDate ? '15/07/2025 às 20:00' : ''}
                active={frame >= 75 && frame < 90}
              />
              <Input
                label="Local / Venue"
                value={VENUE.slice(0, venueChars)}
                active={frame >= 98 && frame < 142}
                cursor={frame >= 98 && frame < 142}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 0,
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.slate600, marginBottom: 5, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                  Tipo
                </div>
                <div
                  style={{
                    padding: '9px 13px',
                    borderRadius: 11,
                    border: '1.5px solid rgba(200,210,255,0.7)',
                    background: 'rgba(255,255,255,0.7)',
                    fontSize: 13,
                    color: C.slate700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🏟️ Presencial
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.slate600, marginBottom: 5, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                  Pagamentos
                </div>
                <div
                  style={{
                    padding: '9px 13px',
                    borderRadius: 11,
                    border: '1.5px solid rgba(200,210,255,0.7)',
                    background: 'rgba(255,255,255,0.7)',
                    fontSize: 13,
                    color: C.slate700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ✓ Pix &nbsp; ✓ Cartão
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 22,
                opacity: showBtns,
              }}
            >
              <Btn label="Cancelar" />
              <Btn label="Criar Evento" primary scale={btnScale} />
            </div>
          </GlassCard>
        </div>
      </Content>
      <Toast message="Evento criado com sucesso!" opacity={toastOpacity} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 5 — Criar Ingressos (frames 540–689, 5s)
// ══════════════════════════════════════════════════════════════════════════════
const TicketsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = fadeSeq(frame, 16, 135, 150);

  const showModal = frame >= 32;
  const modalScale = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 13, stiffness: 175 },
  });
  const modalOpacity = cl(frame, [32, 50], [0, 1]);

  const LOT = 'Pista Premium';
  const lotChars = Math.floor(cl(frame, [55, 90], [0, LOT.length]));

  const price = cl(frame, [95, 128], [0, 150.0]);
  const qty = Math.round(cl(frame, [100, 132], [0, 500]));

  const showBtns = cl(frame, [128, 138], [0, 1]);
  const btnScale = cl(frame, [136, 144], [1, 0.94]);
  const toastOpacity = cl(frame, [142, 149], [0, 1]);

  const tableOpacity = cl(frame, [5, 22], [0, 1]);

  return (
    <AbsoluteFill style={{ background: APP_BG, opacity, fontFamily: FONT }}>
      <Sidebar active="ingressos" />
      <Content>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.slate900, margin: 0 }}>Ingressos</h1>
            <p style={{ fontSize: 12, color: C.slate500, margin: '3px 0 0 0' }}>
              Show de Rock Nacional — Lotes e disponibilidade
            </p>
          </div>
          <Btn label="+ Novo Lote" primary style={{ opacity: tableOpacity }} />
        </div>

        {/* Tabela de lotes */}
        <GlassCard style={{ overflow: 'hidden', opacity: tableOpacity }}>
          {/* header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '11px 20px',
              borderBottom: '1px solid rgba(30,42,138,0.07)',
              fontSize: 11,
              fontWeight: 600,
              color: C.slate400,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            <span>Lote</span>
            <span>Preço</span>
            <span>Disponível</span>
            <span>Vendidos</span>
          </div>

          {[
            { name: 'Meia-Entrada', sub: 'Lote 1', price: 'R$ 75,00', avail: '350', sold: '150', color: '#0891b2', emoji: '🎓' },
            { name: 'Inteira', sub: 'Lote 1', price: 'R$ 150,00', avail: '300', sold: '87', color: '#2541f5', emoji: '🎫' },
            { name: 'VIP', sub: 'Especial', price: 'R$ 320,00', avail: '50', sold: '43', color: '#7c3aed', emoji: '⭐' },
          ].map((row) => (
            <div
              key={row.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(30,42,138,0.04)',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: `linear-gradient(135deg, ${row.color}cc, ${row.color})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                  }}
                >
                  {row.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.slate900 }}>{row.name}</div>
                  <div style={{ fontSize: 11, color: C.slate500 }}>{row.sub}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.slate900 }}>{row.price}</span>
              <span style={{ fontSize: 13, color: C.slate600 }}>{row.avail}</span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  color: C.slate600,
                }}
              >
                {row.sold}
                <span
                  style={{
                    fontSize: 10,
                    background: 'rgba(37,65,245,0.1)',
                    color: C.brand600,
                    borderRadius: 5,
                    padding: '1px 5px',
                    fontWeight: 600,
                  }}
                >
                  vendidos
                </span>
              </div>
            </div>
          ))}
        </GlassCard>
      </Content>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,15,40,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: modalOpacity,
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 20,
              padding: '28px 30px',
              width: 440,
              transform: `scale(${modalScale})`,
              boxShadow: '0 30px 60px -20px rgba(30,42,138,0.35)',
              fontFamily: FONT,
            }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.slate900, margin: '0 0 22px 0' }}>
              Novo Lote de Ingressos
            </h2>

            <Input
              label="Nome do lote *"
              value={LOT.slice(0, lotChars)}
              active={frame >= 55 && frame < 94}
              cursor={frame >= 55 && frame < 94}
              style={{ marginBottom: 14 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 5, letterSpacing: '0.01em' }}>
                  Preço (R$)
                </div>
                <div
                  style={{
                    padding: '9px 13px',
                    borderRadius: 11,
                    border: '1.5px solid rgba(200,210,255,0.6)',
                    background: 'rgba(248,250,252,0.9)',
                    fontSize: 13,
                    color: C.slate900,
                    minHeight: 38,
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 600,
                  }}
                >
                  {price > 0 ? `R$ ${price.toFixed(2).replace('.', ',')}` : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.slate600, marginBottom: 5, letterSpacing: '0.01em' }}>
                  Quantidade
                </div>
                <div
                  style={{
                    padding: '9px 13px',
                    borderRadius: 11,
                    border: '1.5px solid rgba(200,210,255,0.6)',
                    background: 'rgba(248,250,252,0.9)',
                    fontSize: 13,
                    color: C.slate900,
                    minHeight: 38,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {qty > 0 ? qty.toString() : ''}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: 11,
                background: 'rgba(37,65,245,0.06)',
                border: '1px solid rgba(37,65,245,0.12)',
                fontSize: 12,
                color: C.brand700,
                marginBottom: 20,
              }}
            >
              💡 As vendas ficam disponíveis imediatamente após salvar.
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
                opacity: showBtns,
              }}
            >
              <Btn label="Cancelar" />
              <Btn label="Salvar Lote" primary scale={btnScale} />
            </div>
          </div>
        </div>
      )}

      <Toast message="Lote criado com sucesso!" opacity={toastOpacity} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 6 — Relatórios de Vendas (frames 690–839, 5s)
// ══════════════════════════════════════════════════════════════════════════════
const ReportsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = fadeSeq(frame, 18, 132, 150);
  const y = cl(frame, [0, 24], [18, 0]);

  const revenue = Math.round(cl(frame, [12, 95], [0, 67500]));
  const net = Math.round(cl(frame, [12, 95], [0, 61200]));
  const tickets = Math.round(cl(frame, [16, 100], [0, 537]));
  const orders = Math.round(cl(frame, [18, 102], [0, 280]));

  const chartH = 145;
  const dayBars = [0.4, 0.55, 0.48, 0.7, 0.62, 0.85, 0.78, 0.95, 0.88, 1.0, 0.72, 0.9];
  const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const breakdown = [
    { name: 'Pista Premium', sold: 320, total: 500, color: C.brand600 },
    { name: 'VIP', sold: 87, total: 100, color: '#7c3aed' },
    { name: 'Meia-Entrada', sold: 130, total: 350, color: '#0891b2' },
  ];

  return (
    <AbsoluteFill style={{ background: APP_BG, opacity, fontFamily: FONT }}>
      <Sidebar active="relatorios" />
      <Content>
        <div style={{ transform: `translateY(${y}px)` }}>
          <PageTitle title="Relatório de Vendas" sub="Show de Rock Nacional — Julho 2025" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13, marginBottom: 18 }}>
            <StatCard label="Receita Total" value={`R$ ${revenue.toLocaleString('pt-BR')}`} icon="💰" delay={0} />
            <StatCard label="Receita Líquida" value={`R$ ${net.toLocaleString('pt-BR')}`} icon="✅" delay={4} accent={C.green} />
            <StatCard label="Ingressos Emitidos" value={tickets.toString()} icon="🎫" delay={8} />
            <StatCard label="Pedidos Pagos" value={orders.toString()} icon="📦" delay={12} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16 }}>
            {/* Gráfico de vendas */}
            <GlassCard style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.slate800, marginBottom: 12 }}>
                Vendas por dia — Julho 2025
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: chartH }}>
                {dayBars.map((v, i) => {
                  const h = Math.max(3, cl(frame, [18 + i * 4, 90 + i * 2], [0, v]) * chartH);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div
                        style={{
                          width: '100%',
                          height: h,
                          background: GRAD_BTN,
                          borderRadius: '5px 5px 0 0',
                          opacity: 0.8,
                        }}
                      />
                      <span style={{ fontSize: 9, color: C.slate400, fontWeight: 500 }}>{days[i]}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Breakdown por tipo */}
            <GlassCard style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.slate800, marginBottom: 18 }}>
                Por tipo de ingresso
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {breakdown.map((item, i) => {
                  const pct = cl(frame, [20 + i * 14, 100 + i * 10], [0, item.sold / item.total]);
                  const soldDisplay = Math.round(pct * item.sold);
                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.slate700 }}>{item.name}</span>
                        <span style={{ fontSize: 12, color: C.slate500 }}>
                          {soldDisplay}/{item.total}
                        </span>
                      </div>
                      <div style={{ height: 7, background: 'rgba(30,42,138,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct * 100}%`,
                            background: item.color,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Taxa de conversão */}
              <div
                style={{
                  marginTop: 22,
                  padding: '12px 14px',
                  borderRadius: 11,
                  background: 'rgba(37,65,245,0.06)',
                  border: '1px solid rgba(37,65,245,0.12)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: C.slate700 }}>Taxa de conversão</span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    background: GRAD_BTN,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } as React.CSSProperties}
                >
                  {cl(frame, [30, 110], [0, 82.4]).toFixed(1)}%
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </Content>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 7 — CTA Final (frames 840–929, 3s)
// ══════════════════════════════════════════════════════════════════════════════
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = cl(frame, [0, 18], [0, 1]);
  const logoSc = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });

  const line1 = cl(frame, [12, 32], [0, 1]);
  const line2 = cl(frame, [26, 46], [0, 1]);
  const line3 = cl(frame, [40, 62], [0, 1]);
  const bullets = cl(frame, [55, 75], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: DARK_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        opacity,
      }}
    >
      {/* glow orbs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,65,245,0.3) 0%, transparent 65%)', top: '50%', left: '25%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,38,211,0.26) 0%, transparent 65%)', top: '15%', right: '8%', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', zIndex: 1, transform: `scale(${logoSc})` }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20, opacity: line1 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: GRAD_BTN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              boxShadow: '0 10px 32px rgba(37,65,245,0.55)',
            }}
          >
            🎫
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 2 }}>
              Comece agora
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: C.white, letterSpacing: '-1.5px', lineHeight: 1 }}>
              Ticketeira
            </div>
          </div>
        </div>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', margin: '0 0 28px 0', opacity: line2 }}>
          Sua plataforma completa de venda de ingressos
        </p>

        <div style={{ opacity: line3 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 34px',
              borderRadius: 14,
              background: GRAD_BTN,
              fontSize: 16,
              fontWeight: 700,
              color: C.white,
              boxShadow: '0 10px 32px rgba(37,65,245,0.55)',
            }}
          >
            Crie seu portal agora →
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            display: 'flex',
            justifyContent: 'center',
            gap: 28,
            opacity: bullets,
          }}
        >
          {['Sem taxa de setup', 'Suas regras', 'Sua marca'].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: C.accent400 }}>✦</span> {t}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CENA 6 — PDV / Ponto de Venda (frames 690–869, 6s)
// ══════════════════════════════════════════════════════════════════════════════
const EMERALD = '#059669';
const EMERALD_LIGHT = '#ecfdf5';
const EMERALD_BORDER = '#6ee7b7';

const PosLotRow: React.FC<{
  name: string;
  price: string;
  avail: string;
  qty: number;
  plusActive?: boolean;
  delay?: number;
}> = ({ name, price, avail, qty, plusActive, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 13, stiffness: 200 } });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 16px',
        borderBottom: '1px solid #f1f5f9',
        transform: `scale(${sc})`,
        transformOrigin: 'left center',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.slate800 }}>{name}</div>
        <div style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>
          {price} · {avail} disponíveis
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `1px solid #cbd5e1`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: C.slate500,
            background: qty === 0 ? '#f8fafc' : C.white,
            opacity: qty === 0 ? 0.4 : 1,
          }}
        >
          −
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.slate900, width: 18, textAlign: 'center' }}>
          {qty}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `1.5px solid ${plusActive ? EMERALD : '#cbd5e1'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: plusActive ? EMERALD : C.slate500,
            background: plusActive ? EMERALD_LIGHT : C.white,
            fontWeight: 700,
            transform: plusActive ? 'scale(1.18)' : 'scale(1)',
            boxShadow: plusActive ? `0 0 0 3px ${EMERALD}22` : undefined,
          }}
        >
          +
        </div>
      </div>
    </div>
  );
};

const PosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = fadeSeq(frame, 16, 165, 180);

  // Qty dos lotes animados
  const qtyPista = frame >= 42 ? 1 : 0;
  const qtyVip = frame >= 62 ? 1 : 0;

  // Subtotal aparece depois das seleções
  const subtotalOpacity = cl(frame, [65, 78], [0, 1]);

  // Customer inputs
  const NAME = 'Ana Silva';
  const nameChars = Math.floor(cl(frame, [80, 105], [0, NAME.length]));
  const EMAIL = 'ana.silva@gmail.com';
  const emailChars = Math.floor(cl(frame, [108, 135], [0, EMAIL.length]));

  // Customer found badge
  const foundOpacity = cl(frame, [136, 146], [0, 1]);

  // Confirm button
  const btnScale = cl(frame, [150, 158], [1, 0.94]);
  const btnOpacity = cl(frame, [148, 155], [1, 0.7]);

  // Success screen
  const showSuccess = frame >= 160;
  const successScale = spring({ frame: Math.max(0, frame - 160), fps, config: { damping: 13, stiffness: 160 } });
  const successOpacity = cl(frame, [160, 172], [0, 1]);

  // Plus button pulses
  const plus1Active = frame >= 38 && frame <= 48;
  const plus2Active = frame >= 58 && frame <= 68;

  const lotsOpacity = cl(frame, [18, 30], [0, 1]);

  return (
    <AbsoluteFill style={{ background: APP_BG, opacity, fontFamily: FONT }}>
      <Sidebar active="pos" />
      <Content>
        {/* Page header */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.slate900, margin: 0 }}>Ponto de Venda</h1>
          <p style={{ fontSize: 12, color: C.slate500, margin: '3px 0 0 0' }}>
            Venda presencial — registre e confirme ingressos instantaneamente
          </p>
        </div>

        {/* Event selector */}
        <div
          style={{
            background: C.white,
            border: '1.5px solid #e2e8f0',
            borderRadius: 11,
            padding: '11px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.slate900 }}>Show de Rock Nacional</div>
            <div style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>Arena São Paulo · 15/07/2025</div>
          </div>
          <div style={{ fontSize: 18, color: C.slate300 }}>▾</div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>

          {/* LEFT — lotes */}
          <div style={{ opacity: lotsOpacity }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.slate400,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Ingressos
            </div>

            <div
              style={{
                background: C.white,
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <PosLotRow name="Pista Premium" price="R$ 320,00" avail="350" qty={qtyPista} plusActive={plus1Active} delay={8} />
              <PosLotRow name="Meia-Entrada" price="R$ 75,00" avail="180" qty={0} delay={14} />
              <PosLotRow name="VIP Backstage" price="R$ 150,00" avail="13" qty={qtyVip} plusActive={plus2Active} delay={20} />
            </div>

            {/* Coupon */}
            <div
              style={{
                marginTop: 12,
                padding: '9px 13px',
                background: C.white,
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 12,
                color: C.slate400,
                letterSpacing: '0.04em',
                width: 200,
              }}
            >
              Código de cupom…
            </div>

            {/* Subtotal */}
            <div
              style={{
                marginTop: 12,
                padding: '12px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: subtotalOpacity,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: C.slate700 }}>Subtotal</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.slate900 }}>R$ 470,00</span>
            </div>
          </div>

          {/* RIGHT — cliente + pagamento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Cliente */}
            <div
              style={{
                background: C.white,
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.slate400,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Cliente <span style={{ fontWeight: 400, color: '#94a3b8' }}>(opcional)</span>
              </div>

              {/* Name */}
              <div
                style={{
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: frame >= 80 && frame < 110 ? `1.5px solid ${EMERALD_BORDER}` : '1px solid #e2e8f0',
                  background: frame >= 80 && frame < 110 ? EMERALD_LIGHT : '#f8fafc',
                  fontSize: 13,
                  color: C.slate800,
                  marginBottom: 8,
                  minHeight: 36,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {NAME.slice(0, nameChars)}
                {frame >= 80 && frame < 110 && (
                  <span style={{ display: 'inline-block', width: 2, height: 13, background: EMERALD, marginLeft: 1, borderRadius: 1 }} />
                )}
                {nameChars === 0 && <span style={{ color: '#cbd5e1' }}>Nome do cliente</span>}
              </div>

              {/* Email */}
              <div
                style={{
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: frame >= 108 && frame < 138 ? `1.5px solid ${EMERALD_BORDER}` : '1px solid #e2e8f0',
                  background: frame >= 108 && frame < 138 ? EMERALD_LIGHT : '#f8fafc',
                  fontSize: 13,
                  color: C.slate800,
                  minHeight: 36,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {EMAIL.slice(0, emailChars)}
                {frame >= 108 && frame < 138 && (
                  <span style={{ display: 'inline-block', width: 2, height: 13, background: EMERALD, marginLeft: 1, borderRadius: 1 }} />
                )}
                {emailChars === 0 && <span style={{ color: '#cbd5e1' }}>E-mail</span>}
              </div>

              {/* Found badge */}
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: EMERALD,
                  opacity: foundOpacity,
                }}
              >
                <span style={{ fontSize: 14 }}>✓</span> Cliente encontrado: Ana Silva
              </div>
            </div>

            {/* Pagamento */}
            <div
              style={{
                background: C.white,
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.slate400,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Pagamento
              </div>

              {/* Marcar como pago */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '11px 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${EMERALD_BORDER}`,
                  background: EMERALD_LIGHT,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: `2px solid ${EMERALD}`,
                    background: EMERALD,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.white }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.slate800 }}>Marcar como pago</div>
                  <div style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>
                    Registra a venda imediatamente como confirmada
                  </div>
                </div>
              </div>

              {/* Enviar link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '11px 12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #cbd5e1',
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.slate700 }}>Enviar link de pagamento</div>
                  <div style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>
                    Cliente escolhe PIX ou Cartão
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <div
              style={{
                background: EMERALD,
                borderRadius: 13,
                padding: '13px 0',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: C.white,
                cursor: 'pointer',
                transform: `scale(${btnScale})`,
                opacity: btnOpacity,
                boxShadow: '0 4px 18px rgba(5,150,105,0.4)',
              }}
            >
              Confirmar Venda — R$ 470,00
            </div>
          </div>
        </div>
      </Content>

      {/* Success overlay */}
      {showSuccess && (
        <AbsoluteFill
          style={{
            background: 'rgba(248,250,252,0.96)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: successOpacity,
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              transform: `scale(${successScale})`,
              maxWidth: 440,
            }}
          >
            {/* Checkmark */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: EMERALD_LIGHT,
                border: `2px solid ${EMERALD_BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 32,
              }}
            >
              ✓
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.slate900, margin: '0 0 8px 0' }}>
              Venda realizada com sucesso!
            </h2>
            <p style={{ fontSize: 14, color: C.slate500, margin: '0 0 24px 0' }}>
              Pedido #4821 · Os ingressos foram emitidos automaticamente
            </p>

            {/* Order summary */}
            <div
              style={{
                background: C.white,
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '16px 20px',
                textAlign: 'left',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: C.slate800, marginBottom: 10 }}>
                Show de Rock Nacional
              </div>
              {[
                { name: 'Pista Premium × 1', price: 'R$ 320,00' },
                { name: 'VIP Backstage × 1', price: 'R$ 150,00' },
              ].map((item) => (
                <div
                  key={item.name}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.slate600, padding: '4px 0' }}
                >
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.slate900,
                  borderTop: '1px solid #e2e8f0',
                  marginTop: 10,
                  paddingTop: 10,
                }}
              >
                <span>Total</span>
                <span>R$ 470,00</span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '11px 28px',
                borderRadius: 11,
                background: EMERALD,
                fontSize: 14,
                fontWeight: 600,
                color: C.white,
                boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
              }}
            >
              Nova Venda
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSIÇÃO PRINCIPAL
// Timeline (30fps):
//  0–149  : Abertura (5s)
// 150–209 : Brand reveal (2s)
// 210–359 : Dashboard (5s)
// 360–539 : Criar Evento (6s)
// 540–689 : Criar Ingressos (5s)
// 690–869 : PDV / Ponto de Venda (6s)  ← NOVO
// 870–1019: Relatórios de Vendas (5s)
// 1020–1109: CTA Final (3s)
// ══════════════════════════════════════════════════════════════════════════════
export const TicketeiraVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={150}>
        <OpeningScene />
      </Sequence>
      <Sequence from={150} durationInFrames={60}>
        <BrandScene />
      </Sequence>
      <Sequence from={210} durationInFrames={150}>
        <DashboardScene />
      </Sequence>
      <Sequence from={360} durationInFrames={180}>
        <CreateEventScene />
      </Sequence>
      <Sequence from={540} durationInFrames={150}>
        <TicketsScene />
      </Sequence>
      <Sequence from={690} durationInFrames={180}>
        <PosScene />
      </Sequence>
      <Sequence from={870} durationInFrames={150}>
        <ReportsScene />
      </Sequence>
      <Sequence from={1020} durationInFrames={90}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
