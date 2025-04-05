// routes for views

import { Router } from 'express'
import { noCache } from '../middleware/nocache.js'
import { login, register, home, profile}  from '../controllers/index.js'
import authUser from '../middleware/auth.js'

const router = Router()

//router.get('/', noCache, home, profile)
router.get('/', noCache, home, profile)
router.get('/login', login)
router.get('/register', register)

// protected route (authUser middleware used)
router.get('/profile', authUser, profile)

export default router
