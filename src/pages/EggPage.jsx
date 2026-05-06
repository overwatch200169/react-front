import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { Pie } from '@ant-design/plots'
import { getEgg, getEggChecki } from '../services/api'
import { CoffeeOutlined } from '@ant-design/icons'

const EggPage = () => {
  const [eggList, setEggList] = useState([])
  const [checkiData, setCheckiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchEggData()
    fetchCheckiData()
    window.scrollTo(0, 0)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchEggData = async () => {
    try {
      setLoading(true)
      const data = await getEgg()
      const list = data.results || data || []
      setEggList(list)
    } catch (err) {
      console.error('获取彩蛋信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckiData = async () => {
    try {
      const data = await getEggChecki()
      setCheckiData(data || [])
    } catch (err) {
      console.error('获取切奇数据失败:', err)
    }
  }

  const totalCount = checkiData.reduce((sum, item) => sum + (item.cheki_count || 0), 0)

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  
  }

  const columns = [
    {
      
      dataIndex: 'name',
      key: 'name',
      align: 'center'
    },
    {
      
      dataIndex: 'birthday',
      key: 'birthday',
      align: 'center',
      render: (text) => formatDate(text)
    },
    {
      
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
          <h2><CoffeeOutlined /> 彩蛋</h2>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={false}
            bordered
            style={{ maxWidth: 800, margin: '0 auto' }}
          />
        </div>

        {checkiData.length > 0 && (
          <div className="about-section">
            <h2><CoffeeOutlined /> 切奇统计</h2>
            <div style={{
              maxWidth: isMobile ? '100%' : 900,
              margin: '0 auto',
              minHeight: isMobile ? 400 : 500,
              padding: isMobile ? '10px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Pie
                data={checkiData.map(item => ({
                  type: item.name || '未知',
                  value: item.cheki_count || 0,
                  percent: (item.cheki_count / totalCount) * 100
                }))}
                angleField="value"
                colorField="type"
                radius={isMobile ? 0.7 : 0.9}
                innerRadius={isMobile ? 0.3 : 0.5}
                height={isMobile ? 350 : 700}
                marginTop={isMobile ? 20 : 50}
                marginLeft={isMobile ? 10 : 20}
                marginBottom={isMobile ? 60 : 50}
                marginRight={isMobile ? 10 : 20}
                label={{
                  text: (d) => isMobile ? d.type : `${d.type}\n ${d.value}张\n ${d.percent.toFixed(2)}%`,
                  position: 'spider',
                  transform: [
                    {
                      type: 'overlapDodgeY',
                      padding: isMobile ? 2 : 30,
                      maxIterations: isMobile ? 30 : 50
                    }
                  ],
                  style: {
                    fontWeight: 'bold',
                    fontSize: isMobile ? 10 : 12,
                  },
                }}
                legend={{
                  color: {
                    title: false,
                    position: isMobile ? 'bottom' : 'right',
                    rowPadding: 5,
                  },
                }}
                tooltip={{
                  title: '切奇详情',
                  items: [
                    (datum) => ({
                      name: datum.type,
                      value: `${datum.value} 张`
                    })
                  ]
                }}
                annotations={[
                  {
                    type: 'text',
                    style: {
                      text: `切奇总数：${totalCount}`,
                      x: '50%',
                      y: '50%',
                      textAlign: 'center',
                      fontSize: isMobile ? 12 : 14,
                      fontWeight: 'bold',
                    },
                  },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EggPage
