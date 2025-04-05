import Album from '../models/Album.js'
import User from '../models/User.js'
import APIError from '../errors/apierror.js'
import { StatusCodes } from 'http-status-codes'

// 1. GET /api/v1/albums - returns all albums
const getAllAlbums = async (req, res) => {
  const albums = await Album.find({})
  if (!albums) {
    throw new APIError('Album was not found', 404)
  }
  return res.status(StatusCodes.OK).json({ success: true, data: albums })
}

// 2. GET /api/v1/albums/all - returns albums with query params (filters and sorting)
const getAlbumsQuery = async (req, res) => {
  const { artist, title, genre, tracks, year, numericFilters, sort, fields, startYear, endYear } = req.query
  console.log(numericFilters)
  const queryObject = {}
  
  // filter by genre and tracks
  if (genre) queryObject.genre = genre
  if (tracks) queryObject.tracks = tracks

  // adding search functionality with regex to artist name and album title ('i'=case insensitive)
  if (artist) queryObject.artist = { $regex: artist, $options: 'i' }
  if (title) queryObject.title = { $regex: title, $options: 'i'}
  if (year) queryObject.year = { $regex: year, $options: 'i'}
  
  // filter between two years
  if (startYear && endYear) { queryObject.year = {  // both fields must be given (no filtering with only other)
      $gte: Number(startYear),  // define startYear as minimum (greater than or equal)
      $lte: Number(endYear)  // define endYear as maximum (less than or equal)
    }
  }

  // filter with numbers
  if (numericFilters) {
    // transforming comparison operators to ones used by MongoDB
    const operatorMap = {
      '>' : '$gt', // (replace operator: '>'  with  'greater than')
      '>=' : '$gte', // (>=  to  'greater than or equal')
      '=' : '$eq', // (=  to  'equal')
      '<' : '$lt', // (<  to  'less than ')
      '<=' : '$lte', // (<=  to  'less than or equal')
    }
    // regex match: replace all operators found in numeric filters with ones used by MongoDB
    const regEx = /\b(>|>=|=|<|<=)\b/g
    // logic for replacing: "found with regex -> replace with defined match"
    let filters = numericFilters.replace(regEx,(match) => `-${operatorMap[match]}-`)
    console.log(filters)
    const options = ['year'] // define what field allowed for filtering (now only 'year')
    // Splitting the numeric filters into individual items
    filters = filters.split(',').forEach((item) => {
      // Destructuring each numeric filter from the array by splitting on the '-'
      const [field,operator,value] = item.split('-')
      // check that field is included (for example 'year'), prevend unwanted filtering
      if (options.includes(field)) {
        // add filter to queryObject
        queryObject[field] = {[operator] : Number(value)}
      }
    })
  }
  console.log(queryObject)

  // sorting by fields (for example artist, release year, title...)
  let result = Album.find(queryObject)
  
  // check if sort parameter is found
  if (sort) {
    const sortList = sort.split(',').join(' ') // album,artist -> album -artist
    result = result.sort(sortList)
  } else {
    result = result.sort('year') // if no sort parameter, sort default by year
  }
  
  // check if fiels parameter is found
  if (fields) {
    const fieldList = fields.split(',').join(' ') + ' -_id' // artist,year -> artist year - _id
    result = result.select(fieldList)
  }
  
  const albums = await result
  console.log('Albums found with query:', albums.length) // log number of albums found
  
  res.status(StatusCodes.OK).json({ albums, number_of_hits: albums.length })
}


// 3. GET /api/v1/albums/:id - returns a single album by id
const getAlbumById = async (req, res) => {
  const { id } = req.params
  const singleAlbum = await Album.findById(id)
  if (!singleAlbum) {  // if album not found, throw APIError
    throw new APIError('Album not found!', StatusCodes.NOT_FOUND)
  }
  return res.status(StatusCodes.OK).json({ success: true, data: singleAlbum }) // return album in json format
}


// 4. POST /api/v1/albums - adds a new album
const createAlbum = async (req, res) => {
  const { artist, title, year, genre, tracks } = req.body

  if (!req.user || !req.user.id) {
    throw new APIError('Authentication token missing or invalid', StatusCodes.UNAUTHORIZED)
  }
  const user = await User.findById(req.user.id)

  // check that all required fields are mentioned
  if (!artist || !title || !year || !genre || !tracks) {
    // if some field/fields are missing, error message is thrown
    throw new APIError(`All album fields are required.`, StatusCodes.BAD_REQUEST)
  }

  const newAlbum = new Album({ artist, title, year, genre, tracks, owners: user._id })
  try {
    const savedAlbum = await newAlbum.save()  // get saved album, need it's id
    user.albums = user.albums.concat(savedAlbum._id)  // save saved album's id to user's album
    await user.save()  // save user
  } catch (err) {
    throw new APIError('Failed to create album', StatusCodes.INTERNAL_SERVER_ERROR)
  }
    // successful creating of album returns StatusCode "CREATED"
  return res.status(StatusCodes.CREATED).json({ success: true, album: newAlbum })
} 


// 5. PUT /api/v1/albums/:id - updates an album by id
const updateAlbum = async (req, res) => {
  const { id } = req.params // get id from parameter
  const { artist, title, year, genre, tracks } = req.body // get required fields from parameters

  const updatedAlbum = await Album.findById(id)

  if (!updatedAlbum) {
    // if album with given index is not found, throw APIError
    throw new APIError(`Album with id ${id} not found`, StatusCodes.NOT_FOUND)
  }

  if (artist) updatedAlbum.artist = artist
  if (title) updatedAlbum.title = title
  if (year) updatedAlbum.year = year
  if (genre) updatedAlbum.genre = genre
  if (tracks) updatedAlbum.tracks = tracks

  try {
    await updatedAlbum.save()
  } catch (err) {
    throw new APIError('Error saving album changes', StatusCodes.INTERNAL_SERVER_ERROR)
  }

  return res.status(StatusCodes.OK).json({ success: true, data: updatedAlbum }) // return updated album
}

// 6. DELETE /api/v1/albums/:id - deletes an album by id
const deleteAlbum = async (req, res) => {
  const { id } = req.params // get id from parameter

  const deletedAlbum = await Album.findByIdAndDelete(id) // find album with param id

  if (!deletedAlbum) { // if album not found, throw APIError
    throw new APIError(`No album found with id ${id}`, StatusCodes.NOT_FOUND)
  }

  return res.status(StatusCodes.OK).json({ success: true })
}


export { getAllAlbums, getAlbumsQuery, getAlbumById, createAlbum, updateAlbum, deleteAlbum }
