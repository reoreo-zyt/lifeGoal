# GitHub Actions 服务器密码配置指南

## 错误原因

报错：`Command failed: ssh-add - Error loading key "(stdin)": error in libcrypto`

这表示SSH密钥加载失败，可能是由于密钥格式错误或权限问题。

## 解决方案

我已经修改了GitHub Actions workflow文件，使用密码认证而不是SSH密钥认证，这样可以避免SSH密钥相关的问题。

### 步骤1：在GitHub仓库中设置SERVER_PASSWORD

1. **登录GitHub**，进入仓库：https://github.com/reoreo-zyt/lifeGoal

2. **进入Settings**：
   - 点击仓库顶部的 "Settings" 选项卡

3. **进入Secrets and variables**：
   - 在左侧菜单中选择 "Secrets and variables" → "Actions"

4. **创建新密钥**：
   - 点击 "New repository secret"
   - **Name**：输入 `SERVER_PASSWORD`（必须与 workflow 文件中的名称一致）
   - **Secret**：输入服务器的密码：`这里是你的服务器密码`
   - 点击 "Add secret"

### 步骤2：验证配置

1. **推送代码测试**：
   推送代码到 `main` 分支，观察GitHub Actions的执行状态。

## 常见问题

1. **密码格式错误**：确保输入的密码与服务器登录密码完全一致，包括大小写和特殊字符。

2. **密钥名称错误**：确保GitHub Secrets中的密钥名称与 workflow 文件中的一致（大小写敏感）。

3. **服务器防火墙**：确保服务器的SSH端口（22）是开放的。

4. **服务器权限**：确保登录用户 `Admin` 有执行部署命令的权限，特别是 `sudo systemctl restart nginx` 命令。

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
