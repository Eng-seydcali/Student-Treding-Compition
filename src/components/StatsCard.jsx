import PropTypes from 'prop-types'
import LoadingSkeleton from './LoadingSkeleton'

const StatsCard = ({ icon, count, label, bgColor = 'bg-blue-50', loading = false }) => {
  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="card flex flex-col items-center justify-center py-6">
      <div className={`${bgColor} p-3 rounded-full mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  )
}

StatsCard.propTypes = {
  icon: PropTypes.node.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
  loading: PropTypes.bool
}

export default StatsCard