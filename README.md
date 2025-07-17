# 📦 LiteBox

**LiteBox** is a lightweight, personal NAS (Network Attached Storage) solution built using Node.js, Express, Telegram Bot API, Ngrok, and PM2. It transforms any old laptop, Raspberry Pi, or Android phone into a cloud-enabled NAS with Telegram control, secure file access, and easy deployment.

## 🚀 Features

- 📁 Upload, download, delete files/folders via web UI or Telegram bot  
- 📦 Folder structure support with nested folders  
- 🌐 Public access via [Ngrok](https://ngrok.com/) tunneling  
- 🔐 Route protection using token-based Authorization headers  
- 📊 Disk usage reports (`/status`)  
- 🤖 Telegram bot integration with these commands:
  - `/list` – list all files and folders
  - `/download <file_path>` – generate download link
  - `/delete <file_path>` – delete files/folders
  - `/status` – get disk usage
  - `/ip` – get local server IP
  - `/ngrokurl` – current ngrok URL
  - `/reboot` – restart the NAS server (PM2-based)

- 🔁 Auto restart using PM2 with custom cron scheduling  
- 💬 Telegram alerts for uploads, downloads, and unauthorized access  
- 🛡️ Rate limiting to prevent brute-force attacks
- 📲 Can run on **any device**, even an old smartphone (with Termux or Node.js)

## 🧠 How It Works

1. The Express server handles all HTTP routes and static file serving.
2. All secure routes (`/upload`, `/delete`, `/files`, etc.) require an Authorization token.
3. The Telegram bot uses `node-telegram-bot-api` to interact with your NAS remotely.
4. Ngrok exposes the local server to the internet using a secure public URL.
5. PM2 manages the background process and allows auto-restarts on a cron schedule.

## 📦 Tech Stack / Packages Used

| Package | Purpose |
|--------|---------|
| **express** | Backend server |
| **multer** | File upload handling |
| **fs-extra** | Enhanced file system utilities |
| **@ngrok/ngrok** | Tunneling to internet |
| **cors** | Cross-origin access |
| **dotenv** | Environment variable support |
| **ip** | Local IP detection |
| **chalk** | Pretty console output |
| **express-rate-limit** | Protects against spam/abuse |
| **check-disk-space** | Disk usage information |
| **node-telegram-bot-api** | Telegram bot interaction |
| **pm2** | Background process manager |

## 🛠️ Getting Started

### 1. Clone the Project

```bash
git clone https://github.com/milan-sony/LiteBox.git
cd LiteBox
npm install
```

### 2. Create a .env file:

```
PORT=3000

LITEBOX_SECRET=your_secret_token

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

TELEGRAM_CHAT_ID=your_telegram_chat_id

NGROK_AUTH_TOKEN=your_ngrok_auth_token
```

## ▶️ Running the Server

Option 1: Normal Start

```
node server.js
```

Option 2: Use PM2 (Recommended)

```
npm install -g pm2
pm2 start server.js --name litebox
```

Auto Restart Every 8 Hours (Optional)

```
pm2 restart litebox --cron "0 */8 * * *"
```

Save PM2 for System Startup
```
pm2 save
pm2 startup
```

## 📲 Run on Old Android Phone (Termux)

1. Install Termux from F-Droid

2. Setup:

```
pkg install nodejs git
git clone https://github.com/milan-sony/LiteBox.git
cd LiteBox
npm install
node server.js
```

3. Access your NAS using the Ngrok public URL shown in logs or via the/ngrokurl Telegram command.

## 🔐 API Authorization

All sensitive endpoints require this HTTP header:

Authorization: Bearer <LITEBOX_SECRET>

Use this for:

```/upload```

```/delete```

```/files```

```/create-folder```

```/storage-info```

```/download```

## 🤖 Telegram Bot Commands

Command	Description

```/help```	Show help

```/list```	List all files and folders

```/download <path>```	Generate download link

```/delete <path>```	Delete file or folder

```/status```	Show disk space info

```/ip```	Show server local IP

```/ngrokurl```	Show ngrok public URL

```/reboot```	Restart the NAS (PM2 required)

## 🌱 Future Enhancements

- 📤 Upload via Telegram bot

- 🔐 Per-file password protection

- 🖼️ File previews (PDF, image thumbnails)

- 🧾 File rename support

- 🌍 Static IP with DDNS support

- 📲 Push notifications via mobile app

- ☁️ Cloud sync (Google Drive, Dropbox)

- 🧠 AI assistant via Telegram for voice commands

- 🔒 OTP-based access for download links


## 👨‍💻 Author

Made with ❤️ by Milan Sony

Telegram: @litebox_alert_bot

GitHub: github.com/milan-sony

