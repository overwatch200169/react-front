import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">📝</span>
          <span>我的博客</span>
        </Link>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            🔍
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
        </nav>
      </div>
    </header>
  )
}

export default Header
