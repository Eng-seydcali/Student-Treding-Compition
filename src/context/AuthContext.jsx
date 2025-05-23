import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/current`, {
          withCredentials: true
        })
        
        if (res.data.success) {
          setUser(res.data.user)
        }
      } catch (err) {
        console.error('Not authenticated')
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      })
      
      if (res.data.success) {
        setUser(res.data.user)
        return { success: true }
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
        withCredentials: true
      })
      setUser(null)
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}