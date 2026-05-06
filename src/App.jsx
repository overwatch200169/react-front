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

// 页面布局组件
const Layout = ({ children }) => {
  const location = useLocation()
  // 在文章详情页、首页Hero区、标签页、关于页面、彩蛋页面隐藏侧边栏
  const showSidebar = !location.pathname.startsWith('/article/') 
    && !location.pathname.startsWith('/tags')
    && location.pathname !== '/about'
    && location.pathname !== '/'
    && location.pathname !== '/egg'

  return (
    <>
      <main className="main">
        {showSidebar ? (
          <div className="layout-with-sidebar">
            <div className="main-content">{children}</div>
            <TimelineSidebar />
          </div>
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
