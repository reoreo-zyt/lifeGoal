# GitHub Actions SSH密钥配置指南

## 错误原因

报错：`The ssh-private-key argument is empty. Maybe the secret has not been configured, or you are using a wrong secret name in your workflow file.`

这表示GitHub Actions工作流无法找到名为 `SSH_PRIVATE_KEY` 的密钥，或者该密钥内容为空。

## 解决方案

### 步骤1：生成SSH密钥对

1. **在本地终端生成密钥对**：
   ```bash
   # Windows (PowerShell)
   ssh-keygen -t rsa -b 4096 -C "deploy@example.com" -f $HOME\.ssh\id_rsa
   
   # Linux/Mac
   ssh-keygen -t rsa -b 4096 -C "deploy@example.com"
   ```

2. **查看生成的密钥文件**：
   - 私钥：`~/.ssh/id_rsa`（需要复制到GitHub Secrets）
   - 公钥：`~/.ssh/id_rsa.pub`（需要添加到服务器）

### 步骤2：将公钥添加到服务器

1. **连接服务器**：
   ```bash
   ssh Admin@101.132.149.36
   ```

2. **创建.ssh目录（如果不存在）**：
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   ```

3. **将公钥添加到authorized_keys**：
   ```bash
   # 在本地终端执行
   cat ~/.ssh/id_rsa.pub | ssh Admin@101.132.149.36 "cat >> ~/.ssh/authorized_keys"
   
   # 或在服务器上手动编辑
   nano ~/.ssh/authorized_keys
   # 粘贴公钥内容，保存退出
   ```

4. **设置文件权限**：
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   ```

### 步骤3：在GitHub仓库中设置SSH_PRIVATE_KEY

1. **登录GitHub**，进入仓库：https://github.com/reoreo-zyt/lifeGoal

2. **进入Settings**：
   - 点击仓库顶部的 "Settings" 选项卡

3. **进入Secrets and variables**：
   - 在左侧菜单中选择 "Secrets and variables" → "Actions"

4. **创建新密钥**：
   - 点击 "New repository secret"
   - **Name**：输入 `SSH_PRIVATE_KEY`（必须与 workflow 文件中的名称一致）
   - **Secret**：打开本地的 `~/.ssh/id_rsa` 文件，复制其完整内容（包括 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`）
   - 点击 "Add secret"

### 步骤4：验证配置

1. **测试SSH连接**：
   ```bash
   ssh -i ~/.ssh/id_rsa Admin@101.132.149.36
   ```
   如果能够成功连接，说明密钥配置正确。

2. **推送代码测试**：
   推送代码到 `main` 分支，观察GitHub Actions的执行状态。

## 常见问题

1. **密钥格式错误**：确保复制的是完整的私钥内容，包括首尾的标记行。

2. **权限问题**：确保服务器上的 `~/.ssh` 目录权限为 700，`~/.ssh/authorized_keys` 文件权限为 600。

3. **密钥名称错误**：确保GitHub Secrets中的密钥名称与 workflow 文件中的一致（大小写敏感）。

4. **服务器防火墙**：确保服务器的SSH端口（22）是开放的。

## 手动部署备选方案

如果GitHub Actions配置遇到困难，可以使用手动部署：

1. **连接服务器**：
   ```bash
   ssh Admin@101.132.149.36
   ```

2. **进入部署目录**：
   ```bash
   cd /home/admin/lifeGoal
   ```

3. **执行部署**：
   ```bash
   git pull origin main && npm install && npm run build && sudo systemctl restart nginx
   ```
