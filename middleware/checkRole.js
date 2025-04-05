import { UnauthorizedError } from '../errors/index.js'

const checkRole = (...roles) => {
  return (req, _res, next) => {
    // if logged in user's role is not as defined (e.g. 'admin'), throw error and stop
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('You do not have permission to perform this action.')
    }
    // otherwise, continue to next middleware or controller
    next()
  }
}

export default checkRole
