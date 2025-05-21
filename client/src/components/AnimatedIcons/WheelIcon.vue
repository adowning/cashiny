<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
  import * as WheelJson from "@/assets/anim/wheel.json";
  import WheelImg from "@/assets/anim/wheel.png";
  import { useUserStore } from "@/stores/user";

  const eventBus = useEventManager();
  const { currentUser } = useUserStore();
  const isMounted = ref(false);
  const countdownActive = ref(false);

  const sprite = ref();
  const isSpiral = ref(false);
  const complete = ref(false);
  const shakeIt = ref(false);
  // function formatTime(seconds: number): string {
  //   const hours = Math.floor(seconds / 3600)
  //   const minutes = Math.floor((seconds % 3600) / 60)
  //   const secs = seconds % 60

  //   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  // }
  // const formattedTime = ref('')
  function warnDisabled() {
    // //console.log('wd')
    shakeIt.value = true;
    setTimeout(() => {
      shakeIt.value = false;
    }, 1500);
  }
  function doFreeSpin() {
    console.log("doFreeSpin");
    if (complete.value === false) {
      warnDisabled();
    } else {
      eventBus.emit("wheelPageOpen", true);
    }
    // $bus.$emit(eventTypes.show_wheel, true)
  }
  // //console.log(WheelJson)
  const start_date = new Date(
    currentUser?.lastDailySpin
      ? currentUser.lastDailySpin.toString()
      : "2023-01-01T00:00:00.000Z"
  );
  const remaining_minutes = ref(0);
  const remaining_seconds_display = ref(0);
  const interval = ref();
  function countdownTimer(start_date: Date): void {
    // Calculate the end date, which is one hour after the start date
    const end_date = new Date(start_date.getTime() + 3600000); // One hour later

    // Calculate the difference between the end date and now
    const now = new Date();
    const time_difference = end_date.getTime() - now.getTime();

    // Convert the time difference to seconds
    const total_seconds = Math.floor(time_difference / 1000);

    // Calculate minutes and seconds
    // const minutes = Math.floor(total_seconds / 60)
    // const seconds = total_seconds % 60

    // Print the initial countdown
    // console.log(`Countdown: ${minutes} minutes and ${seconds} seconds`)

    // Start the countdown
    let remaining_seconds = total_seconds;
    interval.value = setInterval(() => {
      // Calculate remaining minutes and seconds
      remaining_minutes.value = Math.floor(remaining_seconds / 60);
      remaining_seconds_display.value = remaining_seconds % 60;

      // Print the remaining time
      // console.log(
      //   `Countdown: ${remaining_minutes.value} minutes and ${remaining_seconds_display.value} seconds`,
      // )

      // Decrease the remaining seconds by one
      remaining_seconds -= 1;

      // Stop the countdown when it reaches zero
      if (remaining_seconds < 0) {
        clearInterval(interval.value);
        // console.log('Countdown finished!')
        complete.value = true;
      }
    }, 1000);
    countdownActive.value = true;
  }
  countdownTimer(start_date);
  // const countDown = useCountdown(Math.floor(time / 1000))
  // console.log(new Date(countDown.remaining.value))

  // countDown.start()
  // //console.log(countDown.current.value)
  // watch(countDown.remaining, (z) => {

  //   if (z <= 0) {
  //     complete.value = true
  //   }
  // })
  // const countDown = ref({
  //   remaining: time, // Initialize with the remaining time in seconds
  // })
  // const formatted = useDateFormat(
  //   new Date(new Date().getTime() + countDown.value.remaining),
  //   'HH:mm:ss',
  // )

  // setInterval(() => {
  //   if (!complete.value) {
  //     // console.log(countDown.value.remaining)
  //     countDown.value.remaining--
  //     formattedTime.value = formatTime(countDown.value.remaining)
  //     if (countDown.value.remaining <= 0) {
  //       complete.value = true
  //     }
  //   }
  // }, 1000)
  // watch(countDown, (newRemaining) => {
  //   // console.log(newRemaining)
  //   formattedTime.value = formatTime(newRemaining.remaining)

  //   if (newRemaining.remaining <= 0) {
  //     complete.value = true
  //   }
  // })

  // if (countDown.value.remaining === 0) {
  //   complete.value = true
  // }
  const wheel = shallowRef<any>();
  onMounted(() => {
    setTimeout(() => {
      isMounted.value = true;
    }, 1000);
    setTimeout(() => {
      isSpiral.value = true;
    }, 7000);
  });
</script>

<template>
  <div
    ref="wheel"
    style="margin: auto"
    class="flex grow-1 flex-col justify-between"
  >
    <!-- <img src="/images/freespins2.avif"
      style="margin: auto; margin-top: -10px; width: 80px; height: 60px;  background-repeat: no-repeat"
      @click="doFreeSpin()"> -->

    <VSprite
      id="Wheel"
      ref="sprite"
      :spritesheet="WheelImg"
      :json="WheelJson"
      style="
        margin-right: 40px;
        width: 60px;
        height: 60px;
        background-repeat: no-repeat;
        z-index: 1;
        transform: scale(0.4) translateY(10px) translateX(-32px);
      "
      :autoplay="true"
      @click="doFreeSpin()"
    />
    <!-- </div> -->
    <!-- <div
                v-if="!complete"
                class="pl-5"
                @click="warnDisabled"
                style="
                    position: absolute;
                    background-image: url('/images/timeleft.avif');
                    margin: auto;
                    z-index: 2;
                    bottom: 0px;
                    margin-left: 4px;
                    background-size: contain;
                    background-repeat: no-repeat;
                    height: 46px;
                    width: 120px;
                "
            > -->
    <div
      :class="{ shake: shakeIt }"
      v-if="!complete"
      style="
        position: absolute;
        bottom: 8px;
        padding-left: 7px;
        padding-right: 7px;
        right: -14px;
        width: 80px;
        height: 20px;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
        font-size: 14px;
        font-weight: 700;
        margin: auto;
        justify-content: center;
        z-index: 9999;
      "
      class="futex-cell flex"
    >
      {{ remaining_minutes }}:{{ remaining_seconds_display < 10 ? 0 : ""
      }}{{ remaining_seconds_display }}
    </div>
    <!-- <div
      :class="{ shake: shakeIt }"
      v-else
      style="
        position: absolute;
        bottom: 8px;
        left: 12px;
        padding-left: 7px;
        padding-right: 7px;
        right: -14px;
        width: 80px;
        height: 20px;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
        font-size: 14px;
        font-weight: 700;
        margin: auto;
        justify-content: center;
        z-index: 9999;
      "
      class="futex-cell flex"
    >
      freespin
    </div> -->
    <!-- </div> -->
    <div
      v-if="complete"
      class="futex-cell flex justify-center text-white onacona"
      style="
        width: 90px;
        line-height: 1;
        position: absolute;
        bottom: 6px;
        padding-bottom: 20px;
        left: -15px;
        height: 15px;
        font-family: ubuntu;
        z-index: 9999;
        font-size: 20px;
        font-weight: 700;
      "
      @click="doFreeSpin()"
    >
      Spin
    </div>
    <div v-if="complete" id="“spriteAnim”" />
  </div>
</template>

<style scoped>
  .shake {
    /* transform: translateY(14px); */
    color: orange;
    z-index: 999999;
    /* animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; */
    animation: shake 0.82s;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translateX(-1px);
    }

    20%,
    80% {
      transform: translateX(2px);
    }

    30%,
    50%,
    70% {
      transform: translateX(-4px);
    }

    40%,
    60% {
      transform: translateX(4px);
    }
  }

  #spriteAnim {
    width: 399px;

    height: 200px;

    margin: 2em auto;

    background: transparent url("") 0 0 no-repeat;

    animation: spriteAnim 1s steps(12) infinite;
  }

  /* Animation keyframes */

  @keyframes spriteAnim {
    100% {
      background-position: 0 -2393px;
    }
  }
</style>
