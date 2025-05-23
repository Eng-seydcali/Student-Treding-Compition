import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all users - admin only
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Create user - admin only
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' })
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    })
    
    await user.save()
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Update user - admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const userId = req.params.id
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Please provide name and email' })
    }
    
    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    // Check email uniqueness
    if (email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' })
      }
    }
    
    // Update fields
    user.name = name
    user.email = email
    user.role = role || user.role
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }
    
    await user.save()
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Delete user - admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id
    
    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    await User.findByIdAndDelete(userId)
    
    res.status(200).json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

export default router