import { Link } from 'react-router-dom'
import { FaTrophy } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { isAuthenticated } = useAuth()

  return (
    <header className="bg-white shadow-sm py-4">
      <div className=" mx-5 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <FaTrophy className="text-primary-500" />
          <span>Student Trading Competition</span>
        </Link>
        
        {!isAuthenticated && (
          <Link to="/admin/login" className="btn-outline ">
            Admin Login
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header