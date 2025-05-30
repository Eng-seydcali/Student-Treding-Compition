import { Component } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
          <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-center">We apologize for the inconvenience. Please try refreshing the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary