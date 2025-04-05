import { Router } from 'express'
const router = Router()

import { login } from '../controllers/login.js'

// Login post route, pass in the login controller
// This route was used in Exercise 6 with JWT, not needed in 7 (with Passport)
// now in use: passport.authenticate()
//router.post('/', login)

export default router
