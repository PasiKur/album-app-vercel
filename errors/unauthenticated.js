import { StatusCodes } from 'http-status-codes'
import APIError from './apierror.js'

class UnauthenticatedError extends APIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}

export default UnauthenticatedError