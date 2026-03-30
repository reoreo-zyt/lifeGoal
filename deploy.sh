#!/bin/bash

# 部署目录
DEPLOY_DIR="/home/admin/lifeGoal"

# 进入部署目录
cd "$DEPLOY_DIR"

# 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 安装依赖
echo "安装依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 重启nginx
echo "重启nginx..."
sudo systemctl restart nginx

echo "部署完成！"
