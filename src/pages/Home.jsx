import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../components/Header'
import RegistrationForm from '../components/RegistrationForm'
import { FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa'

const Home = () => {
  const [stats, setStats] = useState({
    participants: 0,
    validSubmissions: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/submissions/stats`)
        if (response.data.success) {
          setStats(response.data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary-500 text-white py-2 rounded-3xl m-5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-4xl font-bold mb-4">
              🎉 Win Amazing Prizes!
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Join our exclusive student trading competition with Pocket Option and win incredible rewards!
            </p>
            
            <div className="flex flex-wrap justify-center gap-8  my-5">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg py-3 px-4 text-center min-w-[110px]">
                <div className="text-2xl font-bold">$5,000+</div>
                <div className="text-white/80">Total Prizes</div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-white/80">Max Participants</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card flex flex-col items-center text-center p-8 rounded-2xl">
                <FaUsers className="text-primary-500 text-4xl mb-4" />
                <div className="text-4xl font-bold mb-2">{stats.participants}</div>
                <div className="text-gray-600">Total Participants</div>
              </div>
              
              <div className="card flex flex-col items-center text-center p-8 rounded-2xl">
                <FaClock className="text-warning-500 text-4xl mb-4" />
                <div className="text-xl font-bold mb-2">Time Remaining</div>
                <div className="text-gray-600">Competition in progress</div>
              </div>
              
              <div className="card flex flex-col items-center text-center p-8 rounded-2xl">
                <FaCheckCircle className="text-success-500 text-4xl mb-4" />
                <div className="text-4xl font-bold mb-2">{stats.validSubmissions}</div>
                <div className="text-gray-600">Valid Submissions</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Registration Form Section */}
        <section className="py-10 mb-20">
          <div className="container mx-auto px-80  max-w-full">
            <RegistrationForm />
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Milgo Technology.  All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home