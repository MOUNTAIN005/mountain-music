#!/bin/bash
# ========================================
# 山影知道 | MOUNTAIN Music 部署脚本
# 目标：绿联云NAS (192.168.31.171)
# 使用方法：bash deploy.sh
# ========================================

NAS_IP="192.168.31.171"
NAS_USER="MOUNTAIN"
NAS_PATH="/home/MOUNTAIN/mountain-music"
PACKAGE="/tmp/mountain-music-deploy.tar.gz"
SSHPASS="./sshpass"

echo "=========================================="
echo "  山影知道 | MOUNTAIN Music 部署脚本"
echo "  目标: $NAS_USER@$NAS_IP"
echo "=========================================="

if [ ! -f "$SSHPASS" ]; then
  echo "⚠️  sshpass 未安装，请输入 NAS 密码（仅本次使用）"
  read -s -p "NAS 登录密码: " PASSWORD
  echo ""
else
  PASSWORD=""
fi

# 读取密码
if [ -z "$PASSWORD" ] && [ -f "$SSHPASS" ]; then
  echo ""
  echo "请运行: bash deploy-with-password.sh"
  echo "或手动输入 sshpass 命令"
  exit 0
fi

# 第一步：打包
echo ""
echo "[1/4] 打包项目中..."
cd /Users/mountain/Desktop/mountainredio
tar czf "$PACKAGE" --exclude=node_modules --exclude=.next --exclude=dev.db* --exclude=.DS_Store --exclude=.git --exclude=sshpass . 2>&1 || { echo "❌ 打包失败"; exit 1; }
echo "✅ 打包完成: $(du -h "$PACKAGE" | cut -f1)"

# 第二步：上传
echo ""
echo "[2/4] 上传到 NAS..."
ssh "$NAS_USER@$NAS_IP" "mkdir -p $NAS_PATH"
cat "$PACKAGE" | ssh "$NAS_USER@$NAS_IP" "cat > $NAS_PATH/mountain-music-deploy.tar.gz" || { echo "❌ 上传失败"; exit 1; }
echo "✅ 上传完成"

# 第三步：解压
echo ""
echo "[3/4] 解压..."
ssh "$NAS_USER@$NAS_IP" "cd $NAS_PATH && tar xzf mountain-music-deploy.tar.gz && rm mountain-music-deploy.tar.gz && find . -name '._*' -delete 2>/dev/null; echo 'EXTRACT_OK'" || { echo "❌ 解压失败"; exit 1; }
echo "✅ 解压完成"

# 第四步：构建并启动
echo ""
echo "[4/4] 构建并启动 Docker..."
ssh "$NAS_USER@$NAS_IP" "cd $NAS_PATH && echo '$PASSWORD' | sudo -S docker compose -f docker/docker-compose.yml build 2>&1" || { echo "❌ Docker 构建失败"; exit 1; }
ssh "$NAS_USER@$NAS_IP" "cd $NAS_PATH && echo '$PASSWORD' | sudo -S docker compose -f docker/docker-compose.yml down 2>/dev/null; echo '$PASSWORD' | sudo -S docker compose -f docker/docker-compose.yml up -d 2>&1" || { echo "❌ 启动失败"; exit 1; }
sleep 5
ssh "$NAS_USER@$NAS_IP" "echo '$PASSWORD' | sudo -S docker compose -f $NAS_PATH/docker/docker-compose.yml exec -T app sh /app/init.sh 2>&1" || echo "⚠️ 初始化可能有警告"
echo "✅ 部署完成！"
echo ""
echo "=========================================="
echo "  前台: http://$NAS_IP:3000"
echo "  后台: http://$NAS_IP:3000/admin/dashboard"
echo "=========================================="
