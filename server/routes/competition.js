import express from 'express'
import CompetitionSettings from '../models/CompetitionSettings.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get competition status
router.get('/status', async (req, res) => {
  try {
    const settings = await CompetitionSettings.findOne().sort({ createdAt: -1 })
    
    if (!settings) {
      return res.status(200).json({
        success: true,
        isActive: false,
        message: 'No competition scheduled'
      })
    }

    const now = new Date()
    const endTime = new Date(settings.startTime.getTime() + settings.duration * 60000)
    const isActive = settings.isActive && now >= settings.startTime && now < endTime
    
    res.status(200).json({
      success: true,
      isActive,
      startTime: settings.startTime,
      duration: settings.duration,
      endTime
    })
  } catch (error) {
    console.error('Get competition status error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Start new competition - admin only
router.post('/start', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { startTime, duration } = req.body
    
    // Deactivate any existing competitions
    await CompetitionSettings.updateMany({}, { isActive: false })
    
    // Create new competition
    const settings = new CompetitionSettings({
      startTime: startTime || new Date(),
      duration: duration || 180, // 3 hours default
      isActive: true
    })
    
    await settings.save()
    
    res.status(201).json({ success: true, settings })
  } catch (error) {
    console.error('Start competition error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// End competition - admin only
router.post('/end', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await CompetitionSettings.updateMany({}, { isActive: false })
    res.status(200).json({ success: true, message: 'Competition ended' })
  } catch (error) {
    console.error('End competition error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router