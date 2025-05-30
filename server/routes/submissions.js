import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import Submission from '../models/Submission.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Public stats for homepage - Add caching
let statsCache = {
  data: null,
  timestamp: 0
}

const CACHE_DURATION = 10000 // 1 minute cache

// Get submissions with optional filtering and pagination - admin only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    let query = {}

    if (status && status !== 'all') {
      if (status === 'winner') {
        query.isWinner = true
      } else {
        query.status = status
      }
    }

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean()

    const total = await Submission.countDocuments(query)

    res.status(200).json({
      success: true,
      submissions,
      total
    })
  } catch (error) {
    console.error('Fetch submissions error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})


router.get('/stats', async (req, res) => {
  try {
    const now = Date.now()
    
    // Return cached data if valid
    if (statsCache.data && (now - statsCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        stats: statsCache.data
      })
    }

    // If no cache or expired, fetch new data
    const [participants, validSubmissions] = await Promise.all([
      Submission.countDocuments().lean(),
      Submission.countDocuments({ status: 'approved' }).lean()
    ])
    
    // Update cache
    statsCache = {
      data: { participants, validSubmissions },
      timestamp: now
    }
    
    res.status(200).json({
      success: true,
      stats: statsCache.data
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Dashboard stats for admin - Add caching
let dashboardStatsCache = {
  data: null,
  timestamp: 0
}

router.get('/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    const now = Date.now()
    
    // Return cached data if valid
    if (dashboardStatsCache.data && (now - dashboardStatsCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        stats: dashboardStatsCache.data
      })
    }

    // If no cache or expired, fetch new data using Promise.all for parallel execution
    const [total, pending, approved, rejected, winners] = await Promise.all([
      Submission.countDocuments().lean(),
      Submission.countDocuments({ status: 'pending' }).lean(),
      Submission.countDocuments({ status: 'approved' }).lean(),
      Submission.countDocuments({ status: 'rejected' }).lean(),
      Submission.countDocuments({ isWinner: true }).lean()
    ])
    
    // Update cache
    dashboardStatsCache = {
      data: { total, pending, approved, rejected, winners },
      timestamp: now
    }
    
    res.status(200).json({
      success: true,
      stats: dashboardStatsCache.data
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Delete all submissions - admin only
router.delete('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Submission.deleteMany({})
    
    // Clear caches
    statsCache = { data: null, timestamp: 0 }
    dashboardStatsCache = { data: null, timestamp: 0 }
    
    res.status(200).json({ 
      success: true, 
      message: 'All submissions deleted successfully' 
    })
  } catch (error) {
    console.error('Delete all submissions error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get all submissions - Add pagination and lean queries
router.get('/winners', async (req, res) => {
  try {
    const winners = await Submission.find({ isWinner: true, status: 'approved' }).sort({ createdAt: -1 })
    res.json({ success: true, submissions: winners })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to fetch winners' })
  }
})


// Create submission - public
router.post('/', async (req, res) => {
  try {
    const { fullName, phoneNumber, pocketOptionId } = req.body
    
    // Validate input
    if (!fullName || !phoneNumber || !pocketOptionId) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' })
    }
    
    if (!req.files || !req.files.screenshot) {
      return res.status(400).json({ success: false, message: 'Please upload a screenshot' })
    }
    
    const screenshot = req.files.screenshot
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(screenshot.mimetype)) {
      return res.status(400).json({ success: false, message: 'Please upload a valid image file (JPG, PNG, GIF)' })
    }
    
    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${screenshot.name.replace(/\s/g, '_')}`
    const uploadPath = path.join(__dirname, '../uploads', filename)
    
    // Move file to uploads directory
    await screenshot.mv(uploadPath)
    
    // Create submission with relative path
    const submission = new Submission({
      fullName,
      phoneNumber,
      pocketOptionId,
      screenshotUrl: `/uploads/${filename}`
    })
    
    await submission.save()
    
    // Clear caches
    statsCache = { data: null, timestamp: 0 }
    dashboardStatsCache = { data: null, timestamp: 0 }
    
    res.status(201).json({ success: true, submission })
  } catch (error) {
    console.error('Create submission error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Update submission status - admin only
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const submissionId = req.params.id

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    // Update status directly with findByIdAndUpdate
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { status },
      { new: true, runValidators: false }
    )

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    // Clear caches
    statsCache = { data: null, timestamp: 0 }
    dashboardStatsCache = { data: null, timestamp: 0 }

    res.status(200).json({ success: true, submission })
  } catch (error) {
    console.error('Update submission status error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Toggle winner status - admin only
router.put('/:id/winner', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isWinner } = req.body
    const submissionId = req.params.id

    // Update isWinner directly with findByIdAndUpdate
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { isWinner },
      { new: true, runValidators: false }
    )

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }

    // Clear caches
    statsCache = { data: null, timestamp: 0 }
    dashboardStatsCache = { data: null, timestamp: 0 }

    res.status(200).json({ success: true, submission })
  } catch (error) {
    console.error('Update winner status error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})


// Export submissions as CSV - admin only
router.get('/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 })
    
    // Create CSV header
    let csv = 'Full Name,Phone Number,Pocket Option ID,Status,Winner,Submission Date\n'
    
    // Add rows
    submissions.forEach(submission => {
      const row = [
        `"${submission.fullName}"`,
        `"${submission.phoneNumber}"`,
        `"${submission.pocketOptionId}"`,
        `"${submission.status}"`,
        `"${submission.isWinner ? 'Yes' : 'No'}"`,
        `"${new Date(submission.createdAt).toLocaleDateString()}"`
      ]
      csv += row.join(',') + '\n'
    })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv')
    
    res.send(csv)
  } catch (error) {
    console.error('Export submissions error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router