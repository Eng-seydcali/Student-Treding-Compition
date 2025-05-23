import mongoose from 'mongoose'

const competitionSettingsSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 180 // 3 hours default
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const CompetitionSettings = mongoose.model('CompetitionSettings', competitionSettingsSchema)

export default CompetitionSettings