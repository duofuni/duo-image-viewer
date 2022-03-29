
<p align="center"><b>一个简洁的图片查看器(支持多图记忆)</b></p>

# 目录

- [快速入门](#快速入门)
  - [安装](#安装)
  - [用法](#用法)
- [维护者](#维护者)

## 快速入门

### 安装

```bash
$ npm i duo-image-viewer --save             # install duo-image-viewer   
```

### 用法

#### main.js 文件：

```js

import duoImageViewer from 'duo-image-viewer'

Vue.use(duoImageViewer)

```
#### 使用：

```vue
<template>
  <div>
    <button @click="handleOpen">打开查看器</button>
    <duo-image-viewer 
      :list="srcList"
      @open="openCallback"
      @close="closeCallback"
      :show.sync="showViewer"
      :currentIndex="currentIndex"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      currentIndex: 0, // 打开图片查看器时，需要定位到的图片的索引
      srcList: [
        "https://scpic.chinaz.net/files/pic/pic9/202203/apic39703.jpg",
        "https://scpic.chinaz.net/files/pic/pic9/202005/zzpic24899.jpg",
        "https://scpic.chinaz.net/files/pic/pic9/202109/bpic24244.jpg",
        "https://scpic.chinaz.net/files/pic/pic9/202110/hpic4529.jpg",
        "https://scpic.chinaz.net/files/pic/pic9/201912/zzpic22106.jpg",
        "https://scpic.chinaz.net/files/pic/pic9/202202/apic38580.jpg",
      ], // 图片查看器数据集
      showViewer: false, // 是否打开图片查看器
    };
  },
  methods: {
    handleOpen() {
      this.showViewer = true;
    },
    openCallback() {}, // 打开时的回调
    closeCallback() {}, // 关闭时的回调
  }
};
</script>
```

[→ simple demo](https://duofuni.github.io/duo-image-viewer/)

## 维护者

- [duofuni](https://github.com/duofuni)