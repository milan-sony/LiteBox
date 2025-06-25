import express from 'express'
import multer from 'multer'
import fs from 'fs-extra'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import ip from "ip"
import ngrok from "@ngrok/ngrok"

// Config .env
dotenv.config()

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express App and Setup Storage Directory
const app = express()
const STORAGE_DIR = path.join(__dirname, 'storage')

fs.ensureDirSync(STORAGE_DIR) // Creates the 'storage' folder if it doesn't exist
app.use(cors())
app.use(express.static(STORAGE_DIR)) // Serve static files directly
app.use(express.json())

// Configure Multer for File Uploads
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
    if (fs.existsSync(filePath)) {
        res.download(filePath)
    } else {
        res.status(404).send('File not found')
    }
})

// Delete a file
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(STORAGE_DIR, req.params.filename)
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        res.send('File deleted')
    } else {
        res.status(404).send('File not found')
    }
})

// connection port
const PORT = process.env.PORT || 5000

// gets local IP
const localIP = ip.address();

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`\n✅ NAS Server is running!`)
    console.log(`\n📍 Localhost:  http://localhost:${PORT}`)
    console.log(`\n📡 Local Network:  http://${localIP}:${PORT}`)

    // Start ngrok and log the public URL
    const tunnel = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN,
    })
    console.log(`\n🌐 Public Access via Ngrok:  ${tunnel.url()}`)
})