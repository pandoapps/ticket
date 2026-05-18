import type { FlowchartSlide, FlowchartStep } from '@data/slidesData';

export function FlowchartDiagram({ slide }: { slide: FlowchartSlide }) {
  const NODE_SLOT = 200;
  const NW = 148;
  const NH = 80;
  const NRX = 12;
  const DHW = 80;
  const DHH = 52;

  const rowBreak = slide.rowBreak ?? slide.steps.length;
  const row1 = slide.steps.slice(0, rowBreak);
  const row2 = slide.steps.slice(rowBreak);
  const hasRow2 = row2.length > 0;

  const VBW = Math.max(row1.length, hasRow2 ? row2.length : 0, 1) * NODE_SLOT;
  const Y1 = 110;
  const Y2 = 330;
  const LOOP_Y1 = 22;
  const YMID = 205;
  const LOOP_Y_BOT = Y2 + DHH + 36;
  const VBH = hasRow2 ? LOOP_Y_BOT + 32 : Y1 + DHH + 32;

  function stepRow(idx: number): 1 | 2 { return idx < rowBreak ? 1 : 2; }

  function nodePos(idx: number) {
    const row = stepRow(idx);
    const ri = row === 1 ? idx : idx - rowBreak;
    return { x: (ri + 0.5) * NODE_SLOT, y: row === 1 ? Y1 : Y2 };
  }

  function rEdge(idx: number, s: FlowchartStep) {
    return nodePos(idx).x + (s.shape === 'diamond' ? DHW : NW / 2);
  }
  function lEdge(idx: number, s: FlowchartStep) {
    return nodePos(idx).x - (s.shape === 'diamond' ? DHW : NW / 2);
  }
  function tEdge(idx: number, s: FlowchartStep) {
    return nodePos(idx).y - (s.shape === 'diamond' ? DHH : NH / 2);
  }
  function bEdge(idx: number, s: FlowchartStep) {
    return nodePos(idx).y + (s.shape === 'diamond' ? DHH : NH / 2);
  }

  function sidx(id: string) { return slide.steps.findIndex((s) => s.id === id); }

  const arrowColor = '#94a3b8';
  const sw = 2.5;

  function NodeShape({ step, i }: { step: FlowchartStep; i: number }) {
    const accent = step.accent ?? slide.color;
    const { x: cx, y: cy } = nodePos(i);
    const words = step.label.split(' ');
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const twoLines = line2.length > 0;

    const badgeY = cy + (step.shape === 'diamond' ? DHH : NH / 2) + 18;
    const aboveY = cy - (step.shape === 'diamond' ? DHH : NH / 2) - 18;
    const aboveCount = step.aboveBadges?.length ?? 0;
    const aboveSpacing = 30;

    const AboveBadges = () => step.aboveBadges ? (
      <>
        {step.aboveBadges.map((b, bi) => {
          const bx = cx - ((aboveCount - 1) * aboveSpacing) / 2 + bi * aboveSpacing;
          return (
            <g key={bi}>
              <circle cx={bx} cy={aboveY} r={13} fill={accent} />
              <text x={bx} y={aboveY} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="white">{b}</text>
            </g>
          );
        })}
      </>
    ) : null;

    if (step.shape === 'diamond') {
      return (
        <g>
          <AboveBadges />
          <polygon
            points={`${cx},${cy - DHH} ${cx + DHW},${cy} ${cx},${cy + DHH} ${cx - DHW},${cy}`}
            fill="white" stroke={accent} strokeWidth={sw}
          />
          <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" fontSize="20">{step.icon}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={accent}>{step.label}</text>
          {step.badge && (
            <>
              <circle cx={cx} cy={badgeY} r={13} fill={accent} />
              <text x={cx} y={badgeY} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="white">{step.badge}</text>
            </>
          )}
        </g>
      );
    }
    return (
      <g>
        <AboveBadges />
        <rect x={cx - NW / 2} y={cy - NH / 2} width={NW} height={NH} rx={NRX} fill="white" stroke={accent} strokeWidth={sw} />
        <text x={cx} y={cy - 14} textAnchor="middle" dominantBaseline="middle" fontSize="22">{step.icon}</text>
        {twoLines ? (
          <>
            <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={accent}>{line1}</text>
            <text x={cx} y={cy + 22} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={accent}>{line2}</text>
          </>
        ) : (
          <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={accent}>{step.label}</text>
        )}
        {step.badge && (
          <>
            <circle cx={cx} cy={badgeY} r={13} fill={accent} />
            <text x={cx} y={badgeY} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="white">{step.badge}</text>
          </>
        )}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} className="w-full" aria-hidden>
      <defs>
        <marker id="fc-arr" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 z" fill={arrowColor} />
        </marker>
      </defs>

      {slide.connections.map((conn, ci) => {
        const fi = sidx(conn.from);
        const ti = sidx(conn.to);
        if (fi === -1 || ti === -1) return null;
        const fs = slide.steps[fi];
        const ts = slide.steps[ti];
        const fr = stepRow(fi);
        const tr = stepRow(ti);
        const { x: fx, y: fy } = nodePos(fi);
        const { x: tx } = nodePos(ti);

        if (fr !== tr) {
          const sy = bEdge(fi, fs);
          const ey = tEdge(ti, ts) - 2;
          return (
            <g key={ci} fill="none" stroke={arrowColor} strokeWidth={sw}>
              <path d={`M ${fx} ${sy} L ${fx} ${YMID} L ${tx} ${YMID} L ${tx} ${ey}`} markerEnd="url(#fc-arr)" />
              {conn.label && (
                <text x={fx + 8} y={(sy + YMID) / 2} textAnchor="start" dominantBaseline="middle"
                  fontSize="14" fontWeight="700" fill={arrowColor} stroke="none">{conn.label}</text>
              )}
            </g>
          );
        }

        if (tx < fx) {
          if (fr === 2) {
            const sy = bEdge(fi, fs);
            const ey = bEdge(ti, ts) + 2;
            return (
              <g key={ci} fill="none" stroke={arrowColor} strokeWidth={sw}>
                <path d={`M ${fx} ${sy} L ${fx} ${LOOP_Y_BOT} L ${tx} ${LOOP_Y_BOT} L ${tx} ${ey}`} markerEnd="url(#fc-arr)" />
                {conn.label && (
                  <text x={(fx + tx) / 2} y={LOOP_Y_BOT + 10} textAnchor="middle" dominantBaseline="hanging"
                    fontSize="15" fontWeight="700" fill={arrowColor} stroke="none">{conn.label}</text>
                )}
              </g>
            );
          }
          const sy = tEdge(fi, fs);
          const ey = tEdge(ti, ts) - 2;
          return (
            <g key={ci} fill="none" stroke={arrowColor} strokeWidth={sw}>
              <path d={`M ${fx} ${sy} L ${fx} ${LOOP_Y1} L ${tx} ${LOOP_Y1} L ${tx} ${ey}`} markerEnd="url(#fc-arr)" />
              {conn.label && (
                <text x={(fx + tx) / 2} y={LOOP_Y1 - 8} textAnchor="middle" dominantBaseline="auto"
                  fontSize="15" fontWeight="700" fill={arrowColor} stroke="none">{conn.label}</text>
              )}
            </g>
          );
        }

        const x1 = rEdge(fi, fs);
        const x2 = lEdge(ti, ts) - 2;
        return (
          <g key={ci} fill="none" stroke={arrowColor} strokeWidth={sw}>
            <line x1={x1} y1={fy} x2={x2} y2={fy} markerEnd="url(#fc-arr)" />
            {conn.label && (
              <text x={(x1 + x2) / 2} y={fy - 10} textAnchor="middle" dominantBaseline="auto"
                fontSize="14" fontWeight="700" fill={arrowColor} stroke="none">{conn.label}</text>
            )}
          </g>
        );
      })}

      {slide.steps.map((step, i) => <NodeShape key={i} step={step} i={i} />)}
    </svg>
  );
}
