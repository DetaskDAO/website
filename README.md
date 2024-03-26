# DeTask
<p align="center">
  <img src="./public/logo1.png" width="400" alt="DeTask logo">
</p>

## 🚀 DeTask frontend

### 技术栈

`next@12.3.1 + wagmi@0.6.4 + redux@4.2.0 + ethers@5.7 + Antd@5.8.2`

> `ahooks`    React Hooks 库

> `identicon.js`    哈希头像生成

### 基本功能

- [x] 派发任务
- [x] 接收任务
- [x] 任务管理

### 项目结构

```
├── components               # 组件
├── containers               # 容器
├── public                   # 资源文件
├── page                     # UI 页面
├── utils                    # 工具
├── styles                   # 样式
├── src                      # 主程序目录
│   ├── controller              # 合约调用
│   ├── depolyments             # 合约地址
│   ├── redux                   # redux配置
│   └── request                 # 请求接口
```

### 配置参数

将以下配置添加到`./env.development`文件中，将'xxx'替换为设定值。
```bash
NEXT_PUBLIC_DEVELOPMENT_CHAIN="mumbai"
NEXT_PUBLIC_DEVELOPMENT_CHAIN_ID="80001"

NEXT_PUBLIC_CONTRACT_DETASK=xxx           # DETASK 合约地址
NEXT_PUBLIC_CONTRACT_DEORDER=xxx          # DEORDER 合约地址
NEXT_PUBLIC_CONTRACT_PERMIT2=xxx          # PERMIT2 合约地址
NEXT_PUBLIC_CONTRACT_USDC=xxx             # USDC 合约地址

NEXT_PUBLIC_INFURA_KEY=xxx              # INFURA KEY

NEXT_PUBLIC_DEVELOPMENT_API=xxx         # API 地址
NEXT_PUBLIC_DEVELOPMENT_UPLOAD=xxx      # UPLOAD 文件目录
NEXT_PUBLIC_DEVELOPMENT_FILE=xxx        # IPFS 节点

NEXT_PUBLIC_SOCIAL_GITHUB_INVITE_URL="https://github.com/DetaskDAO"         # gitub
NEXT_PUBLIC_SOCIAL_TWITTER_INVITE_URL="https://twitter.com/Detasks"         # twitter
NEXT_PUBLIC_SOCIAL_DISCORD_INVITE_URL="https://discord.gg/nWWQgsSZjy"       # discord
NEXT_PUBLIC_SOCIAL_TELEGRAM_INVITE_URL="https://t.me/detaskxyz"             # telegram
NEXT_PUBLIC_SOCIAL_MEDIUM_INVITE_URL="https://medium.com/@web3.detask"      # medium
```

### 使用方法

```npm

// 安装依赖
npm i

// 启动
npm dev

```