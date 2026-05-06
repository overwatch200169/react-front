import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { searchArticles, getArticles, getUserById } from '../services/api'
import { DownOutlined } from '@ant-design/icons'
import TimelineSidebar from '../components/TimelineSidebar'

const ArticleList = () => {
  const [articles, setArticles] = useState([])
  const [authorNames, setAuthorNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalArticles, setTotalArticles] = useState(0)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [searchParams] = useSearchParams()
  const PAGE_SIZE = 50
  const searchQuery = searchParams.get('search')
  const dateYearMonth = searchParams.get('date_year_month')
  const { tag } = useParams()
  const navigate = useNavigate()

  const isHomePage = !searchQuery && !dateYearMonth && !tag

  useEffect(() => {
    fetchArticles()
  }, [tag, searchQuery, dateYearMonth, currentOffset])

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
      setLoading(true)

      let data
      let total = 0
      if (dateYearMonth) {
        const result = await searchArticles({ date_year_month: dateYearMonth, size: 50 })
        data = result?.results || []
        total = result?.total || data.length
      } else if (searchQuery) {
        const result = await searchArticles({ q: searchQuery, size: 50 })
        data = result?.results || []
        total = result?.total || data.length
      } else if (tag) {
        const result = await searchArticles({ tags: [tag], size: 50 })
        data = result?.results || []
        total = result?.total || data.length
      } else {
        const result = await getArticles({ limit: PAGE_SIZE, offset: currentOffset })
        data = result?.results || result || []
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
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const scrollToContent = () => {
    const contentSection = document.getElementById('articles-section')
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handlePageChange = (newOffset) => {
    setCurrentOffset(newOffset)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageButtons = () => {
    const totalPages = Math.ceil(totalArticles / PAGE_SIZE)
    if (totalPages <= 1) return null

    const buttons = []
    for (let i = 0; i < totalPages; i++) {
      const offset = i * PAGE_SIZE
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(offset)}
          className={`pagination-button ${currentOffset === offset ? 'active' : ''}`}
        >
          {i + 1}
        </button>
      )
    }
    return buttons
  }

  // 首页渲染 Hero 区域
  if (isHomePage && !searchQuery && !dateYearMonth && !tag) {
    return (
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg"></div>
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
          <div className="articles-layout">
            <div className="articles-main">
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
                    <div className="articles-grid">
                      {articles.map((article) => {
                        const tags = article.tags 
                          ? (Array.isArray(article.tags) ? article.tags : article.tags.split(','))
                          : []
                        const displayTags = tags.slice(0, 4) // 最多显示4个标签
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
                          <span className="article-card-date">{formatDate(article.create_time)}</span>
                        </div>
                        )
                      })}
                    </div>

                    {getPageButtons() && (
                      <div className="pagination">
                        {currentOffset > 0 && (
                          <button
                            onClick={() => handlePageChange(currentOffset - PAGE_SIZE)}
                            className="pagination-button"
                          >
                            ← 上一页
                          </button>
                        )}
                        {getPageButtons()}
                        {currentOffset + PAGE_SIZE < totalArticles && (
                          <button
                            onClick={() => handlePageChange(currentOffset + PAGE_SIZE)}
                            className="pagination-button"
                          >
                            下一页 →
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <aside className="articles-sidebar">
              <TimelineSidebar />
            </aside>
          </div>
        </section>
      </div>
    )
  }

  // 非首页（搜索/筛选结果）保持原有样式
  const isSearchResult = searchQuery || dateYearMonth || tag

  return (
    <div className="container">
      <div className="page-header">
        {isSearchResult && (
          <button 
            className="back-to-list-btn"
            onClick={() => navigate('/')}
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
              <span className="article-card-date">{formatDate(article.create_time)}</span>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ArticleList
