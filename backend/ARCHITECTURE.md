# QRBeam Backend - Modular Architecture

This document describes the modular structure of the QRBeam backend application.

## Folder Structure

```
backend/
├── src/
│   ├── app.js                 # Express app setup & middleware
│   ├── config/
│   │   └── azure.js          # Azure Blob Storage configuration
│   ├── constant/
│   │   └── index.js          # Application constants
│   ├── controllers/
│   │   └── fileController.js # Route handlers & business logic
│   ├── middlewares/
│   │   └── upload.js         # Multer upload configuration
│   ├── routes/
│   │   └── fileRoutes.js     # Express routes
│   ├── services/
│   │   ├── azureService.js   # Azure Blob operations
│   │   ├── qrService.js      # QR code generation
│   │   └── sessionService.js # Session management
│   └── utils/
│       └── helpers.js        # Utility functions
├── server.js                  # Entry point
└── package.json              # Dependencies
```

## Module Descriptions

### Config
- **azure.js**: Initializes Azure Blob Storage client and container

### Constants
- **index.js**: Centralized configuration values (file sizes, expiry times, etc.)

### Controllers
- **fileController.js**: Contains all route handler functions:
  - `uploadFiles()` - Handle file uploads
  - `getFileInfo()` - Get session file information
  - `downloadFile()` - Download specific file
  - `terminateSession()` - End a session
  - `healthCheck()` - Health status

### Middlewares
- **upload.js**: Multer configuration for file uploads

### Routes
- **fileRoutes.js**: Define all API endpoints and map them to controllers

### Services
- **azureService.js**: Azure Blob Storage operations
  - Upload, download, delete files from Azure
- **qrService.js**: QR code generation
  - Generate QR codes pointing to download URLs
- **sessionService.js**: In-memory session management
  - Create, retrieve, delete sessions
  - Schedule automatic expiry

### Utils
- **helpers.js**: Utility functions
  - Generate unique codes
  - Generate safe blob names

## API Endpoints

- `POST /upload` - Upload files and get a session code
- `GET /file-info/:code` - Get file info for a session
- `GET /download/:code/:filename` - Download a specific file
- `DELETE /terminate/:code` - End a session
- `GET /health` - Health check

## Running the Server

```bash
npm install
npm start
# or
node server.js
```

Environment variables required:
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_CONTAINER_NAME`
- `FRONTEND_URL` (optional, defaults to http://localhost:3000)
- `PORT` (optional, defaults to 5000)
