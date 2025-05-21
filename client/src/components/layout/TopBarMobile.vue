<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
// import { useSocketStore } from '@/stores/socket'
import { ref } from 'vue';

// import PlayerAvatar from "./PlayerAvatar.vue";
// import { useSocketStore } from "@/stores/socket";
import { useAuthStore } from '@/stores/auth';
import { useDepositStore } from '@/stores/deposit';
import { useUserStore } from '@/stores/user';
import { DepositHistoryItem } from '@cashflow/types';

const eventBus = useEventManager();
console.log(eventBus);
const router = useRouter();
const countdownActive = ref(false);
const sparkle = ref(false);
// const { currentProfile } = useUserStore();
const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const depositStore = useDepositStore();
const { dispatchUserDepositHistory } = useDepositStore();
const {
  getDepositHistoryItems, // isLoading: authLoading, // If you need to show auth-specific loading in App.vue
  // error: authError, // Auth store errors
} = storeToRefs(depositStore);
function openSettings() {
  console.log('x');
  eventBus.emit('settingsModal', true);
}
const depositItems = ref<DepositHistoryItem[]>();

const target = ref();
const trans = getDepositHistoryItems;
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
  const minutes = Math.floor(total_seconds / 60);
  const seconds = total_seconds % 60;

  // Print the initial countdown
  console.log(`Countdown: ${minutes} minutes and ${seconds} seconds`);

  // Start the countdown
  let remaining_seconds = total_seconds;
  interval.value = setInterval(async () => {
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
      console.log('Countdown finished!');
      // console.log(depositItems.value);
      depositItems.value?.record.splice(0, 3);
      await depositStore.dispatchCancelPending();
    }
  }, 1000);
  countdownActive.value = true;
}

// async function setPending(transaction?: Transaction) {
//   if (transaction === undefined) {
//     let t
//     if (activeProfile !== undefined) {
//       t = activeProfile.purchases
//     }
//     if (t !== undefined) {
//       t.forEach((purch: any) => {
//         if (purch.status === 'PENDING_PAYMENT') {
//           transaction = purch
//         }
//       })
//     }
//   }
//   let p
//   if (typeof transaction === 'string') {
//     p = JSON.parse(transaction)
//   } else {
//     p = transaction
//   }
//   if (p === null || p === undefined) {
//     return
//   }
//   if (p.status === 'PENDING_PAYMENT') {
//     const created = new Date(p.createdAt)
//     const time = created.getTime() + 3600000 - new Date().getTime()
//     // const countdown = useCountDown({
//     //   time: +time,
//     //   millisecond: true,
//     //   // onChange: (current) => $bus.$emit(eventTypes.update_player, current),
//     //   // onFinish: () => $bus.$emit(eventTypes.is_loading, false),
//     // })
//     // countdown.start()
//     timeToExpire.value = current
//   }
// }
console.log(trans);
if (trans.value !== undefined) {
  // console.log(trans.value);
  // trans.forEach((tran) => {
  //   console.log(tran);
  // if (purch.status === 'PENDING_PAYMENT') {
  //   const created = new Date(purch.createdAt)
  //   const time = created.getTime() + 3600000 - new Date().getTime()
  //   console.log(created.getTime() + 3600000)
  //   const countdown = useCountDown({
  //     time: +time,
  //     millisecond: true,
  //     // onChange: current => $emit('change', current),
  //     // onFinish: () => emit('finish'),
  //   })
  //   countdown.start()
  //   current.value = countdown.current
  //   pendingTransactions.value.push(purch)
  // }
  // incomingMessage.value = 'change'
  // setTimeout(() => {
  //   incomingMessage.value = null
  // }, 3000)
  // });
}

watch(getDepositHistoryItems, (newVal) => {
  console.log(newVal);
  const pendings = newVal.find((purch: { status: string }) => purch.status === 'PENDING_PAYMENT');
  if (pendings) {
    countdownTimer(new Date(pendings.createdAt));
  }
});
eventBus.on('updatePurchases', (newVal) => {
  // console.log(newVal);
  // console.log(pendingTransactions.value);
  // if (newVal.status !== "PENDING_PAYMENT") {
  //   if (newVal.id === pendingTransactions.value[0].id) {
  //     clearInterval(interval.value);
  //     console.log("Countdown finished!");
  //     pendingTransactions.value.splice(0, 3);
  //     console.log(pendingTransactions.value);
  //     countdownActive.value = false;
  //   }
  // } else {
  //   pendingTransactions.value.push(newVal);
  //   countdownTimer(new Date(newVal.createdAt));
  // }
});
const currentExp = ref(0);
let ran = false;
onMounted(async () => {
  if (ran === false) await dispatchUserDepositHistory();
  ran = true;
  // const {
  //   getDepositHistoryItems, // isLoading: authLoading, // If you need to show auth-specific loading in App.vue
  //   // error: authError, // Auth store errors
  // } = storeToRefs(depositStore);
  //@ts-ignore
  depositItems.value = depositStore.depositHistoryItem.data;
  console.log(depositItems.value);

  if (depositItems.value !== undefined && depositItems.value.record.length > 0) {
    depositItems.value.record.forEach((item) => {
      // console.log(item.status);
      if (item.status === 'PENDING') {
        countdownTimer(new Date(item.createdAt));
      }
    });
  }
});
</script>

<template>
  <!-- <div class=" animate__animated animate__slideInDown flex"> -->
  <div ref="target" class="tbar flex flex-row justify-stretch">
    <div class="w-100 flex flex-row justify-start">
      <!-- <PlayerAvatar @click="router.push('/client/profile')" style="z-index: 99; max-height: 60px" /> -->
      <PlayerAvatar
        @click="router.push('/client/profile')"
        style="z-index: 99; width: 55px"
        :currentExp="currentExp"
        :sparkle="sparkle"
        :maxExp="100"
      />
      <div id="PlayerCredits" class="color-white flex flex-col pb-1 pl-1 text-center">
        <div
          v-if="countdownActive"
          class="flex w-full flex-row items-center"
          style="
            height: 14px;
            font-size: 16px;
            font-weight: 600;
            line-height: 0.5;
            margin-left: 8px;
            margin-top: 4px;
            color: white;
          "
        >
          <img
            src="/images/layout/cashappicon.avif"
            width="14px"
            style="margin-right: 7px; color: white"
          />
          ends:
          {{ remaining_minutes > 1 ? `${remaining_minutes}m` : `0m:${remaining_seconds_display}` }}
        </div>
        <div
          v-else
          class="flex w-full flex-row"
          style="height: 20px; font-size: 26px; font-weight: 600"
        />
        <div
          class="glow-light flex flex-row items-center justify-center"
          style="
            z-index: 999;
            line-height: 14px;
            text-align: center;
            height: 30px;
            min-width: 100px;
            max-width: 100px;
            font-size: 23px;
            padding-top: 1px;
            padding-left: 6px;
            margin-top: 2px;
            margin-left: 6px;
            font-weight: 600;
            background-size: cover;
            background-image: url('/images/layout/money_backing.png');
          "
        >
          <div
            v-if="currentUser !== undefined"
            class="glow mt--2 flex justify-center"
            style="line-height: 0.6; text-align: center; letter-spacing: 0px; font-weight: 800"
          >
            {{ currentUser?.profile?.balance }}
          </div>
        </div>
      </div>
    </div>
    <div
      @click="openSettings"
      style="
        height: 50px;
        width: 50px;
        position: absolute;
        top: 0px;
        right: 8px;
        gap: 0px;
        margin: 0px;
        padding: 4px;
        background-size: cover;
        z-index: 999999;
      "
    >
      <img
        style="
          top: 0px;
          right: 8px;
          gap: 0px;
          margin: 0px;
          padding: 0px;
          background-size: cover;
          z-index: 999999;
        "
        src="/images/layout/settings.avif"
        @click="openSettings"
      />
    </div>
    <!-- <div
      class=""
      style="
        position: absolute;
        top: 0px;
        right: 8px;
        gap: 0px;
        margin: 0px;
        padding: 0px;
        background-size: cover;
        z-index: 99;
      "
    >
      <img style="width: 52px; height: 52px" src="@/assets/bars/settings.avif" />
    </div> -->
  </div>
  <!-- </div> -->
</template>

<style scoped>
.tbar {
  background-size: cover;

  position: absolute;
  width: 100%;
  max-height: 62px;

  /* height: 52px; */
  background-position: center;
  top: 0px;
  left: 0px;
  background-repeat: no-repeat;
  background-image: url('/images/layout/topback.png');
}

.moveout {
  animation: moveout 0.32s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate(50, 0, 0);
}

@keyframes moveout {
  100% {
    transform: translate3d(-50px, 0, 0);
  }
}
</style>
