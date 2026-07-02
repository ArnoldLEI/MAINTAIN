import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/api/data')) {
            const dataFilePath = path.resolve(__dirname, 'db.json')
            
            if (req.method === 'GET') {
              if (fs.existsSync(dataFilePath)) {
                const fileData = fs.readFileSync(dataFilePath, 'utf-8')
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(fileData)
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'No data found' }))
              }
              return
            }
            
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => {
                body += chunk.toString()
              })
              req.on('end', () => {
                try {
                  fs.writeFileSync(dataFilePath, body, 'utf-8')
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ success: true }))
                } catch (e) {
                  res.writeHead(500, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ error: e.message }))
                }
              })
              return
            }
          }
          next()
        })
      }
    }
  ],
})
