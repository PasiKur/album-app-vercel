// 1. Import basic modules and env
import 'express-async-errors'
import config from './utils/config.js'
import express from 'express'
import connectMongoDB from './db/connectMongoDB.js'
import MongoDBStore from 'connect-mongo'
import dotenv from 'dotenv'
import path from 'path'
import session from 'express-session'
import { fileURLToPath } from 'url'
import passport from 'passport'
import { initializePassport } from './config/passport.js'

// 2. Import routers
import indexRouter from './routes/index.js'
import authRouter from './routes/auth.js'
import albumsRouter from './routes/albums.js'
import usersRouter from './routes/users.js'

// 3. Other imports
import errorHandlerMiddleware from './middleware/error-handler.js'
// import users from './routes/users.js'  // JWT-based (not in use)
//import login from './routes/login.js' // JWT-based (not in use)

// 4. Load .env config
dotenv.config()

// 5. Initializing app
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const { PORT, MONGODB_URI } = process.env // imports from .env file

// 6. Middleware for parsing JSON from data
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 7. Session configuration with MongoDB
app.use(session({
  name: 'session_id',  // rename cookie name from default connect.sid to session_id
  secret: config.SESSION_SECRET,  // use SESSION_SECRET from config (not .env)
  resave: false,  // save session only if modified
  saveUninitialized: false,  // ask user permission for saving cookies
  store: MongoDBStore.create({  // store sessions to MongoDB collection
    mongoUrl: config.MONGODB_URI,
    collection: 'passport-sessions',  // name for collection
    ttl: 60 * 60,  // delete session from MongoDB after 1h if user is inactive
  }),
  cookie: {
    ttpOnly: true,
    maxAge: 60 * 60 * 1000,  // browser cookie expires automatically in 1h
  },
}))

// 8. Initialize Passport.js
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

// 9. Routes for views and authentication
app.use('/', indexRouter)  // views (home, login, register, profile)
app.use('/', authRouter)  // authentication (login, logout, registration)
app.use('/api/users', usersRouter)  // users (get, delete)

// 10. View setup (Pug templates)
app.set('view engine', 'pug')
app.set('views', './views')

// 11. Static file handling
app.use(express.static(path.join(__dirname, 'public')))

// 12. API routes
app.use('/api/albums', albumsRouter)
//app.use('/api/login', login) // JWT-based (not in use)
//app.use('/api/users', users)  // JWT-based (not in use)

// 13. Global error handling middleware
app.use(errorHandlerMiddleware)

// 14. Connect to MongoDB database
try {
  await connectMongoDB(config.MONGODB_URI)
} catch (error) {
  console.log(error)
}

export default app

// testaan tällä rivillä gitlab-ci.yml filen vaikutusta pipeline asetuksiin...
