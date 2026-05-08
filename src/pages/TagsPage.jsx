import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../services/api'
import { Pagination } from 'antd'

const TagsPage = () => {
  const [tags, setTags] = useState([])
  const [allTags, setAllTags] = useState([]) // 存储所有标签用于分页
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(20)
  const [currentOffset, setCurrentOffset] = useState(0)
  const PAGE_SIZE = 50

  useEffect(() => {
    fetchTags()
    window.scrollTo(0, 0)
  }, [])

  // 当分页参数变化时更新显示的标签
  useEffect(() => {
    if (allTags.length > 0) {
      const start = currentOffset
      const end = currentOffset + pageSize
      setTags(allTags.slice(start, end))
    }
  }, [currentOffset, pageSize, allTags])

  const fetchTags = async () => {
    try {
      setLoading(true)
      
      // 分页获取所有文章（按 50 为基数）
      const tagCounts = {}
      let offset = 0
      const total = 0 // 初始化总数
      let fetchedTotal = 0 // 已获取的文章数

      while (true) {
        const result = await getArticles({ limit: PAGE_SIZE, offset })
        
        // 获取总数（只在第一次请求时）
        const apiTotal = result?.total || 0
        if (offset === 0 && apiTotal > 0) {
          // 可以在此处使用 total 进行进度提示
        }

        // 处理返回数据格式：支持新旧 API 格式
        const data = result?.items || result?.results || result || []
        
        if (data.length === 0) {
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

        fetchedTotal += data.length

        // 判断是否还有更多数据：通过总数判断
        if (fetchedTotal >= apiTotal || data.length < PAGE_SIZE) {
          break
        }
        
        offset += PAGE_SIZE
      }
      
      // 转换为数组并按数量排序
      const tagArray = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count)
      
      setAllTags(tagArray)
      setTags(tagArray.slice(0, pageSize))
    } catch (err) {
      console.error('加载标签失败:', err)
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
      
      {allTags.length === 0 ? (
        <div className="error">
          <p>暂无标签</p>
        </div>
      ) : (
        <>
          <div className="tags-grid">
            {tags.map((tag, index) => (
              <Link key={index} to={`/tags/${tag.name}`} className="tag-card">
                <div className="tag-name">{tag.name}</div>
                <div className="tag-count">{tag.count} 篇文章</div>
              </Link>
            ))}
          </div>

          {/* 分页组件 */}
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={allTags.length}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['10', '20', '50', '100']}
              showTotal={(total, range) => `显示第 ${range[0]}-${range[1]} 个标签，共 ${total} 个标签`}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default TagsPage
