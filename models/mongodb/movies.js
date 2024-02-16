/* eslint-disable space-before-function-paren */
import { MongoClient, ObjectId } from 'mongodb'

const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)
const dbName = 'moviesdb'

async function connect() {
  try {
    await client.connect()
    const db = client.db(dbName)
    return db.collection('movies')
  } catch (error) {
    console.error('Error connecting to the database')
    console.error(error)
    await client.close()
  }
}

export class MovieModel {
  static async getAll({ genre }) {
    const collection = await connect()
    if (genre) {
      return collection.find({
        genre: {
          $elemMatch: {
            $regex: genre,
            $options: 'i'
          }
        }
      }).toArray()
    }

    return collection.find({}).toArray()
  }

  static async getById({ id }) {
    const collection = await connect()
    const objectId = new ObjectId(id)
    return collection.findOne({ _id: objectId })
  }

  static async create({ input }) {
    const collection = await connect()
    try {
      await collection.insertOne(input)
    } catch (error) {
      throw new Error('Error creating movie')
    }

    return {
      ...input
    }
  }

  static async delete({ id }) {
    const collection = await connect()
    const objectId = new ObjectId(id)
    const { deletedCount } = await collection.deleteOne({ _id: objectId })
    return deletedCount > 0
  }

  static async update({ id, input }) {
    const collection = await connect()
    const objectId = new ObjectId(id)

    const updated = await collection.findOneAndUpdate({ _id: objectId }, { $set: input }, { returnOriginal: false, returnDocument: 'after' })

    if (!updated) return false

    return updated
  }
}
