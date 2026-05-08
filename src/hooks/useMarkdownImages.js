import { useEffect, useRef } from 'react'
import LazyLoad from 'react-lazyload'

/**
 * 为 Markdown 内容中的图片添加懒加载效果
 * @param {string} contentSelector - Markdown 内容的 CSS 选择器
 */
const useMarkdownImages = (contentSelector = '.markdown-content') => {
  const observerRef = useRef(null)

  useEffect(() => {
    const container = document.querySelector(contentSelector)
    if (!container) return

    // 处理单个图片
    const processImage = (img) => {
      if (img.dataset.lazyHandled) return
      img.dataset.lazyHandled = 'true'

      // 创建包装容器
      const wrapper = document.createElement('div')
      wrapper.className = 'markdown-image-wrapper'
      img.parentNode.insertBefore(wrapper, img)
      wrapper.appendChild(img)

      // 添加加载状态类
      img.classList.add('lazy-image')
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.5s ease-in-out'

      // 创建占位符
      const placeholder = document.createElement('div')
      placeholder.className = 'lazy-image-placeholder'
      wrapper.insertBefore(placeholder, img)

      // 监听图片加载
      img.onload = () => {
        img.style.opacity = '1'
        placeholder.style.display = 'none'
      }
      img.onerror = () => {
        img.style.opacity = '1'
        placeholder.style.display = 'none'
      }
    }

    // 处理已有图片
    const existingImages = container.querySelectorAll('img')
    existingImages.forEach(processImage)

    // 使用 MutationObserver 监听新插入的图片
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IMG') {
            processImage(node)
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(processImage)
          }
        })
      })
    })

    observerRef.current.observe(container, { childList: true, subtree: true })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [contentSelector])
}

export default useMarkdownImages
