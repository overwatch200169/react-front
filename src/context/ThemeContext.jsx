import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'

const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  // 1. 状态统一：'light' | 'dark' | 'system'
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system')

  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  // 2. 计算最终生效的颜色
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

  // 3. 强制应用到 HTML
  const applyTheme = useCallback((res) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(res)
    root.setAttribute('data-theme', res)
  }, [])

  const setTheme = (t) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
  }

  useEffect(() => {
    applyTheme(resolvedTheme)

    // 只有在 system 模式下才监听硬件变化
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme(getSystemTheme())
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme, resolvedTheme, applyTheme])

 // 🟢 3. Ant Design 主题算法切换
  const antdConfig = {
    // 根据 resolvedTheme 决定使用哪种算法
    algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: resolvedTheme === 'dark' ? '#7AAF8A' : '#6B9B7A', // 也可以在这里动态调色
      borderRadius: 8,
      fontFamily: "'MiSans', sans-serif",
    },
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <ConfigProvider theme={antdConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}