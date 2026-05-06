import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import TimelineSidebar from './components/TimelineSidebar'
import HeroPage from './pages/HeroPage'
import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import TagsPage from './pages/TagsPage'
import AboutPage from './pages/AboutPage'
import AuthorPage from './pages/AuthorPage'
import EggPage from './pages/EggPage'

// 页面布局组件
const Layout = ({ children }) => {
  const location = useLocation()
  const [isInHeroMode, setIsInHeroMode] = useState(false)

  // 统一管理 body class - 不使用 cleanup，避免路由切换时闪烁
  useEffect(() => {
    const isHeroPage = location.pathname === '/'
    const isArticlesPage = location.pathname === '/articles'

    if (isHeroPage) {
      // Hero 页面，隐藏顶栏
      document.body.classList.add('hero-view')
      document.body.classList.remove('show-header', 'from-hero-transition')
    } else if (isArticlesPage) {
      // 文章列表页面（从 Hero 导航过来）
      document.body.classList.remove('hero-view')
      document.body.classList.add('show-header')
    } else {
      // 其他页面
      document.body.classList.remove('hero-view', 'from-hero-transition')
      document.body.classList.add('show-header')
    }
    // 不设置 cleanup，避免路由切换时 class 被移除导致闪烁
  }, [location.pathname])

  // 监听 body class 变化
  useEffect(() => {
    const checkHeroMode = () => {
      const hasHeroView = document.body.classList.contains('hero-view')
      setIsInHeroMode(hasHeroView)
    }

    // 初始检查
    checkHeroMode()

    // 使用 MutationObserver 监听 class 变化
    const observer = new MutationObserver(checkHeroMode)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    // 也监听滚动事件，因为 class 可能在滚动时变化
    const handleScroll = () => {
      checkHeroMode()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 在文章详情页隐藏侧边栏
  const showSidebar = !location.pathname.startsWith('/article/')
  // 在首页 Hero 视图时隐藏侧边栏
  const isHomePage = location.pathname === '/'

  return (
    <>
      <main className={`main ${isHomePage && isInHeroMode ? 'fullscreen-mode' : ''}`}>
        {showSidebar ? (
          <div className={`layout-with-sidebar ${isHomePage && isInHeroMode ? 'hide-sidebar' : ''}`}>
            <div className="main-content">{children}</div>
            {!(isHomePage && isInHeroMode) && <TimelineSidebar />}
          </div>
        ) : (
          children
        )}
      </main>
      <Footer className={isHomePage && isInHeroMode ? 'footer-hidden' : ''} />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Layout>
          <Routes>
            <Route path="/" element={<HeroPage />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:tag" element={<ArticleList />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/author/:id" element={<AuthorPage />} />
            <Route path="/egg" element={<EggPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App
