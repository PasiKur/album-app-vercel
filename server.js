// server.js
import app from './app.js'
import http from 'node:http'
import config from './utils/config.js'

const server = http.createServer(app)

server.listen(config.PORT, () => {
  // PORT imported from config.file (which imports it from .env)
  console.log(`Server running on http://localhost:${config.PORT}`)
})
