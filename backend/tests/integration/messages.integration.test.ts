import request from 'supertest'
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app, { startServer } from '../../src/index'

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

describe('Messages API integration', () => {
  it('should create and list messages', async () => {
    const text = 'Hello from integration test'

    const createRes = await request(app)
      .post('/api/messages')
      .send({ text })
      .expect(201)

    expect(createRes.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        text,
      })
    )

    const listRes = await request(app).get('/api/messages').expect(200)

    expect(Array.isArray(listRes.body)).toBe(true)
    expect(listRes.body.some((m: any) => m.text === text)).toBe(true)
  })
})
