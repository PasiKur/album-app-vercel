import { StatusCodes } from 'http-status-codes'

export const home = (req, res, next) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).render('home', { 
      title: 'Welcome',
      status: StatusCodes.UNAUTHORIZED
    })
  }
  next()
}

export const profile = (req, res) => {
  const { name, username, email, role } = req.user  // ✅
  res.status(StatusCodes.OK).render('profile', { 
    title: 'User Profile',
    name,
    username,
    email,
    role,
    status: StatusCodes.OK
  })
}
export const login = (req, res) => {
  const messages = req.session.messages || []
  // Clear messages after reading
  req.session.messages = []
  res.render('login', { messages })
}

export const register = (_req, res) => {
  res.render('register')
}
