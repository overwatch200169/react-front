import { useState, useEffect } from 'react'
import { Input, Button, message } from 'antd'
import { UserOutlined, BookOutlined, ToolOutlined, MailOutlined, CoffeeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getUserProfile, getCaptcha, sendContactEmail } from '../services/api'

const { TextArea } = Input

const AboutPage = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    mail_text: '',
    captcha_code: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchNewCaptcha()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getUserProfile(1)
      setProfile(data)
    } catch (err) {
      console.log('使用默认关于信息')
    } finally {
      setLoading(false)
    }
  }

  const fetchNewCaptcha = async () => {
    try {
      const result = await getCaptcha()
      if (result.captcha_id) {
        setCaptchaId(result.captcha_id)
      }
      if (result.image) {
        setCaptchaImage(result.image)
      }
    } catch (err) {
      console.error('获取验证码失败:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.sender_email || !formData.mail_text || !formData.captcha_code) {
      message.error('请填写所有必填字段')
      return
    }

    try {
      setIsSubmitting(true)
      await sendContactEmail({
        sender_name: formData.sender_name || null,
        sender_email: formData.sender_email,
        mail_text: formData.mail_text,
        captcha_id: captchaId,
        captcha_code: formData.captcha_code
      })
      message.success('邮件发送成功！')
      setFormData({ sender_name: '', sender_email: '', mail_text: '', captcha_code: '' })
      fetchNewCaptcha()
    } catch (err) {
      message.error(err.response?.data?.message || '发送失败，请重试')
      fetchNewCaptcha()
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultProfile = {
    bio: '一名热爱技术的开发者，专注于Web开发领域。喜欢探索新技术，分享学习心得。在这个博客中，我会记录工作中的点点滴滴，希望能与志同道合的朋友共同成长。',
    skills: ['React', 'Python', 'Docker', 'Redis', 'Git']
  }

  const displayProfile = profile || defaultProfile

  return (
    <div className="container" style={{ position: 'relative' }}>
      <Link to="/egg" className="egg-entrance" title="彩蛋">
        <CoffeeOutlined />
      </Link>
      <div className="about-content">
        <div className="about-header">
          <div className="about-avatar"><UserOutlined /></div>
          <div className="about-info">
            <h1>关于我</h1>
            <p>热爱技术，享受代码带来的乐趣</p>
          </div>
        </div>
        
        <div className="about-section">
          <h2><BookOutlined /> 个人简介</h2>
          <p>{displayProfile.bio || defaultProfile.bio}</p>
        </div>
        
        <div className="about-section">
          <h2>🛠 技术栈</h2>
          <div className="skills-grid">
            {(profile?.skills || defaultProfile.skills).map((skill, index) => (
              <div key={index} className="skill-item">
                {skill}
              </div>
            ))}
          </div>
        </div>
        
        <div className="about-section">
          <h2><MailOutlined /> 联系我</h2>
          <p className="contact-intro">有任何问题或建议，欢迎给我发送邮件！</p>
          
          <div className="contact-form">
            <div className="form-field">
              <label htmlFor="sender_name">您的称呼（可选）</label>
              <Input
                id="sender_name"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleInputChange}
                placeholder="请输入您的称呼"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="sender_email">邮箱地址</label>
              <Input
                type="email"
                id="sender_email"
                name="sender_email"
                value={formData.sender_email}
                onChange={handleInputChange}
                placeholder="请输入您的邮箱"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="mail_text">留言内容</label>
              <TextArea
                id="mail_text"
                name="mail_text"
                value={formData.mail_text}
                onChange={handleInputChange}
                placeholder="请输入您想说的话..."
                rows={5}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-field captcha-field">
              <Input
                id="captcha_code"
                name="captcha_code"
                value={formData.captcha_code}
                onChange={handleInputChange}
                placeholder="请输入验证码"
                disabled={isSubmitting}
                style={{ width: 200 }}
              />
              {captchaImage && (
                <img
                  className="captcha-image"
                  src={captchaImage}
                  alt="验证码"
                  onClick={fetchNewCaptcha}
                  title="点击刷新验证码"
                  style={{ cursor: 'pointer', marginLeft: 12 }}
                />
              )}
            </div>
            
            <Button 
              type="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              {isSubmitting ? '发送中...' : '发送邮件'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
