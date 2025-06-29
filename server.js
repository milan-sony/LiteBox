// ✨ server.js (Updated)
import express from 'express'
import multer from 'multer'
import fs from 'fs-extra'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import ngrok from '@ngrok/ngrok'
import { fileURLToPath } from 'url'
import ip from 'ip'
import { spawn } from 'child_process'
import chalk from 'chalk'
import rateLimit from 'express-rate-limit'
import checkDiskSpace from 'check-disk-space'
import TelegramBot from 'node-telegram-bot-api'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000
const STORAGE_DIR = path.join(__dirname, 'storage')
const PUBLIC_DIR = path.join(__dirname, 'public')

// Setup Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)
const notify = (msg) => {
    if (process.env.TELEGRAM_CHAT_ID) {
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg).catch(console.error)
    }
}

// Ensure base folders
fs.ensureDirSync(STORAGE_DIR)
fs.ensureDirSync(PUBLIC_DIR)

const app = express()

app.set('trust proxy', 'loopback')

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(cors())
app.use(express.static(PUBLIC_DIR))
app.use(express.json())

const safePath = (subPath = '') => path.normalize(subPath).replace(/^(\.\.(\/|\\|$))+/, '')

app.get('/download', (req, res) => {
    const filePath = path.join(STORAGE_DIR, safePath(req.query.path || ''))

    if (fs.existsSync(filePath)) {
        const ipAddr = req.ip
        const relativePath = safePath(req.query.path)
        const fileName = path.basename(relativePath)

        res.download(filePath, () => {
            console.log(`\n⬇️ File downloaded: ${fileName} from IP: ${ipAddr}`)
            notify(`⬇️ File downloaded: ${fileName} from IP: ${ipAddr}`)
        })
    } else {
        res.status(404).send('File not found')
    }
})

app.use((req, res, next) => {
    const auth = req.headers['authorization']
    const expected = `Bearer ${process.env.LITEBOX_SECRET}`
    if (auth !== expected) {
        console.log(`\n⚠️ Unauthorized access attempt from IP: ${req.ip}`)
        notify(`⚠️ Unauthorized access attempt from IP: ${req.ip}`)
        return res.status(401).json({ message: 'Unauthorized' })
    }
    console.log(`\n✅ Authorized request from IP: ${req.ip} - ${req.method} ${req.url}`)
    notify(`✅ Authorized request from IP: ${req.ip} - ${req.method} ${req.url}`)
    next()
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const safeFolder = safePath(req.query.folder || '')
        const uploadPath = path.join(STORAGE_DIR, safeFolder)
        fs.ensureDirSync(uploadPath)
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage })

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(`\n📁 File uploaded: ${req.file.originalname} in ${req.query.folder || '/'} by IP: ${req.ip}`)
    notify(`📁 File uploaded: ${req.file.originalname} in ${req.query.folder || '/'} by IP: ${req.ip}`)
    res.json({ message: 'File uploaded', file: req.file })
})

app.post('/create-folder', (req, res) => {
    const fullPath = path.join(STORAGE_DIR, safePath(req.body.folderPath))
    if (!fs.existsSync(fullPath)) {
        fs.ensureDirSync(fullPath)
        console.log(`\n📂 Folder created: ${req.body.folderPath}`)
        notify(`📂 Folder created: ${req.body.folderPath}`)
        res.json({ message: 'Folder created' })
    } else {
        res.status(400).json({ message: 'Folder already exists' })
    }
})

const getFolderSize = (dirPath) => {
    return fs.readdirSync(dirPath).reduce((total, item) => {
        const fullPath = path.join(dirPath, item)
        const stats = fs.statSync(fullPath)
        return total + (stats.isDirectory() ? getFolderSize(fullPath) : stats.size)
    }, 0)
}

const readRecursive = (dir) => {
    return fs.readdirSync(dir).map((name) => {
        const fullPath = path.join(dir, name)
        const stat = fs.statSync(fullPath)
        return stat.isDirectory()
            ? { name, type: 'folder', size: getFolderSize(fullPath), children: readRecursive(fullPath) }
            : { name, type: 'file', size: stat.size, path: path.relative(STORAGE_DIR, fullPath) }
    })
}

app.get('/files', (req, res) => res.json(readRecursive(STORAGE_DIR)))

app.delete('/delete', (req, res) => {
    const fullPath = path.join(STORAGE_DIR, safePath(req.query.path || ''))
    if (fs.existsSync(fullPath)) {
        fs.removeSync(fullPath)
        console.log(`\n🗑️ Deleted: ${req.query.path}`)
        notify(`🗑️ Deleted: ${req.query.path}`)
        res.send('Deleted')
    } else {
        res.status(404).send('Not found')
    }
})

app.get('/storage-info', async (req, res) => {
    try {
        const { free, size } = await checkDiskSpace(process.platform === 'win32' ? 'C:\\' : '/')
        res.json({ free, total: size, used: size - free })
    } catch (err) {
        res.status(500).json({ message: 'Failed to get disk usage info' })
    }
})

const startServer = async () => {
    const localIP = ip.address()

    app.listen(PORT, '0.0.0.0', async () => {
        console.log(chalk.green(`\n🚀 NAS Server running`))
        console.log(`\n📍 Localhost:        http://localhost:${PORT}`)
        console.log(`\n📡 Local Network:    http://${localIP}:${PORT}`)

        try {
            const tunnel = await ngrok.connect({ addr: PORT, authtoken: process.env.NGROK_AUTH_TOKEN })
            const ngrokUrl = tunnel.url()
            console.log(chalk.blue(`\n🌍 Ngrok URL: ${ngrokUrl}`))
            notify(`🌍 Ngrok URL: ${ngrokUrl}`)
        } catch (err) {
            console.log(chalk.red('\nNgrok failed:', err.message))
            notify(`❌ Ngrok failed to start: ${err.message}`)
        }
    })
}

const AUTO_RESTART_HOURS = 8
setTimeout(() => {
    console.log(chalk.green(`🔁 Restarting NAS Server in ${AUTO_RESTART_HOURS} hours`))
    notify(`🔁 Restarting NAS Server in ${AUTO_RESTART_HOURS} hours`)
    spawn('node', [__filename], { cwd: __dirname, stdio: 'inherit', shell: true })
    process.exit(0)
}, AUTO_RESTART_HOURS * 60 * 60 * 1000)

startServer()
