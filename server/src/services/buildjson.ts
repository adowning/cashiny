// import stringifyObject from 'stringify-object'

import { RTGSettingsResponseDto } from '@cashflow/types'

export function buildJsonSettings(
  gameSettingsFromDeveloper: RTGSettingsResponseDto,
  balance: number,
  experience: number
): string {
  // console.log(gameSettingsFromDeveloper)
  gameSettingsFromDeveloper.result.user.balance.cash = balance.toString()
  gameSettingsFromDeveloper.result.user.balance.sessionFreeBets = experience.toString()
  gameSettingsFromDeveloper.result.user.currency.code = 'USD'
  gameSettingsFromDeveloper.result.user.currency.symbol = '$'
  gameSettingsFromDeveloper.result.user.limits.maxTotalStake = { total: '10.00' }
  gameSettingsFromDeveloper.result.user.limits.minTotalStake = { total: '0.10' }
  //console.log(jsonBase.result.user.stakes.types)
  const newTypes: string[] = []

  gameSettingsFromDeveloper.result.user.stakes.types.forEach((type: string) => {
    if (parseInt(type) <= 2) {
      console.log(type)
      newTypes.push(type)
    }
  })
  gameSettingsFromDeveloper.result.user.stakes.types = newTypes
  console.dir(gameSettingsFromDeveloper, { depth: null })
  return JSON.stringify(gameSettingsFromDeveloper)
}

export function buildJsonForSpin(
  jsonBase: any
  // stake: number,
  // originalBalance: number,
  // balance2: number
): string {
  // //console.log(jsonBase.result.user.balance.cash, ' -- ', balance)
  // const start = jsonBase.result.user.balance.cash.atStart
  // const afterBet = jsonBase.result.user.balance.cash.afterBet
  // const end = jsonBase.result.user.balance.cash.atEnd

  // //console.log(balance - parseFloat(jsonBase.result.user.balance.cash.afterBet))
  // //console.log(balance - parseFloat(jsonBase.result.user.balance.cash.atEnd))
  // jsonBase.rtg = jsonBase.result.user.balance.cash
  // //console.log(balance - parseFloat(jsonBase.result.user.balance.cash.atStart))
  //console.log(jsonBase.result.user.balance)
  // jsonBase.result.user.balance.freeBets.atEnd = coins.toString();
  // jsonBase.result.user.balance.sessionFreeBets.atEnd = experience.toString();
  // jsonBase.result.user.balance.cash.afterBet = original_crystals - bet;
  // jsonBase.result.user.balance.cash.atStart = original_crystals;
  // jsonBase.result.user.balance.cash.atEnd = balance;
  // jsonBase.rtg = end;
  // //console.log(parseFloat(jsonBase.result.user.balance.cash.atStart))
  // //console.log( parseFloat(jsonBase.result.user.balance.cash.afterBet))
  // //console.log( parseFloat(jsonBase.result.user.balance.cash.atEnd))
  //console.log(jsonBase)

  // jsonBase.result.user.balance.afterBet = balance
  // jsonBase.result.user.balance.atEnd = balance
  //
  // jsonBase.result.user.currency.code = 'USD';
  // jsonBase.result.user.limits.maxGambleStake = 20;
  return jsonBase
}

export function buildJsonForChoice(jsonBase: any): string {
  // jsonBase.rtg = jsonBase.result.user.balance.cash

  // jsonBase.result.user.balance.cash = balance

  // jsonBase.result.user.currency.code = 'USD';
  // jsonBase.result.user.limits.maxGambleStake = 20;
  return JSON.stringify(jsonBase)
}

// import stringifyObject from 'stringify-object'

export function buildJson2(
  jsonBase: any,
  balance: number,
  coins: number,
  experience: number
): string {
  jsonBase.result.user.balance.cash = balance
  jsonBase.result.user.balance.freeBets = coins
  jsonBase.result.user.balance.sessionFreeBets = experience
  jsonBase.result.user.currency.code = 'USD'
  jsonBase.result.user.currency.symbol = '$'
  jsonBase.result.user.limits.maxTotalStake = 10
  //console.log(jsonBase.result.user.stakes.types);
  const newTypes: string[] = []

  jsonBase.result.user.stakes.types.forEach((type: string) => {
    if (parseInt(type) <= 2) {
      newTypes.push(type)
    }
  })
  jsonBase.result.user.stakes.types = newTypes
  // const pretty = JSON.stringify(jsonBase)

  return jsonBase
}

export function buildJsonForSpin2(
  jsonBase: any,
  balance: number,
  bet: number,
  original_crystals: number,
  coins: number
  // experience: number
): string {
  // //console.log(jsonBase.result.user.balance.cash, ' -- ', balance)
  // const start = jsonBase.result.user.balance.cash.atStart;
  // const afterBet = jsonBase.result.user.balance.cash.afterBet;
  const end = jsonBase.result.user.balance.cash.atEnd
  jsonBase.result.user.balance.freeBets.atEnd = coins.toString()
  jsonBase.result.user.balance.sessionFreeBets.atEnd = coins.toString() // experience.toString();
  jsonBase.result.user.balance.cash.afterBet = original_crystals - bet
  jsonBase.result.user.balance.cash.atStart = original_crystals
  jsonBase.result.user.balance.cash.atEnd = balance
  jsonBase.rtg = end
  //console.log(jsonBase);
  return JSON.stringify(jsonBase)
}
