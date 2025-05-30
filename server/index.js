import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import path from 'path'
import { fileURLToPath } from 'url'

// Routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import submissionRoutes from './routes/submissions.js'
import competitionRoutes from './routes/competition.js'

// Config
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// App setup
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://student-treding-compition.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
import fs from 'fs'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Serve uploaded files - Make uploads directory publicly accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/competition', competitionRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    // Create admin user if none exists
    import('./models/User.js').then(({ default: User }) => {
      User.findOne({ role: 'admin' }).then(adminUser => {
        if (!adminUser) {
          import('bcryptjs').then(({ default: bcrypt }) => {
            const password = 'admin123'
            const hashedPassword = bcrypt.hashSync(password, 10)
            
            const newAdmin = new User({
              name: 'Admin',
              email: 'admin@example.com',
              password: hashedPassword,
              role: 'admin'
            })
            
            newAdmin.save().then(() => {
              console.log('Default admin user created:')
              console.log('Email: admin@example.com')
              console.log('Password: admin123')
            })
          })
        }
      })
    })
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
  })

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})