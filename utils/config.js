import 'dotenv/config'  // import data from .env file
const PORT = process.env.PORT  // use server port from .env file
const RUNTIME_ENV = process.env.RUNTIME_ENV  // initialize runtime environment variable

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

// Convert duration strings to milliseconds for cookie maxAge
const parseDuration = (duration) => {
  const unit = duration.slice(-1)
  const value = parseInt(duration.slice(0, -1))
  
  switch(unit) {
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return value * 1000  // default value = 1 second
  }
}

// security settings according to environment
const cookieOptions = {
  accessToken: {  // open, default access
    httpOnly: false,
    secure: RUNTIME_ENV === 'production',
    maxAge: parseDuration(ACCESS_TOKEN_EXPIRES_IN),
    sameSite: 'None',
    // domain: 'localhost'
  },
  refreshToken: {  // secure, HTTP-only
    httpOnly: true,
    secure: RUNTIME_ENV === 'production',
    maxAge: parseDuration(REFRESH_TOKEN_EXPIRES_IN),
    sameSite: 'None',
    // domain: 'localhost'
  }
}

export default {
  MONGODB_URI,
  PORT,
  SESSION_SECRET,
  RUNTIME_ENV,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  cookieOptions,
  parseDuration
}
