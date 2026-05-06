import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = window.scrollY
      const heroHeight = window.innerHeight

      // 检查特殊状态
      const isInHeroMode = document.body.classList.contains('hero-view')
      const shouldForceShow = document.body.classList.contains('show-header')

      // 如果需要强制显示（文章列表激活），直接显示 Header
      if (shouldForceShow) {
        setVisible(true)
      } else if (isInHeroMode) {
        // Hero 视图模式，隐藏 Header
        setVisible(false)
      } else {
        // 正常滚动逻辑
        if (currentScrollY < heroHeight * 0.3) {
          setVisible(false)
        } else {
          setVisible(true)
        }
      }
    }

    // 初始检查
    updateVisibility()

    // 监听滚动
    window.addEventListener('scroll', updateVisibility, { passive: true })

    // 监听 body class 变化（路由切换时）
    const observer = new MutationObserver(updateVisibility)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      observer.disconnect()
    }
  }, [])

  const isActive = (path) => {
    if (path === '/articles') {
      return location.pathname === '/articles' || location.pathname.startsWith('/article')
    }
    return location.pathname.startsWith(path)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // 跳转到文章列表并带上搜索参数
    navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
  }

  return (
    <header className={`header ${visible ? 'header-visible' : 'header-hidden'}`}>
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
          <Link to="/articles" className={`nav-link ${isActive('/articles') ? 'active' : ''}`}>
            文章
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
