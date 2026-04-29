#!/usr/bin/env node
// Standalone file server for /uploads - bypasses Next.js routing
// Runs on port 3001, handles all static uploads

const http = require('http')
const fs = require('fs')
const path = require('path')

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads')
const PORT = 3001

const MIME_TYPES = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg:  'image/svg+xml',
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).slice(1).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  // Only allow /uploads/ requests
  if (!req.url.startsWith('/uploads/')) {
    res.writeHead(404)
    res.end()
    return
  }

  // Security: prevent path traversal
  const filename = path.basename(req.url)
  if (filename.includes('..') || filename.includes('/') || filename.startsWith('.')) {
    res.writeHead(400)
    res.end('Bad request')
    return
  }

  const filePath = path.join(UPLOADS_DIR, filename)

  // Resolve to ensure it's within uploads dir
  if (!filePath.startsWith(UPLOADS_DIR)) {
    res.writeHead(400)
    res.end('Bad request')
    return
  }

  serveFile(filePath, res)
})

server.listen(PORT, () => {
  console.log(`[uploads] Static server running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})