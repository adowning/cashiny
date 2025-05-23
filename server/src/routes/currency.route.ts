import { NETWORK_CONFIG, User } from '@cashflow/types'
import { getCurrencyList } from '../services/currency.service'
import createRouter from '../rest.router'

const router = createRouter()
router.get(NETWORK_CONFIG.CURRENCY.CURRENCY_LIST, async (c) => {
  const user = c.get('user') as User
  return await getCurrencyList(c.req, user)
})

export default router
