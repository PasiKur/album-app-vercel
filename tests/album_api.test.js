import { afterAll, beforeEach, describe, expect, test, vi} from 'vitest'

// bypass authUser middleware during tests (create a 'fake user id')
vi.mock('../middleware/auth.js', () => ({
  default: (req, res, next) => {
    req.user = {
      id: '1234567890abcdef12345678',  // fake user id
      role: 'user'  // default role (admin role not needed in tests)
    }
    next()
  }
}))

// bypass checkOwnerchip middleware during tests (PUT and DELETE routes)
vi.mock('../middleware/checkOwnership.js', () => ({
  default: (req, res, next) => next()
}))

import mongoose from 'mongoose'  // 
import supertest from 'supertest'  // starts the server
import Album from '../models/Album.js'
import User from '../models/User.js'
import testAlbums from './test_albums.json'  // initialize test database, import JSON data
import app from '../app.js'  // import app for supertest

const api = supertest(app)  // create 'api' variable from the app

describe('Album API tests', () => {  // name for the test pattern
  
  beforeEach(async () => {

    await Album.deleteMany({})  // first delete all album resources from test database...
    await User.deleteMany({})  // ...and also delete all user resources from test database
    
    // create a test user with same user id than the mocked user
    await User.create({
      _id: '1234567890abcdef12345678',  // same user id than mocked user
      name: 'testuser',
      email: 'test@example.com',
      password: 'testhash',
      role: 'user'
    })
    
    await Album.create(testAlbums)  // finally replace data with test data
  })
  
  // use asyncronoys function since waiting result from api
  
  // TESTS:
  // 1. test if albums can be received from api
  test('test returns albums as JSON with correct length', async () => {
    const response = await api
      .get('/api/albums')  // route to albums
      .expect(200)  // await reply with statuscode 200 (OK)
      .expect('Content-Type', /application\/json/)  // wait to receive JSON data
    
    // expect correct length of album data (number of albums)
    expect(response.body.data).toHaveLength(testAlbums.length)
  })


  // b) test if a new album can be added
  test('a new album can be added ', async () => {
    const newAlbum = {  // create a new object (Album) with predefined data fields
      artist: 'Led Zeppelin',
      title: 'Led Zeppelin IV',
      year: 1971,
      genre: 'Rock',
      tracks: 8
    }
  
    await api  // call supertest api
    .post('/api/albums')  // post request to route
    .send(newAlbum)  // send new created album data
    .expect(201)  // await reply with statuscode 201 (Created)
    .expect('Content-Type', /application\/json/)  // wait to receive JSON data

    const response = await api.get('/api/albums')  // ask for request and save to variable
    
    // check album count after creating a new album
    console.log('Album count after POST:', response.body.data.length)
    
    // find the new created album from test database albums (with same title as the album in test database)
    const created = response.body.data.find(album => album.title === newAlbum.title)
    
    // check album data after creating album
    console.log('Created album:', created)

    // make sure that created album matches with the newAlbum (the album data that was send when creating album)
    expect(created).toMatchObject(newAlbum)
  })


  // c) test that an album can be deleted
  test('an album can be deleted by id', async () => {
    const albumsAll = await api.get('/api/albums')  // get all albums from test database, save data to variable
    const albumDelete = albumsAll.body.data[0]  // choose to delete first album from the fetched ones
  
    await api
      .delete(`/api/albums/${albumDelete._id}`)  // send DELETE request for chosen album
      .expect(200)  // await reply with statuscode 200 (OK)
  
    const albumsAfter = await api.get('/api/albums')  // get all albums after deleting one
    expect(albumsAfter.body.data).toHaveLength(testAlbums.length - 1)  // await album count -1
  
    // find all album titles after deletion
    const titles = albumsAfter.body.data.map(album => album.title)
    // make sure that deleted album's title is not among the titles of remaining albums
    expect(titles).not.toContain(albumDelete.title)
    console.log('Deleted album title:', albumDelete.title)  // print deleted album title
    console.log('Remaining titles:', titles)  // print remaining album titles (confirm deletion)
  })


  // d) test that non-existent album returns error message
  test('deleting a non-existent album returns error NOT FOUND (404)', async () => {
    const wrongId = '012345678901234567890123'  // valid MongoDB ObjectId format, but doesn't exist

    await api
      .delete(`/api/albums/${wrongId}`)  // send DELETE request
      .expect(404)  // await reply with statuscode 404 (NOT FOUND)
    
    console.log('Trying to delete non-existent album id:', wrongId)  // print non-existing album Id
  })

  // close mongoose connection with afterAll-hook after tests are completed
  afterAll(() => {
    mongoose.connection.close()
  })
})
