import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaPlay, FaStop } from 'react-icons/fa'

const CompetitionControl = () => {
  const [loading, setLoading] = useState(false)

  const startCompetition = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/competition/start`,
        {
          startTime: new Date(),
          duration: 180 // 3 hours
        },
        { withCredentials: true }
      )
      
      if (response.data.success) {
        toast.success('Competition started successfully')
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
    <div className="bg-white shadow-card rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Competition Control</h2>
      <div className="flex gap-4">
        <button
          onClick={startCompetition}
          disabled={loading}
          className="btn-primary py-2 flex-1 bg-green-500 hover:bg-green-600"
        >
          <FaPlay className="inline mr-2" /> Start Competition
        </button>
        
        <button
          onClick={endCompetition}
          disabled={loading}
          className="btn-primary py-2 flex-1 bg-red-500 hover:bg-red-600"
        >
          <FaStop className="inline mr-2" /> End Competition
        </button>
      </div>
    </div>
  )
}

export default CompetitionControl