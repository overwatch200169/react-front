import { useState } from 'react'
import LazyLoad from 'react-lazyload'
import { UserOutlined } from '@ant-design/icons'

const LazyImage = ({ src, alt, className, style, fallback, wrapperStyle }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    if (fallback) {
      return fallback
    }
    // 错误时显示占位图标，保持容器尺寸
    return (
      <div 
        className={`lazy-image-wrapper lazy-image-error ${className || ''}`} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--md-surface-container-high, #e0e0e0)',
          minHeight: wrapperStyle?.height || 120,
          ...wrapperStyle,
          ...style 
        }}
      >
        <UserOutlined style={{ fontSize: 48, color: 'var(--md-on-surface-variant, #999)' }} />
      </div>
    )
  }

  return (
    <LazyLoad height={200} once offset={100}>
      <div className={`lazy-image-wrapper ${className || ''}`} style={{ ...wrapperStyle, ...style }}>
        {!loaded && (
          <div className="lazy-image-placeholder" />
        )}
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${loaded ? 'lazy-image-loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </div>
    </LazyLoad>
  )
}

export default LazyImage
