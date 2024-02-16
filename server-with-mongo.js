import { createApp } from './app.js'
import { MovieModel } from './models/mongodb/movies.js'

createApp({
  movieModel: MovieModel
})
