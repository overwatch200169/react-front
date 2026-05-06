import { useEffect, useRef, useState } from 'react'
import { getUserProfile } from '../services/api'

const Hero = ({ onScrollDown }) => {
  const [profile, setProfile] = useState(null)
  const heroRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile(1)
      setProfile(data)
    } catch (err) {
      console.log('使用默认信息')
    }
  }

  const defaultTitle = '我的技术博客'
  const defaultSubtitle = '记录技术成长，分享实战经验'

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <div className="hero" ref={heroRef}>
      <div className="hero-background"></div>
      <div className="hero-content">
        <h1 className="hero-title">{profile?.title || defaultTitle}</h1>
        <p className="hero-subtitle">{profile?.subtitle || defaultSubtitle}</p>
      </div>
      <div className="hero-scroll-hint" onClick={handleScrollDown}>
        <span>查看文章</span>
        <div className="scroll-arrow">↓</div>
      </div>
    </div>
  )
}

export default Hero
