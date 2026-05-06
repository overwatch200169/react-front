import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileTextOutlined, SearchOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { isDark, toggleTheme } = useTheme()

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/article')
    }
    return location.pathname.startsWith(path)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // 跳转到首页并带上搜索参数
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    navigate('/')
    // 滚动到 Hero 区域（页面顶部）
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="header">
      <div className="header-content">
        <a href="/" onClick={handleHomeClick} className="logo">
          <span className="logo-icon"><FileTextOutlined /></span>
          <span>我的博客</span>
        </a>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <SearchOutlined />
          </button>
        </form>

        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            首页
          </Link>
          <Link to="/tags" className={`nav-link ${isActive('/tags') ? 'active' : ''}`}>
            标签
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
            关于
          </Link>
          {/* 主题切换按钮 - 仅桌面端显示 */}
          <button 
            className="theme-toggle-btn desktop-only" 
            onClick={toggleTheme}
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
