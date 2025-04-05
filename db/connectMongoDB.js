import mongoose from 'mongoose'
import chalk from 'chalk'

const connectMongoDB = async (url) => {
  mongoose.set('debug', true)

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 1000,
    })
    console.log(chalk.green('Connection to MongoDB ok'))
  } catch (error) {
    console.error(chalk.red('MongoDB connection error:'), error)
    process.exit(1)
  }
}

export default connectMongoDB
