<script setup lang="ts">
  const sparks = ref<any[]>([])
  let z = 1
  for (var i = 0; i < 20; i++) {
    z = z + 1
    let spark = {
      top: Math.floor(Math.random() * 90) + 5 + '%',
      left: Math.floor(Math.random() * 90) + 5 + '%',
      animationDelay: Math.floor(Math.random() * 5 + z) + 's',
      image: Math.floor(z),
    }
    if (z >= 3) z = 0
    sparks.value.push(spark)
  }
  const { isMobile } = useDisplay()
</script>
<template>
  <div class="home h-full position absolute" :style="`width: ${isMobile ? '100%' : '50%'}`">
    <div class="sparkle" style="top: 15%; left: 20%"></div>
    <div class="sparkle" style="top: 25%; left: 40%; animation-delay: 0.5s"></div>
    <div class="sparkle" style="top: 10%; left: 60%; animation-delay: 1s"></div>
    <div
      class="sparkle-image"
      style="
        top: 30%;
        left: 80%;
        animation-delay: 1.5s;
        background-image: url('/images/stars/star1.avif');
      "
    />

    <div class="sparkle" style="top: 50%; left: 30%; animation-delay: 2s"></div>
    <div class="sparkle-image" style="top: 60%; left: 70%; animation-delay: 2.5s"></div>
    <div
      class="sparkle-fadeout"
      style="
        top: 60%;
        left: 20%;
        animation-delay: 1.2s;
        background-image: url('/images/stars/star.png');
      "
    ></div>
    <div
      class="sparkle-image-turn"
      style="
        top: 50%;
        left: 10%;
        animation-delay: 1.2s;
        background-image: url('/images/stars/star0.png');
      "
    ></div>
    <div class="sparkle" style="top: 70%; left: 50%; animation-delay: 0.7s"></div>
    <div
      class="sparkle-pop"
      style="
        top: 70%;
        left: 50%;
        animation-delay: 1s;
        background-image: url('/images/stars/star1.avif');
      "
    ></div>

    <div class="sparkle" style="top: 90%; left: 80%; animation-delay: 1.7s"></div>
    <div
      class="sparkle-image"
      style="
        top: 70%;
        left: 20%;
        animation-delay: 1.9s;
        background-image: url('/images/stars/star1.avif');
      "
    />
    <div
      class="sparkle-image-turn"
      style="
        top: 40%;
        left: 30%;
        animation-delay: 1.9s;
        background-image: url('/images/stars/star1.avif');
      "
    />

    <!-- <div
      class="absolute"
      style="width: 400px; height: 900px"
      v-for="spark of sparks"
    > -->
    <!-- <div
        v-for="spark of sparks"
        class="sparkle-image-turn"
        :style="`
        top: ${spark.top}, 
        left: ${spark.left}, 
        position: absolute;
        animation-delay: ${spark.animationDelay}, 
        background-size: cover;
        width: 50px;
        height: 50px;
        background-image: url('/images/stars/star${spark.image}.avif');
      `"
      /> -->
    <!-- </div> -->
    <div
      class="sparkle-image-turn"
      style="
        top: 10%;
        left: 10%;
        animation-delay: 0.2s;
        background-image: url('/images/stars/star3.avif');
      "
    />
    <div
      class="sparkle-fadeout"
      style="
        top: 20%;
        left: 20%;
        animation-delay: 0.4s;
        background-image: url('/images/stars/star2.avif');
      "
    />
    <div
      class="sparkle-image-turn"
      style="
        top: 40%;
        left: 40%;
        animation-delay: 0.5s;
        background-image: url('/images/stars/star1.avif');
      "
    />
    <div
      class="sparkle-pop"
      style="
        top: 60%;
        left: 70%;
        animation-delay: 0.1s;
        background-image: url('/images/stars/star2.avif');
      "
    />
  </div>
</template>
<style scoped>
  .sparkle-image {
    position: relative;
    width: 34px;
    background-size: cover;
    height: 34px;
    /* border-radius: 50%; */
    /* box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); */
    animation: sparkle-image 15s infinite;
  }
  .sparkle-fadeout {
    position: relative;
    width: 64px;
    background-size: cover;
    height: 64px;
    /* border-radius: 50%; */
    /* box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); */
    animation-timing-function: linear;

    animation: sparkle-fadeout 5s infinite;
  }
  .sparkle-pop {
    position: relative;
    width: 34px;
    background-size: cover;
    height: 34px;
    /* border-radius: 50%; */
    /* box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); */
    animation: sparkle-pop 2s infinite;
  }
  .sparkle-image-turn {
    position: relative;
    width: 54px;
    background-size: cover;
    height: 54px;
    /* border-radius: 50%; */
    /* box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); */
    animation: sparkle-image-turn 12s infinite;
  }
  @keyframes sparkle-image {
    0% {
      opacity: 0;
      size: 0;
    }
    90% {
      opacity: 0;
      size: 0;
    }

    92% {
      opacity: 1;
      size: 1;
      /* transform: rotate(140deg); */
    }
    100% {
      opacity: 1;
      size: 1;
      /* transform: rotate(0deg); */
    }
  }
  @keyframes sparkle-image-turn {
    0% {
      opacity: 0;
      size: 0;
    }
    80% {
      opacity: 0;
      size: 0;
    }
    90% {
      opacity: 0.5;
      size: 0.5;
    }

    91% {
      opacity: 1;
      size: 1;
      /* transform: rotate(140deg); */
      transform: rotate(120deg);
    }
    100% {
      opacity: 0;
      size: 1;
      transform: rotate(220deg);
    }
  }
  .sparkle-fadeout {
    position: relative;
    width: 64px;
    background-size: cover;
    height: 64px;
    /* border-radius: 50%; */
    /* box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); */
    /* animation-timing-function: linear; */

    animation: sparkle-fadeout 5s infinite;
  }
  @keyframes sparkle-pop {
    0% {
      opacity: 0;
      size: 0;
    }
    95% {
      opacity: 0;
      size: 0;
      /* transform: rotate(140deg); */
    }
    100% {
      opacity: 1;
      size: 1;

      /* transform: rotate(0deg); */
    }
  }
  @keyframes sparkle-fadeout {
    0% {
      opacity: 0;
      size: 0;
    }
    25% {
      opacity: 0.25;
      size: 0.25;
      /* transform: rotate(140deg); */
      /* transform: rotate(20deg); */
    }
    50% {
      opacity: 0.75;
      size: 0.5;
      /* transform: rotate(40deg); */

      /* transform: rotate(140deg); */
    }
    85% {
      opacity: 1;
      size: 1;
      /* transform: rotate(140deg); */
      transform: rotate(60deg);
    }
    100% {
      opacity: 0;
      size: 1;
      transform: rotate(30deg);
    }
  }
  .sparkle {
    position: relative;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
    animation: sparkle 3s infinite;
  }
  @keyframes sparkle {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
