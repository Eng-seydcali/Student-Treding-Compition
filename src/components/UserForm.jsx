import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import PropTypes from 'prop-types'

const UserForm = ({ onSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'user'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || (!initialData && !formData.password)) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      let response
      
      if (initialData) {
        // Update user
        const updateData = { ...formData }
        if (!updateData.password) delete updateData.password
        
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/users/${initialData._id}`, 
          updateData,
          { withCredentials: true }
        )
      } else {
        // Create new user
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/users`, 
          formData,
          { withCredentials: true }
        )
      }

      if (response.data.success) {
        toast.success(initialData ? 'User updated successfully!' : 'User created successfully!')
        if (onSuccess) onSuccess()
        
        if (!initialData) {
          setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
          })
        }
      }
    } catch (error) {
      console.error('User operation error:', error)
      toast.error(error.response?.data?.message || 'Operation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="input-label">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="input-field"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="input-label">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="input-field"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="input-label">
          Password {!initialData && <span className="text-red-500">*</span>}
          {initialData && <span className="text-sm text-gray-500 ml-2">(Leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="input-field"
          value={formData.password}
          onChange={handleChange}
          required={!initialData}
        />
      </div>

      <div>
        <label htmlFor="role" className="input-label">Role</label>
        <select
          id="role"
          name="role"
          className="input-field"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary mt-6"
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
        ) : initialData ? 'Update User' : 'Create User'}
      </button>
    </form>
  )
}

UserForm.propTypes = {
  onSuccess: PropTypes.func,
  initialData: PropTypes.object
}

export default UserForm