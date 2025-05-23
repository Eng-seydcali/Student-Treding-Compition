import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import StatsCard from '../components/StatsCard'
import {
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaEye,
  FaThumbsDown,
  FaCrown,
  FaSearch,
  FaDownload,
  FaSignOutAlt,
  FaTimes
} from 'react-icons/fa'

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    winners: 0
  })
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [filter])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, submissionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/submissions/dashboard-stats`, { 
          withCredentials: true 
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/submissions?status=${filter}`, { 
          withCredentials: true 
        })
      ])
      
      if (statsRes.data.success) {
        setStats(statsRes.data.stats)
      }
      
      if (submissionsRes.data.success) {
        setSubmissions(submissionsRes.data.submissions)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/submissions/${submissionId}/status`,
        { status: newStatus },
        { withCredentials: true }
      )
      
      if (res.data.success) {
        toast.success(`Submission marked as ${newStatus}`)
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating submission status:', error)
      toast.error('Failed to update submission')
    }
  }

  const handleWinnerToggle = async (submissionId, isWinner) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/submissions/${submissionId}/winner`,
        { isWinner },
        { withCredentials: true }
      )
      
      if (res.data.success) {
        toast.success(isWinner ? 'Marked as winner' : 'Removed from winners')
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error updating winner status:', error)
      toast.error('Failed to update winner status')
    }
  }

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/submissions/export`, {
        withCredentials: true,
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'submissions.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export successful')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      submission.fullName.toLowerCase().includes(query) ||
      submission.telegramUsername.toLowerCase().includes(query) ||
      submission.pocketOptionId.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/dashboard/users" className="btn-outline">
                Manage Users
              </Link>
            )}
            <button 
              onClick={handleLogout} 
              className="btn-outline flex items-center gap-2 text-red-500 border-red-500 hover:bg-red-50"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard 
            icon={<FaUsers className="text-primary-500 text-xl" />}
            count={stats.total}
            label="Total"
            bgColor="bg-primary-100"
          />
          <StatsCard 
            icon={<FaCalendarAlt className="text-yellow-500 text-xl" />}
            count={stats.pending}
            label="Pending"
            bgColor="bg-yellow-100"
          />
          <StatsCard 
            icon={<FaTrophy className="text-green-500 text-xl" />}
            count={stats.approved}
            label="Approved"
            bgColor="bg-green-100"
          />
          <StatsCard 
            icon={<FaThumbsDown className="text-red-500 text-xl" />}
            count={stats.rejected}
            label="Rejected"
            bgColor="bg-red-100"
          />
          <StatsCard 
            icon={<FaCrown className="text-purple-500 text-xl" />}
            count={stats.winners}
            label="Winners"
            bgColor="bg-purple-100"
          />
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search by name, telegram, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="input-field"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="winner">Winners</option>
            </select>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="btn-outline flex items-center   gap-2 whitespace-nowrap"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>

        {/* Submissions Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telegram
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pocket Option ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screenshot
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Winner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{submission.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{submission.telegramUsername}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{submission.pocketOptionId}</div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => setSelectedImage(submission.screenshotUrl)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEye className="inline mr-1" /> View
                </button>
              </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            submission.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.isWinner ? 
                          <span className="text-purple-600 font-semibold flex items-center">
                            <FaCrown className="mr-1" /> Yes
                          </span> : 
                          <span>-</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          className="text-sm border border-gray-300 rounded-md p-1 mr-2"
                          value={submission.status}
                          onChange={(e) => handleStatusChange(submission._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        
                        <button
                          onClick={() => handleWinnerToggle(submission._id, !submission.isWinner)}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded
                            ${submission.isWinner ? 
                              'bg-red-100 text-red-700 hover:bg-red-200' : 
                              'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                        >
                          {submission.isWinner ? 'Remove Winner' : 'Mark Winner'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full h-96 bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
            <img
              src={selectedImage}
              alt="Screenshot"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard