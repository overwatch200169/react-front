import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { Pie } from '@ant-design/plots'
import { getEgg, getEggChecki } from '../services/api'
import { CoffeeOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'
import LazyImage from '../components/LazyImage'
import '../styles/LazyImage.css'


const EggPage = () => {
  const [eggList, setEggList] = useState([])
  const [checkiData, setCheckiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchEggData()
    fetchCheckiData()
    window.scrollTo(0, 0)
    
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width <= 1024)
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

  // const formatDate = (dateString) => {
  //   if (!dateString) return '-'
  //   const date = new Date(dateString)
  //   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  
  // }

  const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const pad = (num) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${year}-${month}-${day}`;
};


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
        <LazyImage
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


  const textColor = isDark ? '#DCE3DD' : '#2D3B32'
  const connectorColor = isDark ? 'rgba(220, 227, 221, 0.4)' : 'rgba(45, 59, 50, 0.4)'
  const chartThemeMode = resolvedTheme // 直接对齐 'light' 或 'dark'

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
              minHeight: isMobile ? 500 : 600,
              padding: isMobile ? '10px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: isMobile ? '100%' : 800, display: 'flex', justifyContent: 'center' }}>
                <Pie
                data={checkiData.map(item => ({
                  type: item.name || '未知',
                  value: item.cheki_count || 0,
                  percent: (item.cheki_count / totalCount) * 100
                }))}
                angleField="value"
                colorField="type"
                radius={isMobile ? 0.5 : 0.7}
                innerRadius={isMobile ? 0.35 : 0.4}
                
                height={isMobile ? 500 : 700}
                // width={isMobile ? 400 : 800}
                
                marginTop={isMobile ? 20 : 50}
                marginLeft={isMobile ? 10 : 20}
                marginBottom={isMobile ? 20 : 50}
                marginRight={isMobile ? 10 : 20}
                theme={{
                  colorScheme: chartThemeMode,
                  defaultColor: isDark ? '#7AAF8A' : '#6B9B7A',
                  style: {
                    backgroundColor: 'transparent',
                  },
                }}
                
                label={{
                  text: (d) => isMobile ? d.value : `${d.type}  ${d.value}张  ${d.percent.toFixed(0)}%`,
                  position: isMobile ? 'outside' : 'spider',
                  connector: true,
                  connectorStroke: isDark ? '#DCE3DD' : '#2D3B32',
                  connectorLineWidth: 1,
                  transform: [
                    {
                      type: 'overlapDodgeY',
                      padding:20,
                      maxIterations:10,


                    },
                  ],
                  layout: [
                    {
                      type: 'limitInShape',
                    },
                  ],
                  style: {
                    fontWeight: 'bold',
                    fontSize: isMobile ? 10 : 12,
                    fill: textColor,
                  },
                }}
                legend={{
                  color: {
                    title: false,
                    position: (isMobile || isTablet) ? 'bottom' : 'right',
                    rowPadding: 5,
                    itemLabelFill: textColor
                  },
                  style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: isMobile ? 10 : 13,
                    fill: textColor
                  },
                }}
                tooltip={{
                  title: '切奇详情',
                  items: [
                    (datum) => ({
                      name: datum.type,
                      value: `${datum.value} 张`,
                    })
                  ],
                }}
                interaction={{
                  tooltip: {
                    css: {
                      '.g2-tooltip-list-item-value': {
          color: textColor, // 🟢 注入
        },
        '.g2-tooltip-list-item-name': {
          color: textColor, // 🟢 追加：防止类名不一致导致部分失色
        },
        '.g2-tooltip-title': {
          color: textColor, // 🟢 追加：标题文字颜色
        }
                    },
                  }
                }}
                annotations={[
                  {
                    type: 'text',
                    style: {
                      text: `切奇总数：${totalCount}`,
                      x: '50%',
                      y: '50%',
                      textAlign: 'center',
                      fontSize: isMobile ? 10 : 30,
                      fontWeight: 'bold',
                      fill: textColor,  // 🟢 注入：G2 使用 fill 渲染文本颜色
        // color: textColor, // 注入
                    },
                  },
                ]}
                style={{
                  // stroke: '#fff',
      inset: 1,
      radius: 3,
                }}
              />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EggPage
