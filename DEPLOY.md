# 自动化部署说明

## 服务器准备

1. **连接服务器**：
   ```bash
   ssh Admin@101.132.149.36
   ```

2. **创建部署目录**：
   ```bash
   mkdir -p /home/admin/lifeGoal
   cd /home/admin/lifeGoal
   ```

3. **克隆仓库**：
   ```bash
   git clone https://github.com/reoreo-zyt/lifeGoal.git .
   ```

4. **安装依赖**：
   ```bash
   npm install
   ```

5. **构建项目**：
   ```bash
   npm run build
   ```

6. **配置Nginx**：
   确保Nginx已经配置好，指向构建产物目录 `/home/admin/lifeGoal/dist`

## GitHub Actions 配置

1. **生成SSH密钥对**：
   ```bash
   ssh-keygen -t rsa -b 4096 -C "deploy@example.com"
   ```

2. **将公钥添加到服务器**：
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub Admin@101.132.149.36
   ```

3. **设置GitHub Secrets**：
   - 登录GitHub，进入仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - 名称：`SSH_PRIVATE_KEY`
   - 值：复制私钥文件 `~/.ssh/id_rsa` 的内容

4. **推送代码**：
   当你推送代码到 `main` 分支时，GitHub Actions 会自动执行部署流程

## 部署流程

1. 代码推送至 `main` 分支
2. GitHub Actions 触发部署 workflow
3. 连接到阿里云服务器
4. 拉取最新代码
5. 安装依赖
6. 构建项目
7. 重启Nginx
8. 部署完成

## 手动部署

如果需要手动部署，可以运行：

```bash
bash deploy.sh
```
