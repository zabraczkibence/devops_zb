import request from 'supertest'
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../../src/index'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri('appdb')

  process.env.MONGO_URI = uri
  process.env.NODE_ENV = 'test'

  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('Messages validation', () => {
  it('returns 400 when text is missing or invalid', async () => {
    // missing text
    await request(app).post('/api/messages').send({}).expect(400)

    // invalid type
    await request(app).post('/api/messages').send({ text: 123 }).expect(400)
  })
})
