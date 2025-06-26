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

// Load environment variables
dotenv.config()

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000
const STORAGE_DIR = path.join(__dirname, 'storage')

fs.ensureDirSync(STORAGE_DIR)

const app = express()
app.use(cors())
app.use(express.static(STORAGE_DIR))
app.use(express.json())

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, STORAGE_DIR),
    filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage })

// Upload file
app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded', file: req.file })
})

// List all files
app.get('/files', (req, res) => {
    const files = fs.readdirSync(STORAGE_DIR)
    res.json({ files })
})

// Download a file
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(STORAGE_DIR, req.params.filename)
    fs.existsSync(filePath)
        ? res.download(filePath)
        : res.status(404).send('File not found')
})

// Delete a file
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(STORAGE_DIR, req.params.filename)
    fs.existsSync(filePath)
        ? (fs.unlinkSync(filePath), res.send('File deleted'))
        : res.status(404).send('File not found')
})

// Start server + Ngrok
const startServer = async () => {
    const localIP = ip.address()

    app.listen(PORT, '0.0.0.0', async () => {
        console.log(chalk.green(`\n🚀 NAS Server is running!`));
        // console.log(`\n🚀 NAS Server is running!`)
        console.log(`\n📍 Localhost:  http://localhost:${PORT}`)
        console.log(`\n📡 Local Network:  http://${localIP}:${PORT}`)

        try {
            const tunnel = await ngrok.connect({ addr: PORT, authtoken: process.env.NGROK_AUTH_TOKEN })
            const ngrokUrl = tunnel.url()
            console.log(`\n🌍 Public Access Ngrok URL: ${ngrokUrl}`)
        } catch (err) {
            console.log(chalk.red('\n❌ Ngrok failed to start:', err.message))
        }
    })
}

// Auto-restart after 8 hours
const AUTO_RESTART_HOURS = 8
const restartAfter = AUTO_RESTART_HOURS * 60 * 60 * 1000

setTimeout(() => {
    console.log(chalk.blue('\n🔁 Auto-restarting LiteBox now...'))
    spawn('node', [__filename], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    })
    process.exit(0)
}, restartAfter)

startServer()
