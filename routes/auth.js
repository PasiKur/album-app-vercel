// routes for login/logout

import { Router } from 'express'
import passport from 'passport'
import { register, logout } from '../controllers/auth.js'

const router = Router()

// Passport route handler for password auth
router.post('/login/password', 
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
  })
)

router.post('/logout', logout)
router.post('/register', register)

export default router