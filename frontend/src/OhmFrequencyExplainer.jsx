import React, { useState } from 'react'
import { computeSignature } from './ohm-mystic-engine'

const LC = {
  teosofica:{bg:'#EEEDFE',border:'#534AB7',text:'#26215C'},
  cabalistica:{bg:'#FBEAF0',border:'#D4537E',text:'#4B1528'},
  hermetica:{bg:'#FAEEDA',border:'#EF9F27',text:'#412402'},
  zoroastrista:{bg:'#FAECE7',border:'#D85A30',text:'#4A1B0C'},
  schumann:{bg:'#E1F5EE',border:'#1D9E75',text:'#04342C'}
}

function Layer({num,color,title,plain,detail,value}){
  const c=LC[color]
  return (
    <div style={{display:'grid',gridTemplateColumns:'32px 1fr',gap:14,padding:'16px 0',borderBottom:'.5px solid rgba(196,181,253,.1)'}}>
      <div style={{width:32,height:32,borderRadius:'50%',background:c.bg,border:`1px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:500,color:c.text}}>{num}</div>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:15,fontWeight:500,color:'var(--lav,#c4b5fd)'}}>{title}</span>
          <span style={{fontSize:13,fontWeight:500,color:c.border,fontFamily:'monospace'}}>{value}</span>
        </div>
        <p style={{fontSize:14,color:'var(--textd,#9b95c9)',lineHeight:1.6,margin:'6px 0 0'}}>{plain}</p>
        {detail&&<div style={{marginTop:8,padding:'8px 12px',background:'rgba(83,74,183,.12)',borderRadius:8,fontSize:13,color:'var(--lav,#c4b5fd)',fontStyle:'italic',lineHeight:1.5}}>{detail}</div>}
      </div>
    </div>
  )
}

export function FrequencyJourney({profile}){
  const sig=computeSignature({birthdate:profile.birthdate,birthtime:profile.birthtime,name:profile.name,intention:profile.intention||'elevacao'})
  return (
    <div style={{maxWidth:620}}>
      <div style={{background:'var(--surface,rgba(196,181,253,.04))',borderRadius:16,padding:24,textAlign:'center',marginBottom:24,border:'.5px solid var(--border,rgba(196,181,253,.08))'}}>
        <div style={{fontSize:12,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--textg,#6b6488)',marginBottom:8}}>Sua frequência pessoal</div>
        <div style={{fontSize:52,fontWeight:300,fontFamily:"'Cormorant Garamond',serif",color:'var(--lav,#c4b5fd)',lineHeight:1}}>{sig.rootFreq}<span style={{fontSize:20,color:'var(--textg,#6b6488)'}}> Hz</span></div>
        <div style={{fontSize:14,color:'var(--textd,#9b95c9)',marginTop:8}}>acorde de {sig.voices.length} vozes · {sig.planet} · {sig.quality}</div>
        <div style={{marginTop:14,display:'inline-flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
          {sig.voices.map((v,i)=><span key={i} style={{padding:'4px 12px',borderRadius:20,fontSize:13,background:'rgba(83,74,183,.15)',color:'var(--lav,#c4b5fd)',fontFamily:'monospace'}}>{v.hz} Hz</span>)}
        </div>
      </div>
      <h3 style={{fontSize:16,fontWeight:400,color:'var(--lav,#c4b5fd)',marginBottom:4}}>Como chegamos até aqui</h3>
      <p style={{fontSize:14,color:'var(--textd,#9b95c9)',lineHeight:1.6,marginBottom:8}}>Cada camada é calculada a partir dos seus dados de nascimento. Nada é aleatório, tudo é público e verificável. É uma prática simbólica de contemplação — não uma promessa de resultado.</p>
      <Layer num="1" color="teosofica" title="Tradição teosófica — sua nota-raiz" plain={`Os números da sua data de nascimento são somados e reduzidos a um dígito (${sig.root}), que a astrologia védica associa ao planeta ${sig.planet}. Daí nasce sua frequência base.`} detail={`${profile.birthdate} → reduz a ${sig.root} → ${sig.planet} → ${sig.rootFreq} Hz`} value={`${sig.rootFreq} Hz`} />
      <Layer num="2" color="cabalistica" title="Tradição cabalística — a harmônica do nome" plain={`Cada letra do seu nome tem um valor numérico (gematria). A soma (${sig.gem}) define um intervalo que se soma à raiz como segunda voz do acorde.`} detail={`Gematria de "${profile.name}" = ${sig.gem} → ${sig.harmonic1} Hz`} value={`${sig.harmonic1} Hz`} />
      <Layer num="3" color="hermetica" title="Tradição hermética — a hora planetária" plain={`O Hermetismo divide o dia em horas regidas por planetas. A hora do seu nascimento cai sob ${sig.hermeticPlanet}, que afina a terceira voz.`} detail={profile.birthtime?`Nasceu às ${profile.birthtime} → hora de ${sig.hermeticPlanet} → ${sig.harmonic2} Hz`:'Hora não informada — usando meio-dia'} value={`${sig.harmonic2} Hz`} />
      <Layer num="4" color="zoroastrista" title="Tradição zoroastrista — o caráter do som" plain={`O calendário do Avesta atribui um Yazata a cada dia. O seu é ${sig.yazata} — ${sig.yazataTrait} — que define a textura e o timbre.`} detail={`Dia ${sig.day} → Yazata ${sig.yazata} → timbre "${sig.timbre}"`} value="timbre" />
      <Layer num="5" color="schumann" title="Ressonância Schumann — o pulso da Terra" plain={`A Terra tem uma frequência natural de fundo: 7,83 Hz. Grave demais para ser ouvida, ela faz todo o seu som pulsar suavemente nesse ritmo — uma forma real de sintonizar a prática com o planeta.`} detail={`O som inteiro "respira" 7,83 vezes por segundo`} value="7,83 Hz" />
      <div style={{marginTop:20,padding:16,background:'var(--surface,rgba(196,181,253,.04))',borderRadius:12,display:'flex',alignItems:'center',gap:14,border:'.5px solid var(--border,rgba(196,181,253,.08))'}}>
        <div style={{fontSize:32,fontFamily:'serif',color:'var(--lav,#c4b5fd)'}}>ॐ</div>
        <div>
          <div style={{fontSize:14,fontWeight:500,color:'var(--lav,#c4b5fd)'}}>Som de elevação: {sig.bija}</div>
          <div style={{fontSize:13,color:'var(--textd,#9b95c9)',marginTop:2}}>O bija mantra sânscrito da sua intenção — {sig.bijaDesc}.</div>
        </div>
      </div>
      <p style={{fontSize:12,color:'var(--textg,#6b6488)',marginTop:16,lineHeight:1.5,fontStyle:'italic'}}>O ŌHM é uma ferramenta de meditação e mentalização. Não substitui acompanhamento médico, psicológico ou terapêutico, e não trata, cura ou previne doenças.</p>
    </div>
  )
}

const MOMENTS=[
  {icon:'◷',key:'crise',title:'Momentos de crise',text:'Quando algo aperta e a mente acelera, ative sua frequência por 10–20 minutos. Respire no ritmo do pulso da Terra e deixe o som ancorar sua atenção no presente.',intention:'equilibrio'},
  {icon:'△',key:'desafio',title:'Novos desafios',text:'Antes de uma prova, decisão ou conversa difícil, use a frequência de foco. Mentalize o resultado que quer construir enquanto o som sustenta sua concentração.',intention:'forca'},
  {icon:'◇',key:'negocios',title:'Negócios e prosperidade',text:'Comece o dia com o bija SHRIM e sua frequência ao fundo. Não é magia — é criar um ambiente sonoro de intenção clara enquanto você age.',intention:'prosperidade'},
  {icon:'○',key:'gratidao',title:'Gratidão',text:'Ao fim do dia, ative sua frequência e dedique minutos a reconhecer o que foi bom. A prática regular de gratidão é um hábito contemplativo simples.',intention:'vibracoes'}
]

export function UsageTutorial({onPickMoment}){
  const [active,setActive]=useState(null)
  return (
    <div style={{maxWidth:620}}>
      <h3 style={{fontSize:16,fontWeight:400,color:'var(--lav,#c4b5fd)',marginBottom:4}}>Quando usar o ŌHM</h3>
      <p style={{fontSize:14,color:'var(--textd,#9b95c9)',lineHeight:1.6,marginBottom:16}}>A vibração acompanha a mentalização. Escolha o momento e deixe o som sustentar sua intenção.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {MOMENTS.map(m=>(
          <div key={m.key} onClick={()=>{setActive(m.key);onPickMoment&&onPickMoment(m.intention)}} style={{padding:16,borderRadius:12,cursor:'pointer',background:active===m.key?'rgba(83,74,183,.15)':'var(--surface,rgba(196,181,253,.04))',border:active===m.key?'1px solid #534AB7':'.5px solid var(--border,rgba(196,181,253,.08))',transition:'all .15s'}}>
            <div style={{fontSize:22,color:'var(--lav,#c4b5fd)',marginBottom:8}}>{m.icon}</div>
            <div style={{fontSize:15,fontWeight:500,color:'var(--lav,#c4b5fd)',marginBottom:6}}>{m.title}</div>
            <p style={{fontSize:13,color:'var(--textd,#9b95c9)',lineHeight:1.55,margin:0}}>{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FrequencyJourney
