import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' })
  }
}