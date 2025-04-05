/* JWT-based login.js below (for future reference)
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { UnauthenticatedError } from '../errors/index.js'
import { StatusCodes } from 'http-status-codes'

const login = async (req,res) => {
  const { email, password } = req.body  // email and password used in POST request
  const user = await User.findOne({ email })  // search user by email
  console.log(user) 
  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.password)
  if (!(user && passwordCorrect)) {  // if (either/both) user not found (or/and) password not correct...
    throw new UnauthenticatedError('Invalid username or password')  // ...an error is thrown
  }
  // username and user ID are added to payload
  const userForToken = {
    username: user.name,
    id: user._id,
  }
  // sign the token with payload (username+id), secret (secret string from .env) and option (expire time from .env)
  const token = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
  res.status(StatusCodes.OK).send({ token, username: user.name })  // statuscode 200-ok and token with username
}

export {
  login,
}*/