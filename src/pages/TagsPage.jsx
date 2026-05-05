import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../services/api'

const TagsPage = () => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 50

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      
      // 分页获取所有文章（按 50 为基数）
      const tagCounts = {}
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const result = await getArticles({ limit: PAGE_SIZE, offset })
        
        // 处理返回数据格式：可能是 { results: [...] } 或直接是数组
        const data = result?.results || result || []
        
        if (data.length === 0) {
          hasMore = false
          break
        }

        // 统计标签
        data.forEach(article => {
          if (article.tags) {
            // tags 可能是数组或逗号分隔的字符串
            const articleTags = Array.isArray(article.tags) 
              ? article.tags 
              : article.tags.split(',')
            articleTags.forEach(tag => {
              const trimmedTag = typeof tag === 'string' ? tag.trim() : tag
              if (trimmedTag) {
                tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1
              }
            })
          }
        })

        // 判断是否还有更多数据
        if (data.length < PAGE_SIZE) {
          hasMore = false
        } else {
          offset += PAGE_SIZE
        }
      }
      
      // 转换为数组并按数量排序
      const tagArray = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count)
      
      setTags(tagArray)
    } catch (err) {
      console.error('加载标签失败:', err)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">标签分类</h1>
        <p className="page-subtitle">通过标签快速找到感兴趣的文章</p>
      </div>
      
      {tags.length === 0 ? (
        <div className="error">
          <p>暂无标签</p>
        </div>
      ) : (
        <div className="tags-grid">
          {tags.map((tag, index) => (
            <Link key={index} to={`/tags/${tag.name}`} className="tag-card">
              <div className="tag-name">{tag.name}</div>
              <div className="tag-count">{tag.count} 篇文章</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagsPage
