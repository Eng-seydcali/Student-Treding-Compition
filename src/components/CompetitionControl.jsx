import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaPlay, FaStop, FaClock } from 'react-icons/fa'

const CompetitionControl = () => {
  const [loading, setLoading] = useState(false)
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [duration, setDuration] = useState({
    value: 3,
    unit: 'hours'
  })

  const startCompetition = async () => {
    setLoading(true)
    try {
      // Convert duration to minutes
      const durationInMinutes = duration.unit === 'hours' 
        ? duration.value * 60 
        : duration.unit === 'days' 
          ? duration.value * 24 * 60 
          : duration.value

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/competition/start`,
        {
          startTime: new Date(),
          duration: durationInMinutes
        },
        { withCredentials: true }
      )
      
      if (response.data.success) {
        toast.success('Competition started successfully')
        setShowDurationModal(false)
      }
    } catch (error) {
      console.error('Error starting competition:', error)
      toast.error('Failed to start competition')
    } finally {
      setLoading(false)
    }
  }

  const endCompetition = async () => {
    if (!confirm('Are you sure you want to end the competition?')) return
    
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/competition/end`,
        {},
        { withCredentials: true }
      )
      
      if (response.data.success) {
        toast.success('Competition ended successfully')
      }
    } catch (error) {
      console.error('Error ending competition:', error)
      toast.error('Failed to end competition')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaClock className="text-white text-xl" />
          <h2 className="text-lg font-bold text-white">Competition Control</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDurationModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <FaPlay className="text-sm" /> Start
          </button>
          
          <button
            onClick={endCompetition}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <FaStop className="text-sm" /> End
          </button>
        </div>
      </div>

      {/* Duration Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Set Competition Duration</h3>
              <button 
                onClick={() => setShowDurationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={duration.value}
                  onChange={(e) => setDuration(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                  className="input-field flex-1"
                />
                <select
                  value={duration.unit}
                  onChange={(e) => setDuration(prev => ({ ...prev, unit: e.target.value }))}
                  className="input-field w-32"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-end">
              <button
                onClick={() => setShowDurationModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startCompetition}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {loading ? 'Starting...' : 'Start Competition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitionControl