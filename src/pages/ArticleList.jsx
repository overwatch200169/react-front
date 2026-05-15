import { useTransition,useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { Pagination } from 'antd'
import { searchArticles, getArticles, getUserById } from '../services/api'
import { DownOutlined, UnorderedListOutlined, ClockCircleOutlined } from '@ant-design/icons'
import TimelineSidebar from '../components/TimelineSidebar'

const ArticleList = () => {
  const [articles, setArticles] = useState([])
  const [authorNames, setAuthorNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalArticles, setTotalArticles] = useState(0)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams] = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'timeline'
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const searchQuery = searchParams.get('search')
  const dateYearMonth = searchParams.get('date_year_month')
  const { tag } = useParams()
  const navigate = useNavigate()
  
  const heroImageUrl = 'https://pub-c487eb6882174c26a8f6e44dc041dac3.r2.dev/articles/8500f160-d359-4785-9cc0-2f86bdad0c43-1778234623.462131-articles.jpg'
  
  // 预加载 hero 图片
  useEffect(() => {
    const img = new Image()
    img.onload = () => setHeroImageLoaded(true)
    img.onerror = () => {
      setHeroImageFailed(true)
      // 加载失败时也设置为已加载，让图片可见（带错误状态）
      setHeroImageLoaded(true)
    }
    img.src = heroImageUrl
  }, [])

  const isHomePage = !searchQuery && !dateYearMonth && !tag

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchArticles()
    
  }, [tag, searchQuery, dateYearMonth, currentOffset, pageSize])

  const fetchAuthorName = async (userId) => {
    if (authorNames[userId] || !userId) return
    try {
      const user = await getUserById(userId)
      setAuthorNames(prev => ({ ...prev, [userId]: user.username }))
    } catch (err) {
      setAuthorNames(prev => ({ ...prev, [userId]: '未知作者' }))
    }
  }

  const fetchArticles = async () => {
    try {
      if (articles.length === 0) {
      setLoading(true);
    }

      let data
      let total = 0
      if (dateYearMonth) {
        const result = await searchArticles({ date_year_month: dateYearMonth, size: pageSize, offset: currentOffset })
        data = result?.items || result?.results || []
        total = result?.total || data.length
      } else if (searchQuery) {
        const result = await searchArticles({ q: searchQuery, size: pageSize, offset: currentOffset })
        data = result?.items || result?.results || []
        total = result?.total || data.length
      } else if (tag) {
        const result = await searchArticles({ tags: [tag], size: pageSize, offset: currentOffset })
        data = result?.items || result?.results || []
        total = result?.total || data.length
      } else {
        const result = await getArticles({ limit: pageSize, offset: currentOffset })
        data = result?.items || result?.results || result || []
        total = result?.total || data.length
      }

      setArticles(data || [])
      setTotalArticles(total)
      setError(null)

      const uniqueAuthorIds = [...new Set(data.map(a => a.author_id).filter(Boolean))]
      uniqueAuthorIds.forEach(id => fetchAuthorName(id))

    } catch (err) {
      setError('加载文章失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const pad = (num) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${year}-${month}-${day}`;
};
  const scrollToContent = () => {
    const contentSection = document.getElementById('articles-section')
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  const [isPending, startTransition] = useTransition();
  // 处理分页变化
  const handlePageChange = (page, newPageSize) => {
    startTransition(() => {
    // 如果 pageSize 发生变化，重置到第一页
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentOffset(0)
    } else {
      setCurrentOffset((page - 1) * pageSize)
    }
    
    // 滚动到文章列表顶部
    const articlesSection = document.getElementById('articles-section')
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  });
  }

  // 计算当前页码
  const currentPage = Math.floor(currentOffset / pageSize) + 1

  // 首页渲染 Hero 区域
  if (isHomePage && !searchQuery && !dateYearMonth && !tag) {
    return (
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg"></div>
          {!heroImageFailed && (
            <img
              src={heroImageUrl}
              alt=""
              className={`hero-image ${heroImageLoaded ? 'hero-image-loaded' : ''}`}
            />
          )}
          <div className="hero-content">
            <h1 className="hero-title">偶活，我要偶活</h1>
            <p className="hero-subtitle">地下偶像把我害惨了（不是）</p>
          </div>
          <button className="scroll-indicator" onClick={scrollToContent} aria-label="向下滚动">
            <DownOutlined />
          </button>
        </section>

        {/* Articles Section */}
        <section id="articles-section" className="articles-section">
          {/* 移动端 Tab 切换 */}
          {isMobile && (
            <div className="mobile-tabs">
              <button 
                className={`mobile-tab ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => setActiveTab('list')}
              >
                <UnorderedListOutlined /> 文章列表
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <ClockCircleOutlined /> 时间线
              </button>
            </div>
          )}

          <div className="articles-layout">
            <div className="articles-main">
              {/* 移动端只显示当前激活的 Tab 内容 */}
              {(!isMobile || activeTab === 'list') && (
                <div className="articles-container">
                  {loading ? (
                    <div className="loading">
                      <div className="loading-spinner"></div>
                    </div>
                  ) : error ? (
                    <div className="error">{error}</div>
                  ) : articles.length === 0 ? (
                    <div className="empty-state">
                      <p>暂无文章</p>
                    </div>
                  ) : (
                    <>
                      <div className="articles-grid" style={{ 
    opacity: isPending ? 0.6 : 1,      // 正在加载时变半透明
    transition: 'opacity 0.3s ease',   // 丝滑过渡
    pointerEvents: isPending ? 'none' : 'auto' // 加载时防止重复点击
  }}>
                        {articles.map((article) => {
                          const tags = article.tags 
                            ? (Array.isArray(article.tags) ? article.tags : article.tags.split(','))
                            : []
                          const displayTags = tags.slice(0, 4)
                          return (
                          <div 
                            key={article.article_id} 
                            className="article-card-minimal"
                            onClick={() => navigate(`/article/${article.article_id}`)}
                          >
                            <div className="article-card-left">
                              <h2 className="article-card-title">{article.title}</h2>
                              {displayTags.length > 0 && (
                                <div className="article-card-tags">
                                  {displayTags.map((tag, index) => (
                                    <span 
                                      key={index} 
                                      className="article-tag"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/tags/${typeof tag === 'string' ? tag.trim() : tag}`)
                                      }}
                                    >
                                      {typeof tag === 'string' ? tag.trim() : tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="article-card-right">
                              {article.author_id && (
                                <Link 
                                  to={`/author/${article.author_id}`} 
                                  className="article-card-author"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {authorNames[article.author_id] || '加载中...'}
                                </Link>
                              )}
                              <span className="article-card-date">{formatDate(article.create_time)}</span>
                            </div>
                          </div>
                          )
                        })}
                      </div>

                      {/* Ant Design 分页组件 */}
                      <div className="pagination-container">
                        <Pagination
                          current={currentPage}
                          pageSize={pageSize}
                          total={totalArticles}
                          onChange={handlePageChange}
                          showSizeChanger
                          showQuickJumper
                          pageSizeOptions={['5', '10', '20', '50']}
                          showTotal={(total, range) => `${range[0]}-${range[1]} / 共 ${total} 条`}
                          locale={{
                            items_per_page: '条/页',
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              {/* 移动端时间线 Tab */}
              {isMobile && activeTab === 'timeline' && (
                <div className="mobile-timeline-container">
                  <TimelineSidebar />
                </div>
              )}
            </div>
            {/* 桌面端显示侧边栏 */}
            {!isMobile && (
              <aside className="articles-sidebar">
                <TimelineSidebar />
              </aside>
            )}
          </div>
        </section>
      </div>
    )
  }

  // 非首页（搜索/筛选结果）保持原有样式
  const isSearchResult = searchQuery || dateYearMonth || tag

  const handleBackToList = () => {
    navigate('/')
    setTimeout(() => {
      const contentSection = document.getElementById('articles-section')
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div id="articles-section" className="container">
      <div className="page-header">
        {isSearchResult && (
          <button 
            className="back-to-list-btn"
            onClick={handleBackToList}
          >
            ← 返回文章列表
          </button>
        )}
        <h1 className="page-title">
          {dateYearMonth
            ? dateYearMonth
            : searchQuery
              ? `搜索结果: "${searchQuery}"`
              : tag
                ? `标签: ${tag}`
                : '文章列表'
          }
        </h1>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          <p>暂无文章</p>
        </div>
      ) : (
        <>
          <div className="articles-grid">
            {articles.map((article) => {
              const tags = article.tags 
                ? (Array.isArray(article.tags) ? article.tags : article.tags.split(','))
                : []
              const displayTags = tags.slice(0, 4)
              return (
              <div 
                key={article.article_id} 
                className="article-card-minimal"
                onClick={() => navigate(`/article/${article.article_id}`)}
              >
                <div className="article-card-left">
                  <h2 className="article-card-title">{article.title}</h2>
                  {displayTags.length > 0 && (
                    <div className="article-card-tags">
                      {displayTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="article-tag"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tags/${typeof tag === 'string' ? tag.trim() : tag}`)
                          }}
                        >
                          {typeof tag === 'string' ? tag.trim() : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="article-card-right">
                  {article.author_id && (
                    <Link 
                      to={`/author/${article.author_id}`} 
                      className="article-card-author"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {authorNames[article.author_id] || '加载中...'}
                    </Link>
                  )}
                  <span className="article-card-date">{formatDate(article.create_time)}</span>
                </div>
              </div>
              )
            })}
          </div>

          {/* Ant Design 分页组件 */}
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalArticles}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['5', '10', '20', '50']}
              showTotal={(total, range) => `${range[0]}-${range[1]} / 共 ${total} 条`}
              locale={{
                items_per_page: '条/页',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ArticleList
