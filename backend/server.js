const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = 'ohm-secret-2024';

app.use(cors());
app.use(express.json());

const db = new Database(path.join('/app/data', 'ohm.db'));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  birthdate TEXT,
  intention TEXT,
  mantra TEXT,
  frequency INTEGER DEFAULT 528,
  plan TEXT DEFAULT 'free',
  created_at TEXT DEFAULT (datetime('now'))
);`);

const PHONEMES = {
  a:'expansão',b:'sustentação',c:'criatividade',d:'determinação',
  e:'expressão',f:'fluidez',g:'crescimento',h:'elevação',i:'intuição',
  j:'sabedoria',k:'estabilidade',l:'leveza',m:'propósito',n:'renovação',
  o:'conexão',p:'proteção',q:'clareza',r:'movimento',s:'pureza',
  t:'transformação',u:'unidade',v:'vitalidade',w:'força',x:'transmutação',
  y:'harmonia',z:'equilíbrio'
};

const INTENTIONS = {
  paz:{mantra:'Om Shanti Shanti Shanti',freq:432},
  protecao:{mantra:'Om Maha Mrityunjaya Namah',freq:396},
  prosperidade:{mantra:'Om Shrim Mahalakshmyai Namah',freq:528},
  foco:{mantra:'Om Gam Ganapataye Namah',freq:40},
  amor:{mantra:'Om Klim Namah',freq:528},
  transformacao:{mantra:'Om Namah Shivaya',freq:432}
};

function generateMantra(name) {
  const letters = [...new Set(name.toLowerCase().replace(/[^a-z]/g,'').split(''))].slice(0,4);
  const qualities = letters.map(l=>PHONEMES[l]||'luz').join(' · ');
  const syllables = letters.map(l=>l.toUpperCase()+'a').join('-');
  return {
    mantra:`Om ${syllables} Namah`,
    qualities,
    meaning:`Honro a vibração de ${qualities} em mim`
  };
}

function vedicNumber(birthdate) {
  if(!birthdate) return {number:1,planet:'Sol',quality:'liderança'};
  const digits = birthdate.replace(/[^0-9]/g,'').split('').map(Number);
  let sum = digits.reduce((a,b)=>a+b,0);
  while(sum>9) sum = String(sum).split('').map(Number).reduce((a,b)=>a+b,0);
  const m = {
    1:{planet:'Sol',quality:'liderança'},2:{planet:'Lua',quality:'intuição'},
    3:{planet:'Júpiter',quality:'sabedoria'},4:{planet:'Rahu',quality:'transformação'},
    5:{planet:'Mercúrio',quality:'comunicação'},6:{planet:'Vênus',quality:'amor'},
    7:{planet:'Ketu',quality:'espiritualidade'},8:{planet:'Saturno',quality:'disciplina'},
    9:{planet:'Marte',quality:'energia'}
  };
  return {number:sum,...(m[sum]||m[1])};
}

function vedicCycle() {
  const h = new Date().getHours();
  if(h>=4&&h<6)  return {name:'Brahma Muhurta',mantra:'Gayatri',action:'Clareza profunda'};
  if(h>=6&&h<12) return {name:'Sarga — Criação',mantra:'Om Gam Namah',action:'Iniciar e expandir'};
  if(h>=12&&h<18)return {name:'Sthiti — Manutenção',mantra:'Om Shanti',action:'Sustentar e equilibrar'};
  if(h>=18&&h<24)return {name:'Laya — Integração',mantra:'Om Namah Shivaya',action:'Soltar e renovar'};
  return {name:'Repouso',mantra:'Om',action:'Descanso e restauração'};
}

app.get('/health',(req,res)=>res.json({status:'OHM online',port:PORT}));
app.get('/api/cycle',(req,res)=>res.json(vedicCycle()));

app.post('/api/register',async(req,res)=>{
  try {
    const {name,email,password,birthdate,intention}=req.body;
    if(!name||!email||!password) return res.status(400).json({error:'Campos obrigatórios faltando'});
    const hash=await bcrypt.hash(password,10);
    const mantraData=generateMantra(name);
    const intentionData=INTENTIONS[intention]||INTENTIONS.paz;
    db.prepare('INSERT INTO users (name,email,password,birthdate,intention,mantra,frequency) VALUES (?,?,?,?,?,?,?)')
      .run(name,email,hash,birthdate||'',intention||'paz',mantraData.mantra,intentionData.freq);
    res.json({success:true,mantra:mantraData,vedic:vedicNumber(birthdate),intention:intentionData,cycle:vedicCycle()});
  } catch(e){res.status(400).json({error:e.message});}
});

app.post('/api/login',async(req,res)=>{
  try {
    const {email,password}=req.body;
    const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
    if(!user||!await bcrypt.compare(password,user.password))
      return res.status(401).json({error:'Credenciais inválidas'});
    const token=jwt.sign({id:user.id,email},JWT_SECRET,{expiresIn:'30d'});
    res.json({token,name:user.name,mantra:user.mantra,frequency:user.frequency,plan:user.plan});
  } catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/profile',(req,res)=>{
  const token=req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({error:'Token necessário'});
  try {
    const decoded=jwt.verify(token,JWT_SECRET);
    const user=db.prepare('SELECT id,name,email,birthdate,intention,mantra,frequency,plan FROM users WHERE id=?').get(decoded.id);
    if(!user) return res.status(404).json({error:'Usuário não encontrado'});
    res.json({...user,mantraDetails:generateMantra(user.name),vedic:vedicNumber(user.birthdate),cycle:vedicCycle()});
  } catch(e){res.status(401).json({error:'Token inválido'});}
});

app.listen(PORT,()=>console.log(`OHM Backend na porta ${PORT}`));
