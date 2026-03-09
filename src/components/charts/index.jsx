// @ts-nocheck

const Spark = ({ data=[], color="#8b5cf6", fill=false, h=24, w=80 }) => {
  if (!data.length) return null;
  const mn=Math.min(...data), mx=Math.max(...data)||1, rng=mx-mn||1;
  const pts=data.map((v,i)=>[(i/(data.length-1))*w, h-((v-mn)/rng)*(h-4)-2]);
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area=`${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill&&<path d={area} fill={color} fillOpacity="0.12"/>}
      <path d={line} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const BarSVG = ({ data, labels=[], color="#f43f5e", h=72 }) => {
  const mx=Math.max(...data)*1.1||1, bw=90/data.length;
  return (
    <svg width="100%" height={h+16} viewBox={`0 0 100 ${h+16}`} preserveAspectRatio="none">
      {data.map((v,i)=>{const bh=(v/mx)*(h-4),x=i*(100/data.length)+1;return(<rect key={i} x={x} y={h-bh} width={bw-0.8} height={bh} rx="0.6" fill={color} fillOpacity={0.4+(v/mx)*0.6}/>);})}
      {labels.map((l,i)=>(<text key={i} x={i*(100/data.length)+(bw/2)+1} y={h+13} textAnchor="middle" fontSize="3.8" fill="#475569">{l}</text>))}
    </svg>
  );
};


/* ── Pure SVG Charts (no external lib, no sizing issues) ── */

const SvgBar = ({ data=[], labels=[], color="#8b5cf6", h=180, showValues=false }) => {
  const mx = Math.max(...data) * 1.1 || 1;
  const W = 100, pad = 6, barW = (W - pad*2) / data.length - 1.5;
  const barH = h - 28;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <line x1={pad} y1={0} x2={pad} y2={barH} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3"/>
      {[0,0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={pad} y1={barH*t} x2={W-pad} y2={barH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {data.map((v,i) => {
        const bh = (v/mx)*barH;
        const x = pad + i*((W - pad*2)/data.length) + 0.5;
        return (
          <g key={i}>
            <rect x={x} y={barH-bh} width={barW} height={bh} rx="1.2"
              fill={color} fillOpacity={0.5 + (v/mx)*0.5}/>
            {labels[i] && <text x={x+barW/2} y={h-4} textAnchor="middle" fontSize="3.2" fill="#475569">{labels[i]}</text>}
            {showValues && <text x={x+barW/2} y={barH-bh-2} textAnchor="middle" fontSize="3" fill="#94a3b8">{v}</text>}
          </g>
        );
      })}
    </svg>
  );
};

const SvgGroupBar = ({ data=[], keys=[], colors=[], h=180 }) => {
  const allVals = data.flatMap(d => keys.map(k => d[k] || 0));
  const mx = Math.max(...allVals) * 1.1 || 1;
  const W = 100, pad = 6, groupW = (W - pad*2) / data.length;
  const barW = (groupW - 2) / keys.length - 0.5;
  const barH = h - 28;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      {[0,0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={pad} y1={barH*t} x2={W-pad} y2={barH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {data.map((d,i) => {
        const gx = pad + i*groupW;
        return (
          <g key={i}>
            {keys.map((k,j) => {
              const v = d[k] || 0;
              const bh = (v/mx)*barH;
              const x = gx + j*(barW+0.5) + 0.5;
              return <rect key={k} x={x} y={barH-bh} width={barW} height={bh} rx="1" fill={colors[j]} fillOpacity={0.8}/>;
            })}
            {d.month && <text x={gx+groupW/2} y={h-4} textAnchor="middle" fontSize="3.2" fill="#475569">{d.month}</text>}
          </g>
        );
      })}
      <g>
        {keys.map((k,j)=>(
          <g key={k} transform={`translate(${pad + j*14}, ${h-10})`}>
            <circle cx="2" cy="2" r="1.5" fill={colors[j]}/>
            <text x="5" y="4" fontSize="3" fill="#64748b">{k}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

const SvgArea = ({ data=[], dataKeys=[], colors=[], labels=[], h=220, yFmt=(v)=>v }) => {
  const allVals = data.flatMap(d => dataKeys.map(k => d[k] || 0));
  const mx = Math.max(...allVals) * 1.1 || 1;
  const W = 100, pad = 8, barH = h - 32;
  const pts = (key) => data.map((d,i) => [pad + (i/(data.length-1))*(W-pad*2), barH - (d[key]/mx)*barH]);
  const line = (ps) => ps.map((p,i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = (ps) => `${line(ps)} L${(W-pad).toFixed(1)},${barH} L${pad},${barH} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs>
        {dataKeys.map((k,j)=>(
          <linearGradient key={k} id={`svgAreaGrad${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={colors[j]} stopOpacity="0.3"/>
            <stop offset="95%" stopColor={colors[j]} stopOpacity="0"/>
          </linearGradient>
        ))}
      </defs>
      {[0,0.25,0.5,0.75,1].map(t=>(
        <line key={t} x1={pad} y1={barH*t} x2={W-pad} y2={barH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {dataKeys.map((k,j) => {
        const ps = pts(k);
        return (
          <g key={k}>
            <path d={area(ps)} fill={`url(#svgAreaGrad${k})`}/>
            <path d={line(ps)} stroke={colors[j]} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {ps.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="1.2" fill={colors[j]}/>)}
          </g>
        );
      })}
      {labels.map((l,i)=>(
        <text key={i} x={pad + (i/(labels.length-1))*(W-pad*2)} y={h-16} textAnchor="middle" fontSize="3.2" fill="#475569">{l}</text>
      ))}
      <g>
        {dataKeys.map((k,j)=>(
          <g key={k} transform={`translate(${pad + j*16}, ${h-6})`}>
            <circle cx="2" cy="0" r="1.5" fill={colors[j]}/>
            <text x="5" y="2" fontSize="3" fill="#64748b">{k}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

const SvgPie = ({ data=[], colors=[], h=200 }) => {
  const total = data.reduce((s,d)=>s+(d.value||0),0) || 1;
  const cx=50, cy=46, r=32, ri=20;
  let angle = -Math.PI/2;
  const slices = data.map((d,i)=>{
    const sweep = (d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
    angle += sweep;
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
    const xi1=cx+ri*Math.cos(angle-sweep), yi1=cy+ri*Math.sin(angle-sweep);
    const xi2=cx+ri*Math.cos(angle), yi2=cy+ri*Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { d:`M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${ri},${ri},0,${large},0,${xi1.toFixed(2)},${yi1.toFixed(2)} Z`, color:colors[i], ...d };
  });
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} style={{display:"block"}}>
      {slices.map((s,i)=><path key={i} d={s.d} fill={s.color} fillOpacity="0.9" stroke="#13111f" strokeWidth="0.8"/>)}
      <text x={cx} y={cy+1} textAnchor="middle" fontSize="5" fontWeight="bold" fill="#e2e8f0">{total}</text>
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="3" fill="#64748b">total</text>
      {data.map((d,i)=>(
        <g key={i} transform={`translate(4, ${h-22+i*7})`}>
          <rect x="0" y="0" width="4" height="4" rx="1" fill={colors[i]}/>
          <text x="6" y="3.5" fontSize="3.2" fill="#94a3b8">{d.name} <tspan fill="#64748b">({d.value})</tspan></text>
        </g>
      ))}
    </svg>
  );
};

const SvgCpuHistory = ({ data=[], color="#10b981", h=160 }) => {
  return <Spark data={data} color={color} fill h={h} w={500}/>;
};

export { Spark, BarSVG, SvgBar, SvgGroupBar, SvgArea, SvgPie, SvgCpuHistory };
