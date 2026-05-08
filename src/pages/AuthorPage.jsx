import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getUserById, getUserProfile, getArticlesByUser } from '../services/api'
import { CalendarOutlined, UserOutlined, GiftOutlined, FileTextOutlined } from '@ant-design/icons'
import { Pagination } from 'antd'
import LazyImage from '../components/LazyImage'
import '../styles/LazyImage.css'

const AuthorPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalArticles, setTotalArticles] = useState(0)

  useEffect(() => {
    fetchAuthorData()
    window.scrollTo(0, 0)
  }, [id, currentOffset, pageSize])

  const fetchAuthorData = async () => {
    try {
      setLoading(true)
      
      // 获取用户信息
      const userData = await getUserById(id)
      setUser(userData)
      
      // 获取文章（带分页）
      const articlesData = await getArticlesByUser(id, { limit: pageSize, offset: currentOffset })
      const articlesList = articlesData?.items || articlesData?.results || articlesData || []
      setArticles(Array.isArray(articlesList) ? articlesList : [])
      setTotalArticles(articlesData?.total || articlesList.length)
      
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

  // 处理分页变化
  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentOffset(0)
    } else {
      setCurrentOffset((page - 1) * pageSize)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 计算当前页码
  const currentPage = Math.floor(currentOffset / pageSize) + 1

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
    <div className="container author-page">
      <div className="author-profile-card">
        <div className="author-avatar-large">
          {profile?.avatar_url ? (
            <LazyImage src={profile.avatar_url} alt={user?.username} />
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
              <FileTextOutlined /> 文章数：{totalArticles} 篇
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
                      {displayTags.map((tagItem, index) => (
                        <Link 
                          key={index} 
                          to={`/tags/${typeof tagItem === 'string' ? tagItem.trim() : tagItem}`}
                          className="article-tag"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {typeof tagItem === 'string' ? tagItem.trim() : tagItem}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="article-card-right">
                  <span className="article-card-date">
                    <CalendarOutlined /> {formatDate(article.create_time)}
                  </span>
                </div>
              </div>
            )})}
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

      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <button onClick={() => { navigate('/'); setTimeout(() => { const contentSection = document.getElementById('articles-section'); if (contentSection) { contentSection.scrollIntoView({ behavior: 'smooth' }); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }, 100); }} className="back-to-list-btn">
          ← 返回文章列表
        </button>
      </div>
    </div>
  )
}

export default AuthorPage
