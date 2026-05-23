// StreamPlayer.jsx — componente de player de stream para integrar no App_v3.jsx
// Substitui o PlayerPanel atual

import React, { useState, useEffect, useRef, useCallback } from 'react'

const API = 'http://187.77.60.16:4101/api'

const SOLFEGGIO = {
  396: { name:'Liberação',    color:'rgba(74,222,128,.7)',  desc:'Dissolução de medo e padrões' },
  417: { name:'Mudança',      color:'rgba(100,180,255,.7)', desc:'Facilitação de transformações' },
  528: { name:'Transformação',color:'rgba(196,181,253,.9)', desc:'Bem-estar e foco' },
  639: { name:'Conexão',      color:'rgba(255,180,100,.7)', desc:'Harmonia em relações' },
  741: { name:'Expressão',    color:'rgba(232,197,71,.8)',  desc:'Clareza mental e criatividade' },
  852: { name:'Ordem',        color:'rgba(255,120,120,.7)', desc:'Intuição elevada' },
  963: { name:'Consciência',  color:'rgba(180,100,255,.8)', desc:'Presença pura' },
}

const INTENTIONS = [
  { id:'paz',          label:'Paz interior',    icon:'☽', seq:[396,528,417,963] },
  { id:'prosperidade', label:'Prosperidade',    icon:'✦', seq:[528,639,741,852] },
  { id:'protecao',     label:'Proteção',        icon:'◈', seq:[396,417,528,741] },
  { id:'foco',         label:'Foco e clareza',  icon:'◎', seq:[417,528,741,963] },
  { id:'amor',         label:'Amor e relações', icon:'♡', seq:[528,639,852,963] },
  { id:'transformacao',label:'Transformação',   icon:'⟁', seq:[396,417,639,741] },
]

const WAVE_H = [8,16,24,18,28,12,26,20,14,30,10,22,18,26,14,20,28,16,24,12]

const SS = `
.sp-wrap{display:flex;flex-direction:column;gap:1rem}

/* LIVE INDICATOR */
.live-bar{display:flex;align-items:center;justify-content:space-between;background:rgba(74,222,128,.06);border:.5px solid rgba(74,222,128,.18);border-radius:12px;padding:.85rem 1.25rem}
.live-left{display:flex;align-items:center;gap:.6rem}
.live-dot{width:7px;height:7px;border-radius:50%;background:#4ade80}
.live-dot.active{animation:livepulse 1.5s infinite}
.live-dot.inactive{background:rgba(196,181,253,.2)}
@keyframes livepulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,.4)}70%{box-shadow:0 0 0 6px rgba(74,222,128,0)}}
.live-text{font-size:.75rem;color:rgba(74,222,128,.8);font-weight:400}
.live-freq{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:rgba(74,222,128,.7)}

/* PLAYER CARD */
.sp-player{background:rgba(196,181,253,.04);border:.5px solid rgba(196,181,253,.12);border-radius:18px;padding:2rem 1.5rem;text-align:center;position:relative;overflow:hidden}
.sp-om{font-family:'Cormorant Garamond',serif;font-size:8rem;color:rgba(196,181,253,.05);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:spbreathe 8s ease-in-out infinite}
@keyframes spbreathe{0%,100%{opacity:.04;transform:translate(-50%,-50%) scale(1)}50%{opacity:.08;transform:translate(-50%,-50%) scale(1.03)}}
.sp-label{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(226,217,243,.2);margin-bottom:.85rem}
.sp-mantra{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:#c4b5fd;letter-spacing:.08em;margin-bottom:.3rem;line-height:1.3}
.sp-meaning{font-size:.72rem;color:rgba(226,217,243,.45);font-style:italic;margin-bottom:1.25rem;line-height:1.6}
.sp-wave{display:flex;align-items:center;gap:3px;justify-content:center;height:32px;margin-bottom:.75rem}
.sp-bar{width:3px;border-radius:2px;background:rgba(83,74,183,.2);transition:height .4s ease,background .5s}
.sp-bar.on{background:#c4b5fd}
.sp-freq-display{margin:.5rem 0 1rem}
.sp-freq-hz{font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:300;line-height:1;transition:color .8s}
.sp-freq-name{font-size:.72rem;margin-top:.2rem;transition:color .8s}
.sp-freq-desc{font-size:.65rem;color:rgba(226,217,243,.35);margin-top:.15rem}

/* SEQUENCE TRACK */
.sp-track{display:flex;gap:.4rem;justify-content:center;margin:.75rem 0}
.sp-track-item{flex:1;max-width:70px;height:4px;border-radius:2px;background:rgba(196,181,253,.1);transition:background .5s,transform .3s}
.sp-track-item.active{transform:scaleY(2)}

/* EMIT STATUS */
.sp-status{display:flex;align-items:center;justify-content:center;gap:1rem;font-size:.7rem;color:rgba(226,217,243,.4);margin-bottom:1rem;flex-wrap:wrap}
.sp-dot{width:5px;height:5px;border-radius:50%}
.sp-dot.device{background:#c4b5fd}
.sp-dot.cloud{background:#E8C547}
.sp-dot.off{background:rgba(196,181,253,.15)}
.sp-dot.device.on{animation:pulse 1.5s infinite}
.sp-dot.cloud.on{animation:pulse 1.5s .5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* BUTTONS */
.sp-btn-row{display:flex;gap:.6rem}
.sp-btn{flex:1;border:none;border-radius:10px;padding:.82rem;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:400;cursor:pointer;transition:all .2s}
.sp-btn-primary{background:#534AB7;color:white}
.sp-btn-primary:hover{opacity:.85}
.sp-btn-primary.on{background:rgba(83,74,183,.3);border:.5px solid rgba(83,74,183,.4)}
.sp-btn-cloud{background:rgba(232,197,71,.12);color:rgba(232,197,71,.8);border:.5px solid rgba(232,197,71,.2)}
.sp-btn-cloud:hover{background:rgba(232,197,71,.18)}
.sp-btn-cloud.on{background:rgba(232,197,71,.2);border-color:rgba(232,197,71,.4)}
.sp-btn-disabled{opacity:.3;cursor:not-allowed}

/* INTENTION SELECTOR */
.sp-intent-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem}
.sp-intent-btn{background:rgba(196,181,253,.03);border:.5px solid rgba(196,181,253,.1);border-radius:11px;padding:.75rem .4rem;text-align:center;cursor:pointer;transition:all .2s}
.sp-intent-btn:hover{background:rgba(196,181,253,.07)}
.sp-intent-btn.active{background:rgba(83,74,183,.18);border-color:rgba(83,74,183,.4)}
.sp-intent-icon{font-size:1rem;margin-bottom:.25rem;display:block;opacity:.7}
.sp-intent-lbl{font-size:.65rem;color:rgba(226,217,243,.55);line-height:1.3}
.sp-intent-btn.active .sp-intent-lbl{color:#c4b5fd}

/* SEQUENCE CARD */
.sp-seq-card{background:rgba(196,181,253,.04);border:.5px solid rgba(196,181,253,.1);border-radius:14px;padding:1.1rem}
.sp-seq-title{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(226,217,243,.2);margin-bottom:.85rem}
.sp-seq-list{display:flex;flex-direction:column;gap:.4rem}
.sp-seq-item{display:flex;align-items:center;gap:.75rem;padding:.6rem .75rem;border-radius:9px;background:rgba(196,181,253,.03);border:.5px solid rgba(196,181,253,.06);transition:all .25s}
.sp-seq-item.now{background:rgba(83,74,183,.12);border-color:rgba(83,74,183,.3)}
.sp-seq-hz{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:300;width:52px;flex-shrink:0;transition:color .5s}
.sp-seq-info{flex:1}
.sp-seq-name{font-size:.72rem;font-weight:400;color:#c4b5fd;margin-bottom:.1rem}
.sp-seq-dur{font-size:.62rem;color:rgba(226,217,243,.4)}
.sp-seq-now{font-size:.6rem;color:#4ade80;display:flex;align-items:center;gap:.3rem}
.sp-seq-now-dot{width:4px;height:4px;border-radius:50%;background:#4ade80;animation:pulse 1.5s infinite}

/* MONITORING */
.sp-monitor{background:rgba(196,181,253,.04);border:.5px solid rgba(196,181,253,.1);border-radius:14px;overflow:hidden}
.sp-monitor-hd{padding:.85rem 1.1rem;border-bottom:.5px solid rgba(196,181,253,.08);display:flex;align-items:center;justify-content:space-between}
.sp-monitor-title{font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(226,217,243,.2)}
.sp-monitor-live{display:flex;align-items:center;gap:.35rem;font-size:.65rem;color:rgba(74,222,128,.6)}
.sp-monitor-live-dot{width:4px;height:4px;border-radius:50%;background:#4ade80;animation:pulse 1.5s infinite}
.sp-stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(196,181,253,.06)}
.sp-stat{padding:1rem;background:rgba(196,181,253,.02);text-align:center}
.sp-stat-val{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;color:#c4b5fd;line-height:1}
.sp-stat-label{font-size:.6rem;color:rgba(226,217,243,.3);margin-top:.2rem;text-transform:uppercase;letter-spacing:.08em}
.sp-verify-link{padding:.75rem 1.1rem;font-size:.68rem;color:rgba(83,74,183,.6);display:flex;align-items:center;gap:.35rem;text-decoration:none;transition:color .2s;border-top:.5px solid rgba(196,181,253,.06)}
.sp-verify-link:hover{color:#7B74D4}

/* GATE */
.sp-gate{background:rgba(232,197,71,.05);border:.5px solid rgba(232,197,71,.15);border-radius:13px;padding:1.5rem;text-align:center}
.sp-gate-icon{font-size:1.3rem;opacity:.5;margin-bottom:.4rem}
.sp-gate-title{font-size:.8rem;color:#E8C547;opacity:.75;font-weight:500;margin-bottom:.3rem}
.sp-gate-desc{font-size:.72rem;color:rgba(226,217,243,.45);line-height:1.6;margin-bottom:.85rem}
.sp-gate-btn{display:inline-block;background:#534AB7;color:white;border:none;border-radius:100px;padding:.45rem 1.4rem;font-size:.75rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .2s;text-decoration:none}
.sp-gate-btn:hover{opacity:.85}

/* CARD SHELL */
.sp-card{background:rgba(196,181,253,.04);border:.5px solid rgba(196,181,253,.12);border-radius:16px;padding:1.25rem;margin-top:0}
.sp-card-label{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(226,217,243,.2);margin-bottom:.85rem;display:block}
`

export default function StreamPlayer({ profile, mantraData }) {
  const [intention, setIntention] = useState(profile?.intention || 'paz')
  const [playing, setPlaying] = useState(false)
  const [cloudOn, setCloudOn] = useState(false)
  const [currentFreq, setCurrentFreq] = useState(profile?.frequency || 528)
  const [sequence, setSequence] = useState(INTENTIONS.find(i => i.id === (profile?.intention || 'paz'))?.seq || [528,639,741,852])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [streamUrl, setStreamUrl] = useState(null)
  const audioRef = useRef(null)
  const pingInterval = useRef(null)
  const token = localStorage.getItem('ohm_token')
  const isCloud = profile?.plan === 'cloud' || profile?.plan === 'space'
  const isPremium = isCloud || profile?.plan === 'personal'
  const freqInfo = SOLFEGGIO[currentFreq] || SOLFEGGIO[528]

  useEffect(() => {
    loadStatus()
    return () => { if (pingInterval.current) clearInterval(pingInterval.current) }
  }, [])

  async function loadStatus() {
    try {
      const r = await fetch(`${API}/stream/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await r.json()
      if (d.stats) setStats(d.stats)
      if (d.currentFreq) setCurrentFreq(d.currentFreq)
      if (d.sequence) setSequence(d.sequence)
      if (d.idx !== undefined) setCurrentIdx(d.idx)
      if (d.session?.is_active) setPlaying(true)
      if (d.session?.cloud_active) setCloudOn(true)
    } catch(e) {}
  }

  async function startStream(cloud = false) {
    setLoading(true)
    try {
      const r = await fetch(`${API}/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ intention, cloud })
      })
      const d = await r.json()
      if (d.error) { alert(d.error); setLoading(false); return }

      setCurrentFreq(d.session.currentFreq)
      setSequence(d.session.sequence)
      setStreamUrl(d.session.streamUrl)
      setPlaying(true)
      if (cloud) setCloudOn(true)

      // Start audio on device
      if (!cloud || (cloud && isCloud)) {
        startDeviceAudio(d.session.currentFreq)
      }

      // Ping every 30s
      pingInterval.current = setInterval(() => pingServer(intention), 30000)
      loadStatus()
    } catch(e) {}
    setLoading(false)
  }

  async function stopStream() {
    try {
      await fetch(`${API}/stream/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch(e) {}
    stopDeviceAudio()
    setPlaying(false)
    setCloudOn(false)
    if (pingInterval.current) { clearInterval(pingInterval.current); pingInterval.current = null }
    loadStatus()
  }

  async function pingServer(intent) {
    try {
      const r = await fetch(`${API}/stream/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ intention: intent })
      })
      const d = await r.json()
      if (d.freq && d.freq !== currentFreq) {
        setCurrentFreq(d.freq)
        setCurrentIdx(d.idx)
        if (playing) changeDeviceFreq(d.freq)
      }
    } catch(e) {}
  }

  async function changeIntention(newIntent) {
    setIntention(newIntent)
    const newSeq = INTENTIONS.find(i => i.id === newIntent)?.seq || [528,639,741,852]
    setSequence(newSeq)

    if (playing) {
      try {
        const r = await fetch(`${API}/intention`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ intention: newIntent })
        })
        const d = await r.json()
        if (d.currentFreq) {
          setCurrentFreq(d.currentFreq)
          changeDeviceFreq(d.currentFreq)
        }
      } catch(e) {}
    }
  }

  // ─── AUDIO ───────────────────────────────────────────────────────────────

  const audioCtx = useRef(null)
  const oscNode = useRef(null)
  const gainNode = useRef(null)

  function startDeviceAudio(freq) {
    try {
      if (audioCtx.current) audioCtx.current.close()
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5)
      osc.start()
      audioCtx.current = ctx; oscNode.current = osc; gainNode.current = gain
    } catch(e) {}
  }

  function stopDeviceAudio() {
    if (gainNode.current && audioCtx.current) {
      try { gainNode.current.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + 0.8) } catch(e) {}
      setTimeout(() => { try { audioCtx.current?.close(); audioCtx.current = null } catch(e) {} }, 900)
    }
  }

  function changeDeviceFreq(freq) {
    if (oscNode.current && audioCtx.current) {
      try { oscNode.current.frequency.linearRampToValueAtTime(freq, audioCtx.current.currentTime + 2) } catch(e) {}
    }
  }

  const freqColor = SOLFEGGIO[currentFreq]?.color || 'rgba(196,181,253,.7)'

  return (
    <>
      <style>{SS}</style>
      <div className="sp-wrap">

        {/* LIVE INDICATOR */}
        <div className="live-bar">
          <div className="live-left">
            <div className={`live-dot ${playing ? 'active' : 'inactive'}`} />
            <span className="live-text">
              {playing ? (cloudOn ? 'Streaming em nuvem + aparelho' : 'Emitindo no aparelho') : 'Stream pausado'}
            </span>
          </div>
          {playing && (
            <div className="live-freq" style={{ color: freqColor }}>
              {currentFreq} Hz
            </div>
          )}
        </div>

        {/* PLAYER */}
        <div className="sp-player">
          <div className="sp-om">ॐ</div>
          <div className="sp-label">Seu mantra pessoal</div>
          <div className="sp-mantra">{mantraData?.mantra}</div>
          <div className="sp-meaning">{mantraData?.meaning}</div>

          <div className="sp-freq-display">
            <div className="sp-freq-hz" style={{ color: freqColor }}>{currentFreq} Hz</div>
            <div className="sp-freq-name" style={{ color: freqColor }}>{freqInfo.name}</div>
            <div className="sp-freq-desc">{freqInfo.desc}</div>
          </div>

          {/* Track */}
          <div className="sp-track">
            {sequence.map((hz, i) => (
              <div key={i} className={`sp-track-item${i === currentIdx ? ' active' : ''}`}
                style={{ background: i === currentIdx ? SOLFEGGIO[hz]?.color || 'var(--lav)' : undefined }} />
            ))}
          </div>

          {/* Wave */}
          <div className="sp-wave">
            {WAVE_H.map((h, i) => (
              <div key={i} className={`sp-bar${playing ? ' on' : ''}`}
                style={{
                  height: playing ? `${h}px` : '5px',
                  background: playing ? freqColor : undefined,
                  transitionDelay: `${i * 20}ms`
                }} />
            ))}
          </div>

          {/* Status */}
          <div className="sp-status">
            <span className={`sp-dot device${playing ? ' on' : ''}`} />
            <span>{playing ? 'Aparelho ativo' : 'Aparelho pausado'}</span>
            {isCloud && <>
              <span className={`sp-dot cloud${cloudOn ? ' on' : ''}`} />
              <span style={{ color: cloudOn ? 'rgba(232,197,71,.6)' : undefined }}>
                {cloudOn ? 'Nuvem ativa' : 'Nuvem pausada'}
              </span>
            </>}
          </div>

          {/* Buttons */}
          <div className="sp-btn-row">
            <button
              className={`sp-btn sp-btn-primary${playing ? ' on' : ''}`}
              onClick={() => playing ? stopStream() : startStream(false)}
              disabled={loading}>
              {loading ? '...' : playing ? 'Pausar' : `Ativar — ${currentFreq} Hz`}
            </button>

            {isCloud ? (
              <button
                className={`sp-btn sp-btn-cloud${cloudOn ? ' on' : ''}`}
                onClick={() => playing ? stopStream() : startStream(true)}>
                {cloudOn ? '☁ Nuvem on' : '☁ Ativar nuvem'}
              </button>
            ) : (
              <button className="sp-btn sp-btn-cloud sp-btn-disabled" disabled title="Requer plano Nuvem">
                ☁ 24/7
              </button>
            )}
          </div>
        </div>

        {/* INTENTION SELECTOR */}
        <div className="sp-card">
          <span className="sp-card-label">Intenção — troque a qualquer momento</span>
          <div className="sp-intent-grid">
            {INTENTIONS.map(i => (
              <div key={i.id}
                className={`sp-intent-btn${intention === i.id ? ' active' : ''}`}
                onClick={() => changeIntention(i.id)}>
                <span className="sp-intent-icon">{i.icon}</span>
                <div className="sp-intent-lbl">{i.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SEQUENCE */}
        <div className="sp-seq-card">
          <div className="sp-seq-title">Sua sequência das 7 Solfeggio</div>
          <div className="sp-seq-list">
            {sequence.map((hz, i) => {
              const info = SOLFEGGIO[hz]
              const isNow = i === currentIdx && playing
              return (
                <div key={i} className={`sp-seq-item${isNow ? ' now' : ''}`}>
                  <div className="sp-seq-hz" style={{ color: info?.color }}>{hz}</div>
                  <div className="sp-seq-info">
                    <div className="sp-seq-name">{info?.name}</div>
                    <div className="sp-seq-dur">{info?.desc}</div>
                  </div>
                  {isNow && (
                    <div className="sp-seq-now">
                      <div className="sp-seq-now-dot" />
                      agora
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* MONITORING */}
        <div className="sp-monitor">
          <div className="sp-monitor-hd">
            <span className="sp-monitor-title">Monitoramento de emissão</span>
            {playing && <div className="sp-monitor-live"><div className="sp-monitor-live-dot" />ao vivo</div>}
          </div>
          <div className="sp-stats-grid">
            <div className="sp-stat">
              <div className="sp-stat-val">{stats?.todayHours || 0}h{stats?.todayMinutes || 0}m</div>
              <div className="sp-stat-label">Hoje</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat-val">{stats?.monthHours || 0}h</div>
              <div className="sp-stat-label">Este mês</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat-val">{currentFreq}</div>
              <div className="sp-stat-label">Hz agora</div>
            </div>
          </div>
          <a className="sp-verify-link" href={`http://187.77.60.16:4101/verify/${profile?.id}`} target="_blank">
            ◈ Verificar frequência publicamente — auditável por qualquer pessoa
          </a>
        </div>

        {/* CLOUD GATE */}
        {!isCloud && (
          <div className="sp-gate">
            <div className="sp-gate-icon">☁</div>
            <div className="sp-gate-title">Stream 24/7 em Nuvem</div>
            <div className="sp-gate-desc">O servidor toca sua sequência continuamente — mesmo com o celular desligado. Verificável a qualquer hora. Plano Nuvem — R$39,90/mês.</div>
            <span className="sp-gate-btn">Assinar plano Nuvem</span>
          </div>
        )}
      </div>
    </>
  )
}
