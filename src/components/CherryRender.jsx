import React, { useEffect, useRef } from 'react';
import Cherry from 'cherry-markdown';
import 'cherry-markdown/dist/cherry-markdown.css';
import { useTheme } from '../context/ThemeContext'; 

// 🟢 1. 提取到组件外部（文件最顶部）！
// 这样它在文件加载时就100%初始化完成了，组件内部任何地方调用都绝不会报 ReferenceError。
const getCherryOptions = (element, theme, initialContent) => ({
  el: element, // 显式将 DOM 节点传入
  value: initialContent || '',
  nameSpace: 'cherry', 
  themeSettings: {
    
    mainTheme: theme === 'dark' ? 'dark' : 'light',
    codeBlockTheme:  'defualt',
  // 🔴 官方只吃 'red' 或 'black'。我们可以让白天用 red，暗黑用 black，但核心视觉依然靠上面的 CSS 来拯救。
    inlineCodeTheme:  'black'
    },
  editor: { defaultModel: 'previewOnly' },
  toolbars: { showToolbar: false, bubble: false, float: false },
  engine: {
    global: { urlProcessor: (url) => url },
    // syntax: {
    //   autoLink: true, table: true, fontColor: true, fontSize: true,
    //   headerId: true, mermaid: true, chart: true,
    // },
  },
});

export default function CherryRenderer({ content }) {
  const containerRef = useRef(null);
  const cherryInstanceRef = useRef(null);
  const { resolvedTheme } = useTheme();

  // 🟢 2. 处理内容同步与初始化
  useEffect(() => {
    if (!containerRef.current) return;

    if (!cherryInstanceRef.current) {
      // 传入 containerRef.current 物理节点、当前物理主题、以及初始内容
      cherryInstanceRef.current = new Cherry(
        getCherryOptions(containerRef.current, resolvedTheme, content)
      );
    } else {
      cherryInstanceRef.current.setValue(content || '');
    }
  }, [content]); 

  // 🟢 3. 安全管理主题切换
  useEffect(() => {
    if (cherryInstanceRef.current) {
      const targetTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
      cherryInstanceRef.current.setTheme(targetTheme);
    //   cherryInstanceRef.current.setCodeBlockTheme('def');
    //   cherryInstanceRef.current.setInlineCodeTheme('black')
    }
  }, [resolvedTheme]);

  // 🟢 4. 组件卸载时的物理清理
  useEffect(() => {
    return () => {
      if (cherryInstanceRef.current) {
        cherryInstanceRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="cherry-renderer-wrapper" 
      style={{ width: '100%', minHeight: '100%', backgroundColor: 'transparent' }}
    />
  );
}