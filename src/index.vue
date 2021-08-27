<template>
  <div
    class="duo-image-viewer"
    v-show="showViewer"
    ref="duoViewer"
    @click="clickAgent"
  >
    <div class="viewer-mask">
      <img
        ref="duoViewerImage"
        :src="realSrc"
        alt="image"
        class="viewer-image"
      />
    </div>
    <div class="viewer-footer">
      <div class="viewer-title">{{ src }}</div>
      <div class="viewer-toolbar">
        <ul>
          <li class="viewer-zoom-in" data-viewer-action="zoom-in"></li>
          <li class="viewer-zoom-out" data-viewer-action="zoom-out"></li>
          <li class="viewer-one-to-one" data-viewer-action="one-to-one"></li>
          <li class="viewer-prev" data-viewer-action="prev"></li>

          <li class="viewer-play" data-viewer-action="play"></li>

          <li class="viewer-next" data-viewer-action="next"></li>
          <li class="viewer-reset" data-viewer-action="reset"></li>
          <li class="viewer-rotate-left" data-viewer-action="rotate-left"></li>
          <li
            class="viewer-rotate-right"
            data-viewer-action="rotate-right"
          ></li>
        </ul>
      </div>
      <div class="viewer-navbar">
        <ul class="thumbnail-list">
          <li
            :key="item + i"
            v-for="(item, i) in srcList"
            :class="
              item === realSrc
                ? 'thumbnail-item viewer-current'
                : 'thumbnail-item'
            "
          >
            <img
              data-viewer-action="select"
              :data-viewer-action-index="i"
              :src="item"
              alt="image"
              class="thumbnail-image"
            />
          </li>
        </ul>
      </div>
    </div>
    <div class="viewer-close" @click="handleClose">
      <div class="false"></div>
    </div>
  </div>
</template>

<script>
import "./style/css/index.css";

export default {
  name: "duoImageViewer",
  data() {
    return {
      defaultHeight: "",
      defaultWidth: "",
      viewerSrc: "",
      currentIndex: 0,
    };
  },
  props: {
    src: {
      type: String,
      default: "",
    },
    srcList: {
      type: Array,
      default: [],
    },
    showViewer: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    realSrc() {
      return this.viewerSrc ? this.viewerSrc : this.src;
    },
  },
  watch: {
    showViewer() {
      if (this.showViewer) {
        this.srcList.forEach((item, i) => {
          item === this.src && (this.currentIndex = i);
        });
      }
    },
  },
  mounted() {
    this.initDrag();
    this.initMouseWheel();
    this.keydown();
    setTimeout(() => {
      this.storageDefaultWidthAndHeight();
    }, 100);
  },
  methods: {
    // Reset position
    resetPosition() {
      let image = this.$refs["duoViewerImage"],
        oldTransform = this.getCurrentTransform(image);

      this.setStyleByName(image, "top", "50%");
      this.setStyleByName(image, "left", "50%");

      oldTransform.translateX = "-50%";
      oldTransform.translateY = "-50%";

      this.setTransform(image, oldTransform);
    },

    // Reset Rotate
    resetRotate() {
      let image = this.$refs["duoViewerImage"],
        oldTransform = this.getCurrentTransform(image);

      oldTransform.rotate = `0deg`;

      this.setTransform(image, oldTransform);
    },

    // Reset zoom action
    resetZoom() {
      let image = this.$refs["duoViewerImage"];

      this.setStyleByName(image, "width", `${this.defaultWidth}`);
      this.setStyleByName(image, "height", `${this.defaultHeight}`);
    },

    // Reset all action
    resetAll() {
      this.resetZoom();
      this.resetRotate();
      this.resetPosition();
    },

    // Rotate action
    rotate(type) {
      let image = this.$refs["duoViewerImage"],
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

      this.setTransform(image, oldTransform);
    },

    // Get style by name
    getStyleByName(obj, type) {
      return Object.prototype.toString.call(obj) === "[object HTMLImageElement]"
        ? window.getComputedStyle(obj, null)[type]
        : "";
    },

    // Set style by name
    setStyleByName(obj, key, value) {
      obj && (obj.style[key] = value);
    },

    // Get element current transform
    getCurrentTransform(obj) {
      let transform = this.getStyleByName(obj, "transform"),
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
      switch (a) {
        case "prev":
          // prev action
          this.currentIndex += this.currentIndex <= 0 ? 0 : -1;
          break;
        case "next":
          // next action
          let srcListLength = this.srcList.length - 1;

          this.currentIndex +=
            this.currentIndex >= srcListLength
              ? srcListLength - this.currentIndex
              : 1;
          break;
        default:
          this.currentIndex = +a;
          break;
      }

      this.viewerSrc = this.srcList[this.currentIndex];
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
      let image = this.$refs["duoViewerImage"],
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
      let drop = this.$refs["duoViewerImage"];

      if (!drop) return;

      const getScroll = () => {
        let scrollLeft =
            document.body.scrollLeft || document.documentElement.scrollLeft,
          scrollTop =
            document.body.scrollTop || document.documentElement.scrollTop;
        return {
          scrollLeft,
          scrollTop,
        };
      };

      // Get the location of the mouse on the page, handle browser compatibility
      const getPage = (e) => {
        let pageX = e.pageX || e.clientX + getScroll().scrollLeft,
          pageY = e.pageY || e.clientY + getScroll().scrollTop;
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
        let x = getPage(e).pageX - drop.offsetLeft,
          y = getPage(e).pageY - drop.offsetTop;

        // When the mouse starts to move
        document.onmousemove = (e) => {
          // Compatible processing
          e = e || window.event;
          // When the mouse moves, get the location of the box on the page
          // Box on page = mouse on page - mouse in box
          let boxX = getPage(e).pageX - x,
            boxY = getPage(e).pageY - y;
          drop.style.left = `${boxX}px`;
          drop.style.top = `${boxY}px`;
        };
        return false;
      };
      // Stop dragging when the mouse pops up
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    },

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

    // Storage default width and height
    storageDefaultWidthAndHeight() {
      let image = this.$refs["duoViewerImage"];

      this.defaultHeight = this.getStyleByName(image, "height");
      this.defaultWidth = this.getStyleByName(image, "width");
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
    handleClose() {
      this.$emit("close");
      this.viewerSrc = "";
    },
  },
};
</script>

<style>
</style>