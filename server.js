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

// Telegram bot setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })
const notify = (msg) => {
    if (process.env.TELEGRAM_CHAT_ID) {
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg).catch(console.error)
    }
}

// Ensure directories
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
        res.download(filePath)
        console.log(`⬇️ File downloaded: ${req.query.path}`)
        notify(`⬇️ File downloaded: ${req.query.path} by IP: ${req.ip}`)
    } else {
        res.status(404).send('File not found')
    }
})

// Auth middleware
const authMiddleware = (req, res, next) => {
    const auth = req.headers['authorization']
    const expected = `Bearer ${process.env.LITEBOX_SECRET}`
    if (auth !== expected) {
        console.log(`⚠️ Unauthorized access from ${req.ip}`)
        notify(`⚠️ Unauthorized access attempt from IP: ${req.ip}`)
        return res.status(401).json({ message: 'Unauthorized' })
    }
    console.log(`✅ Authorized: ${req.method} ${req.url} from IP: ${req.ip}`)
    notify(`✅ Authorized: ${req.method} ${req.url} from IP: ${req.ip}`)
    next()
}

// Apply auth middleware ONLY to sensitive routes
app.use(['/upload', '/files', '/delete', '/create-folder', '/storage-info', '/download'], authMiddleware)

// File upload setup
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
    console.log(`📁 File uploaded: ${req.file.originalname} in ${req.query.folder || '/'} by ${req.ip}`)
    notify(`📁 File uploaded: ${req.file.originalname} in ${req.query.folder || '/'} by IP: ${req.ip}`)
    res.json({ message: 'File uploaded', file: req.file })
})

app.post('/create-folder', (req, res) => {
    const fullPath = path.join(STORAGE_DIR, safePath(req.body.folderPath))
    if (!fs.existsSync(fullPath)) {
        fs.ensureDirSync(fullPath)
        console.log(`📂 Folder created: ${req.body.folderPath}`)
        notify(`📂 Folder created: ${req.body.folderPath}`)
        res.json({ message: 'Folder created' })
    } else {
        res.status(400).json({ message: 'Folder already exists' })
    }
})

const getFolderSize = (dirPath) =>
    fs.readdirSync(dirPath).reduce((total, item) => {
        const fullPath = path.join(dirPath, item)
        const stats = fs.statSync(fullPath)
        return total + (stats.isDirectory() ? getFolderSize(fullPath) : stats.size)
    }, 0)

const readRecursive = (dir) =>
    fs.readdirSync(dir).map((name) => {
        const fullPath = path.join(dir, name)
        const stat = fs.statSync(fullPath)
        return stat.isDirectory()
            ? { name, type: 'folder', size: getFolderSize(fullPath), children: readRecursive(fullPath) }
            : { name, type: 'file', size: stat.size, path: path.relative(STORAGE_DIR, fullPath) }
    })

app.get('/files', (req, res) => res.json(readRecursive(STORAGE_DIR)))

app.delete('/delete', (req, res) => {
    const fullPath = path.join(STORAGE_DIR, safePath(req.query.path || ''))
    if (fs.existsSync(fullPath)) {
        fs.removeSync(fullPath)
        console.log(`🗑️ Deleted: ${req.query.path}`)
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

app.get('/home', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'))
})

// Recursively get list of files/folders with their relative paths
const getRecursiveList = (dir, base = '') => {
    const entries = fs.readdirSync(dir)
    let result = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry)
        const relativePath = path.join(base, entry)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
            result.push(`📁 /${relativePath}/`)
            result = result.concat(getRecursiveList(fullPath, relativePath))
        } else {
            result.push(`📄 /${relativePath}`)
        }
    }

    return result
}

// Telegram bot commands
bot.onText(/\/help/, (msg) => {
    const help = `
📖 *LiteBox Bot Commands*:
/help - Show this help message
/list - List all files in root
/download <file_path> - Get a download link
/delete <file_path> - Delete a file or folder
/status - Show storage usage
/ip - Show server's IP
/reboot - Restart the server
    `
    bot.sendMessage(msg.chat.id, help, { parse_mode: 'Markdown' })
})

bot.onText(/\/ip/, (msg) => {
    bot.sendMessage(msg.chat.id, `📡 Local IP: ${ip.address()}`)
})

bot.onText(/\/status/, async (msg) => {
    const { free, size } = await checkDiskSpace(process.platform === 'win32' ? 'C:\\' : '/')
    const toGB = (b) => (b / (1024 ** 3)).toFixed(2) + ' GB'
    bot.sendMessage(msg.chat.id, `💾 Disk Usage:\nFree: ${toGB(free)}\nTotal: ${toGB(size)}\nUsed: ${toGB(size - free)}`)
})

// Telegram command: /list
bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id

    try {
        const fileList = getRecursiveList(STORAGE_DIR)
        if (fileList.length === 0) {
            bot.sendMessage(chatId, '📂 Storage is empty.')
        } else {
            const chunks = []
            let current = ''

            for (const line of fileList) {
                if ((current + line + '\n').length > 4000) {
                    chunks.push(current)
                    current = ''
                }
                current += line + '\n'
            }
            if (current) chunks.push(current)

            for (const chunk of chunks) {
                await bot.sendMessage(chatId, `📋 List of files:\n\n${chunk}`, { parse_mode: 'Markdown' })
            }
        }
    } catch (err) {
        console.error('Error listing files:', err)
        bot.sendMessage(chatId, '❌ Failed to list files.')
    }
})

bot.onText(/\/download (.+)/, (msg, match) => {
    const pathParam = match[1]
    const url = `${process.env.NGROK_PUBLIC_URL || 'http://localhost:' + PORT}/download?path=${encodeURIComponent(pathParam)}`
    bot.sendMessage(msg.chat.id, `⬇️ [Download Link](${url})`, { parse_mode: 'Markdown' })
})

bot.onText(/\/delete (.+)/, (msg, match) => {
    const file = safePath(match[1])
    const fullPath = path.join(STORAGE_DIR, file)
    if (fs.existsSync(fullPath)) {
        fs.removeSync(fullPath)
        bot.sendMessage(msg.chat.id, `🗑️ Deleted: ${file}`)
    } else {
        bot.sendMessage(msg.chat.id, `❌ Not found: ${file}`)
    }
})

bot.onText(/\/ngrokurl/, (msg) => {
    const chatId = msg.chat.id
    const ngrokUrl = process.env.NGROK_PUBLIC_URL

    if (ngrokUrl) {
        bot.sendMessage(chatId, `🌍 Current Ngrok URL:\n${ngrokUrl}`)
    } else {
        bot.sendMessage(chatId, `❌ Ngrok URL is not yet available.`)
    }
})

// Register commands for Telegram UI
await bot.setMyCommands([
    { command: 'help', description: 'Show all available commands' },
    { command: 'list', description: 'List files in root' },
    { command: 'download', description: 'Get a download link to a file' },
    { command: 'delete', description: 'Delete a file or folder' },
    { command: 'status', description: 'Check disk usage' },
    { command: 'ip', description: 'Get local IP address' },
    { command: 'ngrokurl', description: 'Get current Ngrok public URL' },
])

// Start Server + Ngrok
const startServer = async () => {
    const localIP = ip.address()

    app.listen(PORT, '0.0.0.0', async () => {
        console.log(chalk.green(`\n🚀 NAS Server running on http://localhost:${PORT}`))
        console.log(`📡 LAN: http://${localIP}:${PORT}`)

        try {
            const tunnel = await ngrok.connect({ addr: PORT, authtoken: process.env.NGROK_AUTH_TOKEN })
            const ngrokUrl = tunnel.url()
            console.log(chalk.blue(`🌍 Ngrok: ${ngrokUrl}`))
            notify(`🌍 Ngrok tunnel opened: ${ngrokUrl}`)

            // Save ngrok URL for use in bot commands
            process.env.NGROK_PUBLIC_URL = ngrokUrl
        } catch (err) {
            console.error(chalk.red('Ngrok failed:', err.message))
            notify(`❌ Ngrok failed: ${err.message}`)
        }
    })
}

// Auto Restart after 8 hours
const AUTO_RESTART_HOURS = 8
setTimeout(() => {
    console.log(`🔁 Restarting after ${AUTO_RESTART_HOURS} hours`)
    notify(`🔁 Restarting NAS server now`)
    spawn('node', [__filename], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    })
    process.exit(0)
}, AUTO_RESTART_HOURS * 60 * 60 * 1000)

startServer()
