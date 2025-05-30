import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaClock, FaExclamationTriangle } from 'react-icons/fa'
import LoadingSkeleton from './LoadingSkeleton'

const CompetitionTimer = () => {
  const [timeLeft, setTimeLeft] = useState(null)
  const [status, setStatus] = useState('loading')
  const [endTime, setEndTime] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchStatus = async () => {
      try {
        setStatus('loading')
        setError(null)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/competition/status`, {
          signal: controller.signal
        })
        if (!isMounted) return

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
        if (error.name === 'AbortError') return
        console.error('Error fetching competition status:', error)
        if (isMounted) {
          setError('Failed to load competition status')
          setStatus('error')
        }
      }
    }

    fetchStatus()
    const statusInterval = setInterval(fetchStatus, 30000) // Check every 30 seconds

    return () => {
      isMounted = false
      controller.abort()
      clearInterval(statusInterval)
    }
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
    const timerInterval = setInterval(updateTimer, 1000)
    return () => clearInterval(timerInterval)
  }, [endTime])

  if (status === 'loading') {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center mb-6">
        <LoadingSkeleton />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
        <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
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