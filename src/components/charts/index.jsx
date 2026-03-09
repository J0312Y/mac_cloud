// @ts-nocheck
import { useState, useRef, useCallback, useEffect } from "react";

const fmtVal = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

/* ══════════════════════════════════════════════════════════════════════════
   TOOLTIP — follows mouse position absolutely
   ══════════════════════════════════════════════════════════════════════════ */
const FloatTooltip = ({ x, y, lines, visible }) => {
  if (!visible || !lines?.length) return null;
  return (
    <div style={{
      position: "fixed", left: x + 14, top: y - 10,
      pointerEvents: "none", zIndex: 9999,
      background: "#1a1728", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      transition: "opacity 0.1s",
      opacity: visible ? 1 : 0,
      minWidth: 100,
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: i < lines.length - 1 ? 4 : 0 }}>
          {l.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />}
          <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{l.label}</span>
          {l.value !== undefined && <span style={{ fontSize: 11, fontWeight: 700, color: l.color || "#e2e8f0", marginLeft: "auto", paddingLeft: 8 }}>{l.value}</span>}
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SPARK
   ══════════════════════════════════════════════════════════════════════════ */
const Spark = ({ data = [], color = "#8b5cf6", fill = false, h = 24, w = 80 }) => {
  if (!data.length) return null;
  const mn = Math.min(...data), mx = Math.max(...data) || 1, rng = mx - mn || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - mn) / rng) * (h - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={area} fill={color} fillOpacity="0.15" />}
      <path d={line} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   BAR SVG (small KPI inline bar)
   ══════════════════════════════════════════════════════════════════════════ */
const BarSVG = ({ data, labels = [], color = "#f43f5e", h = 72 }) => {
  const mx = Math.max(...data) * 1.1 || 1, bw = 90 / data.length;
  return (
    <svg width="100%" height={h + 20} viewBox={`0 0 100 ${h + 20}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / mx) * (h - 4), x = i * (100 / data.length) + 1;
        return <rect key={i} x={x} y={h - bh} width={bw - 0.8} height={bh} rx="0.6" fill={color} fillOpacity={0.4 + (v / mx) * 0.6} />;
      })}
      {labels.map((l, i) => (
        <text key={i} x={i * (100 / data.length) + bw / 2 + 1} y={h + 14} textAnchor="middle" fontSize="5.5" fill="#94a3b8">{l}</text>
      ))}
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SVG BAR  — mousemove crosshair + click to select bar
   ══════════════════════════════════════════════════════════════════════════ */
const SvgBar = ({ data = [], labels = [], color = "#8b5cf6", h = 200, showValues = false }) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [mouse, setMouse] = useState(null);
  const svgRef = useRef(null);

  if (!data.length) return null;
  const mx = Math.max(...data) * 1.15 || 1;
  const VW = 500, VH = h, padL = 46, padR = 10, padT = 12, padB = 32;
  const plotW = VW - padL - padR, plotH = VH - padT - padB;
  const barW = plotW / data.length * 0.6, gap = plotW / data.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const getSvgX = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    return ((e.clientX - r.left) / r.width) * VW;
  };

  const getIdx = (svgX) => {
    const rel = svgX - padL;
    return Math.max(0, Math.min(data.length - 1, Math.floor(rel / gap)));
  };

  const onMove = useCallback((e) => {
    const sx = getSvgX(e);
    if (sx === null) return;
    const idx = getIdx(sx);
    setActiveIdx(idx);
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const onClick = useCallback((e) => {
    const sx = getSvgX(e);
    if (sx === null) return;
    const idx = getIdx(sx);
    setSelectedIdx(prev => prev === idx ? null : idx);
  }, []);

  return (
    <>
      <svg ref={svgRef} width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={onMove}
        onMouseLeave={() => { setActiveIdx(null); setMouse(null); }}
        onClick={onClick}>

        {/* grid */}
        {ticks.map(t => {
          const y = padT + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={VW - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padL - 5} y={y + 4} textAnchor="end" style={{ fontSize: "11px" }} fill="#64748b">{fmtVal(Math.round(mx * t))}</text>
            </g>
          );
        })}

        {/* crosshair vertical */}
        {activeIdx !== null && (() => {
          const cx = padL + activeIdx * gap + gap / 2;
          return <line x1={cx} y1={padT} x2={cx} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3" />;
        })()}

        {/* bars */}
        {data.map((v, i) => {
          const bh = (v / mx) * plotH;
          const cx = padL + i * gap + gap / 2;
          const x = cx - barW / 2;
          const y = padT + plotH - bh;
          const isActive = activeIdx === i;
          const isSelected = selectedIdx === i;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx="3"
                fill={isSelected ? "#fff" : color}
                fillOpacity={isActive || isSelected ? 1 : (activeIdx !== null ? 0.35 : 0.5 + (v / mx) * 0.5)}
                style={{ transition: "fill-opacity 0.12s" }} />
              {isSelected && <rect x={x} y={padT + plotH} width={barW} height="2" rx="1" fill={color} />}
              {(showValues || isActive) && (
                <text x={cx} y={y - 6} textAnchor="middle" style={{ fontSize: "11px", fontWeight: "bold" }} fill="#e2e8f0">{fmtVal(v)}</text>
              )}
              {labels[i] && (
                <text x={cx} y={VH - 6} textAnchor="middle" style={{ fontSize: "11px" }} fill={isActive || isSelected ? "#e2e8f0" : "#64748b"}>{labels[i]}</text>
              )}
            </g>
          );
        })}

        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>

      <FloatTooltip
        x={mouse?.x} y={mouse?.y}
        visible={activeIdx !== null && mouse !== null}
        lines={activeIdx !== null ? [
          { label: labels[activeIdx] || `Item ${activeIdx + 1}` },
          { dot: color, label: "Value", value: fmtVal(data[activeIdx]), color: "#e2e8f0" }
        ] : []}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SVG GROUP BAR — mousemove + click
   ══════════════════════════════════════════════════════════════════════════ */
const SvgGroupBar = ({ data = [], keys = [], colors = [], h = 200 }) => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [mouse, setMouse] = useState(null);
  const svgRef = useRef(null);

  if (!data.length) return null;
  const allVals = data.flatMap(d => keys.map(k => d[k] || 0));
  const mx = Math.max(...allVals) * 1.15 || 1;
  const VW = 500, VH = h, padL = 50, padR = 10, padT = 12, padB = 42;
  const plotW = VW - padL - padR, plotH = VH - padT - padB;
  const groupW = plotW / data.length, barW = (groupW * 0.68) / keys.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const getIdx = (e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    const sx = ((e.clientX - r.left) / r.width) * VW;
    return Math.max(0, Math.min(data.length - 1, Math.floor((sx - padL) / groupW)));
  };

  return (
    <>
      <svg ref={svgRef} width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={(e) => { setActiveIdx(getIdx(e)); setMouse({ x: e.clientX, y: e.clientY }); }}
        onMouseLeave={() => { setActiveIdx(null); setMouse(null); }}
        onClick={(e) => { const i = getIdx(e); setSelectedIdx(p => p === i ? null : i); }}>

        {ticks.map(t => {
          const y = padT + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={VW - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padL - 5} y={y + 4} textAnchor="end" style={{ fontSize: "11px" }} fill="#64748b">{fmtVal(Math.round(mx * t))}</text>
            </g>
          );
        })}

        {/* group hover bg */}
        {activeIdx !== null && (
          <rect x={padL + activeIdx * groupW} y={padT} width={groupW} height={plotH}
            fill="rgba(255,255,255,0.04)" rx="2" />
        )}

        {data.map((d, i) => {
          const gx = padL + i * groupW + groupW * 0.16;
          const isActive = activeIdx === i;
          const isSelected = selectedIdx === i;
          return (
            <g key={i}>
              {keys.map((k, j) => {
                const v = d[k] || 0, bh = (v / mx) * plotH;
                const x = gx + j * (barW + 1.5), y = padT + plotH - bh;
                return (
                  <rect key={k} x={x} y={y} width={barW} height={bh} rx="2"
                    fill={isSelected ? "#fff" : colors[j]}
                    fillOpacity={isActive || isSelected ? 1 : (activeIdx !== null ? 0.3 : 0.85)}
                    style={{ transition: "fill-opacity 0.12s" }} />
                );
              })}
              {d.month && (
                <text x={padL + i * groupW + groupW / 2} y={padT + plotH + 16} textAnchor="middle"
                  style={{ fontSize: "11px" }} fill={isActive || isSelected ? "#e2e8f0" : "#64748b"}>{d.month}</text>
              )}
            </g>
          );
        })}

        {keys.map((k, j) => (
          <g key={k} transform={`translate(${padL + j * 90},${VH - 12})`}>
            <rect x="0" y="-7" width="12" height="7" rx="1.5" fill={colors[j]} />
            <text x="16" y="0" style={{ fontSize: "11px" }} fill="#94a3b8">{k}</text>
          </g>
        ))}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>

      <FloatTooltip
        x={mouse?.x} y={mouse?.y}
        visible={activeIdx !== null && mouse !== null}
        lines={activeIdx !== null ? [
          { label: data[activeIdx]?.month || `Groupe ${activeIdx + 1}` },
          ...keys.map((k, j) => ({ dot: colors[j], label: k, value: fmtVal(data[activeIdx]?.[k] || 0), color: colors[j] }))
        ] : []}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SVG AREA — mousemove crosshair en temps réel + snap au point le plus proche
   ══════════════════════════════════════════════════════════════════════════ */
const SvgArea = ({ data = [], dataKeys = [], colors = [], labels = [], h = 220 }) => {
  const [snapIdx, setSnapIdx] = useState(null);
  const [mouse, setMouse] = useState(null);
  const svgRef = useRef(null);

  if (!data.length) return null;
  const allVals = data.flatMap(d => dataKeys.map(k => d[k] || 0));
  const mx = Math.max(...allVals) * 1.15 || 1;
  const VW = 500, VH = h, padL = 50, padR = 10, padT = 12, padB = 42;
  const plotW = VW - padL - padR, plotH = VH - padT - padB;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const xOf = (i) => padL + (data.length < 2 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const yOf = (v) => padT + plotH - (v / mx) * plotH;
  const mkLine = (k) => data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d[k] || 0).toFixed(1)}`).join(" ");
  const mkArea = (k) => `${mkLine(k)} L${xOf(data.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)} L${padL},${(padT + plotH).toFixed(1)} Z`;

  const onMove = useCallback((e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const sx = ((e.clientX - r.left) / r.width) * VW;
    const raw = (sx - padL) / plotW * (data.length - 1);
    setSnapIdx(Math.max(0, Math.min(data.length - 1, Math.round(raw))));
    setMouse({ x: e.clientX, y: e.clientY });
  }, [data.length, plotW]);

  return (
    <>
      <svg ref={svgRef} width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={onMove}
        onMouseLeave={() => { setSnapIdx(null); setMouse(null); }}>

        <defs>
          {dataKeys.map((k, j) => (
            <linearGradient key={k} id={`ag_${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[j]} stopOpacity="0.35" />
              <stop offset="95%" stopColor={colors[j]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* grid */}
        {ticks.map(t => {
          const y = padT + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={VW - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padL - 5} y={y + 4} textAnchor="end" style={{ fontSize: "11px" }} fill="#64748b">{fmtVal(Math.round(mx * t))}</text>
            </g>
          );
        })}

        {/* areas + lines */}
        {dataKeys.map((k, j) => (
          <g key={k}>
            <path d={mkArea(k)} fill={`url(#ag_${k})`} />
            <path d={mkLine(k)} stroke={colors[j]} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

        {/* all dots (small) */}
        {dataKeys.map((k, j) =>
          data.map((d, i) => (
            <circle key={`${k}-${i}`} cx={xOf(i)} cy={yOf(d[k] || 0)} r="2.5" fill={colors[j]} fillOpacity="0.8" />
          ))
        )}

        {/* snap crosshair */}
        {snapIdx !== null && (
          <>
            <line x1={xOf(snapIdx)} y1={padT} x2={xOf(snapIdx)} y2={padT + plotH}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4,3" />
            {/* snap dots (big) */}
            {dataKeys.map((k, j) => (
              <circle key={k} cx={xOf(snapIdx)} cy={yOf(data[snapIdx]?.[k] || 0)} r="5"
                fill={colors[j]} stroke="#13111f" strokeWidth="2" />
            ))}
            {/* X label highlight */}
            {labels[snapIdx] && (
              <text x={xOf(snapIdx)} y={padT + plotH + 16} textAnchor="middle" style={{ fontSize: "11px", fontWeight: "bold" }} fill="#e2e8f0">
                {labels[snapIdx]}
              </text>
            )}
          </>
        )}

        {/* X labels */}
        {labels.map((l, i) => snapIdx === i ? null : (
          <text key={i} x={xOf(i)} y={padT + plotH + 16} textAnchor="middle" style={{ fontSize: "11px" }} fill="#64748b">{l}</text>
        ))}

        {/* legend */}
        {dataKeys.map((k, j) => (
          <g key={k} transform={`translate(${padL + j * 90},${VH - 10})`}>
            <circle cx="5" cy="-1" r="4" fill={colors[j]} />
            <text x="13" y="3" style={{ fontSize: "11px" }} fill="#94a3b8">{k}</text>
          </g>
        ))}

        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>

      <FloatTooltip
        x={mouse?.x} y={mouse?.y}
        visible={snapIdx !== null && mouse !== null}
        lines={snapIdx !== null ? [
          { label: labels[snapIdx] || `#${snapIdx + 1}` },
          ...dataKeys.map((k, j) => ({ dot: colors[j], label: k, value: fmtVal(data[snapIdx]?.[k] || 0), color: colors[j] }))
        ] : []}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   SVG PIE — hover expand + click to isolate
   ══════════════════════════════════════════════════════════════════════════ */
const SvgPie = ({ data = [], colors = [], h = 220 }) => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mouse, setMouse] = useState(null);

  if (!data.length) return null;
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const VW = 500, VH = h, cx = 130, cy = VH / 2;
  const r = Math.min(cy - 16, 80), ri = r * 0.52;

  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + sweep;
    angle = a1;
    const midA = (a0 + a1) / 2;
    const push = hovered === i || selected === i ? 10 : 0;
    const ox = push * Math.cos(midA), oy = push * Math.sin(midA);
    const mkPath = (ox, oy) => {
      const x1 = cx + ox + r * Math.cos(a0), y1 = cy + oy + r * Math.sin(a0);
      const x2 = cx + ox + r * Math.cos(a1), y2 = cy + oy + r * Math.sin(a1);
      const xi1 = cx + ox + ri * Math.cos(a0), yi1 = cy + oy + ri * Math.sin(a0);
      const xi2 = cx + ox + ri * Math.cos(a1), yi2 = cy + oy + ri * Math.sin(a1);
      const lg = sweep > Math.PI ? 1 : 0;
      return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r},0,${lg},1,${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${ri},${ri},0,${lg},0,${xi1.toFixed(1)},${yi1.toFixed(1)} Z`;
    };
    return { path: mkPath(ox, oy), color: colors[i], midA, ...d };
  });

  const legendX = cx + r + 32, rowH = 28, legendY = cy - ((data.length - 1) * rowH) / 2;
  const active = selected ?? hovered;

  return (
    <>
      <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
        style={{ display: "block" }}
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => { setHovered(null); setMouse(null); }}>

        {slices.map((s, i) => (
          <path key={i} d={s.path}
            fill={s.color}
            fillOpacity={active === null || active === i ? 0.9 : 0.25}
            stroke="#13111f" strokeWidth="1.5"
            style={{ cursor: "pointer", transition: "fill-opacity 0.2s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(p => p === i ? null : i)}
          />
        ))}

        {/* center display */}
        {active !== null ? (
          <>
            <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: "12px" }} fill="#94a3b8">{data[active]?.name}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: "22px", fontWeight: "bold" }} fill="#f1f5f9">{data[active]?.value}</text>
            <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: "11px" }} fill="#64748b">{Math.round((data[active]?.value / total) * 100)}%</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: "22px", fontWeight: "bold" }} fill="#f1f5f9">{total}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: "12px" }} fill="#64748b">total</text>
          </>
        )}

        {/* legend */}
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          const isActive = active === i;
          return (
            <g key={i} transform={`translate(${legendX},${legendY + i * rowH})`}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(p => p === i ? null : i)}>
              <rect x="-4" y="-14" width={VW - legendX + 2} height={rowH - 2} rx="4"
                fill={isActive ? "rgba(255,255,255,0.05)" : "transparent"} />
              <rect x="0" y="-10" width="13" height="13" rx="2"
                fill={colors[i]} fillOpacity={active === null || isActive ? 1 : 0.35} />
              <text x="19" y="1" style={{ fontSize: "13px", fontWeight: isActive ? "bold" : "normal" }} fill={isActive ? "#fff" : "#cbd5e1"}>{d.name}</text>
              <text x="19" y="15" style={{ fontSize: "11px" }} fill="#64748b">{d.value} — {pct}%</text>
            </g>
          );
        })}
      </svg>

      <FloatTooltip
        x={mouse?.x} y={mouse?.y}
        visible={hovered !== null && mouse !== null}
        lines={hovered !== null ? [
          { dot: colors[hovered], label: data[hovered]?.name, value: fmtVal(data[hovered]?.value), color: colors[hovered] },
          { label: "Part", value: `${Math.round((data[hovered]?.value / total) * 100)}%` }
        ] : []}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   CPU HISTORY
   ══════════════════════════════════════════════════════════════════════════ */
const SvgCpuHistory = ({ data = [], color = "#10b981", h = 160 }) => (
  <Spark data={data} color={color} fill h={h} w={500} />
);

export { Spark, BarSVG, SvgBar, SvgGroupBar, SvgArea, SvgPie, SvgCpuHistory };
