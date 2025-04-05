// config/passport.js
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

// function for Passport authentication strategies
export const initializePassport = () => {
  // a) define strategy for login
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, cb) => {
    try {
      // check if user is found in MongoDB (by given email)
      const user = await User.findOne({ email })
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.password)

      // if user is not found by email or password is wrong, authentication fails
      if (!(user && passwordCorrect)) {
        return cb(null, false, { message: 'Incorrect email or password.' })
      }

      // if authentication is ok, proceed with user
      return cb(null, user)
    } catch (err) {
      return cb(err)
    }
  }))

  // b) define user data to be saved into session
  passport.serializeUser((user, cb) => {
    process.nextTick(() => {
      cb(null, {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email || 'undefined',
        role: user.role || 'undefined',  // if role not defined, show info
      })
    })
  })

  // c) define how user data is read back to use from session
  passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
      cb(null, user)
    })
  })
}