import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getUserById, getUserProfile, getArticlesByUser } from '../services/api'
import { CalendarOutlined, UserOutlined, GiftOutlined, FileTextOutlined } from '@ant-design/icons'

const AuthorPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAuthorData()
  }, [id])

  const fetchAuthorData = async () => {
    try {
      setLoading(true)
      
      // 并行获取用户信息和文章
      const [userData, articlesData] = await Promise.all([
        getUserById(id),
        getArticlesByUser(id, { limit: 100 })
      ])
      
      setUser(userData)
      setArticles(Array.isArray(articlesData) ? articlesData : [])
      
      // 尝试获取用户资料
      try {
        const profileData = await getUserProfile(id)
        setProfile(profileData)
      } catch (e) {
        // profile 可能不存在，忽略错误
      }
      
      setError(null)
    } catch (err) {
      setError('加载作者信息失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).replace(/\//g, '-')
  }

  // 生日只显示月日
  const formatBirthday = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).replace(/\//g, '-')
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
          <button onClick={() => navigate('/')} className="back-button">返回首页</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="author-profile-card">
        <div className="author-avatar-large">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={user?.username} />
          ) : (
            <UserOutlined />
          )}
        </div>
        <div className="author-info">
          <h1 className="author-name">{user?.username || '未知用户'}</h1>
          <p className="author-bio">{profile?.bio || '暂无简介'}</p>
          <div className="author-meta-group">
            <span className="author-meta">
              <GiftOutlined /> 生日：{profile?.birthday ? formatBirthday(profile.birthday) : '保密'}
            </span>
            <span className="author-meta">
              <CalendarOutlined /> 年龄：{profile?.age ?? '保密'}
            </span>
            <span className="author-meta">
              <FileTextOutlined /> 文章数：{articles.length} 篇
            </span>
          </div>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: '48px' }}>
        <h2 className="page-title" style={{ fontSize: '24px' }}>他的文章</h2>
      </div>

      {articles.length === 0 ? (
        <div className="error">
          <p>该作者暂无文章</p>
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

      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <button onClick={() => navigate('/')} className="back-button">
          ← 返回首页
        </button>
      </div>
    </div>
  )
}

export default AuthorPage
