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

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000
const STORAGE_DIR = path.join(__dirname, 'storage')
const PUBLIC_DIR = path.join(__dirname, 'public')

// Ensure base folders exist
fs.ensureDirSync(STORAGE_DIR)
fs.ensureDirSync(PUBLIC_DIR)

const app = express()

// Restrict proxy trust
app.set('trust proxy', 'loopback')

// Rate Limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP"
}))

app.use(cors())
app.use(express.static(PUBLIC_DIR))
app.use(express.json())

// Sanitize incoming paths
const safePath = (subPath = '') => {
    return path.normalize(subPath).replace(/^(\.\.(\/|\\|$))+/, '')
}

// Public Download Route
app.get('/download', (req, res) => {
    const filePath = path.join(STORAGE_DIR, safePath(req.query.path || ''))
    if (fs.existsSync(filePath)) {
        res.download(filePath)
    } else {
        res.status(404).send('File not found')
    }
})

// Auth Middleware 
app.use((req, res, next) => {
    const auth = req.headers['authorization']
    const expected = `Bearer ${process.env.LITEBOX_SECRET}`

    if (auth !== expected) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    next()
})

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderFromQuery = req.query.folder || ''
        const safeFolder = safePath(folderFromQuery)
        const uploadPath = path.join(STORAGE_DIR, safeFolder)
        fs.ensureDirSync(uploadPath)
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage })

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded', file: req.file })
})

app.post('/create-folder', (req, res) => {
    const folderPath = safePath(req.body.folderPath)
    const fullPath = path.join(STORAGE_DIR, folderPath)

    if (!fs.existsSync(fullPath)) {
        fs.ensureDirSync(fullPath)
        res.json({ message: 'Folder created' })
    } else {
        res.status(400).json({ message: 'Folder already exists' })
    }
})

// Helper to calculate file/folder size
const getFolderSize = (dirPath) => {
    let totalSize = 0
    const items = fs.readdirSync(dirPath)

    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
            totalSize += getFolderSize(fullPath)
        } else {
            totalSize += stats.size
        }
    }

    return totalSize
}

// Recursive listing with size
const readRecursive = (dir) => {
    return fs.readdirSync(dir).map((name) => {
        const fullPath = path.join(dir, name)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            return {
                name,
                type: 'folder',
                size: getFolderSize(fullPath),
                children: readRecursive(fullPath)
            }
        } else {
            return {
                name,
                type: 'file',
                size: stat.size,
                path: path.relative(STORAGE_DIR, fullPath)
            }
        }
    })
}

app.get('/files', (req, res) => {
    res.json(readRecursive(STORAGE_DIR))
})

app.delete('/delete', (req, res) => {
    const fullPath = path.join(STORAGE_DIR, safePath(req.query.path || ''))
    if (fs.existsSync(fullPath)) {
        fs.removeSync(fullPath)
        res.send('Deleted')
    } else {
        res.status(404).send('Not found')
    }
})

app.get('/storage-info', async (req, res) => {
    try {
        const pathToCheck = process.platform === 'win32' ? 'C:\\' : '/'
        const { free, size } = await checkDiskSpace(pathToCheck)

        res.json({
            free,
            total: size,
            used: size - free
        })
    } catch (err) {
        console.error('Disk space check failed:', err)
        res.status(500).json({ message: 'Failed to get disk usage info' })
    }
})

// Start server + Ngrok tunnel
const startServer = async () => {
    const localIP = ip.address()

    app.listen(PORT, '0.0.0.0', async () => {
        console.log(chalk.green('\n🚀 NAS Server is running!'))
        console.log(`📍 Localhost:        http://localhost:${PORT}`)
        console.log(`📡 Local Network:    http://${localIP}:${PORT}`)

        try {
            const tunnel = await ngrok.connect({ addr: PORT, authtoken: process.env.NGROK_AUTH_TOKEN })
            const ngrokUrl = tunnel.url()
            console.log(chalk.cyan(`🌍 Public Ngrok URL: ${ngrokUrl}`))
        } catch (err) {
            console.log(chalk.red('❌ Ngrok failed to start:'), err.message)
        }
    })
}

// Auto-restart every 8 hours
const AUTO_RESTART_HOURS = 8
setTimeout(() => {
    console.log(chalk.blue('\n🔁 Auto-restarting LiteBox...'))
    spawn('node', [__filename], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    })
    process.exit(0)
}, AUTO_RESTART_HOURS * 60 * 60 * 1000)

startServer()
