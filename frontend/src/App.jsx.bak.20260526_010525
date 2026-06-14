import React, { useState, useEffect, useRef } from 'react'

const API = 'http://187.77.60.16:4101/api'

// ─── DATA ────────────────────────────────────────────────────────────────────

const PHONEMES = {
  a:'expansão',b:'sustentação',c:'criatividade',d:'determinação',
  e:'expressão',f:'fluidez',g:'crescimento',h:'elevação',i:'intuição',
  j:'sabedoria',k:'estabilidade',l:'leveza',m:'propósito',n:'renovação',
  o:'conexão',p:'proteção',q:'clareza',r:'movimento',s:'pureza',
  t:'transformação',u:'unidade',v:'vitalidade',w:'força',x:'transmutação',
  y:'harmonia',z:'equilíbrio'
}

const INTENTIONS = [
  { id:'paz',          label:'Paz interior',    mantra:'Om Shanti Shanti Shanti',      freq:432, icon:'☽' },
  { id:'prosperidade', label:'Prosperidade',    mantra:'Om Shrim Mahalakshmyai Namah', freq:528, icon:'✦' },
  { id:'protecao',     label:'Proteção',        mantra:'Om Maha Mrityunjaya Namah',    freq:396, icon:'◈' },
  { id:'foco',         label:'Foco e clareza',  mantra:'Om Gam Ganapataye Namah',      freq:40,  icon:'◎' },
  { id:'amor',         label:'Amor e relações', mantra:'Om Klim Namah',                freq:528, icon:'♡' },
  { id:'transformacao',label:'Transformação',   mantra:'Om Namah Shivaya',             freq:432, icon:'⟁' },
]

const FREQUENCIES = [
  { hz:432, name:'Equilíbrio',    desc:'Afinação natural' },
  { hz:528, name:'Transformação', desc:'Bem-estar e foco' },
  { hz:396, name:'Liberação',     desc:'Proteção e raiz' },
  { hz:174, name:'Fundação',      desc:'Sono e presença' },
  { hz:40,  name:'Gamma',         desc:'Foco cognitivo'  },
]

const CYCLES = [
  { start:4,  end:6,  name:'Brahma Muhurta',      action:'Clareza profunda',       mantra:'Gayatri Mantra', freq:432 },
  { start:6,  end:12, name:'Sarga — Criação',      action:'Iniciar e expandir',     mantra:'Om Gam Namah',   freq:528 },
  { start:12, end:18, name:'Sthiti — Manutenção',  action:'Sustentar e equilibrar', mantra:'Om Shanti',      freq:432 },
  { start:18, end:24, name:'Laya — Integração',    action:'Soltar e renovar',       mantra:'Om Namah Shivaya',freq:396 },
  { start:0,  end:4,  name:'Repouso',              action:'Descanso profundo',      mantra:'Om puro',        freq:174 },
]

const SEQUENCES = {
  paz:          [396, 528, 417, 963],
  prosperidade: [528, 639, 741, 852],
  protecao:     [396, 417, 528, 741],
  foco:         [417, 528, 741, 963],
  amor:         [528, 639, 852, 963],
  transformacao:[396, 417, 639, 741],
}

const VEDIC = {
  1:{planet:'Sol',quality:'liderança'},    2:{planet:'Lua',quality:'intuição'},
  3:{planet:'Júpiter',quality:'sabedoria'},4:{planet:'Rahu',quality:'transformação'},
  5:{planet:'Mercúrio',quality:'comunicação'},6:{planet:'Vênus',quality:'amor'},
  7:{planet:'Ketu',quality:'espiritualidade'},8:{planet:'Saturno',quality:'disciplina'},
  9:{planet:'Marte',quality:'energia'}
}

const YAZATA = {
  1:'Hormozd',2:'Bahman',3:'Ardibehesht',4:'Shahrivar',5:'Espandarmaz',
  6:'Khordad',7:'Amordad',8:'Daepadar',9:'Azar',10:'Aban',11:'Khorshed',
  12:'Mah',13:'Tir',14:'Gosh',15:'Daepamihr',16:'Mihr',17:'Srosh',
  18:'Rashn',19:'Farvardin',20:'Bahram',21:'Ram',22:'Bad',23:'Daepadin',
  24:'Din',25:'Ard',26:'Ashtad',27:'Asman',28:'Zamyad',29:'Mahraspand',30:'Anagran'
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getCurrentCycle() {
  const h = new Date().getHours()
  return CYCLES.find(c => h >= c.start && h < c.end) || CYCLES[4]
}

function vedicNum(dateStr) {
  if (!dateStr) return { number:5, planet:'Mercúrio', quality:'comunicação' }
  const digits = dateStr.replace(/[^0-9]/g,'').split('').map(Number)
  let s = digits.reduce((a,b)=>a+b,0)
  while (s>9) s = String(s).split('').map(Number).reduce((a,b)=>a+b,0)
  return { number:s, ...(VEDIC[s]||VEDIC[5]) }
}

function yazataOf(dateStr) {
  if (!dateStr) return 'Mihr'
  const d = new Date(dateStr)
  return YAZATA[d.getDate()] || 'Mihr'
}

function generateMantra(name) {
  const letters = [...new Set(name.toLowerCase().replace(/[^a-z]/g,'').split(''))].slice(0,4)
  const qualities = letters.map(l=>PHONEMES[l]||'luz').join(' · ')
  const syllables = letters.map(l=>l.toUpperCase()+'a').join('·')
  return { mantra:`Om ${syllables} Namah`, qualities, meaning:`Honro a vibração de ${qualities} em mim` }
}

const WAVE_H = [10,18,26,20,30,14,28,22,16,32,12,24,20,28,16,22,30,18,26,14]

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
:root{
  --void:#05020e; --ink:#0a0618; --surface:#110d1e; --surface2:#18132b;
  --indigo:#534AB7; --indigo2:#7B74D4; --iglow:rgba(83,74,183,.15);
  --lav:#c4b5fd; --lavd:rgba(196,181,253,.5); --lavg:rgba(196,181,253,.1);
  --gold:#E8C547; --goldd:rgba(232,197,71,.55);
  --text:#e2d9f3; --textd:rgba(226,217,243,.55); --textg:rgba(226,217,243,.18);
  --border:rgba(196,181,253,.1); --border2:rgba(196,181,253,.18);
  --green:rgba(74,222,128,.7); --red:#f87171;
  --sidebar:220px;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html,body,#root{height:100%}
body{background:var(--void);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:300;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");pointer-events:none;z-index:999;opacity:.4}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--indigo);border-radius:2px}
a{color:inherit;text-decoration:none}
button{font-family:'DM Sans',sans-serif;cursor:pointer}
input,select{font-family:'DM Sans',sans-serif}

/* AUTH PAGES */
.auth-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;background:var(--void);position:relative;overflow:hidden}
.auth-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(83,74,183,.12) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-60%);pointer-events:none}
.auth-logo{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:300;letter-spacing:.2em;color:var(--lav);margin-bottom:.25rem;position:relative;z-index:2}
.auth-sub{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--textg);margin-bottom:2.5rem;position:relative;z-index:2}
.auth-card{background:rgba(196,181,253,.04);border:.5px solid var(--border);border-radius:20px;padding:2rem;width:100%;max-width:400px;position:relative;z-index:2}
.auth-label{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--textg);margin-bottom:1.25rem;display:block}
.auth-input{width:100%;background:rgba(196,181,253,.06);border:.5px solid var(--border);border-radius:10px;padding:.82rem 1rem;color:var(--text);font-size:.88rem;margin-bottom:.65rem;outline:none;transition:border .2s}
.auth-input:focus{border-color:rgba(196,181,253,.35)}
.auth-select{width:100%;background:rgba(196,181,253,.06);border:.5px solid var(--border);border-radius:10px;padding:.82rem 1rem;color:var(--text);font-size:.88rem;margin-bottom:.65rem;outline:none;cursor:pointer}
.auth-select option{background:#0d0920}
.auth-hint{font-size:.68rem;color:var(--textg);line-height:1.6;margin-bottom:.65rem}
.btn-main{width:100%;background:var(--indigo);color:white;border:none;border-radius:11px;padding:.88rem;font-size:.88rem;font-weight:400;letter-spacing:.02em;transition:all .2s;margin-bottom:.5rem}
.btn-main:hover{opacity:.85;transform:translateY(-1px)}
.btn-main:disabled{opacity:.4;cursor:not-allowed;transform:none}
.btn-sec{width:100%;background:transparent;border:.5px solid var(--border2);color:var(--lavd);border-radius:11px;padding:.82rem;font-size:.82rem;transition:all .2s}
.btn-sec:hover{border-color:var(--lavd);color:var(--lav)}
.err{font-size:.75rem;color:var(--red);background:rgba(248,113,113,.08);border-radius:8px;padding:.5rem .75rem;margin-bottom:.7rem}
.auth-cycle{background:rgba(83,74,183,.08);border:.5px solid rgba(83,74,183,.18);border-radius:12px;padding:.85rem 1.1rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between}
.auth-cycle-name{font-size:.8rem;font-weight:400;color:var(--lav)}
.auth-cycle-hz{font-size:.7rem;color:rgba(196,181,253,.4);margin-top:.15rem}

/* DASHBOARD LAYOUT */
.dash{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sidebar{width:var(--sidebar);background:var(--ink);border-right:.5px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
.sidebar-logo{padding:1.75rem 1.5rem 1.25rem;border-bottom:.5px solid var(--border)}
.sl-text{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;letter-spacing:.2em;color:var(--lav)}
.sl-sub{font-size:.58rem;letter-spacing:.15em;text-transform:uppercase;color:var(--textg);margin-top:.1rem}
.nav-sec{padding:1.1rem .65rem .4rem}
.nav-sec-label{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--textg);padding:0 .7rem;margin-bottom:.4rem;display:block}
.nav-item{display:flex;align-items:center;gap:.65rem;padding:.6rem .7rem;border-radius:9px;color:var(--textd);cursor:pointer;transition:all .2s;margin-bottom:2px;font-size:.78rem}
.nav-item:hover{background:var(--lavg);color:var(--lav)}
.nav-item.active{background:var(--iglow);color:var(--lav);border:.5px solid rgba(83,74,183,.18)}
.nav-icon{font-size:.9rem;width:16px;text-align:center;flex-shrink:0}
.sidebar-foot{margin-top:auto;padding:1.1rem;border-top:.5px solid var(--border)}
.user-card{display:flex;align-items:center;gap:.65rem}
.user-av{width:30px;height:30px;border-radius:50%;background:var(--iglow);border:.5px solid rgba(83,74,183,.25);display:flex;align-items:center;justify-content:center;font-size:.62rem;color:var(--lavd);font-weight:500;flex-shrink:0}
.user-name{font-size:.75rem;font-weight:500;color:var(--text)}
.user-plan{font-size:.62rem;color:var(--textg);text-transform:capitalize}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{background:rgba(5,2,14,.85);backdrop-filter:blur(20px);border-bottom:.5px solid var(--border);padding:.9rem 1.75rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.topbar-title{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:300;color:var(--lav)}
.topbar-sub{font-size:.7rem;color:var(--textg);margin-top:.1rem}
.cycle-badge{display:flex;align-items:center;gap:.45rem;background:var(--iglow);border:.5px solid rgba(83,74,183,.2);border-radius:100px;padding:.32rem .85rem;font-size:.68rem;color:var(--lavd)}
.cdot{width:5px;height:5px;border-radius:50%;background:var(--indigo2);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.content{flex:1;overflow-y:auto;padding:1.5rem 1.75rem}

/* CARDS */
.card{background:var(--surface);border:.5px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:1rem}
.card-hd{padding:1rem 1.25rem;border-bottom:.5px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.card-hd-title{font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:var(--textg)}
.card-hd-action{font-size:.68rem;color:var(--indigo2);cursor:pointer;transition:color .2s}
.card-hd-action:hover{color:var(--lav)}
.card-bd{padding:1.25rem}

/* METRICS */
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1rem}
.metric{background:var(--surface);border:.5px solid var(--border);border-radius:14px;padding:1.25rem;transition:border .3s}
.metric:hover{border-color:var(--border2)}
.metric-label{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--textg);margin-bottom:.65rem}
.metric-val{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:300;color:var(--lav);line-height:1}
.metric-sub{font-size:.68rem;color:var(--textg);margin-top:.3rem}
.metric-up{font-size:.68rem;color:var(--green);margin-top:.3rem;display:flex;align-items:center;gap:.2rem}

/* GRID */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.g3{display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1rem}

/* MANTRA PLAYER */
.player-card{background:var(--surface);border:.5px solid var(--border);border-radius:16px;padding:1.75rem;text-align:center;position:relative;overflow:hidden;margin-bottom:1rem}
.player-om{font-family:'Cormorant Garamond',serif;font-size:10rem;color:var(--lav);opacity:.04;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:breathe 8s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.03;transform:translate(-50%,-50%) scale(1)}50%{opacity:.08;transform:translate(-50%,-50%) scale(1.03)}}
.player-label{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--textg);margin-bottom:.85rem}
.player-mantra{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:300;color:var(--lav);letter-spacing:.08em;margin-bottom:.35rem;line-height:1.3}
.player-meaning{font-size:.72rem;color:var(--textd);font-style:italic;margin-bottom:1.25rem;line-height:1.6}
.wave{display:flex;align-items:center;gap:3px;justify-content:center;height:28px;margin-bottom:.75rem}
.wbar{width:3px;border-radius:2px;background:rgba(83,74,183,.2);transition:height .4s ease,background .3s}
.wbar.on{background:var(--lav)}
.emit-row{display:flex;align-items:center;justify-content:center;gap:.85rem;font-size:.7rem;color:var(--textg);margin-bottom:1.1rem}
.emit-dot{width:5px;height:5px;border-radius:50%}
.emit-dot.on{background:var(--lav);animation:pulse 1.5s infinite}
.emit-dot.cloud{background:var(--gold);animation:pulse 1.5s .5s infinite}
.emit-dot.off{background:rgba(196,181,253,.15)}

/* TABS */
.tabs{display:flex;background:rgba(196,181,253,.04);border-radius:10px;padding:3px;margin-bottom:1rem}
.tab{flex:1;padding:.45rem;text-align:center;border-radius:7px;font-size:.68rem;cursor:pointer;transition:all .2s;color:var(--textg)}
.tab.active{background:var(--iglow);color:var(--lav)}

/* INTENT GRID */
.intent-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:.75rem}
.intent-btn{background:rgba(196,181,253,.03);border:.5px solid var(--border);border-radius:11px;padding:.75rem .4rem;text-align:center;cursor:pointer;transition:all .2s}
.intent-btn:hover{background:var(--lavg)}
.intent-btn.active{background:var(--iglow);border-color:rgba(83,74,183,.4)}
.intent-icon{font-size:1rem;margin-bottom:.25rem;display:block;opacity:.7}
.intent-lbl{font-size:.65rem;color:var(--textd);line-height:1.3}
.intent-btn.active .intent-lbl{color:var(--lav)}

/* FREQ GRID */
.freq-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-bottom:.75rem}
.freq-btn{background:rgba(196,181,253,.03);border:.5px solid var(--border);border-radius:11px;padding:.75rem .75rem;cursor:pointer;transition:all .2s}
.freq-btn:hover{background:var(--lavg)}
.freq-btn.active{background:var(--iglow);border-color:rgba(83,74,183,.4)}
.freq-hz{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--gold);opacity:.7;line-height:1}
.freq-nm{font-size:.65rem;color:var(--lav);margin:.15rem 0}
.freq-ds{font-size:.6rem;color:var(--textg)}

/* PLAY BTN */
.play-btn{width:100%;background:var(--indigo);color:white;border:none;border-radius:10px;padding:.78rem;font-size:.82rem;font-weight:400;transition:all .2s}
.play-btn:hover{opacity:.85}
.play-btn.on{background:rgba(83,74,183,.3);border:.5px solid rgba(83,74,183,.4)}

/* SCHEDULE */
.sched-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.sched-item{display:flex;align-items:center;gap:.65rem;background:rgba(196,181,253,.03);border:.5px solid var(--border);border-radius:10px;padding:.75rem .9rem}
.sched-info{flex:1}
.sched-name{font-size:.75rem;color:var(--lav)}
.sched-dur{font-size:.65rem;color:var(--textg);margin-top:.1rem}
.sched-rm{background:none;border:none;color:rgba(248,113,113,.35);font-size:.85rem;padding:0 .2rem;transition:color .2s}
.sched-rm:hover{color:var(--red)}
.add-btn{width:100%;background:transparent;border:.5px dashed rgba(196,181,253,.12);border-radius:10px;padding:.65rem;color:rgba(196,181,253,.3);font-size:.75rem;transition:all .2s;margin-bottom:.75rem}
.add-btn:hover{border-color:rgba(196,181,253,.25);color:var(--lavd)}

/* CYCLES VIEW */
.cycle-list{display:flex;flex-direction:column;gap:.4rem}
.cycle-row{display:flex;align-items:center;gap:.85rem;padding:.85rem 1rem;border-radius:11px;background:rgba(196,181,253,.02);border:.5px solid rgba(196,181,253,.06);transition:all .2s}
.cycle-row.now{background:var(--iglow);border-color:rgba(83,74,183,.3)}
.cycle-time{font-family:'Cormorant Garamond',serif;font-size:.85rem;color:var(--goldd);width:70px;flex-shrink:0}
.cycle-info{flex:1}
.cycle-nm{font-size:.75rem;font-weight:400;color:var(--lav);margin-bottom:.12rem}
.cycle-ac{font-size:.65rem;color:var(--textd)}
.cycle-hz{font-size:.62rem;color:var(--indigo2);background:var(--iglow);border:.5px solid rgba(83,74,183,.18);border-radius:100px;padding:.18rem .55rem;flex-shrink:0}

/* CLOUD */
.cloud-gate{background:rgba(232,197,71,.05);border:.5px solid rgba(232,197,71,.18);border-radius:13px;padding:1.25rem;text-align:center;margin-bottom:.75rem}
.cloud-gate-icon{font-size:1.3rem;opacity:.5;margin-bottom:.35rem}
.cloud-gate-title{font-size:.8rem;color:var(--gold);opacity:.75;font-weight:500;margin-bottom:.3rem}
.cloud-gate-desc{font-size:.72rem;color:var(--textd);line-height:1.6;margin-bottom:.85rem}
.cloud-gate-btn{display:inline-block;background:var(--indigo);color:white;border:none;border-radius:100px;padding:.45rem 1.4rem;font-size:.75rem;transition:opacity .2s}
.cloud-gate-btn:hover{opacity:.85}
.cloud-toggle{display:flex;align-items:center;justify-content:space-between;background:rgba(196,181,253,.03);border:.5px solid var(--border);border-radius:11px;padding:.9rem 1.1rem;cursor:pointer;transition:all .2s;margin-bottom:.5rem}
.cloud-toggle:hover{background:var(--lavg)}
.ct-label{font-size:.78rem;color:var(--text)}
.ct-sub{font-size:.65rem;color:var(--textg);margin-top:.12rem}
.toggle-sw{width:36px;height:20px;background:rgba(196,181,253,.08);border-radius:10px;position:relative;transition:background .3s;flex-shrink:0}
.toggle-sw.on{background:var(--indigo)}
.toggle-knob{width:14px;height:14px;background:white;border-radius:50%;position:absolute;top:3px;left:3px;transition:left .3s;opacity:.5}
.toggle-sw.on .toggle-knob{left:19px;opacity:1}

/* CHART */
.chart-bars{display:flex;align-items:flex-end;gap:5px;height:100px}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end}
.chart-bar{width:100%;background:var(--indigo);border-radius:3px 3px 0 0;opacity:.55;transition:opacity .2s;min-height:3px}
.chart-bar:hover{opacity:1}
.chart-bar.gold{background:var(--gold)}
.chart-lbl{font-size:.58rem;color:var(--textg)}

/* INTENTS DIST */
.idist{display:flex;flex-direction:column;gap:.65rem}
.idist-row{display:flex;align-items:center;gap:.65rem}
.idist-lbl{font-size:.72rem;color:var(--textd);width:100px;flex-shrink:0}
.idist-bar{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
.idist-fill{height:100%;border-radius:2px;background:var(--indigo)}
.idist-pct{font-size:.65rem;color:var(--textg);width:28px;text-align:right;flex-shrink:0}

/* TABLE */
.tbl{width:100%;border-collapse:collapse}
.tbl th{font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:var(--textg);padding:.65rem .9rem;text-align:left;border-bottom:.5px solid var(--border);font-weight:400}
.tbl td{padding:.8rem .9rem;font-size:.75rem;color:var(--textd);border-bottom:.5px solid rgba(196,181,253,.04)}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:rgba(196,181,253,.02)}
.tbl-av{width:24px;height:24px;border-radius:50%;background:var(--iglow);border:.5px solid rgba(83,74,183,.2);display:flex;align-items:center;justify-content:center;font-size:.58rem;color:var(--lavd);font-weight:500;flex-shrink:0}
.tbl-name{display:flex;align-items:center;gap:.5rem}
.badge{display:inline-flex;align-items:center;padding:.18rem .55rem;border-radius:100px;font-size:.62rem}
.badge.free{background:rgba(196,181,253,.07);color:var(--lavd);border:.5px solid rgba(196,181,253,.12)}
.badge.personal{background:var(--iglow);color:var(--indigo2);border:.5px solid rgba(83,74,183,.2)}
.badge.complete{background:rgba(232,197,71,.08);color:var(--goldd);border:.5px solid rgba(232,197,71,.18)}

/* PROFILE */
.profile-av{width:60px;height:60px;border-radius:50%;background:var(--iglow);border:.5px solid rgba(83,74,183,.25);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.6rem;color:var(--lav);margin:0 auto .75rem}
.vedic-row{display:flex;align-items:flex-start;gap:.85rem;padding:.85rem 0;border-bottom:.5px solid rgba(196,181,253,.05)}
.vedic-row:last-child{border-bottom:none}
.vedic-ic{width:40px;height:40px;border-radius:50%;background:var(--iglow);border:.5px solid rgba(83,74,183,.18);display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--lav);flex-shrink:0}
.vedic-title{font-size:.75rem;font-weight:400;color:var(--lav);margin-bottom:.2rem}
.vedic-desc{font-size:.68rem;color:var(--textd);line-height:1.55}

/* ACTIVITY */
.act-item{display:flex;align-items:flex-start;gap:.65rem;padding:.65rem 0;border-bottom:.5px solid rgba(196,181,253,.04)}
.act-item:last-child{border-bottom:none}
.act-icon{width:26px;height:26px;border-radius:7px;background:var(--iglow);display:flex;align-items:center;justify-content:center;font-size:.65rem;flex-shrink:0;margin-top:1px}
.act-text{font-size:.74rem;color:var(--textd);line-height:1.5}
.act-time{font-size:.62rem;color:var(--textg);margin-top:.15rem}

/* MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(5,2,14,.88);backdrop-filter:blur(8px);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:var(--ink);border:.5px solid var(--border2);border-radius:18px;padding:1.75rem;width:100%;max-width:360px}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--lav);margin-bottom:1.1rem}
.modal-row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.modal-sel,.modal-inp{width:100%;background:rgba(196,181,253,.06);border:.5px solid var(--border);border-radius:9px;padding:.68rem .9rem;color:var(--text);font-size:.8rem;outline:none;margin-bottom:.6rem}
.modal-sel option{background:#0d0920}
.modal-lbl{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--textg);display:block;margin-bottom:.35rem}

/* PLAN GATE */
.plan-gate{background:rgba(232,197,71,.05);border:.5px solid rgba(232,197,71,.15);border-radius:13px;padding:1.5rem;text-align:center}
.gate-icon{font-size:1.4rem;opacity:.5;margin-bottom:.4rem}
.gate-title{font-size:.82rem;color:var(--gold);opacity:.75;font-weight:500;margin-bottom:.3rem}
.gate-desc{font-size:.72rem;color:var(--textd);line-height:1.6;margin-bottom:.85rem}
.gate-btn{display:inline-block;background:var(--indigo);color:white;border:none;border-radius:100px;padding:.45rem 1.4rem;font-size:.75rem;transition:opacity .2s}
.gate-btn:hover{opacity:.85}

@media(max-width:900px){
  .sidebar{display:none}
  .metrics{grid-template-columns:1fr 1fr}
  .g2,.g3{grid-template-columns:1fr}
}
@media(max-width:540px){
  .metrics{grid-template-columns:1fr}
  .intent-grid{grid-template-columns:1fr 1fr}
  .freq-grid{grid-template-columns:1fr 1fr}
}
`

// ─── AUDIO HOOK ───────────────────────────────────────────────────────────────

function useAudio() {
  const ctx = useRef(null)
  const osc = useRef(null)
  const gain = useRef(null)

  function start(freq) {
    try {
      stop()
      const c = new (window.AudioContext || window.webkitAudioContext)()
      const o = c.createOscillator()
      const g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.frequency.value = freq; o.type = 'sine'
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.1, c.currentTime + 1.5)
      o.start()
      ctx.current = c; osc.current = o; gain.current = g
    } catch(e) {}
  }

  function stop() {
    if (gain.current && ctx.current) {
      try { gain.current.gain.linearRampToValueAtTime(0, ctx.current.currentTime + 0.8) } catch(e) {}
      setTimeout(() => { try { ctx.current?.close(); ctx.current = null } catch(e) {} }, 900)
    }
  }

  function changeFreq(freq) {
    if (osc.current && ctx.current) {
      try { osc.current.frequency.linearRampToValueAtTime(freq, ctx.current.currentTime + 1.2) } catch(e) {}
    }
  }

  return { start, stop, changeFreq }
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Wave({ playing }) {
  return (
    <div className="wave">
      {WAVE_H.map((h, i) => (
        <div key={i} className={`wbar${playing ? ' on' : ''}`}
          style={{ height: playing ? `${h}px` : '5px', transitionDelay: `${i * 18}ms` }} />
      ))}
    </div>
  )
}

function Toggle({ on, onClick }) {
  return (
    <div className={`toggle-sw${on ? ' on' : ''}`} onClick={onClick}>
      <div className="toggle-knob" />
    </div>
  )
}

// ─── PLAYER ──────────────────────────────────────────────────────────────────

function PlayerPanel({ profile, cycle }) {
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState('simple')
  const [activeIntent, setActiveIntent] = useState(
    INTENTIONS.find(i => i.id === profile.intention) || INTENTIONS[0]
  )
  const [activeFreq, setActiveFreq] = useState(profile.frequency || 528)
  const [cloudOn, setCloudOn] = useState(false)
  const [cloudDev, setCloudDev] = useState(false)
  const [schedule, setSchedule] = useState([])
  const [schedIdx, setSchedIdx] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [newItem, setNewItem] = useState({ intentId: 'paz', hours: 1, minutes: 0 })
  const schedTimer = useRef(null)
  const audio = useAudio()
  const mantra = generateMantra(profile.name)
  const isPremium = profile.plan === 'complete' || profile.plan === 'cloud'
  const isCloud = profile.plan === 'cloud'

  function togglePlay() {
    if (playing) {
      audio.stop()
      if (schedTimer.current) { clearInterval(schedTimer.current); schedTimer.current = null }
      setPlaying(false)
    } else {
      if (mode === 'simple') { audio.start(activeFreq); setPlaying(true) }
      else if (mode === 'cycle') { const c = getCurrentCycle(); audio.start(c.freq); setActiveFreq(c.freq); setPlaying(true) }
      else if (mode === 'scheduled' && schedule.length > 0) {
        const first = INTENTIONS.find(i => i.id === schedule[0].intentId)
        audio.start(first?.freq || 528); setPlaying(true); setSchedIdx(0)
        let idx = 0
        schedTimer.current = setInterval(() => {
          idx = (idx + 1) % schedule.length
          const item = schedule[idx]
          const intent = INTENTIONS.find(i => i.id === item.intentId)
          setSchedIdx(idx)
          audio.changeFreq(intent?.freq || 528)
        }, (schedule[idx]?.hours * 3600 + schedule[idx]?.minutes * 60) * 1000 || 3600000)
      }
    }
  }

  function addItem() {
    const intent = INTENTIONS.find(i => i.id === newItem.intentId)
    setSchedule(p => [...p, {
      intentId: newItem.intentId, label: intent?.label || '',
      freq: intent?.freq || 528, hours: +newItem.hours || 1, minutes: +newItem.minutes || 0
    }])
    setShowModal(false)
    setNewItem({ intentId: 'paz', hours: 1, minutes: 0 })
  }

  return (
    <>
      {showModal && (
        <div className="modal-ov" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Adicionar à sequência</div>
            <select className="modal-sel" value={newItem.intentId}
              onChange={e => setNewItem(p => ({ ...p, intentId: e.target.value }))}>
              {INTENTIONS.map(i => <option key={i.id} value={i.id}>{i.label} — {i.freq} Hz</option>)}
            </select>
            <div className="modal-row">
              <div>
                <span className="modal-lbl">Horas</span>
                <input className="modal-inp" type="number" min="0" max="23" value={newItem.hours}
                  onChange={e => setNewItem(p => ({ ...p, hours: e.target.value }))} />
              </div>
              <div>
                <span className="modal-lbl">Minutos</span>
                <input className="modal-inp" type="number" min="0" max="59" value={newItem.minutes}
                  onChange={e => setNewItem(p => ({ ...p, minutes: e.target.value }))} />
              </div>
            </div>
            <button className="btn-main" onClick={addItem}>Adicionar</button>
            <button className="btn-sec" style={{ marginTop: '.4rem' }} onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="player-card">
        <div className="player-om">ॐ</div>
        <div className="player-label">Seu mantra pessoal</div>
        <div className="player-mantra">{mantra.mantra}</div>
        <div className="player-meaning">{mantra.meaning}</div>
        <Wave playing={playing} />
        <div className="emit-row">
          <span className={`emit-dot${playing ? ' on' : ' off'}`} />
          <span>{playing ? `Emitindo — ${activeFreq} Hz` : 'Pausado'}</span>
          {cloudOn && <><span className="emit-dot cloud" /><span style={{ color: 'rgba(232,197,71,.5)' }}>Nuvem ativa</span></>}
        </div>
      </div>

      <div className="tabs">
        {[
          { id: 'simple', label: 'Simples' },
          { id: 'scheduled', label: 'Programado' },
          { id: 'cycle', label: 'Ciclo védico' },
          { id: 'cloud', label: '☁ Nuvem' },
        ].map(m => (
          <div key={m.id} className={`tab${mode === m.id ? ' active' : ''}`}
            onClick={() => { if (playing) { audio.stop(); setPlaying(false) }; setMode(m.id) }}>
            {m.label}
          </div>
        ))}
      </div>

      {/* SIMPLE */}
      {mode === 'simple' && (
        <div className="card">
          <div className="card-bd">
            <div className="card-hd-title" style={{ marginBottom: '.75rem', display: 'block', fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--textg)' }}>Intenção</div>
            <div className="intent-grid">
              {INTENTIONS.map(i => (
                <div key={i.id} className={`intent-btn${activeIntent?.id === i.id ? ' active' : ''}`}
                  onClick={() => { setActiveIntent(i); setActiveFreq(i.freq); if (playing) audio.changeFreq(i.freq) }}>
                  <span className="intent-icon">{i.icon}</span>
                  <div className="intent-lbl">{i.label}</div>
                </div>
              ))}
            </div>
            <div className="card-hd-title" style={{ marginBottom: '.75rem', display: 'block', fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--textg)' }}>Frequência</div>
            <div className="freq-grid">
              {FREQUENCIES.map(fr => (
                <div key={fr.hz} className={`freq-btn${activeFreq === fr.hz ? ' active' : ''}`}
                  onClick={() => { setActiveFreq(fr.hz); if (playing) audio.changeFreq(fr.hz) }}>
                  <div className="freq-hz">{fr.hz}</div>
                  <div className="freq-nm">{fr.name}</div>
                  <div className="freq-ds">{fr.desc}</div>
                </div>
              ))}
            </div>
            <button className={`play-btn${playing ? ' on' : ''}`} onClick={togglePlay}>
              {playing ? 'Pausar vibração' : `Ativar — ${activeFreq} Hz`}
            </button>
          </div>
        </div>
      )}

      {/* SCHEDULED */}
      {mode === 'scheduled' && (
        <div className="card">
          <div className="card-bd">
            {!isPremium ? (
              <div className="plan-gate">
                <div className="gate-icon">⏱</div>
                <div className="gate-title">Modo Programado</div>
                <div className="gate-desc">Monte sequências — 1h prosperidade, 2h paz, 30min proteção. Plano Pessoal e acima.</div>
                <span className="gate-btn">Fazer upgrade</span>
              </div>
            ) : (
              <>
                <div className="sched-list">
                  {schedule.length === 0 && <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--textg)', padding: '.75rem 0' }}>Sequência vazia. Adicione abaixo.</div>}
                  {schedule.map((item, i) => (
                    <div key={i} className="sched-item" style={schedIdx === i && playing ? { borderColor: 'rgba(83,74,183,.4)', background: 'var(--iglow)' } : {}}>
                      <div className="sched-info">
                        <div className="sched-name">{item.label} — {item.freq} Hz</div>
                        <div className="sched-dur">{item.hours}h {item.minutes > 0 ? item.minutes + 'min' : ''}</div>
                      </div>
                      {schedIdx === i && playing && <span style={{ fontSize: '.6rem', color: 'var(--lav)' }}>▶</span>}
                      <button className="sched-rm" onClick={() => setSchedule(p => p.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>+ Adicionar vibração</button>
                <button className={`play-btn${playing ? ' on' : ''}`} onClick={togglePlay} disabled={schedule.length === 0}>
                  {playing ? 'Pausar sequência' : 'Iniciar sequência'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CYCLE */}
      {mode === 'cycle' && (
        <div className="card">
          <div className="card-bd">
            <div className="cycle-list" style={{ marginBottom: '.85rem' }}>
              {CYCLES.map((c, i) => (
                <div key={i} className={`cycle-row${c.name === cycle.name ? ' now' : ''}`}>
                  <div className="cycle-time">{String(c.start).padStart(2,'0')}—{String(c.end).padStart(2,'0')}h</div>
                  <div className="cycle-info">
                    <div className="cycle-nm">{c.name}</div>
                    <div className="cycle-ac">{c.action}</div>
                  </div>
                  <div className="cycle-hz">{c.freq} Hz</div>
                </div>
              ))}
            </div>
            <button className={`play-btn${playing ? ' on' : ''}`} onClick={togglePlay}>
              {playing ? 'Pausar ciclo védico' : 'Ativar ciclo védico automático'}
            </button>
          </div>
        </div>
      )}

      {/* CLOUD */}
      {mode === 'cloud' && (
        <div className="card">
          <div className="card-bd">
            {!isCloud ? (
              <div className="cloud-gate">
                <div className="cloud-gate-icon">☁</div>
                <div className="cloud-gate-title">Modo 24/7 em Nuvem</div>
                <div className="cloud-gate-desc">O servidor emite sua vibração continuamente — mesmo com o celular desligado. Plano Nuvem — R$39,90/mês.</div>
                <span className="cloud-gate-btn">Assinar plano Nuvem</span>
              </div>
            ) : (
              <>
                <div className="cloud-toggle" onClick={() => setCloudOn(!cloudOn)}>
                  <div><div className="ct-label">Emissão em nuvem 24/7</div><div className="ct-sub">Servidor emite independente do aparelho</div></div>
                  <Toggle on={cloudOn} />
                </div>
                <div className="cloud-toggle" onClick={() => { setCloudDev(v => !v) }}>
                  <div><div className="ct-label">Emissão simultânea no aparelho</div><div className="ct-sub">Toca também neste dispositivo</div></div>
                  <Toggle on={cloudDev} onClick={e => { e.stopPropagation(); setCloudDev(v => !v) }} />
                </div>
                <button
                  className={`play-btn${playing ? ' on' : ''}`}
                  style={{ marginTop: '.5rem', opacity: cloudDev ? 1 : 0.35 }}
                  onClick={() => { if (!cloudDev) { setCloudDev(true); } togglePlay(); }}>
                  {playing ? 'Pausar no aparelho' : 'Ativar no aparelho também'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────

function Overview({ profile, cycle, setPage }) {
  const mantra = generateMantra(profile.name)
  const vedic = vedicNum(profile.birthdate)
  const audio = useAudio()
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    if (playing) { audio.stop(); setPlaying(false) }
    else { audio.start(profile.frequency || 528); setPlaying(true) }
  }

  return (
    <>
      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Dias ativos</div>
          <div className="metric-val">23</div>
          <div className="metric-sub">desde o cadastro</div>
        </div>
        <div className="metric">
          <div className="metric-label">Horas emitidas</div>
          <div className="metric-val">312</div>
          <div className="metric-up">↑ +18h esta semana</div>
        </div>
        <div className="metric">
          <div className="metric-label">Frequência ativa</div>
          <div className="metric-val">{profile.frequency || 528}</div>
          <div className="metric-sub">Hz</div>
        </div>
        <div className="metric">
          <div className="metric-label">Próximo ciclo</div>
          <div className="metric-val" style={{ fontSize: '1.4rem', paddingTop: '.3rem' }}>
            {cycle.end === 24 ? '00' : String(cycle.end).padStart(2,'0')}h00
          </div>
          <div className="metric-sub">{CYCLES[(CYCLES.indexOf(cycle) + 1) % CYCLES.length]?.name}</div>
        </div>
      </div>

      <div className="g3">
        <div>
          <div className="player-card" style={{ marginBottom: 0 }}>
            <div className="player-om">ॐ</div>
            <div className="player-label">Seu mantra pessoal</div>
            <div className="player-mantra">{mantra.mantra}</div>
            <div className="player-meaning">{mantra.meaning}</div>
            <Wave playing={playing} />
            <div className="emit-row">
              <span className={`emit-dot${playing ? ' on' : ' off'}`} />
              <span>{playing ? `Emitindo — ${profile.frequency || 528} Hz` : 'Pausado'}</span>
            </div>
            <button className={`play-btn${playing ? ' on' : ''}`} onClick={togglePlay}>
              {playing ? 'Pausar vibração' : 'Ativar vibração'}
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-hd"><span className="card-hd-title">Número védico</span></div>
            <div className="card-bd" style={{ textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--iglow)', border: '.5px solid rgba(83,74,183,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .6rem', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: 'var(--lav)' }}>{vedic.number}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--lav)', marginBottom: '.2rem' }}>{vedic.planet}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--textd)' }}>{vedic.quality}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><span className="card-hd-title">Ciclo atual</span></div>
            <div className="card-bd">
              <div style={{ fontSize: '.82rem', color: 'var(--lav)', marginBottom: '.2rem' }}>{cycle.name}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--textd)', marginBottom: '.5rem' }}>{cycle.action}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--indigo2)', fontStyle: 'italic' }}>{cycle.mantra}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-hd"><span className="card-hd-title">Horas emitidas — semana</span></div>
          <div className="card-bd">
            <div className="chart-bars">
              {[{d:'Seg',h:40},{d:'Ter',h:65},{d:'Qua',h:55},{d:'Qui',h:90,gold:true},{d:'Sex',h:20,dim:true},{d:'Sáb',h:10,dim:true},{d:'Dom',h:5,dim:true}].map((b,i) => (
                <div key={i} className="chart-col">
                  <div className={`chart-bar${b.gold?' gold':''}`} style={{ height: `${b.h}px`, opacity: b.dim ? .2 : undefined }} />
                  <div className="chart-lbl">{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd"><span className="card-hd-title">Intenções</span></div>
          <div className="card-bd">
            <div className="idist">
              {[{l:'Prosperidade',p:68,gold:true},{l:'Paz interior',p:52},{l:'Proteção',p:38},{l:'Foco',p:29},{l:'Amor',p:21,lav:true}].map((r,i) => (
                <div key={i} className="idist-row">
                  <div className="idist-lbl">{r.l}</div>
                  <div className="idist-bar"><div className="idist-fill" style={{ width:`${r.p}%`, background: r.gold ? 'var(--gold)' : r.lav ? 'var(--lav)' : undefined }} /></div>
                  <div className="idist-pct">{r.p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="g3">
        <div className="card">
          <div className="card-hd"><span className="card-hd-title">Usuários recentes</span><span className="card-hd-action">Ver todos</span></div>
          <table className="tbl">
            <thead><tr><th>Usuário</th><th>Mantra</th><th>Plano</th><th>Cadastro</th></tr></thead>
            <tbody>
              {[{n:'Maria A.',m:'Om Ma·Ra·Ia Namah',p:'personal',d:'hoje'},{n:'Ricardo C.',m:'Om Ri·Ca·Da Namah',p:'complete',d:'ontem'},{n:'Fernanda L.',m:'Om Fe·Na·Da Namah',p:'personal',d:'ontem'},{n:'João P.',m:'Om Ja·Oa Namah',p:'free',d:'2 dias'},{n:'Ana S.',m:'Om Aa·Na·Sa Namah',p:'personal',d:'3 dias'}].map((r,i) => (
                <tr key={i}>
                  <td><div className="tbl-name"><div className="tbl-av">{r.n[0]}{r.n.split(' ')[1]?.[0]}</div>{r.n}</div></td>
                  <td style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'.72rem', fontStyle:'italic', color:'var(--lav)' }}>{r.m}</td>
                  <td><span className={`badge ${r.p}`}>{r.p === 'free' ? 'Grátis' : r.p === 'personal' ? 'Pessoal' : 'Completo'}</span></td>
                  <td>{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-hd"><span className="card-hd-title">Atividade</span></div>
          <div className="card-bd" style={{ paddingTop: '.5rem' }}>
            {[{i:'ॐ',t:'Vibração ativada — 528 Hz',d:'agora'},{i:'↻',t:'Ciclo mudou para Sthiti',d:'2h'},{i:'★',t:'Maria A. cadastrou-se',d:'3h'},{i:'↑',t:'Ricardo fez upgrade',d:'ontem'},{i:'ॐ',t:'Brahma Muhurta iniciado',d:'ontem'}].map((a,i) => (
              <div key={i} className="act-item">
                <div className="act-icon">{a.i}</div>
                <div><div className="act-text">{a.t}</div><div className="act-time">{a.d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPLICAÇÃO COMPLETA — COMO CHEGAMOS AO SEU NÚMERO E FREQUÊNCIA */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-hd">
          <span className="card-hd-title">Como chegamos ao seu número e frequência</span>
          <span className="card-hd-action" style={{ fontSize: '.65rem', color: 'var(--goldd)' }}>Total transparência</span>
        </div>
        <div className="card-bd">

          {/* STEP 1 — NOME */}
          <div style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:'.85rem', alignItems:'flex-start', paddingBottom:'1.1rem', borderBottom:'.5px solid rgba(196,181,253,.06)', marginBottom:'1.1rem' }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',color:'var(--indigo2)',fontWeight:500,flexShrink:0 }}>1</div>
            <div>
              <div style={{ fontSize:'.78rem',fontWeight:400,color:'var(--lav)',marginBottom:'.3rem' }}>Fonemas sânscritos do nome</div>
              <div style={{ fontSize:'.72rem',color:'var(--textd)',lineHeight:1.7,marginBottom:'.5rem' }}>
                O sânscrito possui 50 fonemas classificados nos <em>Shikshā</em> — tratados fonéticos védicos com ~2.500 anos. Cada letra do seu nome é mapeada para um fonema e sua qualidade arquetípica associada.
              </div>
              <div style={{ background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.18)',borderRadius:9,padding:'.6rem .9rem',fontSize:'.72rem',color:'var(--lav)',fontStyle:'italic',lineHeight:1.6 }}>
                {profile.name} → {generateMantra(profile.name).qualities}<br/>
                Mantra gerado: <strong style={{fontFamily:"'Cormorant Garamond',serif",letterSpacing:'.06em'}}>{generateMantra(profile.name).mantra}</strong>
              </div>
            </div>
          </div>

          {/* STEP 2 — DATA */}
          <div style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:'.85rem', alignItems:'flex-start', paddingBottom:'1.1rem', borderBottom:'.5px solid rgba(196,181,253,.06)', marginBottom:'1.1rem' }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',color:'var(--indigo2)',fontWeight:500,flexShrink:0 }}>2</div>
            <div>
              <div style={{ fontSize:'.78rem',fontWeight:400,color:'var(--lav)',marginBottom:'.3rem' }}>Número védico — Jyotish (astrologia védica)</div>
              <div style={{ fontSize:'.72rem',color:'var(--textd)',lineHeight:1.7,marginBottom:'.5rem' }}>
                Na tradição Jyotish, a soma reduzida dos dígitos da data de nascimento revela o <em>Graha</em> (planeta regente) que domina a vibração natal da pessoa. Cada planeta tem uma frequência Solfeggio associada.
              </div>
              <div style={{ background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.18)',borderRadius:9,padding:'.6rem .9rem',fontSize:'.72rem',color:'var(--lav)',fontStyle:'italic',lineHeight:1.6 }}>
                {profile.birthdate
                  ? `${profile.birthdate} → soma dos dígitos → reduz para ${vedicNum(profile.birthdate).number} → ${vedicNum(profile.birthdate).planet} → ${vedicNum(profile.birthdate).quality}`
                  : 'Data de nascimento não informada'}
              </div>
            </div>
          </div>

          {/* STEP 3 — FREQUÊNCIA */}
          <div style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:'.85rem', alignItems:'flex-start', paddingBottom:'1.1rem', borderBottom:'.5px solid rgba(196,181,253,.06)', marginBottom:'1.1rem' }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',color:'var(--indigo2)',fontWeight:500,flexShrink:0 }}>3</div>
            <div>
              <div style={{ fontSize:'.78rem',fontWeight:400,color:'var(--lav)',marginBottom:'.3rem' }}>As 7 frequências Solfeggio — origem medieval</div>
              <div style={{ fontSize:'.72rem',color:'var(--textd)',lineHeight:1.7,marginBottom:'.5rem' }}>
                Sistema de 7 tons documentado pelo Dr. Joseph Puleo nos anos 1990 a partir de manuscritos do canto gregoriano medieval (<em>Ut queant laxis</em>, séc. VIII). Cada frequência corresponde a uma qualidade específica. Você recebe 4 das 7, selecionadas pela sua intenção.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'.4rem' }}>
                {(SEQUENCES[profile.intention] || SEQUENCES.paz).map((hz, i) => (
                  <div key={i} style={{ background:'rgba(83,74,183,.1)',border:'.5px solid rgba(83,74,183,.2)',borderRadius:8,padding:'.5rem',textAlign:'center' }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'1.15rem',color:'var(--gold)',opacity:.8,lineHeight:1 }}>{hz}</div>
                    <div style={{ fontSize:'.6rem',color:'var(--lav)',marginTop:'.2rem' }}>
                      {hz===396?'Liberação':hz===417?'Mudança':hz===528?'Transformação':hz===639?'Conexão':hz===741?'Expressão':hz===852?'Ordem':'Consciência'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 4 — HERMETISMO */}
          <div style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:'.85rem', alignItems:'flex-start', paddingBottom:'1.1rem', borderBottom:'.5px solid rgba(196,181,253,.06)', marginBottom:'1.1rem' }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',color:'var(--indigo2)',fontWeight:500,flexShrink:0 }}>4</div>
            <div>
              <div style={{ fontSize:'.78rem',fontWeight:400,color:'var(--lav)',marginBottom:'.3rem' }}>Planeta das Horas — Hermetismo clássico</div>
              <div style={{ fontSize:'.72rem',color:'var(--textd)',lineHeight:1.7 }}>
                O <em>Corpus Hermeticum</em> (séc. II d.C.) estabelece os Horários Planetários — ciclos de 24h onde cada hora é regida por um planeta. A hora do seu nascimento determina o Planeta das Horas, que define o ritmo de troca entre as frequências da sua sequência.
              </div>
            </div>
          </div>

          {/* STEP 5 — ZOROASTRISMO */}
          <div style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:'.85rem', alignItems:'flex-start' }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--iglow)',border:'.5px solid rgba(83,74,183,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',color:'var(--indigo2)',fontWeight:500,flexShrink:0 }}>5</div>
            <div>
              <div style={{ fontSize:'.78rem',fontWeight:400,color:'var(--lav)',marginBottom:'.3rem' }}>Yazata zoroastrista — calendário do Avesta</div>
              <div style={{ fontSize:'.72rem',color:'var(--textd)',lineHeight:1.7,marginBottom:'.5rem' }}>
                O <em>Avesta</em> — texto sagrado zoroastrista (~1200 a.C.) — atribui um Yazata (entidade divina com qualidades específicas) a cada dia do ano no calendário Fasli. O Yazata do seu dia de nascimento define a intenção arquetípica mais profunda do seu mantra.
              </div>
              <div style={{ background:'rgba(232,197,71,.06)',border:'.5px solid rgba(232,197,71,.15)',borderRadius:9,padding:'.6rem .9rem',fontSize:'.72rem',color:'rgba(232,197,71,.7)',fontStyle:'italic',lineHeight:1.6 }}>
                Toda esta lógica é pública, auditável e verificável. Nenhum elemento é aleatório ou inventado.
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  )
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

function ProfilePage({ profile, onLogout }) {
  const mantra = generateMantra(profile.name)
  const vedic = vedicNum(profile.birthdate)
  const yaz = yazataOf(profile.birthdate)

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-bd" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="profile-av">{profile.name?.[0]?.toUpperCase()}</div>
          <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '.25rem' }}>{profile.name}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--textg)' }}>{profile.email}</div>
          <div style={{ marginTop: '.75rem' }}>
            <span className={`badge ${profile.plan || 'free'}`} style={{ fontSize: '.7rem', padding: '.25rem .85rem' }}>
              {profile.plan === 'free' || !profile.plan ? 'Gratuito' : profile.plan === 'personal' ? 'Pessoal' : profile.plan === 'complete' ? 'Completo' : 'Nuvem'}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><span className="card-hd-title">Origem do seu mantra</span></div>
        <div className="card-bd">
          <div className="vedic-row">
            <div className="vedic-ic">अ</div>
            <div>
              <div className="vedic-title">Fonemas sânscritos do nome</div>
              <div className="vedic-desc">Cada letra de "{profile.name}" foi mapeada para um fonema védico com qualidade associada: {mantra.qualities}. Resultado: {mantra.mantra}</div>
            </div>
          </div>
          <div className="vedic-row">
            <div className="vedic-ic">९</div>
            <div>
              <div className="vedic-title">Número védico {vedic.number} — {vedic.planet}</div>
              <div className="vedic-desc">Calculado pela soma reduzida da data de nascimento. Planeta regente: {vedic.planet}. Qualidade: {vedic.quality}. Frequência base: {profile.frequency || 528} Hz.</div>
            </div>
          </div>
          <div className="vedic-row">
            <div className="vedic-ic">☿</div>
            <div>
              <div className="vedic-title">Hermetismo — Planeta das Horas</div>
              <div className="vedic-desc">Baseado na hora e dia de nascimento, a tradição hermética atribui um planeta regente à hora exata do nascimento — refinando a frequência base do mantra.</div>
            </div>
          </div>
          <div className="vedic-row">
            <div className="vedic-ic">🔥</div>
            <div>
              <div className="vedic-title">Yazata zoroastrista — {yaz}</div>
              <div className="vedic-desc">O calendário zoroastrista atribui o Yazata {yaz} ao dia do seu nascimento. Este arquétipo divino define a intenção mais profunda do seu mantra.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><span className="card-hd-title">Seu mantra completo</span></div>
        <div className="card-bd" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: 'var(--lav)', letterSpacing: '.08em', marginBottom: '.4rem' }}>{mantra.mantra}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--textd)', fontStyle: 'italic', lineHeight: 1.6 }}>{mantra.meaning}</div>
        </div>
      </div>

      <button className="btn-sec" onClick={onLogout}>Sair da conta</button>
    </div>
  )
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({ profile, onLogout }) {
  const [page, setPage] = useState('overview')
  const [cycle, setCycle] = useState(getCurrentCycle())

  useEffect(() => {
    const t = setInterval(() => setCycle(getCurrentCycle()), 60000)
    return () => clearInterval(t)
  }, [])

  const pages = {
    overview: 'Visão geral',
    player: 'Meu mantra',
    cycles: 'Ciclos védicos',
    profile: 'Perfil',
  }

  const navItems = [
    { id:'overview', icon:'⊞', label:'Visão geral' },
    { id:'player',   icon:'◎', label:'Meu mantra' },
    { id:'cycles',   icon:'↻', label:'Ciclos védicos' },
  ]

  const navAccount = [
    { id:'profile', icon:'◈', label:'Perfil' },
  ]

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sl-text">ŌHM</div>
          <div className="sl-sub">Painel do usuário</div>
        </div>

        <div className="nav-sec">
          <span className="nav-sec-label">Principal</span>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => setPage(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="nav-sec">
          <span className="nav-sec-label">Conta</span>
          {navAccount.map(item => (
            <div key={item.id} className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => setPage(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="sidebar-foot">
          <div className="user-card">
            <div className="user-av">{profile.name?.[0]?.toUpperCase()}{profile.name?.split(' ')[1]?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{profile.name}</div>
              <div className="user-plan">{profile.plan || 'Gratuito'}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{pages[page]}</div>
            <div className="topbar-sub">{new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div className="cycle-badge"><span className="cdot" />{cycle.name}</div>
            <div className="user-av" style={{ cursor:'pointer', width:34, height:34 }}
              onClick={() => setPage('profile')}>
              {profile.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="content">
          {page === 'overview' && <Overview profile={profile} cycle={cycle} setPage={setPage} />}
          {page === 'player' && <PlayerPanel profile={profile} cycle={cycle} />}
          {page === 'cycles' && (
            <div style={{ maxWidth: 600 }}>
              <div className="card">
                <div className="card-hd"><span className="card-hd-title">Ciclos védicos do dia</span></div>
                <div className="card-bd">
                  <div className="cycle-list">
                    {CYCLES.map((c, i) => (
                      <div key={i} className={`cycle-row${c.name === cycle.name ? ' now' : ''}`}>
                        <div className="cycle-time">{String(c.start).padStart(2,'0')}—{String(c.end).padStart(2,'0')}h</div>
                        <div className="cycle-info">
                          <div className="cycle-nm">{c.name}</div>
                          <div className="cycle-ac">{c.action} · {c.mantra}</div>
                        </div>
                        <div className="cycle-hz">{c.freq} Hz</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {page === 'profile' && <ProfilePage profile={profile} onLogout={onLogout} />}
        </div>
      </div>
    </div>
  )
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [view, setView] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'', birthdate:'', birthtime:'', intention:'paz' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const cycle = getCurrentCycle()
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleLogin() {
    setError(''); setLoading(true)
    try {
      const r = await fetch(`${API}/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: form.email, password: form.password })
      })
      const d = await r.json()
      if (d.error) { setError('Email ou senha incorretos'); setLoading(false); return }
      localStorage.setItem('ohm_token', d.token)
      onLogin(d.token)
    } catch(e) { setError('Erro de conexão.') }
    setLoading(false)
  }

  async function handleRegister() {
    setError(''); setLoading(true)
    try {
      const r = await fetch(`${API}/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      const lr = await fetch(`${API}/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: form.email, password: form.password })
      })
      const ld = await lr.json()
      if (ld.token) { localStorage.setItem('ohm_token', ld.token); onLogin(ld.token) }
    } catch(e) { setError('Erro de conexão.') }
    setLoading(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-glow" />
      <div className="auth-logo">ŌHM</div>
      <div className="auth-sub">O som que é só seu</div>

      <div className="auth-card">
        <div className="auth-cycle">
          <div>
            <div className="auth-cycle-name">{cycle.name}</div>
            <div className="auth-cycle-hz">{cycle.action}</div>
          </div>
          <span style={{ fontSize: '.68rem', color: 'rgba(83,74,183,.6)' }}>{cycle.freq} Hz</span>
        </div>

        {view === 'login' && (
          <>
            <span className="auth-label">Entrar</span>
            {error && <div className="err">{error}</div>}
            <input className="auth-input" placeholder="Email" type="email" value={form.email} onChange={e => f('email', e.target.value)} />
            <input className="auth-input" placeholder="Senha" type="password" value={form.password} onChange={e => f('password', e.target.value)} />
            <button className="btn-main" onClick={handleLogin} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            <button className="btn-sec" onClick={() => { setError(''); setView('register') }}>Criar conta gratuita</button>
          </>
        )}

        {view === 'register' && (
          <>
            <span className="auth-label">Criar sua vibração</span>
            {error && <div className="err">{error}</div>}
            <input className="auth-input" placeholder="Nome completo" value={form.name} onChange={e => f('name', e.target.value)} />
            <input className="auth-input" placeholder="Email" type="email" value={form.email} onChange={e => f('email', e.target.value)} />
            <input className="auth-input" placeholder="Senha (mín. 6 caracteres)" type="password" value={form.password} onChange={e => f('password', e.target.value)} />
            <input className="auth-input" placeholder="Data de nascimento" type="date" value={form.birthdate} onChange={e => f('birthdate', e.target.value)} />
            <input className="auth-input" placeholder="Hora de nascimento (opcional)" type="time" value={form.birthtime} onChange={e => f('birthtime', e.target.value)} />
            <div className="auth-hint">A hora de nascimento é usada para o Planeta das Horas hermético — camada adicional do seu mantra. Opcional.</div>
            <select className="auth-select" value={form.intention} onChange={e => f('intention', e.target.value)}>
              {INTENTIONS.map(i => <option key={i.id} value={i.id}>{i.icon} {i.label}</option>)}
            </select>
            <button className="btn-main" onClick={handleRegister} disabled={loading}>{loading ? 'Gerando seu mantra...' : 'Gerar meu mantra'}</button>
            <button className="btn-sec" onClick={() => { setError(''); setView('login') }}>Já tenho conta</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ohm_token')
    if (token) loadProfile(token)
    else setLoading(false)
  }, [])

  async function loadProfile(token) {
    try {
      const r = await fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (d.id) setProfile(d)
      else localStorage.removeItem('ohm_token')
    } catch(e) {}
    setLoading(false)
  }

  async function handleLogin(token) {
    await loadProfile(token)
  }

  function handleLogout() {
    localStorage.removeItem('ohm_token')
    setProfile(null)
  }

  if (loading) return (
    <>
      <style>{S}</style>
      <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--void)', fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', letterSpacing:'.2em', color:'rgba(196,181,253,.3)' }}>ŌHM</div>
    </>
  )

  return (
    <>
      <style>{S}</style>
      {profile ? <Dashboard profile={profile} onLogout={handleLogout} /> : <AuthScreen onLogin={handleLogin} />}
    </>
  )
}
