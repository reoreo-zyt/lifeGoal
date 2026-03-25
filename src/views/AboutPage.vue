<template>
  <div class="about-page">
    <h2>关于我们</h2>
    <div class="about-content">
      <p>欢迎来到历史书籍库，这是一个致力于保存和分享历史文化遗产的平台。我们希望通过数字化的方式，让更多人能够接触到珍贵的历史文献和经典著作。</p>
      
      <div class="maintenance-section">
        <h3>服务器维护</h3>
        <p>为了提供稳定的服务，我们需要持续维护服务器和存储空间。这些费用包括服务器租赁、带宽使用、数据存储等方面的支出。</p>
        <p>如果您觉得我们的网站对您有所帮助，欢迎通过以下方式支持我们的运营：</p>
      </div>
      
      <div class="donation-section">
        <h3>捐赠支持</h3>
        <div class="qr-code">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wechat%20payment%20qr%20code%20for%20donation&image_size=square" alt="微信收款码" class="wechat-qr">
          <p>微信扫码捐赠</p>
        </div>
        <div class="thank-you">
          <h4>感谢您的支持！</h4>
          <p>您的每一份捐赠都将用于服务器维护和网站功能的改进，让我们能够为更多用户提供优质的历史书籍资源。</p>
          <p>无论捐赠金额大小，我们都深表感谢！</p>
        </div>
      </div>
      
      <div class="contact-section">
        <h3>联系我们</h3>
        <p>如果您有任何建议或问题，欢迎与我们联系。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 关于页面逻辑
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.about-page h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
  border-bottom: 2px solid var(--secondary-color);
  padding-bottom: 1rem;
}

.about-content {
  line-height: 1.8;
}

.about-content p {
  margin-bottom: 1.5rem;
}

.maintenance-section {
  background-color: rgba(212, 175, 55, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  border-left: 4px solid var(--secondary-color);
}

.maintenance-section h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.donation-section {
  margin: 2rem 0;
  text-align: center;
}

.donation-section h3 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.qr-code {
  margin: 2rem 0;
}

.wechat-qr {
  width: 200px;
  height: 200px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  background-color: white;
}

.qr-code p {
  margin-top: 1rem;
  font-weight: 500;
  color: var(--primary-color);
}

.thank-you {
  background-color: rgba(139, 69, 19, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.thank-you h4 {
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.contact-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.contact-section h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}
</style>
