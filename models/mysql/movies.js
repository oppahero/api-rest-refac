/* eslint-disable space-before-function-paren */
import mysql from 'mysql2/promise'
const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()
      const [genres] = await connection.query('SELECT  id, name FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre])
      if (genres.length < 1) return []

      const [{ id }] = genres

      const [movies] = await connection.query(`SELECT m.*, BIN_TO_UUID(m.id) id FROM movie m
        INNER JOIN movie_genres g ON g.movie_id = m.id
        WHERE g.genre_id = ?;`, [id])

      return movies
    }

    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie'
    )

    return movies
  }

  static async getById({ id }) {
    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id= UUID_TO_BIN(?);', [id]
    )

    if (movies.length === 0) return null
    return movies[0]
  }

  static async create({ input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year , director, duration, poster, rate) 
          VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ? );`,
        [title, year, director, duration, poster, rate]
      )
    } catch (error) {
      throw new Error('Error creating movie')
    }

    const [movies] = await connection.query(
      `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate 
        FROM movie WHERE id= UUID_TO_BIN(?);`, [uuid]
    )

    return movies[0]
  }

  static async delete({ id }) {
    const [movies] = await connection.query(
      'SELECT * FROM movie WHERE id= UUID_TO_BIN(?);', [id]
    )

    if (movies.length === 0) return false

    await connection.query(
      'DELETE FROM movie WHERE id= UUID_TO_BIN(?);', [id]
    )

    return true
  }

  static async update({ id, input }) {
    const [movies] = await connection.query(
      'SELECT * FROM movie WHERE id= UUID_TO_BIN(?);', [id]
    )

    if (movies.length === 0) return false

    const newMovie = { ...movies[0], ...input, id }
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate
    } = newMovie

    try {
      await connection.query(
        'UPDATE movie SET title=?, year=?, director=?, duration=?, poster=?, rate=? WHERE id= UUID_TO_BIN(?);',
        [title, year, director, duration, poster, rate, id]
      )
    } catch (error) {
      throw new Error('Error updating movie')
    }
    return newMovie
  }
}
