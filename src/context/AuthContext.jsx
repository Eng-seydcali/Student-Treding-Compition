import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  // Configure axios defaults
  axios.defaults.withCredentials = true
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (!token) {
          setLoading(false)
          return
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/current`,
          axiosConfig
        )
        
        if (res.data.success) {
          setUser(res.data.user)
        }
      } catch (err) {
        console.error('Not authenticated:', err)
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [token])

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        axiosConfig
      )
      
      if (res.data.success) {
        const newToken = res.data.token
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(res.data.user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        return { success: true }
      }
    } catch (err) {
      console.error('Login error:', err)
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        axiosConfig
      )
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}