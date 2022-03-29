<template>
  <div class="duo-viewer" v-if="show" ref="duoViewer" @click="clickAgent">
    <div class="duo-viewer-mask">
      <img
        ref="duoViewerImage"
        :src="realSrc"
        alt="image"
        class="duo-viewer-mask__image"
      />
    </div>
    <div class="duo-viewer-footer">
      <div class="duo-viewer-footer__title">{{ realSrc }}</div>
      <div class="duo-viewer-footer__toolbar">
        <ul>
          <li
            class="duo-viewer-footer__zoom-in"
            data-viewer-action="zoom-in"
          ></li>
          <li
            class="duo-viewer-footer__zoom-out"
            data-viewer-action="zoom-out"
          ></li>
          <li
            class="duo-viewer-footer__one-to-one"
            data-viewer-action="one-to-one"
          ></li>
          <li class="duo-viewer-footer__prev" data-viewer-action="prev"></li>

          <li class="duo-viewer-footer__play" data-viewer-action="play"></li>

          <li class="duo-viewer-footer__next" data-viewer-action="next"></li>
          <li class="duo-viewer-footer__reset" data-viewer-action="reset"></li>
          <li
            class="duo-viewer-footer__rotate-left"
            data-viewer-action="rotate-left"
          ></li>
          <li
            class="duo-viewer-footer__rotate-right"
            data-viewer-action="rotate-right"
          ></li>
        </ul>
      </div>
      <div class="duo-viewer-footer__navbar">
        <div class="duo-viewer-footer__navbar-thumbnail-wrap">
          <div
            ref="duoViewerImageThumbnailList"
            class="duo-viewer-footer__navbar-thumbnail-list"
            :style="{ width: `${listLength * 34}px` }"
          >
            <div
              :key="item + i"
              v-for="(item, i) in list"
              :class="
                i === index
                  ? 'duo-viewer-footer__navbar-thumbnail-item viewer-current'
                  : 'duo-viewer-footer__navbar-thumbnail-item'
              "
            >
              <img
                data-viewer-action="select"
                :data-viewer-action-index="i"
                :src="item"
                alt="image"
                class="duo-viewer-footer__navbar-thumbnail-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="duo-viewer-close" @click="handleClose">
      <div class="duo-viewer-close__off"></div>
    </div>
  </div>
</template>

<script>
import "./style/css/index.css";

export default {
  name: "duoImageViewer",
  data() {
    return {
      viewerSrc: "",
      image: null,
      listDataCache: [],
      index: 0,
    };
  },
  props: {
    // Image src list
    list: {
      type: Array,
      default: [],
    },
    // Control is show of viewer
    show: {
      type: Boolean,
      default: false,
    },
    // Default index
    currentIndex: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    listLength() {
      return this.list.length;
    },
    realSrc() {
      return this.list[this.index];
    },
    currentData() {
      return this.listDataCache[this.index];
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.$emit("open");
        this.index = this.currentIndex;
        this.init();
      } else {
        this.$emit("close");
      }
    },
  },
  methods: {
    // Global init
    init() {
      this.initDrag();
      this.initMouseWheel();
      this.keydown();
      this.initListDataCache();
    },
    // Init listDataCache
    initListDataCache(index = 0) {
      const promises = [];
      let $this = this;

      this.list.forEach((item, i) => {
        const imageObject = new Image();
        promises.push(
          new Promise((resolve) => {
            imageObject.onload = function () {
              $this.listDataCache[i] = {
                transform: {
                  scaleX: "1",
                  skewY: "0",
                  translateX: "-50%",
                  translateY: "-50%",
                  rotate: "0deg",
                },
                left: "50%",
                top: "50%",
                width: `${imageObject.width}px`,
                height: `${imageObject.height}px`,
              };

              resolve("");
              imageObject.onload = null;
            };
            imageObject.src = item;
          })
        );
      });

      Promise.all(promises).then((data) => {
        this.image = this.$refs["duoViewerImage"];

        const { width, height } = $this.listDataCache[index];

        $this.setStyleByName($this.image, "width", width);
        $this.setStyleByName($this.image, "height", height);
      });
    },
    // Reset position
    resetPosition() {
      let image = this.image,
        oldTransform = this.getCurrentTransform(image);

      this.setStyleByName(image, "top", "50%");
      this.setStyleByName(image, "left", "50%");

      oldTransform.translateX = "-50%";
      oldTransform.translateY = "-50%";

      this.setTransform(image, oldTransform);
    },

    // Reset Rotate
    resetRotate() {
      let image = this.image,
        oldTransform = this.getCurrentTransform(image);

      oldTransform.rotate = `0deg`;

      this.setTransform(image, oldTransform);
    },

    // Reset zoom action
    resetZoom() {
      let image = this.image;
      const imageObject = new Image();

      imageObject.src = this.list[this.index];

      const { width, height } = imageObject;

      this.setStyleByName(image, "width", `${width}px`);
      this.setStyleByName(image, "height", `${height}px`);

      this.listDataCache[this.index].width = `${width}px`;
      this.listDataCache[this.index].height = `${height}px`;
    },

    // Reset all action
    resetAll() {
      this.resetZoom();
      this.resetRotate();
      this.resetPosition();
      this.initListDataCache(this.index);
    },

    // Rotate action
    rotate(type) {
      let image = this.image,
        oldTransform = this.getCurrentTransform(image),
        oldRotate = Math.round(
          Math.atan2(+oldTransform.skewY, +oldTransform.scaleX) *
            (180 / Math.PI)
        ),
        changeValue = type === "left" ? -90 : 90,
        rotateValue = oldRotate + changeValue;

      oldTransform.rotate = `${rotateValue}deg`;

      oldTransform.translateX = `${oldTransform.translateX}px`;
      oldTransform.translateY = `${oldTransform.translateY}px`;
      this.currentData.transform = oldTransform;
      this.setTransform(image, oldTransform);
    },

    // Get style by name
    getStyleByName(obj, type) {
      return window.getComputedStyle(obj, null)[type];
    },

    // Set style by name
    setStyleByName(obj, key, value) {
      obj && (obj.style[key] = value);
    },

    // Get element current transform
    getCurrentTransform(obj) {
      let value,
        transform = this.getStyleByName(obj, "transform");

      if (transform === "none") return;

      value = transform.split("(")[1].split(")")[0].split(",");

      return {
        scaleX: value[0].trim(),
        skewY: value[1].trim(),
        // skewX: value[2].trim(),
        // scaleY: value[3].trim(),
        translateX: value[4].trim(),
        translateY: value[5].trim(),
      };
    },
    // Next or prev action
    switchAction(a) {
      let lastIndex = this.index;
      switch (a) {
        case "prev":
          // prev action
          this.index += this.index <= 0 ? 0 : -1;
          break;
        case "next":
          // next action
          let srcListLength = this.listLength - 1;

          this.index +=
            this.index >= srcListLength ? srcListLength - this.index : 1;
          break;
        default:
          this.index = +a;
          break;
      }
      this.judgeThumbnailListMove(lastIndex, this.index);

      this.setStyleByName(this.image, "width", this.currentData.width);
      this.setStyleByName(this.image, "height", this.currentData.height);
      this.setStyleByName(this.image, "left", this.currentData.left);
      this.setStyleByName(this.image, "top", this.currentData.top);
      this.setTransform(this.image, this.currentData.transform);
    },
    // To judge thumbnail list move
    judgeThumbnailListMove(lastIndex, index) {
      if (lastIndex == index) return;

      let translateX = 0,
        lastTransform = 0,
        step = index - lastIndex,
        move = step * 34,
        length = this.listLength,
        target = this.$refs["duoViewerImageThumbnailList"];

      if (!target) return;

      lastTransform = this.getCurrentTransform(target);

      if (lastTransform) {
        translateX = Math.abs(+lastTransform.translateX);
      }

      this.setTransform(target, {
        scaleX: "1",
        skewY: "0",
        translateX: `-${translateX + move}px`,
        translateY: "0%",
        rotate: "0deg",
      });
    },
    // Set element Transform
    setTransform(obj, transformValue) {
      let str = "";

      str += `translateX(${transformValue["translateX"]}) `;
      str += `translateY(${transformValue["translateY"]}) `;
      transformValue["rotate"] &&
        (str += `rotate(${transformValue["rotate"]}) `);

      this.setStyleByName(obj, "transform", str);
    },

    // Zoom action
    zoom(type) {
      let image = this.image,
        w = +this.getStyleByName(image, "width").split("px")[0],
        h = +this.getStyleByName(image, "height").split("px")[0];

      if (h <= 20 && type === "out") return;

      if (type === "out") {
        this.setStyleByName(image, "width", `${w * 0.9}px`);
        this.setStyleByName(image, "height", `${h * 0.9}px`);
      } else {
        this.setStyleByName(image, "width", `${w * (1 + 0.1)}px`);
        this.setStyleByName(image, "height", `${h * (1 + 0.1)}px`);
      }

      this.currentData.width = this.getStyleByName(this.image, "width");
      this.currentData.height = this.getStyleByName(this.image, "height");
    },

    // FullScreen action
    requestFullScreen() {
      let element = this.$refs["duoViewer"],
        requestMethod =
          element.requestFullScreen ||
          element.webkitRequestFullScreen ||
          element.mozRequestFullScreen ||
          element.msRequestFullScreen;

      if (requestMethod) {
        requestMethod.call(element);
      } else if (typeof window.ActiveXObject !== "undefined") {
        // ie
        let wscript = new ActiveXObject("WScript.Shell");
        wscript !== null && wscript.SendKeys("{F11}");
      }
    },

    // Keydown action
    keydown() {
      window.addEventListener("keydown", (e) => {
        e = event || window.event || arguments.callee.caller.arguments[0];

        if (e && e.keyCode == 40) {
          // down
          this.zoom("out");
        }
        if (e && e.keyCode == 37) {
          // left
          this.switchAction("prev");
        }
        if (e && e.keyCode == 39) {
          // right
          this.switchAction("next");
        }
        if (e && e.keyCode == 38) {
          // up
          this.zoom("in");
        }
      });
    },

    // Init element drag
    initDrag() {
      let x,
        y,
        boxX,
        boxY,
        pageX,
        pageY,
        scrollLeft,
        scrollTop,
        drop = this.image;

      if (!drop) return;

      const getScroll = () => {
        (scrollLeft =
          document.body.scrollLeft || document.documentElement.scrollLeft),
          (scrollTop =
            document.body.scrollTop || document.documentElement.scrollTop);
        return {
          scrollLeft,
          scrollTop,
        };
      };

      // Get the location of the mouse on the page, handle browser compatibility
      const getPage = (e) => {
        (pageX = e.pageX || e.clientX + getScroll().scrollLeft),
          (pageY = e.pageY || e.clientY + getScroll().scrollTop);
        return {
          pageX,
          pageY,
        };
      };

      drop.onmousedown = (e) => {
        // Compatible processing
        e = e || window.event;
        // When the mouse is pressed, get the location of the mouse in the box
        // Mouse position in box = mouse position on page - box position on page
        (x = getPage(e).pageX - drop.offsetLeft),
          (y = getPage(e).pageY - drop.offsetTop);

        // When the mouse starts to move
        document.onmousemove = (e) => {
          // Compatible processing
          e = e || window.event;
          // When the mouse moves, get the location of the box on the page
          // Box on page = mouse on page - mouse in box
          (boxX = getPage(e).pageX - x), (boxY = getPage(e).pageY - y);
          drop.style.left = `${boxX}px`;
          drop.style.top = `${boxY}px`;
        };
        return false;
      };
      // Stop dragging when the mouse pops up
      document.onmouseup = () => {
        document.onmousemove = null;
        this.listDataCache[this.index].left = `${boxX}px`;
        this.listDataCache[this.index].top = `${boxY}px`;
      };
    },
    // Init mouse wheel event
    initMouseWheel() {
      const scrollFn = (e) => {
        e = e || window.event;
        if (e.wheelDelta) {
          // for IE/Google
          if (e.wheelDelta > 0) {
            this.zoom("out");
          }
          if (e.wheelDelta < 0) {
            this.zoom("in");
          }
        } else if (e.detail) {
          // for Firefox
          if (e.detail > 0) {
            this.zoom("out");
          }
          if (e.detail < 0) {
            this.zoom("in");
          }
        }
      };

      document.addEventListener &&
        document.addEventListener("DOMMouseScroll", scrollFn, false);
      window.onmousewheel = document.onmousewheel = scrollFn;
    },

    // Agent
    clickAgent(e) {
      switch (e.target.getAttribute("data-viewer-action")) {
        case "zoom-in":
          this.zoom("in");
          break;
        case "zoom-out":
          this.zoom("out");
          break;
        case "one-to-one":
          this.resetZoom();
          break;
        case "prev":
          this.switchAction("prev");
          break;
        case "play":
          this.requestFullScreen();
          break;
        case "next":
          this.switchAction("next");
          break;
        case "reset":
          this.resetAll();
          break;
        case "select":
          this.switchAction(e.target.getAttribute("data-viewer-action-index"));
          break;
        case "rotate-left":
          this.rotate("left");
          break;
        case "rotate-right":
          this.rotate("right");
          break;
      }
    },
    // On close
    handleClose() {
      this.$emit("update:show", false);
    },
  },
};
</script>

<style>
</style>