<script lang="ts" setup>
// import { useUserStore } from '@/stores/user'
import { useDepositStore } from '@/stores/deposit';
import { currency } from '@/utils/currency';
// import { computed, ref } from 'vue'
import type { Product } from 'shared/prisma/interfaces';

import type { ProductWithSelected } from './ShopView.vue';

const eventBus = useEventManager();

// const props = defineProps(['currentUser', 'products'])
// const userStore = useUserStore()
const depositStore = useDepositStore();
// const $bus = useEventsBus()
// const activeProfile = userStore.currentUser.activeProfile
// const products = inject('productsData') as any
// const selectedProduct = ref<ProductWithSelected | null>(null)

// const productList = ref<ProductWithSelected[]>([])
const _productList = depositStore.getOperatorData?.products;
const productList = ref<ProductWithSelected[]>([]);
// @ts-ignore
// _productList.forEach((item: Product) => {
//   const pWithSel: ProductWithSelected = {
//     ...item,
//     selected: false,
//   }
//   productList.value.push(pWithSel)
// })
// props.products.forEach((p: any) =>
//   productList.value.push({
//     ...p,
//     selected: false,
//   }),
// )
// const currentUser = inject('userData') as any
// const currentUser = props.currentUser
function priceFormatted(price: number) {
  return currency(price, 'en-US', { currency: 'USD' });
}

// const usingCustom = ref(false)
// const stepperAmount = ref(1)
// const selectedProduct = ref<ProductWithSelected>({
//   id: '0  ',
//   amountToReceiveInCredits: 0,
//   description: '',
//   type: '',
//   shopId: activeProfile.shopId,
//   bonusSpins: 0,
//   selected: false,
//   title: '',
//   url: '',
//   priceInCents: 0,
//   isPromo: false,
//   // createdAt: new Date(),
//   bonusCode: undefined,
//   bonusTotalInCredits: 0,
//   discountInCents: 0,
//   totalDiscountInCents: 0,
//   Transaction: [],
//   createdAt: '',
//   updatedAt: '',
// })
const tempDepositAmount = ref(0);

// const calculatedSpins = computed(() => {
//   return tempDepositAmount.value / 10
// })

function selectProduct(val: any) {
  // console.log(val.id)
  // if (val.id !== '0') {
  //   usingCustom.value = false
  //   tempDepositAmount.value = val.price
  // } else {
  //   //console.log(stepperAmount.value)
  //   usingCustom.value = true
  //   tempDepositAmount.value = stepperAmount.value * 100
  // }
  console.log(val);
  depositStore.setSelectedProduct(val);
  productList.value.forEach((product: any) => {
    product.selected = false;
  });
  val.selected = true;
  // $bus.$emit(eventTypes.shopSelectProduct, selectedProduct)

  // state.value.selectedProduct = val
  // console.log(state.value.selectedProduct)
}
_productList.forEach((item: Product) => {
  const pWithSel: ProductWithSelected = {
    ...item,
    selected: false,
  };
  productList.value.push(pWithSel);
});
// onMounted(() => {

// })
</script>

<template>
  <div class="mx-1 flex flex-col items-end justify-between">
    <div class="h-100 flex w-full items-start justify-center">
      <div class="margin-auto flex flex-col" style="margin-top: 20px; margin-bottom: 20px">
        <div
          v-for="product of productList"
          :key="product.id"
          class="my-1 w-full gap-5 py-1"
          :style="`background-repeat: no-repeat;background-size: 100% 100%; background-image: url(${
            !product.selected ? '/images/shop/shopbar.avif' : '/images/shop/shopbar-selected.avif'
          });`"
          @click="selectProduct(product)"
        >
          <div
            class="pa-0 mx-4 flex w-full flex-row items-center justify-between pl-1 pr-4"
            style="width: 100%; min-height: 40px"
          >
            <div class="bungee flex flex-row items-center justify-start" style="width: 30%">
              <img
                src="/images/shop/shopcoin.avif"
                style="width: 40px; height: 40px; margin-left: 3px; margin-right: 4px"
              />
              <div
                style="
                  min-width: 65px;
                  max-width: 65px;
                  font-weight: 400;
                  font-size: 22px;
                  margin-right: 5px;
                  font-family: bungee;
                  color: yellow;
                "
              >
                {{ product.amountToReceiveInCredits }}
              </div>
            </div>
            <div class="flex flex-row items-center justify-start" style="width: 40%">
              <img
                src="/images/shop/plusicon.avif"
                class="ml-1 px-0"
                style="width: 20px; height: 20px; margin-left: 14px"
              />
              <div
                style="
                  background-image: url('/images/shop/freespins.png');
                  background-size: contain;
                  background-repeat: no-repeat;
                  background-position: center;
                  width: 100px;
                  height: 50px;
                  /* margin-left: 14px;
                  margin-right: 14px; */
                "
                :style="`filter: ${product.bonusSpins === 0 ? 'grayscale(100%)' : 'grayscale(0%)'}`"
              >
                <div
                  class="bungee"
                  style="
                    -webkit-text-stroke: 0.5px black;
                    /* position: absolute; */
                    color: white;
                    padding: 17px;
                    padding-left: 32px;
                    padding-top: 12px;
                    top: 16px;
                    left: 20px;
                    font-weight: 900;
                    font-size: 17px;
                    font-family: Robot;
                  "
                >
                  {{ product.bonusSpins }}
                </div>
              </div>

              <img
                src="/images/shop/shoparrow.avif"
                class="px-0"
                style="width: 20px; height: 20px; margin-right: 10px"
              />
            </div>
            <div class="flex flex-row items-center justify-end pr-4" style="width: 30%">
              <div
                style="
                  color: white;
                  font-weight: 900;
                  font-family: Bonzier;
                  color: green;
                  font-size: 22px;
                "
              >
                {{ priceFormatted(product.priceInCents / 100) }}
              </div>
            </div>
          </div>
        </div>
        <div
          class="mt-12 flex flex-row justify-center"
          style="margin-bottom: 0px; margin-top: 12px"
        >
          <div @click="eventBus.emit('activeName', 'selectPayment')">
            <GlassButton :disabled="tempDepositAmount <= 0" color="green"> Next </GlassButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- </div> -->
</template>
