<script lang="ts" setup>
const props = defineProps(['spritesheet', 'json', 'fps', 'autoplay', 'id']);
const frames = ref([]);
const canvas = ref();
const length = ref(0);
const currentIndex = ref(0);
const animationFrameID = ref(null);
const direction = ref(0);
const sprite = ref(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const height = ref(0);
const width = ref(0);

const now = ref(0);
const then = ref(0);
const fps = ref(props.fps || 30);

// const scale = props.transform.scale
// const translateX = props.transform.translateX
// const translateY = props.transform.translateY

const spritesheet = props.spritesheet;
function init() {
  if (canvas.value !== undefined && canvas.value !== null) {
    ctx.value = canvas.value.getContext('2d');
  }
  play(0);
  // loop()
}
let x;
let y;
let index;
function render() {
  if (frames.value[index] !== undefined) {
    if (frames.value[index].rotated) {
      direction.value = 1;
    }
    // //console.log(direction.value)
    ctx.value && ctx.value.clearRect(0, 0, width.value, height.value);
    if (direction.value && currentIndex.value % length.value === 0 && currentIndex) {
      direction.value = Number(!direction.value);
    }
    index = Math.abs((currentIndex.value % length.value) - length.value * direction.value);
    x = frames.value[index].x;
    y = frames.value[index].y;
    ctx.value &&
      ctx.value.drawImage(
        sprite.value,
        x,
        y,
        width.value,
        height.value,
        0,
        0,
        width.value,
        height.value,
      );

    if (direction.value && index % length.value === 0 && index) {
      direction.value = Number(!direction.value);
    }
    index = Math.abs((currentIndex.value % length.value) - length.value * direction.value);

    x = frames.value[index].x;
    y = frames.value[index].y;
    // ctx.value.drawImage(sprite.value, x, y, width.value, height.value, 0, 0, width.value, height.value)
    // //console.log(sprite.value, x, y, width.value, height.value, 0, 0, width.value, height.value)
    // if(frames.value[index].rotated){
    // ctx.value.rotate(180*Math.PI/180);
    ctx.value.drawImage(
      sprite.value,
      x,
      y,
      width.value,
      height.value,
      0,
      0,
      width.value,
      height.value,
    );
    // ctx.value.restore()
  }
}
function loop() {
  now.value = Date.now();
  const delta = now.value - then.value;
  if (delta > 1000 / fps.value) {
    then.value = now.value - (delta % (1000 / fps.value));
    render();
    currentIndex.value++;
  }
  animationFrameID.value = window.requestAnimationFrame(loop);
}
// const stop = () => {
//   window.cancelAnimationFrame(animationFrameID.value)
//   index = 0
// }
function play(from) {
  index = Number.isNaN(Number(from)) ? index.value : from;
  loop();
}

nextTick(() => {
  sprite.value = new Image();
  sprite.value.src = spritesheet;
  sprite.value.onload = () => {
    init();
  };
});

onMounted(() => {
  const frams = props.json.frames;
  // console.log(frams);
  if (!Array.isArray(frams)) {
    for (const [key, value] of Object.entries(frams)) {
      const f = value.frame;
      f.rotated = value.rotated;
      // const v = value.aliases
      f.filename = key;

      if (f.filename.toLowerCase().includes(props.id.toLowerCase())) {
        frames.value.push(f);
      }
    }
  } else {
    frams.forEach((item) => {
      if (item.filename.toLowerCase().includes(props.id.toLowerCase())) {
        const newObj = {
          filename: item.filename,
          ...item.frame,
        };
        frames.value.push(newObj);
        console.log(newObj);
      }
    });
  }

  frames.value.sort((a, b) => a.filename < b.filename);
  width.value = frames.value[0].w;
  height.value = frames.value[0].h;
  length.value = frames.value.length - 1;
});
</script>

<template>
  <div class="vue-sprite">
    <canvas :id="id" ref="canvas" :width="width" :height="height" />
  </div>
</template>

<style></style>
