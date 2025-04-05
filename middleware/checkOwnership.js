import Album from '../models/Album.js'
import { UnauthorizedError, APIError } from '../errors/index.js'
import mongoose from 'mongoose'

// use with routes that needs a check for ownership
const checkOwnership = async (req, _res, next) => {
  const { id } = req.params

  // if given id is not ObjectId-type (used by MongoDB), throw error
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new APIError('Invalid album ID.', 400)
  }

  // find album by id, if album not found, throw error
  const album = await Album.findById(id)
  if (!album) {
    throw new APIError('Album not found.', 404)
  }

  // if user role is admin, allow to continue (to next middleware or controller)
  if (req.user.role === 'admin') {  
    return next()
  }

  // if user is not the owner of the album, throw an error and stop
  // otherwise allow to continue to next middleware or controller
  if (album.owners.toString() !== req.user.id) {
    throw new UnauthorizedError('You are not allowed to modify this album.')
  }

  next()
}

export default checkOwnership