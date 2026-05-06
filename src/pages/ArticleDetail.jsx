import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getArticleById, getUserById } from '../services/api'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons'

const ArticleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchArticle()
  }, [id])

  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const data = await getArticleById(id)
      setArticle(data)
      
      // 获取作者信息
      if (data?.author_id) {
        try {
          const authorData = await getUserById(data.author_id)
          setAuthor(authorData)
        } catch (e) {
          // 作者信息获取失败不影响文章显示
        }
      }
      
      setError(null)
    } catch (err) {
      setError('加载文章失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
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
        <div className="error">
          <p>{error}</p>
          <Link to="/" className="back-button">返回首页</Link>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container">
        <div className="error">
          <p>文章不存在</p>
          <Link to="/" className="back-button">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <article className="article-detail">
        <div className="article-detail-header">
          <h1 className="article-detail-title">{article.title}</h1>
          <div className="article-detail-meta">
            <span><CalendarOutlined /> {formatDate(article.create_time)}</span>
            {article.author_id && (
              <Link to={`/author/${article.author_id}`} className="article-detail-author">
                <UserOutlined /> {author?.username || '加载中...'}
              </Link>
            )}
          </div>
          {article.tags && (
            <div className="article-detail-tags">
              {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).map((tag, index) => (
                <Link key={index} to={`/tags/${typeof tag === 'string' ? tag.trim() : tag}`} className="tag">
                  {typeof tag === 'string' ? tag.trim() : tag}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.body || ''}
          </ReactMarkdown>
        </div>
        
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className="back-button"
            onClick={() => {
              navigate('/')
              setTimeout(() => {
                const contentSection = document.getElementById('articles-section')
                if (contentSection) {
                  contentSection.scrollIntoView({ behavior: 'smooth' })
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }, 100)
            }}
          >
            ← 返回文章列表
          </button>
        </div>
      </article>
    </div>
  )
}

export default ArticleDetail
