import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  telegramUsername: {
    type: String,
    required: true,
    trim: true
  },
  pocketOptionId: {
    type: String,
    required: true,
    trim: true
  },
  screenshotUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isWinner: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Submission = mongoose.model('Submission', submissionSchema)

export default Submission