import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: (params) => {
    // 自定义参数序列化，数组每个元素单独作为同名参数
    const parts = []
    for (const key in params) {
      const value = params[key]
      if (Array.isArray(value) && value.length > 0) {
        value.forEach(v => {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
        })
      } else if (value !== undefined && value !== null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      }
    }
    return parts.join('&')
  }
})

// 请求拦截器：所有 POST 请求添加 CSRF Token
api.interceptors.request.use(
  (config) => {
    if (config.method === 'post' || config.method === 'put' || config.method === 'delete' || config.method === 'patch') {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'csrf_access_token' || name === 'csrf_token') {
          config.headers['X-CSRF-Token'] = value
          break
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 获取文章列表
export const getArticles = async (params = {}) => {
  try {
    const response = await api.get('/article/', { params })
    return response.data
  } catch (error) {
    console.error('获取文章列表失败:', error)
    throw error
  }
}

// 获取文章详情
export const getArticleById = async (articleId) => {
  try {
    const response = await api.get(`/article/${articleId}`)
    return response.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    throw error
  }
}

// 获取用户信息
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/profile`)
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}

// 获取用户基本信息（包含username）
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}

// 获取用户文章列表
export const getArticlesByUser = async (userId, params = {}) => {
  try {
    const response = await api.get(`/users/${userId}/article`, { params })
    return response.data
  } catch (error) {
    console.error('获取用户文章失败:', error)
    throw error
  }
}

// 搜索文章
export const searchArticles = async (params = {}) => {
  try {
    const response = await api.get('/search/article', { params })
    return response.data
  } catch (error) {
    console.error('搜索文章失败:', error)
    throw error
  }
}

// 获取月份归档数据
export const getMonthlyAggregation = async () => {
  try {
    const response = await api.get('/search/monthly_aggression')
    return response.data
  } catch (error) {
    console.error('获取月份归档失败:', error)
    throw error
  }
}

// 获取验证码
export const getCaptcha = async () => {
  try {
    const response = await api.get('/captcha/', {
      responseType: 'blob'
    })
    const captchaId = response.headers['x-captcha-id']
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve({
          captcha_id: captchaId,
          image: reader.result
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(response.data)
    })
  } catch (error) {
    console.error('获取验证码失败:', error)
    throw error
  }
}

// 发送联系邮件
export const sendContactEmail = async (data) => {
  try {
    const response = await api.post('/contact/me', data)
    return response.data
  } catch (error) {
    console.error('发送邮件失败:', error)
    throw error
  }
}

// 获取彩蛋信息
export const getEgg = async () => {
  try {
    const response = await api.get('/egg/')
    return response.data
  } catch (error) {
    console.error('获取彩蛋信息失败:', error)
    throw error
  }
}

// 获取切奇统计数据
export const getEggChecki = async () => {
  try {
    const response = await api.get('/egg/checki')
    return response.data
  } catch (error) {
    console.error('获取切奇数据失败:', error)
    throw error
  }
}

export default api
