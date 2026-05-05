import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { getEgg } from '../services/api'

const EggPage = () => {
  const [eggList, setEggList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEggData()
  }, [])

  const fetchEggData = async () => {
    try {
      setLoading(true)
      const data = await getEgg()
      // 支持 results 数组 + total 的结构，或直接返回数组
      const list = data.results || data || []
      setEggList(list)
    } catch (err) {
      console.error('获取彩蛋信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      align: 'center'
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      key: 'birthday',
      align: 'center',
      render: (text) => formatDate(text)
    },
    {
      title: '主页',
      dataIndex: 'homepage',
      key: 'homepage',
      align: 'center',
      width: 80,
      render: (text) => text ? (
        <a href={text} target="_blank" rel="noopener noreferrer" title="访问主页">
          📺
        </a>
      ) : '-'
    },
    {
      title: '头像',
      dataIndex: 'picture_url',
      key: 'picture_url',
      align: 'center',
      render: (text) => text ? (
        <img 
          src={text} 
          alt="头像" 
          style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} 
        />
      ) : '-'
    }
  ]

  const tableData = eggList.map((item, index) => ({
    key: item.egg_id || index,
    name: item.name || '-',
    birthday: item.birthday || null,
    homepage: item.homepage || null,
    picture_url: item.picture_url || null
  }))

  return (
    <div className="container">
      <div className="about-content">
        <div className="about-section">
          <h2>🥚 彩蛋</h2>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={false}
            bordered
            style={{ maxWidth: 800, margin: '0 auto' }}
          />
        </div>
      </div>
    </div>
  )
}

export default EggPage
