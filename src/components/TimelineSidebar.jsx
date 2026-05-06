import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getMonthlyAggregation } from '../services/api'
import { CalendarOutlined } from '@ant-design/icons'

const TimelineSidebar = () => {
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true)
        const data = await getMonthlyAggregation()
        // 过滤掉数量为0的月份，并转换格式
        const filtered = (data.monthly_stats || []).filter(item => item.doc_count > 0)
        setMonthlyData(filtered)
        setError(null)
      } catch (err) {
        setError('加载归档失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [])

  // 按年份分组
  const groupedByYear = monthlyData.reduce((acc, item) => {
    const year = item.month.substring(0, 4)
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(item)
    return acc
  }, {})

  // 转换月份格式
  const formatMonth = (dateStr) => {
    const [, month] = dateStr.split('-')
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    return monthNames[parseInt(month) - 1] || dateStr
  }

  const handleMonthClick = (month) => {
    navigate(`/?date_year_month=${month}`)
  }

  if (loading) {
    return (
      <aside className="timeline-sidebar">
        <div className="timeline-header">
          <span className="timeline-icon"><CalendarOutlined /></span>
          <h3>文章归档</h3>
          <button className="timeline-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
        {!collapsed && (
          <div className="timeline-loading">
            <div className="loading-spinner small"></div>
          </div>
        )}
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="timeline-sidebar">
        <div className="timeline-header">
          <span className="timeline-icon"><CalendarOutlined /></span>
          <h3>文章归档</h3>
          <button className="timeline-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
        {!collapsed && (
          <div className="timeline-error">{error}</div>
        )}
      </aside>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <aside className="timeline-sidebar">
        <div className="timeline-header">
          <span className="timeline-icon"><CalendarOutlined /></span>
          <h3>文章归档</h3>
          <button className="timeline-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
        {!collapsed && (
          <div className="timeline-empty">暂无归档</div>
        )}
      </aside>
    )
  }

  const years = Object.keys(groupedByYear).sort((a, b) => b - a)

  return (
    <aside className={`timeline-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="timeline-header">
        <span className="timeline-icon"><CalendarOutlined /></span>
        <h3>文章归档</h3>
        <button className="timeline-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      {!collapsed && (
        <div className="timeline-content">
          {years.map(year => (
            <div key={year} className="timeline-year">
              <div className="timeline-year-label">
                <span className="year-dot"></span>
                <span className="year-text">{year}</span>
              </div>
              <div className="timeline-months">
                {groupedByYear[year]
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map(item => (
                    <button
                      key={item.month}
                      className={`timeline-month ${
                        location.search.includes(`date_year_month=${item.month}`) ? 'active' : ''
                      }`}
                      onClick={() => handleMonthClick(item.month)}
                    >
                      <span className="month-name">{formatMonth(item.month)}</span>
                      <span className="month-count">{item.doc_count}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

export default TimelineSidebar
