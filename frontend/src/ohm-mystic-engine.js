export const SOLFEGGIO_BASE = { 1:528, 2:417, 3:639, 4:741, 5:852, 6:639, 7:963, 8:174, 9:396 }
export const VEDIC_PLANET = {
  1:{planet:'Sol',quality:'vitalidade e centro'}, 2:{planet:'Lua',quality:'intuição e fluidez'},
  3:{planet:'Júpiter',quality:'expansão e sabedoria'}, 4:{planet:'Rahu',quality:'transformação e ruptura'},
  5:{planet:'Mercúrio',quality:'comunicação e agilidade'}, 6:{planet:'Vênus',quality:'harmonia e beleza'},
  7:{planet:'Ketu',quality:'transcendência e desapego'}, 8:{planet:'Saturno',quality:'estrutura e disciplina'},
  9:{planet:'Marte',quality:'energia e coragem'}
}
export const YAZATAS = [
  {name:'Ahura Mazda',trait:'sabedoria luminosa',timbre:'pure'},{name:'Bahman',trait:'bom propósito',timbre:'harmonics'},
  {name:'Ardibehesht',trait:'verdade e ordem',timbre:'pure'},{name:'Shahrivar',trait:'soberania',timbre:'harmonics'},
  {name:'Sepandarmaz',trait:'devoção e terra',timbre:'pink'},{name:'Khordad',trait:'plenitude',timbre:'pink'},
  {name:'Amordad',trait:'imortalidade',timbre:'harmonics'},{name:'Dey',trait:'o criador',timbre:'pure'},
  {name:'Azar',trait:'fogo sagrado',timbre:'harmonics'},{name:'Aban',trait:'águas',timbre:'pink'},
  {name:'Khorshid',trait:'sol radiante',timbre:'harmonics'},{name:'Mah',trait:'lua',timbre:'pink'},
  {name:'Tir',trait:'a estrela',timbre:'pure'},{name:'Goshorun',trait:'alma do mundo',timbre:'pink'}
]
export const HERMETIC_PLANETS = ['Saturno','Júpiter','Marte','Sol','Vênus','Mercúrio','Lua']
export const BIJA_MANTRAS = {
  elevacao:{bija:'OM',desc:'o som primordial, totalidade'}, saude:{bija:'RAM',desc:'fogo vital, equilíbrio interno'},
  prosperidade:{bija:'SHRIM',desc:'abundância, Lakshmi'}, vibracoes:{bija:'HRIM',desc:'coração, clareza'},
  equilibrio:{bija:'AUM',desc:'as três sílabas, unidade'}, forca:{bija:'KLIM',desc:'magnetismo, atração vital'}
}
export const SCHUMANN_HZ = 7.83
export function theosophicReduce(n){ while(n>9) n=String(n).split('').reduce((a,d)=>a+Number(d),0); return n||9 }
export function gematria(name){ const c=(name||'').toLowerCase().replace(/[^a-z]/g,''); let s=0; for(const ch of c) s+=ch.charCodeAt(0)-96; return s }
export function computeSignature({birthdate,birthtime,name,intention='elevacao'}){
  const dd=(birthdate||'').replace(/[^0-9]/g,'').split('').reduce((a,d)=>a+Number(d),0)
  const root=theosophicReduce(dd), rootFreq=SOLFEGGIO_BASE[root], vedic=VEDIC_PLANET[root]
  const gem=gematria(name), gemReduced=theosophicReduce(gem)
  const ratios=[1.5,1.25,1.333,1.667,2.0,1.2,1.875,1.125,1.8]
  const h1Ratio=ratios[(gemReduced-1)%9], harmonic1=Math.round(rootFreq*h1Ratio)
  const hour=birthtime?parseInt(birthtime.split(':')[0],10):12
  const planetIdx=hour%7, hermeticPlanet=HERMETIC_PLANETS[planetIdx]
  const h2Ratio=1+(planetIdx+1)/12, harmonic2=Math.round(rootFreq*h2Ratio)
  const day=birthdate?new Date(birthdate+'T00:00').getDate():1
  const yazata=YAZATAS[day%YAZATAS.length], bija=BIJA_MANTRAS[intention]||BIJA_MANTRAS.elevacao
  return { root,rootFreq,planet:vedic.planet,quality:vedic.quality,gem,gemReduced,harmonic1,h1Ratio,
    hermeticPlanet,harmonic2,h2Ratio,hour,yazata:yazata.name,yazataTrait:yazata.trait,timbre:yazata.timbre,
    day,bija:bija.bija,bijaDesc:bija.desc,intention,schumann:SCHUMANN_HZ,
    voices:[{hz:rootFreq,amp:0.50,role:'fundamental'},{hz:harmonic1,amp:0.22,role:'cabalística'},
      {hz:harmonic2,amp:0.16,role:'hermética'},{hz:rootFreq*2,amp:0.07,role:'oitava'}] }
}
export class OhmMysticAudio {
  constructor(){ this.ctx=null;this.master=null;this.analyser=null;this.lfo=null;this.lfoGain=null;
    this.voices=[];this.noiseSrc=null;this.playing=false;this.volume=0.28;this.schumannDepth=0.12;this.binaural=false;this.onState=null }
  _noiseBuffer(type){ const n=this.ctx.sampleRate*3,buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=buf.getChannelData(0)
    if(type==='pink'){let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<n;i++){const w=Math.random()*2-1
      b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522;b5=-0.7616*b5-w*0.0168980;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926}}
    else{let last=0;for(let i=0;i<n;i++){last=(last+(Math.random()*2-1)*0.02)/1.02;d[i]=last*3.5}} return buf }
  play(sig){ this.stop(false); const c=new(window.AudioContext||window.webkitAudioContext)()
    if(c.state==='suspended')c.resume(); this.ctx=c; const t=c.currentTime
    this.master=c.createGain(); this.master.gain.setValueAtTime(0.0001,t); this.master.gain.linearRampToValueAtTime(this.volume,t+1.5)
    this.analyser=c.createAnalyser();this.analyser.fftSize=1024;this.master.connect(this.analyser);this.analyser.connect(c.destination)
    this.lfo=c.createOscillator();this.lfo.frequency.value=sig.schumann;this.lfoGain=c.createGain();this.lfoGain.gain.value=this.schumannDepth
    this.lfo.connect(this.lfoGain);this.lfoGain.connect(this.master.gain);this.lfo.start()
    this.voices=sig.voices.map(v=>{const o=c.createOscillator();o.type='sine';o.frequency.value=v.hz
      const g=c.createGain();g.gain.value=v.amp;o.connect(g);g.connect(this.master);o.start();return o})
    if(this.binaural){const m=c.createChannelMerger(2)
      const oL=c.createOscillator();oL.frequency.value=sig.rootFreq;const oR=c.createOscillator();oR.frequency.value=sig.rootFreq+sig.schumann
      const gL=c.createGain();gL.gain.value=0.12;const gR=c.createGain();gR.gain.value=0.12
      oL.connect(gL);gL.connect(m,0,0);oR.connect(gR);gR.connect(m,0,1);m.connect(this.master);oL.start();oR.start();this.voices.push(oL,oR)}
    if(sig.timbre==='pink'){const s=c.createBufferSource();s.buffer=this._noiseBuffer('pink');s.loop=true
      const ng=c.createGain();ng.gain.value=0.05;s.connect(ng);ng.connect(this.master);s.start();this.noiseSrc=s}
    this.playing=true;if(this.onState)this.onState(true) }
  stop(fade=true){ if(!this.ctx)return; const c=this.ctx
    const fin=()=>{try{this.voices.forEach(o=>o.stop())}catch(e){}try{this.lfo&&this.lfo.stop()}catch(e){}
      try{this.noiseSrc&&this.noiseSrc.stop()}catch(e){}try{c.close()}catch(e){}
      this.ctx=null;this.voices=[];this.playing=false;if(this.onState)this.onState(false)}
    if(fade&&this.master){const t=c.currentTime;this.master.gain.cancelScheduledValues(t)
      this.master.gain.setValueAtTime(this.master.gain.value,t);this.master.gain.linearRampToValueAtTime(0.0001,t+1.5);setTimeout(fin,1600)}
    else fin() }
  setVolume(v){this.volume=Math.max(0,Math.min(1,v));if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,0.1)}
  setSchumannDepth(d){this.schumannDepth=Math.max(0,Math.min(0.25,d));if(this.lfoGain&&this.ctx)this.lfoGain.gain.setTargetAtTime(this.schumannDepth,this.ctx.currentTime,0.1)}
  getWaveform(){if(!this.analyser)return new Uint8Array(0);const d=new Uint8Array(this.analyser.frequencyBinCount);this.analyser.getByteTimeDomainData(d);return d}
}
export default OhmMysticAudio
