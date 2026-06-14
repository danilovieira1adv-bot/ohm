/**
 * ohm-spatial.js — ŌHM v2 (som quente, grave, agradável em qualquer saída)
 */
import { computeSignature } from './ohm-mystic-engine'

export class OhmSpatialAudio {
  constructor() {
    this.ctx=null; this.master=null; this.analyser=null
    this.lfo=null; this.lfoGain=null; this.voices=[]; this.panners=[]
    this.noiseSrc=null; this.convolver=null; this.lp=null
    this.playing=false; this.volume=0.22; this.schumannDepth=0.06
    this.spatial=true; this.orbit=true; this.onState=null; this._orbitRAF=null
  }

  _noiseBuffer(){ const n=this.ctx.sampleRate*3,buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=buf.getChannelData(0)
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for(let i=0;i<n;i++){const w=Math.random()*2-1
      b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522;b5=-0.7616*b5-w*0.0168980;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926}
    return buf }

  _makeReverb(){ const len=this.ctx.sampleRate*3,imp=this.ctx.createBuffer(2,len,this.ctx.sampleRate)
    for(let ch=0;ch<2;ch++){const d=imp.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8)}
    const c=this.ctx.createConvolver();c.buffer=imp;return c }

  // Normaliza a frequência para uma faixa grave e agradável (110–330 Hz)
  _warmify(hz){
    let f=hz
    while(f>330) f/=2      // desce oitavas até região grave-média
    while(f<90)  f*=2      // sobe se ficar grave demais
    return f
  }

  play(sig){
    this.stop(false)
    const c=new(window.AudioContext||window.webkitAudioContext)()
    if(c.state==='suspended')c.resume()
    this.ctx=c; const t=c.currentTime

    // Detecta saída mono/alto-falante: se não for estéreo confiável, desliga espacial
    const useSpatial = this.spatial && (c.destination.maxChannelCount >= 2)

    this.master=c.createGain()
    this.master.gain.setValueAtTime(0.0001,t)
    this.master.gain.linearRampToValueAtTime(this.volume,t+2.5)

    // Filtro low-pass suave tira a aspereza aguda
    this.lp=c.createBiquadFilter(); this.lp.type='lowpass'; this.lp.frequency.value=1400; this.lp.Q.value=0.5

    this.analyser=c.createAnalyser(); this.analyser.fftSize=1024

    this.convolver=this._makeReverb()
    const wet=c.createGain(); wet.gain.value=0.28
    const dry=c.createGain(); dry.gain.value=0.85
    this.lp.connect(dry); this.lp.connect(this.convolver)
    this.convolver.connect(wet); wet.connect(this.master); dry.connect(this.master)
    this.master.connect(this.analyser); this.analyser.connect(c.destination)

    // Schumann bem suave
    this.lfo=c.createOscillator(); this.lfo.frequency.value=sig.schumann
    this.lfoGain=c.createGain(); this.lfoGain.gain.value=this.schumannDepth
    this.lfo.connect(this.lfoGain); this.lfoGain.connect(this.master.gain); this.lfo.start()

    // Vozes — graves, quentes (triangle), com leve desafinação entre si (chorus natural)
    const warm = sig.voices.map(v=>this._warmify(v.hz))
    const amps = [0.55, 0.32, 0.22, 0.40]  // fundamental + harmônicas + uma grave reforçada
    const detunes = [0, -4, 5, 0]          // cents — engrossa sem dissonar
    const angles=[0,Math.PI/2,Math.PI,3*Math.PI/2]
    this.voices=[]; this.panners=[]
    warm.forEach((hz,i)=>{
      const o=c.createOscillator(); o.type = i===3?'sine':'triangle'
      o.frequency.value=hz; o.detune.value=detunes[i]||0
      const g=c.createGain(); g.gain.value=amps[i]||0.2
      o.connect(g)
      if(useSpatial){
        const p=c.createPanner(); p.panningModel='HRTF'; p.distanceModel='inverse'
        p.refDistance=1; p.rolloffFactor=0.4
        p.positionX.value=Math.sin(angles[i])*1.5; p.positionZ.value=Math.cos(angles[i])*1.5
        g.connect(p); p.connect(this.lp); this.panners.push({panner:p,baseAngle:angles[i],dist:1.5})
      } else { g.connect(this.lp) }
      o.start(); this.voices.push(o)
    })

    // Ruído rosa de fundo dá corpo e movimento mesmo em alto-falante
    const s=c.createBufferSource(); s.buffer=this._noiseBuffer(); s.loop=true
    const ng=c.createGain(); ng.gain.value=0.035; s.connect(ng); ng.connect(this.lp); s.start(); this.noiseSrc=s

    if(useSpatial && this.orbit) this._startOrbit()
    this.playing=true; if(this.onState)this.onState(true)
  }

  _startOrbit(){ const start=this.ctx.currentTime
    const tick=()=>{ if(!this.playing||!this.ctx)return
      const e=this.ctx.currentTime-start
      this.panners.forEach((pp,i)=>{ const sp=0.03+i*0.01; const a=pp.baseAngle+e*sp
        pp.panner.positionX.value=Math.sin(a)*pp.dist; pp.panner.positionZ.value=Math.cos(a)*pp.dist })
      this._orbitRAF=requestAnimationFrame(tick) }
    tick() }

  stop(fade=true){ if(this._orbitRAF){cancelAnimationFrame(this._orbitRAF);this._orbitRAF=null}
    if(!this.ctx)return; const c=this.ctx
    const fin=()=>{try{this.voices.forEach(o=>o.stop())}catch(e){}try{this.lfo&&this.lfo.stop()}catch(e){}
      try{this.noiseSrc&&this.noiseSrc.stop()}catch(e){}try{c.close()}catch(e){}
      this.ctx=null;this.voices=[];this.panners=[];this.playing=false;if(this.onState)this.onState(false)}
    if(fade&&this.master){const t=c.currentTime;this.master.gain.cancelScheduledValues(t)
      this.master.gain.setValueAtTime(this.master.gain.value,t);this.master.gain.linearRampToValueAtTime(0.0001,t+2);setTimeout(fin,2100)}
    else fin() }

  setVolume(v){this.volume=Math.max(0,Math.min(1,v));if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,0.1)}
  setSpatial(on){this.spatial=on}; setOrbit(on){this.orbit=on}
  getWaveform(){if(!this.analyser)return new Uint8Array(0);const d=new Uint8Array(this.analyser.frequencyBinCount);this.analyser.getByteTimeDomainData(d);return d}
}
export default OhmSpatialAudio
