Readme · MD
# QRBeam ⚡

> Drag. Drop. Scan. Done.

QRBeam is a zero-friction file sharing tool built for the moments when you just need to move a file — fast. No login, no app, no pairing. Upload a file, get a QR code, scan it on your phone, and it's yours. The file deletes itself in 10 minutes.

<img width="1536" height="812" alt="image" src="https://github.com/user-attachments/assets/1b1a25e7-8f9e-445a-9f08-588e600353fc" />


**Live Demo:** https://qrbeamx.netlify.app/

### Features at a Glance
- ⚡ **Instant Sharing** - Share files instantly with a QR code
- 🔐 **No Login Required** - Zero friction, zero accounts
- 📱 **Mobile Friendly** - Scan QR code on your phone
- ⏰ **Auto Delete** - Files self-destruct after 10 minutes
- 🎯 **Simple & Fast** - Upload, share, download - done!
 
---
 
## The Problem
 
Working on a college computer and needed the file on your phone?
 
- Logging into Gmail on a public system? Risky.
- WhatsApp Web? Also risky.
- Bluetooth? Pairing, waiting, praying…
- Random apps? They all want a login or an install.
Too much effort for a 15kb file.
 
QRBeam removes all of it.
 
- **QR Code Transfer** — upload a file, scan the QR on your phone, done
- **6-Digit Code** — alternative if you can't scan (just type the code)
- **No Login** — not now, not ever
- **No App Download** — works in any browser
- **Auto Delete** — files expire and are purged from storage after 10 minutes
- **Up to 10 MB** — handles most everyday files
- **No Database** — session state lives in-memory; nothing persists
---
 
## How It Works
 
```
User uploads file
      │
      ▼
Backend receives file → uploads to Azure Blob Storage
      │
      ├── Generates a unique 6-digit code
      ├── Schedules auto-delete after 10 minutes
      └── Returns QR code + code to frontend
                        │
                        ▼
            Receiver scans QR or enters code
                        │
                        ▼
              File streams directly from Azure
                        │
                        ▼
              Timer fires → blob deleted
```
 
No data is stored beyond the 10-minute window. No accounts. No tracking.
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| File Storage | Azure Blob Storage |
| QR Generation | `qrcode` npm package |
| File Upload | Multer (memory storage) |
| Session State | In-memory Map (no DB) |
 
---
 
## Project Structure

```
qrbeam/
├── frontend/                  # React app
└── backend/
    ├── server.js              # Entry point — boots Azure + starts server
    ├── .env.example           # Environment variable template
    ├── .gitignore
    ├── package.json
    └── src/
        ├── app.js             # Express app (middleware + routes)
        ├── config/
        │   └── azure.js       # Azure Blob client + container init
        ├── constants/
        │   └── index.js       # File limits, expiry, code config
        ├── controllers/
        │   └── fileController.js   # Route handler logic
        ├── middlewares/
        │   └── upload.js      # Multer configuration
        ├── routes/
        │   └── fileRoutes.js  # Express router
        └── services/
            ├── azureService.js    # Blob upload / download / delete
            ├── qrService.js       # QR code generation
            └── sessionService.js  # In-memory session store + expiry
```
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js v18+
- An Azure Storage account with a Blob container
### Backend Setup
 
```bash
# Clone the repo
git clone https://github.com/AayushGattani/qrbeam.git
cd qrbeam/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Azure credentials in .env

# Start the server
npm run dev
```

### Frontend Setup

```bash
cd qrbeam/frontend
npm install
npm run dev
```
 
---
 
## Environment Variables
 
Create a `.env` file in `/backend` using `.env.example` as the template:
 
```env
PORT=5000
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
AZURE_STORAGE_CONTAINER_NAME=your_container_name
FRONTEND_URL=http://localhost:3000
```
 
---
 
## API Reference
 
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload files (max 10 MB total, up to 20 files) |
| `GET` | `/file-info/:code` | Get session details and time remaining |
| `GET` | `/download/:code/:filename` | Stream and download a specific file |
| `DELETE` | `/terminate/:code` | Manually end a session early |
| `GET` | `/health` | Health check + active session count |
 
---
 
## Design Decisions
 
- **No database** — a simple in-memory `Map` handles sessions. Files are temporary by design; persistence would be a contradiction.
- **No authentication** — the 6-digit code is the access key. Short-lived, single-use style.
- **Azure Blob over local disk** — stateless backend, works across deploys and doesn't fill up server storage.
- **Auto cleanup** — `setTimeout` schedules deletion at upload time. If the server restarts, Azure blobs are orphaned — acceptable for a 10-minute ephemeral tool.
---
 
## License
 
MIT — use it, fork it, build on it.
 
---
 
*Built out of genuine frustration with file sharing in 2026.*
