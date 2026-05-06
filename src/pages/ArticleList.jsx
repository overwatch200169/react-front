import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { searchArticles, getArticles, getUserById } from '../services/api'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons'

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
    navigate('/')
  }

  const clearMonthFilter = () => {
    // 清除 date_year_month 参数但保留其他参数
    const params = new URLSearchParams(searchParams)
    params.delete('date_year_month')
    const newSearch = params.toString()
    navigate(newSearch ? `/?${newSearch}` : '/')
    setCurrentOffset(0)
  }

  const clearAllFilters = () => {
    // 清除所有筛选条件（搜索和月份筛选）
    navigate('/')
    setCurrentOffset(0)
  }

  // 分页切换
  const handlePageChange = (newOffset) => {
    setCurrentOffset(newOffset)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
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
<span><CalendarOutlined /> {formatDate(article.create_time)}</span>
                          {article.author_id && (
                            <span>
                              <UserOutlined />
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

      {/* 分页控制 - 仅在首页列表模式显示 */}
      {isHomePage && getPageButtons() && (
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
  )
}

export default ArticleList
