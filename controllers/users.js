import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import APIError from '../errors/apierror.js'

// Get all users
const getUsers = async (_req,res) => {
  //const users = await User.find({}).select('name email _id').populate('albums')
  const users = await User.find({})
  res.status(StatusCodes.OK).json({ data: users })
}

// Get one user
const getSingleUser = async (req,res) => {
  const { id } = req.params
  const user = await User.findById(id)
  // if user not found, throw error
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).send({success: false, msg: 'No such user'})
  }
  const userResponse = { ...user.toObject(), passwordHash: undefined }
  res.status(StatusCodes.OK).json({ user: userResponse })
}

// Create a new user
const createUser = async (req,res) => {
  const { name, email, password, password_confirmation } = req.body
  
  // check that all fields are given (if not, throw error)
  if (!name || !email || !password || !password_confirmation) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: `All fields are required` })
  }

  // check that both passwords match (if no match, throw error)
  if (password !== password_confirmation) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: `Passwords do not match` })
  }
  
  // check that if email already exists (if exists, throw error)
  const emailExists = await User.findOne({ email })  // find email
  if (emailExists) {
    return res.status(StatusCodes.CONFLICT).send({ success : false, msg: `email already exists: ${email}` })
  }

  const user = new User({  // create new user profile
    name, email, password, password_confirmation,
  })

  await user.save()  // save user profile

  // remove passwordHash from response by converting to object and removing key
  const userResponse = { ...user.toObject(), passwordHash: undefined }
  return res.status(StatusCodes.CREATED).json({ user: userResponse })
}

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params // get id from request
  const deletedUser = await User.findByIdAndDelete(id) // find user with param id

  // if user not found, send error message
  if (!deletedUser) {
    throw new APIError(`No user found with id ${id}`, StatusCodes.NOT_FOUND)
  }
  // if delete succesful, statuscode 204 (no content)
  return res.status(StatusCodes.NO_CONTENT)
}

export {
  getUsers,
  createUser,
  getSingleUser,
  deleteUser
}