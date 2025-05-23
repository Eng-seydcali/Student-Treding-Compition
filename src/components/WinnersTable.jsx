import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaCrown } from 'react-icons/fa'

const WinnersTable = () => {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/submissions?status=winner`)
        if (response.data.success) {
          setWinners(response.data.submissions.filter(sub => sub.isWinner))
        }
      } catch (error) {
        console.error('Error fetching winners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWinners()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading winners...</div>
  }

  if (winners.length === 0) {
    return null
  }

  return (
    <div className="bg-white shadow-card rounded-lg p-6 mb-10">
      <div className="flex items-center justify-center gap-2 mb-6">
        <FaCrown className="text-yellow-500 text-2xl" />
        <h2 className="text-2xl font-bold text-center">Competition Winners</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telegram Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {winners.map((winner) => (
              <tr key={winner._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaCrown className="text-yellow-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">{winner.fullName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{winner.telegramUsername}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(winner.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WinnersTable