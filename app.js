import express, { json } from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

// import fs from 'node:fs'
// const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'))

// leer un json en ECModule (recomendado)
// import { createRequire } from 'node:module'
// const require = createRequire(import.meta.url) //import.meta.url tiene es la ubic actual
// const movies = require('./movies.json')

// app.options('/movies/:id', (req, res) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
//   res.sendStatus(200)
// })

export const createApp = ({ movieModel }) => {
  const app = express()
  app.use(json())
  app.use(corsMiddleware())
  app.disable('x-powered-by')

  app.use('/movies', createMovieRouter({ movieModel }))

  const PORT = process.env.PORT ?? 1234

  app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`)
  })
}
