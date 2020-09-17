
<p align="center"><b>一个简洁的图片查看器</b></p>

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
      :src="src" 
      :srcList="srcList" 
      @close="handleClose" 
      :showViewer="showViewer"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      src: {
        name: '',
        url: "https://baidu.com/pictures/2020-09-08/1599535213868-GDJJZizFVtepBxlXpq.jpg"
      },
      srcList: [
        "https://baidu.com/pictures/2020-09-08/1599535213868-GDJJZizFVtepBxlXpq.jpg",
        "https://baidu.com/pictures/2020-09-08/1599535221238-tQfrTrrwOLSdhtiVBY.jpg",
      ],
      showViewer: false,
    };
  },
  methods: {
    handleOpen() {
      this.showViewer = !this.showViewer
    },
    handleClose() {
      this.showViewer = false
    }
  }
};
</script>
```

[→ simple demo](https://duofuni.github.io/duo-image-viewer/)

## 维护者

- [duofuni](https://github.com/duofuni)