import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import Submission from '../models/Submission.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Public stats for homepage
router.get('/stats', async (req, res) => {
  try {
    const participants = await Submission.countDocuments()
    const validSubmissions = await Submission.countDocuments({ status: 'approved' })
    
    res.status(200).json({
      success: true,
      stats: {
        participants,
        validSubmissions
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Dashboard stats for admin
router.get('/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    const total = await Submission.countDocuments()
    const pending = await Submission.countDocuments({ status: 'pending' })
    const approved = await Submission.countDocuments({ status: 'approved' })
    const rejected = await Submission.countDocuments({ status: 'rejected' })
    const winners = await Submission.countDocuments({ isWinner: true })
    
    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        winners
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get all submissions - admin only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query
    let query = {}
    
    if (status && status !== 'all') {
      if (status === 'winner') {
        query.isWinner = true
      } else {
        query.status = status
      }
    }
    
    const submissions = await Submission.find(query).sort({ createdAt: -1 })
    
    res.status(200).json({ success: true, submissions })
  } catch (error) {
    console.error('Get submissions error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Create submission - public
router.post('/', async (req, res) => {
  try {
    const { fullName, telegramUsername, pocketOptionId } = req.body
    
    // Validate input
    if (!fullName || !telegramUsername || !pocketOptionId) {
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
    
    // Create submission
    const submission = new Submission({
      fullName,
      telegramUsername,
      pocketOptionId,
      screenshotUrl: `/uploads/${filename}`
    })
    
    await submission.save()
    
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
    
    const submission = await Submission.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }
    
    submission.status = status
    await submission.save()
    
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
    
    const submission = await Submission.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' })
    }
    
    submission.isWinner = isWinner
    await submission.save()
    
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
    let csv = 'Full Name,Telegram Username,Pocket Option ID,Status,Winner,Submission Date\n'
    
    // Add rows
    submissions.forEach(submission => {
      const row = [
        `"${submission.fullName}"`,
        `"${submission.telegramUsername}"`,
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