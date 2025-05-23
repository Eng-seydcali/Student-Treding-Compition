import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 max-w-xs mx-auto">
            <FaArrowLeft /> Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound