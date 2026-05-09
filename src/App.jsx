import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import TimelineSidebar from './components/TimelineSidebar'
import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import TagsPage from './pages/TagsPage'
import AboutPage from './pages/AboutPage'
import AuthorPage from './pages/AuthorPage'
import EggPage from './pages/EggPage'
import { useTheme } from './context/ThemeContext'
import { useEffect } from 'react'

// 页面布局组件
const Layout = ({ children }) => {
  const location = useLocation()
const { theme, setTheme } = useTheme();

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth <= 768) {
      // 📱 移动端准则：强制回归系统模式
      if (theme !== 'system') {
        setTheme('system');
      }
    }
  };
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [theme, setTheme]);
  // 在文章详情页、标签页、关于页面、彩蛋页面隐藏侧边栏
  const showSidebar = !location.pathname.startsWith('/article/') 
    && !location.pathname.startsWith('/tags')
    && location.pathname !== '/about'
    && location.pathname !== '/egg'

  return (
    <>
      <main className="main">
        {showSidebar ? (
          <>
            {/* 桌面端布局 - 只用于标签详情页 */}
            {location.pathname !== '/' && location.pathname.startsWith('/tags/') && (
              <div className="desktop-layout">
                <div className="main-content">{children}</div>
                <TimelineSidebar />
              </div>
            )}
            {/* 首页和作者页面直接渲染 children */}
            {(location.pathname === '/' || location.pathname.startsWith('/author/')) && children}
          </>
        ) : (
          children
        )}
      </main>
      <Footer />
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
            <Route path="/" element={<ArticleList />} />
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
