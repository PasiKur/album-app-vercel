import { UnauthenticatedError } from '../errors/index.js'

const authUser = (req, res, next) => {
  if (!req.query.user) {
    // check if user parameter is included
    throw new UnauthenticatedError('Unauthorized')
  }
  next() // if user parameter is found, move to next middleware
}

export default authUser
