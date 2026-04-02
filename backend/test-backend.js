const axios = require('axios');

async function testBackend() {
  try {
    console.log('测试后端服务...');
    
    // 测试获取文章列表
    const articlesResponse = await axios.get('http://localhost:3000/articles');
    console.log('获取文章列表成功:', articlesResponse.data.length, '篇文章');
    
    console.log('后端服务正常运行！');
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testBackend();