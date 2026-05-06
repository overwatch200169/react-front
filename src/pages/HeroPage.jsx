import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const HeroPage = () => {
  const navigate = useNavigate()
  const [scrollDelta, setScrollDelta] = useState(0)
  const lastScrollY = useRef(0)
  const isTransitioning = useRef(false)

  // 滚动监听：向下滚动超过阈值时切换到文章列表
  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioning.current) return

      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY.current

      if (delta > 0) {
        // 向下滚动，累计增量
        setScrollDelta(prev => {
          const newDelta = prev + delta
          if (newDelta > 100 && lastScrollY.current < 200) {
            // 向下滚动超过 100px 且还未滚动太远，切换到文章列表
            isTransitioning.current = true
            // 标记从 hero 切换过来
            sessionStorage.setItem('fromHero', 'true')
            navigate('/articles')
          }
          return newDelta > 100 && lastScrollY.current < 200 ? 0 : newDelta
        })
      } else {
        // 向上滚动，重置增量
        setScrollDelta(prev => Math.max(0, prev + delta))
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [navigate])

  // 点击按钮切换到文章列表
  const goToArticles = () => {
    if (isTransitioning.current) return
    isTransitioning.current = true
    sessionStorage.setItem('fromHero', 'true')
    navigate('/articles')
  }

  return (
    <div className="hero-section hero-fullscreen hero-visible">
      <div style={{
        height: '100vh',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          🎯 Hero 与列表切换演示
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          点击下方箭头或滚动切换到文章列表
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '1rem 2rem',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          marginBottom: '3rem'
        }}>
          <p style={{ fontSize: '1rem' }}>
            当前视图：<strong>Hero 区域</strong>
          </p>
        </div>
        
        {/* 切换到文章列表的箭头按钮 */}
        <button 
          onClick={goToArticles}
          className="scroll-indicator"
          style={{
            animation: 'bounce 2s infinite',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'transform 0.3s, background 0.3s'
          }}
        >
          <span style={{ fontSize: '2rem' }}>👇</span>
          <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>查看文章</span>
        </button>
      </div>
    </div>
  )
}

export default HeroPage
