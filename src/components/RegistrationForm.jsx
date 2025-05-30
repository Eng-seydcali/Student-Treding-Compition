import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FaCloudUploadAlt } from 'react-icons/fa'

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    telegramUsername: '',
    pocketOptionId: '',
  })
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [competitionActive, setCompetitionActive] = useState(false)

  useEffect(() => {
    const checkCompetitionStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/competition/status`)
        if (response.data.success) {
          setCompetitionActive(response.data.isActive)
        }
      } catch (error) {
        console.error('Error checking competition status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkCompetitionStatus()
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      setScreenshot(acceptedFiles[0])
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.telegramUsername || !formData.pocketOptionId || !screenshot) {
      toast.error('fadlan soo gali sawirka screenshot ka ah ')
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('fullName', formData.fullName)
      submitData.append('telegramUsername', formData.telegramUsername)
      submitData.append('pocketOptionId', formData.pocketOptionId)
      submitData.append('screenshot', screenshot)

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/submissions`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Registration successful!')
        setRegistered(true)
        setFormData({
          fullName: '',
          telegramUsername: '',
          pocketOptionId: '',
        })
        setScreenshot(null)
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (!competitionActive) {
    return null
  }

  if (registered) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mt-6 mb-2">Registered Successfully!</h2>
          <p className="text-gray-600 mb-6">Your submission has been received and is pending review.</p>
          <button
            onClick={() => setRegistered(false)}
            className="btn-primary"
          >
            Register Another Entry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-center">Join the Competition</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="input-label">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            className="input-field"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="telegramUsername" className="input-label">
            Telegram Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="telegramUsername"
            name="telegramUsername"
            placeholder="@username"
            className="input-field"
            value={formData.telegramUsername}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="pocketOptionId" className="input-label">
            Pocket Option Account ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pocketOptionId"
            name="pocketOptionId"
            placeholder="Enter your Pocket Option ID"
            className="input-field"
            value={formData.pocketOptionId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="input-label">
            Upload Screenshot <span className="text-red-500">*</span>
          </label>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
              screenshot ? 'border-primary-300 bg-primary-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {screenshot ? (
              <div className="flex flex-col items-center">
                <img 
                  src={URL.createObjectURL(screenshot)} 
                  alt="Screenshot preview" 
                  className="max-h-40 mb-3 rounded" 
                />
                <p className="text-sm text-gray-500">Click or drag to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF (max. 5MB)</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Submit Entry'}
        </button>
      </form>
    </div>
  )
}

export default RegistrationForm