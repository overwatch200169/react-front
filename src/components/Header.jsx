import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  FileTextOutlined, 
  SearchOutlined, 
  SunOutlined, 
  MoonOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  // 🟢 新增：控制移动端抽屉/悬浮状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/article')
    }
    return location.pathname.startsWith(path)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setIsMobileSearchOpen(false) // 搜索完成后关闭移动端搜索框
    setIsMobileMenuOpen(false)   // 搜索完成后关闭移动端菜单
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* 1. 左侧 Logo */}
        <a href="/" onClick={handleHomeClick} className="logo">
          <span className="logo-icon"><FileTextOutlined /></span>
          <span>我的博客</span>
        </a>

        {/* 2. 桌面端搜索框（移动端隐藏） */}
        <form onSubmit={handleSearch} className="search-form desktop-only">
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

        {/* 3. 桌面端导航条（移动端隐藏） */}
        <nav className="nav desktop-only">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>首页</Link>
          <Link to="/tags" className={`nav-link ${isActive('/tags') ? 'active' : ''}`}>标签</Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>关于</Link>
          <button 
            className="action-icon theme-toggle-btn desktop-only" 
            onClick={() => {
              const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
              setTheme(nextTheme);
            }}
            title={resolvedTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {resolvedTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </nav>

        {/* 4. 右侧图标功能区（视觉上高度和谐） */}
        <div className="header-actions">
          {/* 移动端专属：呼出搜索框按钮 */}
          <button 
            className="action-icon mobile-only" 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <SearchOutlined />
          </button>

          {/* 共有：主题切换按钮 */}
          

          {/* 移动端专属：呼出菜单按钮 */}
          <button 
            className="action-icon mobile-only" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* ==========================================
          🟢 移动端专属：悬浮搜索栏（极其节省空间）
          ========================================== */}
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <SearchOutlined className="mobile-search-icon" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" className="mobile-search-close" onClick={() => setIsMobileSearchOpen(false)}>
              <CloseOutlined />
            </button>
          </form>
        </div>
      )}

      {/* ==========================================
          🟢 移动端专属：下拉菜单（优雅滑出）
          ========================================== */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>首页</Link>
          <Link to="/tags" className={`mobile-nav-link ${isActive('/tags') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>标签</Link>
          <Link to="/about" className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>关于</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header