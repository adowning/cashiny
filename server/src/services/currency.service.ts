import { NETWORK_CONFIG, User } from '@cashflow/types';
import { GetCurrencyBalanceList, GetCurrencyBalanceListResponse } from '@cashflow/types';
import type { User as BetterAuthUser } from 'better-auth';
import { HonoRequest } from 'hono';

import { getUserFromBetterAuthUser } from './auth.service';

export async function getCurrencyList(req: HonoRequest, _user: BetterAuthUser) {
  const user = await getUserFromBetterAuthUser(_user);
  if (user.profile === null)
    return new Response(JSON.stringify({ message: 'Missing profile', code: 401 }), { status: 401 });
  const list: GetCurrencyBalanceList = {
    amount: user.profile!.balance.toString(),
    availabe_balance: user.profile.balance.toString(),
    real: user.profile.balance.toString(),
    bonus: user.profile.balance.toString(),
    currency: user.profile.balance.toString(),
  };

  const response: GetCurrencyBalanceListResponse = {
    code: 200,
    data: [list],
    message: 'no fkin clue',
  };

  return new Response(JSON.stringify(response));
}
