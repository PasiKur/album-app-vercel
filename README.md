# Exercise set 08

## Setting up the testing environment

### a) Installing test libraries

First I installed testing library **Vitest** and **SuperTest** as dev dependencies:  
```bash
npm i vitest --save-dev
npm i supertest --save-dev
```

### b) ESLint settings

And since we have ESLint configured using the **eslint.config.js** file (with ES modules) and **globals** library is used, we must add **'globals.vitest'** in the file.  

This is to avoid ESLint giving errors for some words (such as **describe**, **test** and **expect**) in test files that we have in our test directory.

```js
globals: {
...globals.browser,
...globals.node,
...globals.vitest
}
```

### c) Configuring environment variables

For supporting both development and testing environments, the settings in **utils/config.js** file can be set to handle both cases differently. With usin RUNTIME_ENV variable we can:

- choose the preferable session secret key
- select the correct database URI (production vs. test)
- read token expiration durations
- set secure cookie settings for authentication

```js
// Variables chosen according to environment:
// a) secret key:
const SESSION_SECRET = process.env.RUNTIME_ENV === 'test'
  ? 'secret'  // test: use static/hardcoded secret key
  : process.env.SESSION_SECRET  // production: use secure secret key

// b) database:
const MONGODB_URI = process.env.RUNTIME_ENV === 'test'
  ? process.env.TEST_MONGODB_URI  // test: use test database
  : process.env.MONGODB_URI  // production: use main database

// set token expiration times in .env file
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '180d'
```

Now in **.env** file we can set different databases for production and testing.
Database names are defined as **App** (mainDB) and **testApp** (testDB).
These two databases were created by extracting the old database data in MongoDB Atlas and then importing it back and saved with new database name.

**Note:** Testing should always be made with test database to ensure that there will be no accidental data loss at the main database.

```js
MONGODB_URI='mongodb+srv://...mongodb.net/App?retryWrites=true'  // main database
TEST_MONGODB_URI='mongodb+srv://...mongodb.net/testApp?retryWrites=true...'  // test database
```

### d) Modifications to package.json scripts

Since I am using Windows instead of Linux, the cross-env package must first be installed for making variables to be added to scripts compatible to use on all operating systems.

```bash
npm install cross-env --save-dev
```

For selecting correct setups for different environments, we can now add variables **RUNTIME_ENV** and **NODE_ENV** to scripts in **package.json** (so the locig we defined in **config.js** can be used).

```js
"scripts": {
  "start": "cross-env RUNTIME_ENV=production NODE_ENV=production node server.js",
  "dev": "cross-env RUNTIME_ENV=development NODE_ENV=production nodemon server.js",
  "test": "cross-env RUNTIME_ENV=test NODE_ENV=production vitest tests",
}
```

### e) Running: app vs. tests

Now the app and tests can be run with using the correct environment settings:

```js
npm run dev   -> use MONGODB_URI (connect to main App database)
npm test      -> use TEST_MONGODB_URI (connect to testApp database)
```

## Testing

### Setting up data for testing

### a) Creating test files

Now we can start making setups for real data used in tests. First we create a folder **tests** with two files. These files will have following purposes for testing:  

**1. album_api.test.js:**  
This file contains the actual HTTP API test functions for album routes GET, POST and DELETE. The name album_api.test.js describes well that now we are testing API endpoints, not just the Album schema/model logic.

**2. test_albums.json:**  
This file contains the test data used in testing. It includes albums with album data fields according to album schema (artist, title, year, genre, tracks).


### b) 'Mocking' middlewares for testing purposes

**1. 'authUser':**  
Since API routes are protected with **'authUser'** middleware...

```js
router.get('/', authUser, getAllAlbums)
```

 ...all requests will need authorization check and logging in. This can be temporarily bypassed for testing purposes and re-enabled again when security check is needed.

Bypassing security check can be made by using Vitest's **'vi.mock()'** function. This function can be placed directly in the beginning of a test file. We can use this function to create a fake id for user and user role is set as default **'user'** during testing:

```js
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
```

**2. 'checkOwnership':**

Since DELETE route have also the check for ownership, we must remember to mock that middleware as well. We will do that later in this exercise set.

## 1. Test for route: GET/api/albums

This test will confirm that the exact number of albums returned matches the number in the test database.

First we can add following test data to file **test_albums.json**. This will initialize the test database with known set of albums.

```js
[
  {
    "artist": "Linkin Park",
    "title": "One More Light",
    "year": 2017,
    "genre": "Rock",
    "tracks": 10
  },
  {
    "artist": "R.E.M.",
    "title": "Automatic for the People",
    "year": 1992,
    "genre": "Rock",
    "tracks": 12
  },
  {
    "artist": "Neil Young",
    "title": "After the Gold Rush",
    "year": 1970,
    "genre": "Country",
    "tracks": 11
  }
]
```

The actual test function will be added to file **'album_api.test.js'**. We start by first importing the JSON album data:

```js
import testAlbums from './test_albums.json'
```

 Then we name the test pattern with a description string (here 'Album API tests'). Next step is to first delete data from test database and then fill it with new album data that we just added to file **'test_albums.json'**.

```js
describe('Album API tests', () => {  // name for the test pattern
  
  beforeEach(async () => {
    await Album.deleteMany({})  // first delete all resources from test database...
    await Album.create(testAlbums)  // ...and replace data with test data
  })
```

Actual test function for a single test will have:  
- name of the test
- defining the route (**/api/albums**)
- expect to receive HTTP statuscode 200 (OK)
- expect to receive JSON data
- expect to receive the same amount of albums as defined in JSON test data file

```js
// 1. test if albums can be received from api with correct length
test('test returns albums as JSON with correct length', async () => {
  const response = await api
    .get('/api/albums')  // route to albums
    .expect(200)  // await reply with statuscode 200 (OK)
    .expect('Content-Type', /application\/json/)  // wait to receive JSON data
  
  // expect correct length of album data (number of albums)
  expect(response.body.data).toHaveLength(testAlbums.length) 
})
```

After test is finished we must remember to close the database connection.
```js
afterAll(() => {
  mongoose.connection.close()
})
```

Now we can run the test with:

```bash
npm run test
```

**Following reply is received:**

a) test environment used, album data deleted, user created -> ok

![alt text](screenshots/E08_1_test_1a.png)

b) 3 albums inserted from test data -> ok 

![alt text](screenshots/E08_1_test_1b.png)

c) all albums queried, 1 test passed -> ok

![alt text](screenshots/E08_1_test_1c.png)

So this first test of GET/api/albums route was successful.


## 2. Test for route: POST/api/albums

This test will ensure that albums can be added successfully.

Now we face a little problem. Since we have created a fake id for user, that id is not found in database (user collection). This leads to POST request failing because the user can not be identified.

This can be fixed with adding the creating of test user to **'beforeEach'** -hook.

**Note:** This does not create a duplicate user because the actual user was not created before, the mocking only simulated authentication (did not create a database object). With this update the album is now connected to correct user and app does not crash.

```js
// create a test user with same user id than the mocked user
await User.create({
  _id: '1234567890abcdef12345678',  // same user id than mocked user
  name: 'testuser',
  email: 'test@example.com',
  password: 'testhash',
  role: 'user'
})
```

Actual test function starts by creating a new album as testdata with required fields.

```js
// b) test if a new album can be added
test('a new album can be added ', async () => {
  const newAlbum = {  // create a new object (Album) with predefined data fields
    artist: 'Led Zeppelin',
    title: 'Led Zeppelin IV',
    year: 1971,
    genre: 'Rock',
    tracks: 8
  }
```

Then we make a POST request to create a new album:

```js
await api  // call supertest api
.post('/api/albums')  // post request to route
.send(newAlbum)  // send new created album data
.expect(201)  // await reply with statuscode 201 (Created)
.expect('Content-Type', /application\/json/)  // wait to receive JSON data
```

After creating album we check that the **testAlbums** length (count) will be increased by one.  

```js
const response = await api.get('/api/albums')  // ask for request and save to variable
// array length should be 'one longer' than before (this case: 3 -> 4)
expect(response.body.data).toHaveLength(testAlbums.length + 1)
```

Finally we find the created album from the test database and compare it's fields with the data we sent when we created the album. For finding out if album count was increased and correct album data was created, we can use console logs to find the info from the output.

```js
// check album count after creating a new album
console.log('Album count after POST:', response.body.data.length)

// find the new created album from test database albums (with same title as the album in test database)
const created = response.body.data.find(album => album.title === newAlbum.title)

// check album data after creating album
console.log('Created album:', created)

// make sure that created album matches with the newAlbum (the album data that was send when creating album)
expect(created).toMatchObject(newAlbum)
```

**When running the test, following reply is received:**

a) albums and users cleared before running the test and new test user created

![alt text](screenshots/E08_2_test2a.png)

b) **new album was added**, new test user is now the owner of the album

User was added as the owner of the album and user's data was updated (now user is the owner of the album)

![](screenshots/E08_2_test2b.png)

c) **album count was increased by one** (3 -> 4) and new album data matches with the album data that we sent when we created the new album

![alt text](screenshots/E08_2_test2c.png)

Tests seems to have passed.

![alt text](screenshots/E08_2_test2c2.png)


## 3. Test for route: DELETE/api/albums

Now we must remember, that the **'checkOwnership'** middleware is also used in DELETE route:

```js
router.delete('/:id', authUser, checkOwnership, deleteAlbum)
```

So we must mock that middleware as well. This allows us to bypass the security logic.

```js
// bypass checkOwnership middleware during tests for DELETE route
vi.mock('../middleware/checkOwnership.js', () => ({
  default: (req, res, next) => next()
}))
```

### 3.1 Test that album can be deleted

This test function now starts by first finding all the albums from the database and then the album to be deleted is selected (here the first album of the fetched ones).

```js
const albumsAll = await api.get('/api/albums')  // get all albums from test database, save data to variable
const albumDelete = albumsAll.body.data[0]  // choose to delete first album from the fetched ones
```

Then we send a DELETE request for chosen album and after that fetch all the remaining albums. We wait the album count to be decreased by one.

```js
const albumsAfter = await api.get('/api/albums')  // get all albums after deleting one
expect(albumsAfter.body.data).toHaveLength(testAlbums.length - 1)  // await album count -1
```

Next step is to find the album titles after deletion and make sure that the deleted album's title is not among the titles of the remaining albums.

```js
// find all album titles after deletion
const titles = albumsAfter.body.data.map(album => album.title)
// make sure that deleted album's title is not among the titles of remaining albums
expect(titles).not.toContain(albumDelete.title)
```

We can now confirm that the album is successfully deleted. This can be done by first printing the title of deleted album and after that the titles of all remaining albums.

```js
console.log('Deleted album title:', albumDelete.title)  // print deleted album title
console.log('Remaining titles:', titles)  // print remaining album titles (confirm deletion)
```

### 3.2 Test for trying to delete non-existing album

Finally we want to handle a case of trying to delete an album that does not exist. This can be done by first initializing an invalid Id. Then we send a DELETE request with that id and wait for an error, a statuscode 404 (NOT FOUND).

```js
// d) test that non-existent album returns error message
test('deleting a non-existent album returns error NOT FOUND (404)', async () => {
  const wrongId = '012345678901234567890123'  // valid MongoDB ObjectId format, but doesn't exist

  await api
    .delete(`/api/albums/${wrongId}`)  // send DELETE request
    .expect(404)  // await reply with statuscode 404 (NOT FOUND)
```

**When running the test, following reply is received:**

a) find all albums, select one album and delete it, find all albums again, deleted album not found among remaining albums.

**-> album succesfully deleted**

![alt text](screenshots/E08_3_test3a.png)

b) try to delete album with 'fake Id', API test passes that expects and error (statuscode 404 NOT FOUND)

**-> API handles this case gracefully**

![alt text](screenshots/E08_3_test3b.png)

All test functionalities seem to be working as expected.


## 4. Deploying the application

I decided to use **Vercel** as the hosting platform for deploying the album abb collection to the cloud.

### a) Setting up the app for deployment

In Vercel, the Express API:s work as functions. So we create one serverless function which then runs every time someone makes an request to our API.

In order to get our app to run in Vercel, we will need a **vercel.json** file in the root the project. This will tell Vercel:

- the entry point (app.js)
- routing the requests to the app

 which maps the entire app and all it's routes to a serverless function (app.js) and specifies the build.

```js
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",  // program file of the app (serverless function to be run)
      "use": "@vercel/node"  // runs with node
    }
  ],
  "routes": [
    {
      "src": "/(.*)",  // all routes, matches with all requests
      "dest": "app.js"  // forward all requests to our app (has own routers)
    }
  ]
}
```

After this we must remember to install vercel from CLI:

```bash
npm i -g vercel
```


### b) Logging in to Vercel and creating a new project



```js
// used by Vercel deployment (app.js is the entry point for serverless functions)
"start:vercel": "node app.js",
```