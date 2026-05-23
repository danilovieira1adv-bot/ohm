const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const { PassThrough } = require('stream')

const app = express()
const PORT = process.env.PORT || 4001
const JWT_SECRET = process.env.JWT_SECRET || 'ohm-secret-2024'

app.use(cors())
app.use(express.json())

// ─── DATABASE ────────────────────────────────────────────────────────────────

const db = new Database(path.join('/app/data', 'ohm.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    birthdate TEXT,
    birthtime TEXT,
    intention TEXT DEFAULT 'paz',
    mantra TEXT,
    frequency INTEGER DEFAULT 528,
    plan TEXT DEFAULT 'free',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stream_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    frequency INTEGER,
    intention TEXT,
    duration_seconds INTEGER DEFAULT 0,
    source TEXT DEFAULT 'device',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stream_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    intention TEXT DEFAULT 'paz',
    is_active INTEGER DEFAULT 0,
    cloud_active INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    last_ping TEXT DEFAULT (datetime('now')),
    current_freq INTEGER DEFAULT 528,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PHONEMES = {
  a:'expansão',b:'sustentação',c:'criatividade',d:'determinação',
  e:'expressão',f:'fluidez',g:'crescimento',h:'elevação',i:'intuição',
  j:'sabedoria',k:'estabilidade',l:'leveza',m:'propósito',n:'renovação',
  o:'conexão',p:'proteção',q:'clareza',r:'movimento',s:'pureza',
  t:'transformação',u:'unidade',v:'vitalidade',w:'força',x:'transmutação',
  y:'harmonia',z:'equilíbrio'
}

const VEDIC = {
  1:{planet:'Sol',quality:'liderança',freq:528},
  2:{planet:'Lua',quality:'intuição',freq:432},
  3:{planet:'Júpiter',quality:'sabedoria',freq:528},
  4:{planet:'Rahu',quality:'transformação',freq:396},
  5:{planet:'Mercúrio',quality:'comunicação',freq:528},
  6:{planet:'Vênus',quality:'amor',freq:639},
  7:{planet:'Ketu',quality:'espiritualidade',freq:963},
  8:{planet:'Saturno',quality:'disciplina',freq:396},
  9:{planet:'Marte',quality:'energia',freq:417}
}

// 7 Solfeggio frequencies
const SOLFEGGIO = [396, 417, 528, 639, 741, 852, 963]

// Sequences per intention — 4 of the 7
const SEQUENCES = {
  paz:          [396, 528, 417, 963],
  prosperidade: [528, 639, 741, 852],
  protecao:     [396, 417, 528, 741],
  foco:         [417, 528, 741, 963],
  amor:         [528, 639, 852, 963],
  transformacao:[396, 417, 639, 741],
}

// Duration per frequency in minutes (based on vedic number)
const DURATIONS = { 1:38, 2:25, 3:21, 4:32, 5:18, 6:28, 7:22, 8:35, 9:30 }

const CYCLES = [
  { start:4,  end:6,  name:'Brahma Muhurta', mantra:'Gayatri Mantra', freq:432 },
  { start:6,  end:12, name:'Sarga — Criação', mantra:'Om Gam Namah', freq:528 },
  { start:12, end:18, name:'Sthiti — Manutenção', mantra:'Om Shanti', freq:432 },
  { start:18, end:24, name:'Laya — Integração', mantra:'Om Namah Shivaya', freq:396 },
  { start:0,  end:4,  name:'Repouso', mantra:'Om', freq:174 },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function vedicNum(dateStr) {
  if (!dateStr) return { number:5, planet:'Mercúrio', quality:'comunicação', freq:528 }
  const digits = dateStr.replace(/[^0-9]/g,'').split('').map(Number)
  let s = digits.reduce((a,b) => a+b, 0)
  while (s > 9) s = String(s).split('').map(Number).reduce((a,b) => a+b, 0)
  return { number:s, ...(VEDIC[s] || VEDIC[5]) }
}

function generateMantra(name) {
  const letters = [...new Set(name.toLowerCase().replace(/[^a-z]/g,'').split(''))].slice(0,4)
  const qualities = letters.map(l => PHONEMES[l] || 'luz').join(' · ')
  const syllables = letters.map(l => l.toUpperCase()+'a').join('·')
  return { mantra:`Om ${syllables} Namah`, qualities, meaning:`Honro a vibração de ${qualities} em mim` }
}

function getCurrentCycle() {
  const h = new Date().getHours()
  return CYCLES.find(c => h >= c.start && h < c.end) || CYCLES[4]
}

function getCurrentFreq(userId, intention) {
  try {
    const user = db.prepare('SELECT birthdate FROM users WHERE id = ?').get(userId)
    const vedic = vedicNum(user?.birthdate)
    const durMin = DURATIONS[vedic.number] || 21
    const seq = SEQUENCES[intention] || SEQUENCES.paz
    const now = new Date()
    const minsToday = now.getHours() * 60 + now.getMinutes()
    const idx = Math.floor(minsToday / durMin) % seq.length
    return { freq: seq[idx], sequence: seq, durMin, idx, vedic }
  } catch(e) {
    return { freq: 528, sequence: SEQUENCES.paz, durMin: 21, idx: 0, vedic: VEDIC[5] }
  }
}

function generateSineWave(freq, sampleRate, durationMs, amplitude = 0.3) {
  const samples = Math.floor(sampleRate * durationMs / 1000)
  const buf = Buffer.alloc(samples * 2) // 16-bit PCM
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate
    const sample = Math.sin(2 * Math.PI * freq * t) * amplitude
    const pcm = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
    buf.writeInt16LE(pcm, i * 2)
  }
  return buf
}

function createWavHeader(sampleRate, numChannels, bitsPerSample, dataSize) {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(numChannels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, 28)
  header.writeUInt16LE(numChannels * bitsPerSample / 8, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)
  return header
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token necessário' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch(e) {
    res.status(401).json({ error: 'Token inválido' })
  }
}

// ─── ROUTES — PUBLIC ─────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get()
  const activeSessions = db.prepare('SELECT COUNT(*) as c FROM stream_sessions WHERE cloud_active = 1').get()
  res.json({
    status: 'OHM online',
    port: PORT,
    users: userCount.c,
    active_streams: activeSessions.c,
    time: new Date().toISOString()
  })
})

app.get('/api/cycle', (req, res) => res.json(getCurrentCycle()))

// ─── AUTH ─────────────────────────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, birthdate, birthtime, intention } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios faltando' })

    const hash = await bcrypt.hash(password, 10)
    const mantraData = generateMantra(name)
    const vedicData = vedicNum(birthdate)
    const seq = SEQUENCES[intention] || SEQUENCES.paz

    db.prepare(`
      INSERT INTO users (name, email, password, birthdate, birthtime, intention, mantra, frequency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, hash, birthdate||'', birthtime||'', intention||'paz', mantraData.mantra, vedicData.freq)

    res.json({
      success: true,
      mantra: mantraData,
      vedic: vedicData,
      sequence: seq,
      cycle: getCurrentCycle()
    })
  } catch(e) {
    res.status(400).json({ error: e.message })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, name: user.name, mantra: user.mantra, frequency: user.frequency, plan: user.plan })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── PROFILE ─────────────────────────────────────────────────────────────────

app.get('/api/profile', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, birthdate, birthtime, intention, mantra, frequency, plan
      FROM users WHERE id = ?
    `).get(req.user.id)

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    const mantraData = generateMantra(user.name)
    const vedicData = vedicNum(user.birthdate)
    const freqData = getCurrentFreq(user.id, user.intention)
    const session = db.prepare('SELECT * FROM stream_sessions WHERE user_id = ?').get(user.id)

    res.json({
      ...user,
      mantraDetails: mantraData,
      vedic: vedicData,
      cycle: getCurrentCycle(),
      currentFreq: freqData,
      session: session || null
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── STREAM CONTROL ───────────────────────────────────────────────────────────

// Start/update stream session
app.post('/api/stream/start', authMiddleware, (req, res) => {
  try {
    const { intention, cloud } = req.body
    const userId = req.user.id
    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(userId)

    // Cloud requires cloud plan
    if (cloud && user.plan !== 'cloud' && user.plan !== 'space') {
      return res.status(403).json({ error: 'Plano Nuvem necessário para streaming em nuvem' })
    }

    const freqData = getCurrentFreq(userId, intention || 'paz')

    // Upsert session
    const existing = db.prepare('SELECT id FROM stream_sessions WHERE user_id = ?').get(userId)
    if (existing) {
      db.prepare(`
        UPDATE stream_sessions
        SET intention = ?, is_active = 1, cloud_active = ?, last_ping = datetime('now'), current_freq = ?
        WHERE user_id = ?
      `).run(intention || 'paz', cloud ? 1 : 0, freqData.freq, userId)
    } else {
      db.prepare(`
        INSERT INTO stream_sessions (user_id, intention, is_active, cloud_active, current_freq)
        VALUES (?, ?, 1, ?, ?)
      `).run(userId, intention || 'paz', cloud ? 1 : 0, freqData.freq)
    }

    // Log start
    db.prepare(`
      INSERT INTO stream_logs (user_id, frequency, intention, source)
      VALUES (?, ?, ?, ?)
    `).run(userId, freqData.freq, intention || 'paz', cloud ? 'cloud' : 'device')

    res.json({
      success: true,
      session: {
        intention: intention || 'paz',
        currentFreq: freqData.freq,
        sequence: freqData.sequence,
        durMin: freqData.durMin,
        cloud: !!cloud,
        streamUrl: `/api/stream/live/${userId}`
      }
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// Stop stream
app.post('/api/stream/stop', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id

    // Update session
    db.prepare(`
      UPDATE stream_sessions
      SET is_active = 0, cloud_active = 0
      WHERE user_id = ?
    `).run(userId)

    // Close last log
    db.prepare(`
      UPDATE stream_logs
      SET ended_at = datetime('now'),
          duration_seconds = CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER)
      WHERE user_id = ? AND ended_at IS NULL
    `).run(userId)

    res.json({ success: true })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// Ping — keep session alive
app.post('/api/stream/ping', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id
    const freqData = getCurrentFreq(userId, req.body.intention)

    db.prepare(`
      UPDATE stream_sessions
      SET last_ping = datetime('now'), current_freq = ?
      WHERE user_id = ?
    `).run(freqData.freq, userId)

    res.json({ freq: freqData.freq, sequence: freqData.sequence, idx: freqData.idx })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// Get stream status
app.get('/api/stream/status', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id
    const session = db.prepare('SELECT * FROM stream_sessions WHERE user_id = ?').get(userId)
    const freqData = getCurrentFreq(userId, session?.intention || 'paz')

    // Total hours this month
    const monthStats = db.prepare(`
      SELECT
        COUNT(*) as sessions,
        COALESCE(SUM(duration_seconds), 0) as total_seconds
      FROM stream_logs
      WHERE user_id = ?
      AND started_at >= date('now', 'start of month')
    `).get(userId)

    // Today
    const todayStats = db.prepare(`
      SELECT COALESCE(SUM(duration_seconds), 0) as today_seconds
      FROM stream_logs
      WHERE user_id = ? AND date(started_at) = date('now')
    `).get(userId)

    res.json({
      session,
      currentFreq: freqData.freq,
      sequence: freqData.sequence,
      durMin: freqData.durMin,
      idx: freqData.idx,
      stats: {
        monthSessions: monthStats.sessions,
        monthHours: Math.floor(monthStats.total_seconds / 3600),
        monthMinutes: Math.floor((monthStats.total_seconds % 3600) / 60),
        todaySeconds: todayStats.today_seconds,
        todayHours: Math.floor(todayStats.today_seconds / 3600),
        todayMinutes: Math.floor((todayStats.today_seconds % 3600) / 60),
      }
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// Get stream logs
app.get('/api/stream/logs', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id
    const logs = db.prepare(`
      SELECT id, started_at, ended_at, frequency, intention, duration_seconds, source
      FROM stream_logs
      WHERE user_id = ?
      ORDER BY started_at DESC
      LIMIT 50
    `).all(userId)

    res.json({ logs })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── LIVE AUDIO STREAM ────────────────────────────────────────────────────────

// Public stream endpoint — anyone with the link can listen
app.get('/api/stream/live/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const user = db.prepare('SELECT id, name, plan, intention FROM users WHERE id = ?').get(userId)

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    // Check plan
    const validPlans = ['cloud', 'space', 'personal']
    if (!validPlans.includes(user.plan)) {
      return res.status(403).send('Plano não permite streaming ao vivo')
    }

    const session = db.prepare('SELECT * FROM stream_sessions WHERE user_id = ?').get(userId)
    const intention = session?.intention || user.intention || 'paz'
    const freqData = getCurrentFreq(userId, intention)

    // WAV streaming — pure sine wave
    const SAMPLE_RATE = 44100
    const CHANNELS = 1
    const BITS = 16
    const CHUNK_MS = 500 // 500ms chunks

    res.setHeader('Content-Type', 'audio/wav')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('X-OHM-Freq', freqData.freq)
    res.setHeader('X-OHM-Intention', intention)
    res.setHeader('X-OHM-User', user.name)

    // Send WAV header for streaming (dataSize = 0xFFFFFFFF for unknown length)
    const wavHeader = createWavHeader(SAMPLE_RATE, CHANNELS, BITS, 0xFFFFFFFF)
    res.write(wavHeader)

    let currentFreq = freqData.freq
    let chunkCount = 0
    let alive = true

    const interval = setInterval(() => {
      if (!alive) return

      // Recalculate freq every 60 chunks (~30s)
      if (chunkCount % 60 === 0) {
        const updated = getCurrentFreq(userId, intention)
        if (updated.freq !== currentFreq) {
          currentFreq = updated.freq
          // Update session
          try {
            db.prepare('UPDATE stream_sessions SET current_freq = ? WHERE user_id = ?')
              .run(currentFreq, userId)
          } catch(e) {}
        }
      }

      const chunk = generateSineWave(currentFreq, SAMPLE_RATE, CHUNK_MS, 0.25)

      try {
        const canContinue = res.write(chunk)
        chunkCount++
      } catch(e) {
        alive = false
        clearInterval(interval)
      }
    }, CHUNK_MS)

    req.on('close', () => {
      alive = false
      clearInterval(interval)
    })

  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// Verification page — public
app.get('/verify/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const user = db.prepare('SELECT id, name, birthdate, intention FROM users WHERE id = ?').get(userId)
    if (!user) return res.status(404).send('Usuário não encontrado')

    const mantraData = generateMantra(user.name)
    const vedicData = vedicNum(user.birthdate)
    const freqData = getCurrentFreq(userId, user.intention)
    const session = db.prepare('SELECT * FROM stream_sessions WHERE user_id = ?').get(userId)

    const totalHours = db.prepare(`
      SELECT COALESCE(SUM(duration_seconds), 0) as total
      FROM stream_logs WHERE user_id = ?
    `).get(userId)

    res.json({
      user: { id: user.id, name: user.name },
      mantra: mantraData,
      vedic: vedicData,
      intention: user.intention,
      currentFreq: freqData.freq,
      sequence: freqData.sequence,
      durMin: freqData.durMin,
      streamActive: session?.is_active === 1,
      cloudActive: session?.cloud_active === 1,
      totalHoursEmitted: Math.floor(totalHours.total / 3600),
      streamUrl: `/api/stream/live/${userId}`,
      formula: {
        step1_name_phonemes: mantraData.qualities,
        step2_vedic_number: vedicData.number,
        step3_planet: vedicData.planet,
        step4_duration_minutes: freqData.durMin,
        step5_sequence: freqData.sequence,
        step6_current_idx: freqData.idx,
        step7_current_freq: freqData.freq
      }
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── UPDATE INTENTION ─────────────────────────────────────────────────────────

app.put('/api/intention', authMiddleware, (req, res) => {
  try {
    const { intention } = req.body
    const validIntentions = ['paz', 'prosperidade', 'protecao', 'foco', 'amor', 'transformacao']
    if (!validIntentions.includes(intention)) {
      return res.status(400).json({ error: 'Intenção inválida' })
    }

    db.prepare('UPDATE users SET intention = ? WHERE id = ?').run(intention, req.user.id)

    const freqData = getCurrentFreq(req.user.id, intention)

    db.prepare(`
      UPDATE stream_sessions SET intention = ?, current_freq = ?
      WHERE user_id = ?
    `).run(intention, freqData.freq, req.user.id)

    res.json({ success: true, intention, currentFreq: freqData.freq, sequence: freqData.sequence })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── CLOUD WATCHDOG ───────────────────────────────────────────────────────────
// Updates logs for active cloud sessions every minute

setInterval(() => {
  try {
    const activeSessions = db.prepare(`
      SELECT user_id, intention, current_freq
      FROM stream_sessions
      WHERE cloud_active = 1
    `).all()

    activeSessions.forEach(session => {
      const freqData = getCurrentFreq(session.user_id, session.intention)

      // Update freq if changed
      if (freqData.freq !== session.current_freq) {
        db.prepare('UPDATE stream_sessions SET current_freq = ? WHERE user_id = ?')
          .run(freqData.freq, session.user_id)
      }

      // Update log duration
      db.prepare(`
        UPDATE stream_logs
        SET duration_seconds = duration_seconds + 60
        WHERE user_id = ? AND ended_at IS NULL
        AND source = 'cloud'
      `).run(session.user_id)
    })
  } catch(e) {}
}, 60000)

app.listen(PORT, () => console.log(`OHM Stream Server na porta ${PORT}`))
