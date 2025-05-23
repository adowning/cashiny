import { UserWithProfile } from '@cashflow/database'
import { NETWORK_CONFIG } from '@cashflow/types'
import { User } from 'better-auth/types'

import { createErrorResponse, createSuccessResponse } from '.'
import createRouter from '../rest.router'
import {
  cancelPendingDeposits, // createDeposit,
  getDepositHistory,
  getDepositMethods,
  getOperatorData,
  submitDeposit,
} from '../services/transactions/deposit.service'

const router = createRouter()

router.post(NETWORK_CONFIG.DEPOSIT_PAGE.CONFIG, async (c) => {
  const user = c.get('user') as Partial<User>
  return await getDepositMethods(c.req, user)
})

router.post(NETWORK_CONFIG.DEPOSIT_PAGE.HISTORY, async (c) => {
  const user = c.get('user_with_profile') as Partial<UserWithProfile>
  return await getDepositHistory(c.req, user)
})

router.post(NETWORK_CONFIG.DEPOSIT_PAGE.SUBMIT, async (c) => {
  const user = c.get('user_with_profile') as Partial<UserWithProfile>

  return await submitDeposit(c.req, user)
})
router.post(NETWORK_CONFIG.DEPOSIT_PAGE.OPERATOR_DATA, async (c) => {
  const user = c.get('user_with_profile')
  return await getOperatorData(c.req, user)
})

router.post(NETWORK_CONFIG.DEPOSIT_PAGE.CANCEL_PENDING, async (c) => {
  const user = c.get('user_with_profile')
  if (user === null || user.id === undefined) {
    return createErrorResponse('no user found', 401)
  }
  try {
    const transactionCount = await cancelPendingDeposits(user.id)

    return createSuccessResponse({ count: transactionCount })
  } catch (e) {
    return createErrorResponse(e.message, 500)
  }
})

export default router
