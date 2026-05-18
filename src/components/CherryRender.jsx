import React, { useEffect,useState, useRef } from 'react';
import Cherry from 'cherry-markdown';
import 'cherry-markdown/dist/cherry-markdown.css';
import { Image } from 'antd';
import { useTheme } from '../context/ThemeContext'; 

// 🟢 1. 提取到组件外部（文件最顶部）！
// 这样它在文件加载时就100%初始化完成了，组件内部任何地方调用都绝不会报 ReferenceError。

const getCherryOptions = (element, theme, initialContent,isMobile) => ({
  el: element, // 显式将 DOM 节点传入
  value: initialContent || '',
  nameSpace: 'cherry', 
  themeSettings: {
    
    mainTheme: theme === 'dark' ? 'dark' : 'light',
    codeBlockTheme:  'dark',
 
    inlineCodeTheme:  'black'
    },
  editor: { defaultModel: 'previewOnly' },
   previewer: {
    
    enablePreviewerBubble: false,
    isMobilePreview: isMobile?true:false ,
    floatWhenClosePreviewer: false,
    lazyLoadImg : {noLoadImgNum: 0, autoLoadImgNum: -1}
  },
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
  const [isMobile, setIsMobile] = useState(false)
 const [previewVisible, setPreviewVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // 当前点击的是第几张
  const [imageList, setImageList] = useState([]);      // 文档里所有的图片合集

  // 1. 提取文档中的所有图片


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  // 🟢 2. 处理内容同步与初始化
  useEffect(() => {
    if (!containerRef.current) return;

    if (!cherryInstanceRef.current) {
      // 传入 containerRef.current 物理节点、当前物理主题、以及初始内容
      cherryInstanceRef.current = new Cherry(
        getCherryOptions(containerRef.current, resolvedTheme, content,isMobile)
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
    <>
      {/* 🟢 1. 挂载一个隐藏的单独 Image 组件，专门用来提供 Antd 的预览框能力 */}
      <Image.PreviewGroup
        preview={{
          visible: previewVisible,
          current: currentIndex,
          onVisibleChange: (value) => setPreviewVisible(value),
          onChange: (current) => setCurrentIndex(current), // 切换图片时同步索引
        }}
        items={imageList} // 将提取到的所有图片列表喂给 Antd
      />
    <div 
      ref={containerRef} 
      id='cherry-renderer-wrapper'
      className="cherry-renderer-wrapper" 
      style={{ width: '100%', minHeight: '100%', backgroundColor: 'transparent' }}
      onClick={(e) => {
        // 🚀 核心修复区：当点击图片时，实时计算索引和列表
          if (e.target.tagName === 'IMG') {
            
            // 1. 实时获取当下容器内所有的 img 节点（此时 DOM 已绝对稳定）
            const imgs = Array.from(containerRef.current.querySelectorAll('img'));
            
            // 2. 直接比对物理 DOM 节点引用，而不是比对易错的 URL 字符串
            const idx = imgs.indexOf(e.target);
            
            if (idx !== -1) {
              // 3. 提取当下最新的 src 数组
              // (兼容部分 markdown 引擎使用 data-src 做懒加载的情况)
              const urls = imgs.map(img => img.src || img.getAttribute('data-src'));
              
              // 4. 利用 React 的批量更新（Batching），同时推入状态并唤起预览
              setImageList(urls);
              setCurrentIndex(idx);
              setPreviewVisible(true);
            }
          }
        }}
    />
    </>
  );
}