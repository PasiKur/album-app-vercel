import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const { Schema } = mongoose

const userSchema = new Schema ({
  name: {
    type: String,
    maxlength: [20, 'name max length is 20 characters'], // name max 20 characters
    minlength: [3, 'name min length is three characters'],  // name min 3 characters
    required: [true, 'name must be provided'],
  },
  email: {
    type: String,
    maxlength: [30, 'email max length is 30 characters'], // email max 30 characters
    minlength: [5, 'email min length is five characters'],  // email min 5 characters
    required: [true, 'email must be provided'],
    unique: true,
  },
  username: String,
  password: {
    type: String,
    minlength: [7, 'password min length is seven characters'],  // password min 7 characters
    required: [true, 'password must be provided'],
  },
  role: {  // user roles: 'user' (default) or 'admin'
    type: String,
    enum: ['user', 'admin'],  // allow only these two user roles
    default: 'user'  // default value
  },
  albums: [{ type: Schema.Types.ObjectId, ref: 'Album' }]
})

// Mongoose pre-save hook, runs before an album is saved (hashes password if modified or new)
userSchema.pre('save', async function (next) {
  // if password is not modified, move to next middleware
  if (!this.isModified('password')) return next()
  
  // if password is modified, encrypt password with bcrypt hash function
  const saltRounds = 10
  this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

export default mongoose.model('User', userSchema)
