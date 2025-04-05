import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import { APIError } from '../errors/index.js'
import User from '../models/User.js'

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) { 
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error', {
        title: 'Logout Error',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error during logout'
      })
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error', {
          title: 'Logout Error',
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Error destroying session'
        })
      }
      res.clearCookie('session_id')  // delete session after logout
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
      res.redirect('/')
    })
  })
}

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body
    const role = 'user'  // always set user role to 'user' when registering new user
    const userExists = await User.findOne({ email })
    if (userExists) {
      throw new APIError(`User already exists with email: ${email}`, StatusCodes.CONFLICT)
    }
    
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      name,
      email,
      username,
      password,
      role,
    })

    await user.save()
    res.status(StatusCodes.CREATED).render('home', {
      message: `Thanks for registering ${name}! You can now log in`
    })
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).render('error', {
      title: 'Registration Error',
      status: StatusCodes.BAD_REQUEST,
      message: error.message
    })
  }
}
export const getProfilePage = async (req, res) => {
  const user = await User.findById(req.user.id).populate('albums')
  res.render('profile', {
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    albums: user.albums,
  })
}
