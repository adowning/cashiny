import { createPinia } from 'pinia'
import type { Pinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// import { useOperatorStore } from './operator'
// import { useUserStore } from './user'
// import userController from '../sdk/userModule/userController'
// import shopController from '../sdk/shopModule/shopController'
// import spinDataController from '../sdk/spinDataModule/spinDataController'

const pinia: Pinia = createPinia()
// const { stopLoading } = useLoading()

export async function setupStore(app: any) {
  const env = import.meta.env.PROD ? 'prod' : 'dev'
  const appVersion = import.meta.env.VITE_APP_VERSION
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`
  // const { namespace } = options
  pinia.use(piniaPluginPersistedstate)
  // pinia.use(
  //   createPersistedState({
  //     // key $appName-$store.id
  //     key: (storeKey) => `${namespace}-${storeKey}`,
  //     storage: localStorage,
  //   }),
  // )
  app.use(pinia)
  return pinia
}

export function resetAllStores() {
  console.log('resetting stores ')
  if (!pinia) {
    console.error('Pinia is not installed')
    return
  }
  const allStores = (pinia as any)._s
  console.log(allStores)
  for (const [_key, store] of allStores) {
    store.$reset()
  }
}
// async function getMultipleResources(calls) {
//   try {
//     const promises = calls //urls.map((url) => fetch(url).then((response) => response.json()))
//     const results = await Promise.all(promises)
//     return results
//   } catch (error) {
//     // Handle errors here
//     console.log('Error fetching resources:', error)
//     return false // Re-throw the error to propagate it further if needed
//   }
// }

export async function hydrateStores(): Promise<boolean> {
  // const userStore = useUserStore()
  // const shopStore = useOperatorStore()
  // const crudQuery = {
  //   where: {
  //     OR: [
  //       {
  //         isActive: true,
  //       },
  //     ],
  //   },
  //   orderBy: [{ name: 'asc' }, { featured: 'desc' }],
  //   page: 1,
  //   pageSize: 100,
  // }

  // try {
  //   const fetchList = [
  //     userController.getUserList(),
  //     // api.userControllerGetUserListGet.send(),
  //     userController.getCurrentUser(),
  //     // api.userControllerFindCurerentUser.send(),
  //     spinDataController.top(),
  //     // api.spinDataControllerTopGet.send(),
  //     shopController.findMyShop(),
  //     // api.shopControllerFindMyShopGet.send(),
  //     shopController.getGameList({}, { data: { crudQuery } }, {}),
  //   ]

  //   // getMultipleResources(fetchList)
  //   // .then((data) => console.log('Fetched data:', data))
  //   // .catch((err) => console.error('Failed to fetch:', err))
  //   const p = await getMultipleResources(fetchList)
  //   if (p === false) {
  //     console.log('returning false from store/index')
  //     return false
  //   }
  //   console.log(p)
  //   shopStore.setUsers(p[0])
  //   userStore.setUserInfo(p[1])
  //   if (p[2] !== Error) shopStore.setSpinDatas(p[2])
  //   shopStore.setShop(p[3])
  //   shopStore.setGames(p[4])
  //   shopStore.setBigWins()
  //   stopLoading()
  //   console.log('returning true from store/index')
  //   return true
  //   // }
  // } catch (e) {
  //   console.log(e)
  //   console.log('returning false from store/index')
  return false
  // }
}

export async function startSubscriptions(): Promise<boolean> {
  // const userStore = useUserStore()
  // userStore.startSubscription()
  return true
}
export { pinia as store }
