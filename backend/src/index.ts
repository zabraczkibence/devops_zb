import express, { type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose, { Schema, type Document, type Model } from 'mongoose'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/appdb'

interface MessageDocument extends Document {
  text: string
}

const messageSchema = new Schema<MessageDocument>(
  {
    text: { type: String, required: true },
  },
  { timestamps: true }
)

const MessageModel: Model<MessageDocument> =
  mongoose.models.Message || mongoose.model<MessageDocument>('Message', messageSchema)

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.get('/api/messages', async (_req: Request, res: Response) => {
  try {
    const messages = await MessageModel.find().sort({ createdAt: 1 }).lean()
    const formatted = messages.map((m: any) => ({
      id: m._id.toString(),
      text: m.text,
    }))
    res.json(formatted)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching messages', err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

app.post('/api/messages', async (req: Request, res: Response) => {
  const { text } = req.body
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' })
  }

  try {
    const created = await MessageModel.create({ text })
    res.status(201).json({ id: created._id.toString(), text: created.text })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating message', err)
    res.status(500).json({ error: 'Failed to create message' })
  }
})

export async function startServer() {
  try {
    await mongoose.connect(MONGO_URI)
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on port ${PORT}`)
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  startServer()
}

export default app
