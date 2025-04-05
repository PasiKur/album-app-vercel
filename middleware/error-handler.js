import { StatusCodes } from 'http-status-codes'
import APIError from '../errors/apierror.js'

const errorHandlerMiddleware = (err, req, res, next) => {
  // Handle "own errors": If error is instance of our own APIError class,
  // return statusCode and message that was defined in that error
  if (err instanceof APIError) { 
    return res.status(err.statusCode).json({ msg: err.message })
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    let errors = {}
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message
    })
    return res.status(StatusCodes.BAD_REQUEST).send(errors)
  }
  console.error(err)
  // Fallback to generic 500 error
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'There was an error, please try again' })
}

export default errorHandlerMiddleware