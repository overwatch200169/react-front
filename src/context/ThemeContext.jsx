// import { createContext, useContext, useState, useEffect, useCallback } from 'react'
// import { ConfigProvider, theme as antdTheme } from 'antd'

// const ThemeContext = createContext()
// export const useTheme = () => useContext(ThemeContext)

// // Ant Design 主题配置（保留你原来的颜色设置）
// const lightAntdTheme = {
//   token: {
//     colorPrimary: '#6B9B7A',
//     colorTextBase: '#1A1A1A',
//     colorBgBase: '#FAFAFA',
//     borderRadius: 8,
//     fontFamily: "'MiSans', sans-serif",
//   },
//   algorithm: antdTheme.defaultAlgorithm,
// }

// const darkAntdTheme = {
//   token: {
//     colorPrimary: '#7AAF8A',
//     colorTextBase: '#DCE3DD',
//     colorBgBase: '#1A2E22',
//     borderRadius: 8,
//     fontFamily: "'MiSans', sans-serif",
//   },
//   algorithm: antdTheme.darkAlgorithm,
// }

// export const ThemeProvider = ({ children }) => {
//   // 1. 状态改为三档：'light' | 'dark' | 'system'
//   const [theme, setThemeState] = useState(() => {
//     return localStorage.getItem('theme') || 'system'
//   })

//   // 2. 获取系统实际的颜色
//   const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

//   // 3. 计算最终渲染的主题
//   const [resolvedTheme, setResolvedTheme] = useState(theme === 'system' ? getSystemTheme() : theme)

//   const applyTheme = useCallback((resolved) => {
//     const root = document.documentElement
//     // 强制移除所有类，然后添加当前计算出的类
//     // 这一步非常重要，它能让 :root.dark 或 :root.light 的 CSS 优先级高于媒体查询
//     root.classList.remove('light', 'dark')
//     root.classList.add(resolved)
//     root.setAttribute('data-theme', resolved)
//   }, [])

//   // 4. 更新函数
//   const setTheme = (t) => {
//     setThemeState(t)
//     localStorage.setItem('theme', t)
//   }

// useEffect(() => {
//   const root = document.documentElement;
//   const storageTheme = localStorage.getItem('theme');
  
//   // 核心逻辑：如果是移动端，忽略存储，强制跟随系统
//   const isMobile = window.innerWidth <= 768;
//   const finalDark = isMobile 
//     ? window.matchMedia('(prefers-color-scheme: dark)').matches 
//     : isDark; // 桌面端用手动状态

//   // 🟢 彻底同步 HTML 状态
//   root.classList.remove('light', 'dark');
//   if (finalDark) {
//     root.classList.add('dark');
//     root.setAttribute('data-theme', 'dark');
//   } else {
//     root.classList.add('light');
//     root.setAttribute('data-theme', 'light');
//   }
  
//   // 同步到 LocalStorage (仅在非移动端)
//   if (!isMobile) {
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
//   }
// }, [isDark]);

//   const antdThemeConfig = resolvedTheme === 'dark' ? darkAntdTheme : lightAntdTheme

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
//       <ConfigProvider theme={antdThemeConfig}>
//         {children}
//       </ConfigProvider>
//     </ThemeContext.Provider>
//   )
// }
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

  // Antd 配置（使用计算出的 resolvedTheme）
  const algorithm = resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <ConfigProvider theme={{ algorithm, token: { /* 你的token... */ } }}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}