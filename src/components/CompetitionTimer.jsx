import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaClock } from 'react-icons/fa'

const CompetitionTimer = () => {
  const [timeLeft, setTimeLeft] = useState(null)
  const [status, setStatus] = useState('loading')
  const [endTime, setEndTime] = useState(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/competition/status`)
        if (response.data.success) {
          if (!response.data.isActive) {
            setStatus('closed')
            return
          }
          
          const end = new Date(response.data.endTime)
          setEndTime(end)
          setStatus('active')
        }
      } catch (error) {
        console.error('Error fetching competition status:', error)
        setStatus('error')
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!endTime) return

    const updateTimer = () => {
      const now = new Date()
      const diff = endTime - now

      if (diff <= 0) {
        setStatus('closed')
        setTimeLeft(null)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  if (status === 'loading') {
    return <div className="text-center py-4">Loading...</div>
  }

  if (status === 'error') {
    return <div className="text-center text-red-500 py-4">Error loading competition status</div>
  }

  if (status === 'closed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-red-700 mb-2">Competition Closed</h3>
        <p className="text-red-600">Registration is no longer available</p>
      </div>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center mb-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <FaClock className="text-primary-500" />
        <h3 className="text-xl font-bold text-primary-700">Registration Closes In</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="bg-white rounded-lg p-3">
          <div className="text-3xl font-bold text-primary-600">{timeLeft.hours}</div>
          <div className="text-sm text-primary-500">Hours</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-3xl font-bold text-primary-600">{timeLeft.minutes}</div>
          <div className="text-sm text-primary-500">Minutes</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-3xl font-bold text-primary-600">{timeLeft.seconds}</div>
          <div className="text-sm text-primary-500">Seconds</div>
        </div>
      </div>
    </div>
  )
}

export default CompetitionTimer