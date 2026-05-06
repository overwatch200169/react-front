import { createContext, useContext, useState, useEffect } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

// Ant Design 主题配置
const lightAntdTheme = {
  token: {
    colorPrimary: '#6B9B7A',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#6B9B7A',
    colorTextBase: '#1A1A1A',
    colorBgBase: '#FAFAFA',
    colorBorder: '#C8D4CB',
    borderRadius: 8,
    fontFamily: "'MiSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  algorithm: antdTheme.defaultAlgorithm,
}

const darkAntdTheme = {
  token: {
    colorPrimary: '#7AAF8A',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#7AAF8A',
    colorTextBase: '#DCE3DD',
    colorBgBase: '#1A2E22',
    colorBorder: '#3D4D42',
    borderRadius: 8,
    fontFamily: "'MiSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  algorithm: antdTheme.darkAlgorithm,
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved !== null) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)
  const antdThemeConfig = isDark ? darkAntdTheme : lightAntdTheme

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider theme={antdThemeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
