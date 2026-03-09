// @ts-nocheck

/* ─── Spark ──────────────────────────────────────────────────────────────── */
const Spark = ({ data=[], color="#8b5cf6", fill=false, h=24, w=80 }) => {
  if (!data.length) return null;
  const mn=Math.min(...data), mx=Math.max(...data)||1, rng=mx-mn||1;
  const pts=data.map((v,i)=>[(i/(data.length-1))*w, h-((v-mn)/rng)*(h-4)-2]);
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area=`${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill&&<path d={area} fill={color} fillOpacity="0.15"/>}
      <path d={line} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/* ─── BarSVG (small inline bar) ──────────────────────────────────────────── */
const BarSVG = ({ data, labels=[], color="#f43f5e", h=72 }) => {
  const mx=Math.max(...data)*1.1||1, bw=90/data.length;
  return (
    <svg width="100%" height={h+20} viewBox={`0 0 100 ${h+20}`} preserveAspectRatio="none">
      {data.map((v,i)=>{
        const bh=(v/mx)*(h-4), x=i*(100/data.length)+1;
        return <rect key={i} x={x} y={h-bh} width={bw-0.8} height={bh} rx="0.6" fill={color} fillOpacity={0.4+(v/mx)*0.6}/>;
      })}
      {labels.map((l,i)=>(
        <text key={i} x={i*(100/data.length)+(bw/2)+1} y={h+14} textAnchor="middle" fontSize="5.5" fill="#94a3b8">{l}</text>
      ))}
    </svg>
  );
};

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmtVal = (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v);

/* ─── SvgBar ─────────────────────────────────────────────────────────────── */
const SvgBar = ({ data=[], labels=[], color="#8b5cf6", h=200, showValues=false }) => {
  if (!data.length) return null;
  const mx   = Math.max(...data) * 1.15 || 1;
  const VW=500, VH=h, padL=44, padR=12, padT=14, padB=36;
  const plotW=VW-padL-padR, plotH=VH-padT-padB;
  const barW = plotW/data.length*0.62;
  const gap  = plotW/data.length;
  const ticks = [0,0.25,0.5,0.75,1];
  return (
    <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
      {ticks.map(t=>{
        const y=padT+plotH-t*plotH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={VW-padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <text x={padL-6} y={y+4} textAnchor="end" fontSize="11" fill="#64748b">{fmtVal(Math.round(mx*t))}</text>
          </g>
        );
      })}
      {data.map((v,i)=>{
        const bh=(v/mx)*plotH, cx=padL+i*gap+gap/2, x=cx-barW/2, y=padT+plotH-bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill={color} fillOpacity={0.55+(v/mx)*0.45}/>
            {showValues&&<text x={cx} y={y-5} textAnchor="middle" fontSize="10" fill="#cbd5e1">{fmtVal(v)}</text>}
            {labels[i]&&<text x={cx} y={VH-8} textAnchor="middle" fontSize="11" fill="#94a3b8">{labels[i]}</text>}
          </g>
        );
      })}
      <line x1={padL} y1={padT} x2={padL} y2={padT+plotH} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
    </svg>
  );
};

/* ─── SvgGroupBar ────────────────────────────────────────────────────────── */
const SvgGroupBar = ({ data=[], keys=[], colors=[], h=200 }) => {
  if (!data.length) return null;
  const allVals=data.flatMap(d=>keys.map(k=>d[k]||0));
  const mx=Math.max(...allVals)*1.15||1;
  const VW=500, VH=h, padL=50, padR=12, padT=14, padB=44;
  const plotW=VW-padL-padR, plotH=VH-padT-padB;
  const groupW=plotW/data.length, barW=(groupW*0.7)/keys.length;
  const ticks=[0,0.25,0.5,0.75,1];
  return (
    <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
      {ticks.map(t=>{
        const y=padT+plotH-t*plotH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={VW-padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <text x={padL-6} y={y+4} textAnchor="end" fontSize="11" fill="#64748b">{fmtVal(Math.round(mx*t))}</text>
          </g>
        );
      })}
      {data.map((d,i)=>{
        const gx=padL+i*groupW+groupW*0.15;
        return (
          <g key={i}>
            {keys.map((k,j)=>{
              const v=d[k]||0, bh=(v/mx)*plotH, x=gx+j*(barW+1), y=padT+plotH-bh;
              return <rect key={k} x={x} y={y} width={barW} height={bh} rx="2" fill={colors[j]} fillOpacity="0.85"/>;
            })}
            {d.month&&<text x={padL+i*groupW+groupW/2} y={padT+plotH+16} textAnchor="middle" fontSize="11" fill="#94a3b8">{d.month}</text>}
          </g>
        );
      })}
      {keys.map((k,j)=>(
        <g key={k} transform={`translate(${padL+j*80},${VH-14})`}>
          <rect x="0" y="-5" width="10" height="5" rx="1" fill={colors[j]}/>
          <text x="14" y="0" fontSize="11" fill="#94a3b8">{k}</text>
        </g>
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={padT+plotH} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
    </svg>
  );
};

/* ─── SvgArea ────────────────────────────────────────────────────────────── */
const SvgArea = ({ data=[], dataKeys=[], colors=[], labels=[], h=220 }) => {
  if (!data.length) return null;
  const allVals=data.flatMap(d=>dataKeys.map(k=>d[k]||0));
  const mx=Math.max(...allVals)*1.15||1;
  const VW=500, VH=h, padL=50, padR=12, padT=14, padB=44;
  const plotW=VW-padL-padR, plotH=VH-padT-padB;
  const ticks=[0,0.25,0.5,0.75,1];
  const xOf=(i)=>padL+(i/(data.length-1))*plotW;
  const yOf=(v)=>padT+plotH-(v/mx)*plotH;
  const makeLine=(key)=>data.map((d,i)=>`${i===0?"M":"L"}${xOf(i).toFixed(1)},${yOf(d[key]||0).toFixed(1)}`).join(" ");
  const makeArea=(key)=>`${makeLine(key)} L${xOf(data.length-1).toFixed(1)},${(padT+plotH).toFixed(1)} L${padL},${(padT+plotH).toFixed(1)} Z`;
  return (
    <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
      <defs>
        {dataKeys.map((k,j)=>(
          <linearGradient key={k} id={`areaGrad_${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={colors[j]} stopOpacity="0.35"/>
            <stop offset="95%" stopColor={colors[j]} stopOpacity="0"/>
          </linearGradient>
        ))}
      </defs>
      {ticks.map(t=>{
        const y=padT+plotH-t*plotH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={VW-padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <text x={padL-6} y={y+4} textAnchor="end" fontSize="11" fill="#64748b">{fmtVal(Math.round(mx*t))}</text>
          </g>
        );
      })}
      {dataKeys.map((k,j)=>(
        <g key={k}>
          <path d={makeArea(k)} fill={`url(#areaGrad_${k})`}/>
          <path d={makeLine(k)} stroke={colors[j]} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {data.map((_,i)=>(
            <circle key={i} cx={xOf(i)} cy={yOf(data[i][k]||0)} r="2.5" fill={colors[j]}/>
          ))}
        </g>
      ))}
      {labels.map((l,i)=>(
        <text key={i} x={xOf(i)} y={padT+plotH+16} textAnchor="middle" fontSize="11" fill="#94a3b8">{l}</text>
      ))}
      {dataKeys.map((k,j)=>(
        <g key={k} transform={`translate(${padL+j*80},${VH-10})`}>
          <circle cx="5" cy="-2" r="4" fill={colors[j]}/>
          <text x="13" y="2" fontSize="11" fill="#94a3b8">{k}</text>
        </g>
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={padT+plotH} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
    </svg>
  );
};

/* ─── SvgPie ─────────────────────────────────────────────────────────────── */
const SvgPie = ({ data=[], colors=[], h=220 }) => {
  if (!data.length) return null;
  const total=data.reduce((s,d)=>s+(d.value||0),0)||1;
  const VW=500, VH=h, cx=130, cy=VH/2, r=Math.min(cy-16,80), ri=r*0.52;
  let angle=-Math.PI/2;
  const slices=data.map((d,i)=>{
    const sweep=(d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
    angle+=sweep;
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
    const xi1=cx+ri*Math.cos(angle-sweep), yi1=cy+ri*Math.sin(angle-sweep);
    const xi2=cx+ri*Math.cos(angle), yi2=cy+ri*Math.sin(angle);
    const large=sweep>Math.PI?1:0;
    return { path:`M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r},0,${large},1,${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${ri},${ri},0,${large},0,${xi1.toFixed(1)},${yi1.toFixed(1)} Z`, color:colors[i], ...d };
  });
  const legendX=cx+r+28, rowH=28, legendY=cy-((data.length-1)*rowH)/2;
  return (
    <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
      {slices.map((s,i)=>(
        <path key={i} d={s.path} fill={s.color} fillOpacity="0.9" stroke="#13111f" strokeWidth="1.5"/>
      ))}
      <text x={cx} y={cy-6}  textAnchor="middle" fontSize="22" fontWeight="bold" fill="#f1f5f9">{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="12"  fill="#64748b">total</text>
      {data.map((d,i)=>{
        const pct=Math.round((d.value/total)*100);
        return (
          <g key={i} transform={`translate(${legendX},${legendY+i*rowH})`}>
            <rect x="0" y="-10" width="13" height="13" rx="2" fill={colors[i]}/>
            <text x="19" y="0" fontSize="13" fill="#cbd5e1" fontWeight="500">{d.name}</text>
            <text x="19" y="14" fontSize="11" fill="#64748b">{d.value} — {pct}%</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── SvgCpuHistory ──────────────────────────────────────────────────────── */
const SvgCpuHistory = ({ data=[], color="#10b981", h=160 }) => {
  return <Spark data={data} color={color} fill h={h} w={500}/>;
};

export { Spark, BarSVG, SvgBar, SvgGroupBar, SvgArea, SvgPie, SvgCpuHistory };
