import mongoose from 'mongoose'
const { Schema } = mongoose

const albumSchema = new Schema({
  artist: {
    type: String,
    maxlength: [50, 'Artist name max length is 50 characters'], // artist name max 50 characters
    minlength: [3, 'Artist name min length is three characters'], // artist name min 3 characters
    required: [true, 'Artist name is required.'], // artist name is a required field
    trim: true,
  },
  title: {
    type: String,
    maxlength: [50, 'Album title max length is 50 characters'], // album title max 50 characters
    minlength: [3, 'Album title min length is three characters'], // album title min 3 characters
    required: [true, 'A title for album must be given'], // album title is a required field
    trim: true,
  },
  year: {
    type: Number,
    min: [
      1900,
      `Release year must be between 1900 and current year, {VALUE} not accepted.`,
    ],
    max: [
      new Date().getFullYear(),
      `Release year must be between 1900 and current year, {VALUE} not accepted.`,
    ],
    required: true,
  },
  genre: {
    type: String,
    enum: {
      values: ['Classic', 'Country', 'Jazz', 'Pop', 'Rock'],
      message:
        '{VALUE} not available. Genre selection: Classic, Country, Jazz, Pop, Rock.',
    },
    required: true,
    trim: true,
  },
  tracks: {
    type: Number,
    min: [1, 'Track count must be at least one'], // at least one track needed
    max: [100, 'Track count max length is 100'], // no more than 100 tracks allowed
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  owners: [{ type: Schema.Types.ObjectId, ref: 'User'}]
})

// Mongoose middleware, that runs before an album is saved
albumSchema.pre('save', function (next) {
  // Update the updatedAt field to the current date
  this.updatedAt = new Date()
  next()
})

// Mongoose middleware, that runs after an album is saved
albumSchema.post('save', function (doc, next) {
  console.log('Message from post-save hook: Album has been created or updated!')
  next()
})

export default mongoose.model('Album', albumSchema)
