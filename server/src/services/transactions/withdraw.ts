import db from '@cashflow/database'
import {
  GetWithdrawResponse,
  GetWithdrawalHistoryResponse,
  NETWORK_CONFIG,
  SubmitWithdrawResponse,
  User,
} from '@cashflow/types'
import { HonoRequest } from 'hono'

import { getUserFromHeader } from '../auth.service'

export async function getWithdrawConfig(req: HonoRequest): Promise<Response> {
  const config = {
    methods: [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        min: 10,
        max: 5000,
      },
    ],
  }

  const response: GetWithdrawResponse = {
    code: 200,
    data: config,
    message: 'Success',
  }

  return new Response(JSON.stringify(response))
}

export async function submitWithdrawal(req: HonoRequest, user: User): Promise<Response> {
  const data = await req.json()

  const withdrawal = await db.transaction.create({
    data: {
      type: 'WITHDRAWAL',
      amount: Number(data.amount),
      profileId: user.activeProfileId as string,
      status: 'PENDING',
      paymentMethod: data.method,
      metadata: data.details,
    },
  })

  const response: SubmitWithdrawResponse = {
    code: 200,
    data: {
      transactionId: withdrawal.id,
      status: withdrawal.status,
    },
    message: 'Withdrawal submitted',
  }

  return new Response(JSON.stringify(response))
}

export async function getWithdrawalHistory(req: HonoRequest, user: User): Promise<Response> {
  const params = new URL(req.url).searchParams
  const page = Number(params.get('page')) || 1
  const limit = Number(params.get('limit')) || 10

  const [count, records] = await Promise.all([
    db.transaction.count({
      where: {
        profileId: user.activeProfileId as string,
        type: 'WITHDRAWAL',
      },
    }),
    db.transaction.findMany({
      where: {
        profileId: user.activeProfileId as string,
        type: 'WITHDRAWAL',
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const response: GetWithdrawalHistoryResponse = {
    code: 200,
    data: {
      total_pages: Math.ceil(count / limit),
      record: records.map((t) => ({
        id: Number(t.id),
        created_at: Math.floor(t.createdAt.getTime() / 1000),
        type: t.type,
        currency_type: 'USD',
        amount: t.amount.toString(),
        status: t.status === 'COMPLETED' ? 1 : 0,
        note: '',
        currency: 'USD',
      })),
    },
    message: 'Success',
  }

  return new Response(JSON.stringify(response))
}

export async function withdrawalRoutes(
  req: HonoRequest,
  route: string
): Promise<Response | boolean> {
  try {
    const user = await getUserFromHeader(req)
    if (!user || !user.activeProfile) {
      return new Response(
        JSON.stringify({
          code: 401,
          message: 'Unauthorized',
          data: { total_pages: 0, record: [] },
        }),
        { status: 401 }
      )
    }

    switch (route) {
      case NETWORK_CONFIG.WITHDRAW_PAGE.WITHDRAWAL_CONFIG:
        return await getWithdrawConfig(req)
      case NETWORK_CONFIG.WITHDRAW_PAGE.WITHDRAWAL_SUBMIT:
        return await submitWithdrawal(req, user)
      case NETWORK_CONFIG.WITHDRAW_PAGE.WITHDRAWAL_HISTORY:
        return await getWithdrawalHistory(req, user)
      default:
        return false
    }
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        message: `Internal server error: ${error}`,
        code: 500,
      }),
      { status: 500 }
    )
  }
}
