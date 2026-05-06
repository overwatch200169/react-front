import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { searchArticles, getArticles, getUserById } from '../services/api'

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
  const isNavigating = useRef(false) // 标记是否正在导航，防止滚动监听器干扰

  const isHomePage = !searchQuery && !dateYearMonth && !tag

  // 检测是否从 Hero 切换过来，添加过渡动画标记
  useEffect(() => {
    if (sessionStorage.getItem('fromHero') === 'true') {
      sessionStorage.removeItem('fromHero')
      // 标记从 hero 切换过来，用于 Header 动画
      document.body.classList.add('from-hero-transition')
      setTimeout(() => {
        document.body.classList.remove('from-hero-transition')
      }, 600)
    }
  }, [])

  // 滚动容器 ref
  const containerRef = useRef(null)

  // 监听文章容器的滚动，实现向上滚动返回 Hero
  useEffect(() => {
    if (!isHomePage) return

    // 等待 DOM 渲染完成后获取容器
    const container = containerRef.current || document.querySelector('.articles-container')
    if (!container) return

    let lastScrollTop = 0
    let scrollUpCount = 0 // 连续向上滚动的次数

    const handleContainerScroll = () => {
      // 如果正在导航，忽略滚动事件
      if (isNavigating.current) return

      const scrollTop = container.scrollTop
      const isScrollingUp = scrollTop < lastScrollTop

      // 滚动到顶部且继续向上滚动
      if (scrollTop <= 0 && isScrollingUp) {
        scrollUpCount++
        // 连续向上滚动 2 次才触发跳转（避免误触）
        if (scrollUpCount >= 2) {
          isNavigating.current = true
          navigate('/')
        }
      } else {
        // 重置计数
        scrollUpCount = 0
      }

      lastScrollTop = scrollTop
    }

    container.addEventListener('scroll', handleContainerScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleContainerScroll)
  }, [isHomePage, navigate])

  // 返回 Hero 按钮点击
  const goBackToHero = () => {
    isNavigating.current = true
    navigate('/')
  }

  useEffect(() => {
    fetchArticles()
  }, [tag, searchQuery, dateYearMonth, currentOffset])

  // 获取作者名称
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
        // 月份筛选模式 - 使用搜索 API
        const result = await searchArticles({ date_year_month: dateYearMonth, size: 50 })
        data = result?.results || []
        total = result?.total || data.length
      } else if (searchQuery) {
        // 搜索模式 - 使用搜索 API
        const result = await searchArticles({ q: searchQuery, size: 50 })
        data = result?.results || []
        total = result?.total || data.length
      } else if (tag) {
        // 标签筛选模式 - 使用搜索 API
        const result = await searchArticles({ tags: [tag], size: 50 })
        data = result?.results || []
        total = result?.total || data.length
      } else {
        // 普通列表模式 - 使用 Article API（支持分页）
        const result = await getArticles({ limit: PAGE_SIZE, offset: currentOffset })
        data = result?.results || result || []
        total = result?.total || data.length
      }

      setArticles(data || [])
      setTotalArticles(total)
      setError(null)

      // 获取所有文章的作者名称
      const uniqueAuthorIds = [...new Set(data.map(a => a.author_id).filter(Boolean))]
      uniqueAuthorIds.forEach(id => fetchAuthorName(id))

    } catch (err) {
      setError('加载文章失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 格式化月份显示
  const formatMonthDisplay = (dateStr) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    return `${year}年${monthNames[parseInt(month) - 1]}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const clearSearch = () => {
    navigate('/articles')
  }

  const clearMonthFilter = () => {
    // 清除 date_year_month 参数但保留其他参数
    const params = new URLSearchParams(searchParams)
    params.delete('date_year_month')
    const newSearch = params.toString()
    navigate(newSearch ? `/articles?${newSearch}` : '/articles')
    setCurrentOffset(0)
  }

  const clearAllFilters = () => {
    // 清除所有筛选条件（搜索和月份筛选）
    navigate('/articles')
    setCurrentOffset(0)
  }

  // 分页切换
  const handlePageChange = (newOffset) => {
    setCurrentOffset(newOffset)
    // 立即重置滚动位置，不使用平滑滚动避免闪烁
    const container = document.querySelector('.articles-container')
    if (container) {
      container.scrollTop = 0
    } else {
      window.scrollTo(0, 0)
    }
  }

  // 生成分页按钮
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

  // 首页且正在加载时显示加载状态
  if (loading && !isHomePage) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error && !isHomePage) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="articles-wrapper">
      {/* 首页的文章列表需要内部滚动 */}
      {isHomePage ? (
        <div className="articles-container" ref={containerRef}>
          <div className="container">
            {/* 顶部标题区域 */}
            <div className="page-header">
              <h1 className="page-title">文章列表</h1>
              <p className="page-subtitle">共 {totalArticles} 篇文章</p>
            </div>

            {/* 文章列表 */}
            {articles.length === 0 ? (
              <div className="error">
                <p>暂无文章</p>
              </div>
            ) : (
              <div className="article-list">
                {articles.map((article) => (
                  <div 
                    key={article.article_id} 
                    className="article-card"
                    onClick={() => navigate(`/article/${article.article_id}`)}
                  >
                    <div className="article-card-header">
                      <div>
                        <h2 className="article-title">{article.title}</h2>
                        <div className="article-meta">
                          <span>📅 {formatDate(article.create_time)}</span>
                          {article.author_id && (
                            <span>
                              👤 
                              <Link 
                                to={`/author/${article.author_id}`} 
                                className="author-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {authorNames[article.author_id] || '加载中...'}
                              </Link>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {article.tags && (
                      <div className="article-tags">
                        {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).map((tagItem, index) => (
                          <Link 
                            key={index} 
                            to={`/tags/${typeof tagItem === 'string' ? tagItem.trim() : tagItem}`}
                            className="tag"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {typeof tagItem === 'string' ? tagItem.trim() : tagItem}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 分页控制 */}
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
          </div>
        </div>
      ) : (
        /* 非首页（搜索、标签筛选等）保持原有行为 */
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">
              {dateYearMonth
                ? formatMonthDisplay(dateYearMonth)
                : searchQuery
                  ? `搜索结果: "${searchQuery}"`
                  : tag
                    ? `标签: ${tag}`
                    : '文章列表'
              }
            </h1>
            <p className="page-subtitle">
              {dateYearMonth
                ? `查看 ${formatMonthDisplay(dateYearMonth)}发布的 ${articles.length} 篇文章`
                : searchQuery
                  ? `找到 ${articles.length} 篇相关文章`
                  : tag
                    ? `查看所有含有「${tag}」标签的文章`
                    : '分享技术心得，记录成长历程'
              }
            </p>
          </div>

          {(searchQuery || dateYearMonth) && articles.length > 0 && (
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {searchQuery && (
                <button onClick={clearSearch} className="back-button">
                  ← 清除搜索
                </button>
              )}
              {dateYearMonth && (
                <button onClick={clearMonthFilter} className="back-button">
                  ← 返回全部文章
                </button>
              )}
            </div>
          )}

          {dateYearMonth && articles.length === 0 && (
            <div style={{ marginBottom: '24px' }}>
              <button onClick={clearMonthFilter} className="back-button">
                ← 返回全部文章
              </button>
            </div>
          )}
          
          {articles.length === 0 ? (
            <div className="error">
              <p>
                {dateYearMonth
                  ? `${formatMonthDisplay(dateYearMonth)}暂无文章`
                  : searchQuery
                    ? '未找到相关文章'
                    : '暂无文章'
                }
              </p>
              {(searchQuery || dateYearMonth) && (
                <button onClick={clearAllFilters} className="back-button">
                  ← 返回全部文章
                </button>
              )}
            </div>
          ) : (
            <div className="article-list">
              {articles.map((article) => (
                <div 
                  key={article.article_id} 
                  className="article-card"
                  onClick={() => navigate(`/article/${article.article_id}`)}
                >
                  <div className="article-card-header">
                    <div>
                      <h2 className="article-title">{article.title}</h2>
                      <div className="article-meta">
                        <span>📅 {formatDate(article.create_time)}</span>
                        {article.author_id && (
                          <span>
                            👤 
                            <Link 
                              to={`/author/${article.author_id}`} 
                              className="author-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {authorNames[article.author_id] || '加载中...'}
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {article.tags && (
                    <div className="article-tags">
                      {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).map((tagItem, index) => (
                        <Link 
                          key={index} 
                          to={`/tags/${typeof tagItem === 'string' ? tagItem.trim() : tagItem}`}
                          className="tag"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {typeof tagItem === 'string' ? tagItem.trim() : tagItem}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ height: '100px' }}></div>
        </div>
      )}

      {/* 首页的返回 Hero 按钮 */}
      {isHomePage && (
        <button 
          onClick={goBackToHero}
          className="back-to-hero-button"
        >
          <span>👆</span>
          <span>返回顶部</span>
        </button>
      )}
    </div>
  )
}

export default ArticleList
