import express from 'express'
import authUser from '../middleware/auth.js'
import checkOwnership from '../middleware/checkOwnership.js'
import {
  getAllAlbums,
  getAlbumsQuery,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum
  } from '../controllers/albums.js'

const router = express.Router() // create express router

// All logged in users can access these album routes
router.get('/', authUser, getAllAlbums)
router.get('/all', authUser, getAlbumsQuery)
router.get('/:id', authUser, getAlbumById)
router.post('/', authUser, createAlbum)  // create album: all logged in users

// access rights: only admin or owner (checkOwnership)
router.put('/:id', authUser, checkOwnership, updateAlbum)  // update album: only owner (own album) and admin
router.delete('/:id', authUser, checkOwnership, deleteAlbum)  // delete album: only owner (own album) and admin

export default router // export router so app.js can use it
