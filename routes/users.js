import express from 'express'
import authUser from '../middleware/auth.js'
import checkRole from '../middleware/checkRole.js'
import { getUsers, getSingleUser, createUser, deleteUser } from '../controllers/users.js'

const router = express.Router() // create express router

// User routes: only admin has rights to access these routes
router.get('/', authUser, checkRole('admin'), getUsers)
router.get('/:id', authUser, checkRole('admin'), getSingleUser)
router.delete('/:id', authUser, checkRole('admin'), deleteUser)

// router.post (below) not used in Exercise 7 (JWT based route)
// -> Passport registering made in controllers/auth.js with form /register
// router.post('/register', createUser) <- saved for future reference

export default router // export router so app.js can use it
