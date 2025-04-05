import { StatusCodes } from 'http-status-codes'

export const authUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }

  return res.status(StatusCodes.UNAUTHORIZED).render('error', {
    title: 'Unauthorized',
    status: StatusCodes.UNAUTHORIZED,
    message: 'You must be logged in to access this page.'
  })
}

export default authUser

/* JWT-based auth.js below (for future reference)
import jwt from 'jsonwebtoken'
import { UnauthenticatedError } from '../errors/index.js'

const authUser = async (req,_res,next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('No token in header')
  }
  const token = authHeader.split(' ')[1]

  try {
    // check that token is valid, not expired and that it exists
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const { id, username } = decoded
    req.user = { id, username }
    next()
  } catch (error) {  // show errors in different situations
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthenticatedError('Login expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthenticatedError('Invalid token')
    } else if (error instanceof jwt.NotBeforeError) {
      throw new UnauthenticatedError('Token not yet valid')
    }
    throw error // Re-throw any other unexpected errors
  }
}

export default authUser
*/