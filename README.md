# lit_game_sldm

小游戏合集，使用 React + TypeScript + Vite 构建，通过 Capacitor 打包为安卓 APK。

## 游戏列表

### 2048
经典 2048 数字合成游戏，支持 4×4 / 6×6 棋盘、三种难度、键盘/鼠标/触屏操作。

### 五子棋 (Gomoku)
15×15 棋盘五子棋，支持人机对战和双人同屏。AI 三级难度，含 Renju 标准禁手规则（三三/四四/长连禁手）。

## 运行

```bash
cd <游戏目录>
npm install
npm run dev      # 本地预览
npm run build    # 生产构建
npm test         # 跑测试
```

## 打包 APK

```bash
cd <游戏目录>/android
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Users/gemii/Library/Java/JavaVirtualMachines/openjdk-20.0.2/Contents/Home
./gradlew assembleDebug --no-daemon
```
