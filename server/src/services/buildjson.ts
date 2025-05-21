// import stringifyObject from 'stringify-object'

export function buildJson(
  jsonBase: any,
  balance: number,
  coins: number,
  experience: number
): string {
  console.log(jsonBase);
  jsonBase.result.user.balance.cash = balance;
  jsonBase.result.user.balance.freeBets = coins;
  jsonBase.result.user.balance.sessionFreeBets = experience;
  jsonBase.result.user.currency.code = 'USD';
  jsonBase.result.user.currency.symbol = '$';
  jsonBase.result.user.limits.maxTotalStake = 10;
  //console.log(jsonBase.result.user.stakes.types)
  const newTypes: string[] = [];

  jsonBase.result.user.stakes.types.forEach((type: string) => {
    if (parseInt(type) <= 2) {
      newTypes.push(type);
    }
  });
  jsonBase.result.user.stakes.types = newTypes;
  // const pretty = JSON.stringify(jsonBase);
  // , {
  //   // indent: '  ',
  //   // singleQuotes: false,
  // });
  // //console.log(pretty);
  // const jsonResult = {
  // 	success: true,
  // 	result: {
  // 		user: {
  // 			balance: {
  // 				cash: player.balance,
  // 				freeBets: '0.00',
  // 				sessionCash: '0.00',
  // 				sessionFreeBets: '0.00',
  // 				bonus: '0.00',
  // 			},
  // 			notifications: [],
  // 			messages: [],
  // 			bonuses: [],
  // 			tournaments: [],
  // 			vouchers: [],
  // 			userId: 1335987,
  // 			country: 'US',
  // 			casino: 'NONE',
  // 			vertical: 'true',
  // 			currency: {
  // 				code: server.currency.code,
  // 				symbol: server.currency.symbol,
  // 			},
  // 			token:
  // 				'7ebe022fa6e8161f8c5a0248e10feba205597734501cb86361a2b3f4732106ef9571f913dbe835f79a86d2a5719db5adc2b166f572e8650a30fb6d5cfda8d5b6',
  // 			sessionId: player.sessionId,
  // 			sessionNetPosition: '0.00',
  // 			aamsParticipationId: null,
  // 			aamsSessionId: null,
  // 			depositedAmount: '0.00',
  // 			maxDeposit: '0.00',
  // 			canGamble: false,
  // 			lastWin: '0.00',
  // 			prevRounds: [],
  // 			limits: {
  // 				maxGambleStake: server.maxGambleStake,
  // 				maxTotalStake: {
  // 					total: '1.00',
  // 				},
  // 				minTotalStake: {
  // 					total: '0.20',
  // 				},
  // 				spinDuration: null,
  // 			},
  // 			stakes: {
  // 				defaultIndex: 0,
  // 				lastIndex: 0,
  // 				types: ['0.2', '0.4', '0.6', '0.8', '1'],
  // 			},
  // 			autoplay: {
  // 				type: 'modal',
  // 				options: {
  // 					spins: {
  // 						values: ['10', '20', '30', '50', '100'],
  // 						default: 10,
  // 					},
  // 					stopOnFeature: {
  // 						enabled: true,
  // 					},
  // 					stopOnLossLimits: {
  // 						mandatory: true,
  // 						enabled: true,
  // 						values: ['10', '20', '30', '50', '100', '200', '500', '1000', '5000', '10000'],
  // 						default: 0,
  // 					},
  // 					stopOnWin: {
  // 						enabled: true,
  // 						values: [
  // 							'10',
  // 							'20',
  // 							'30',
  // 							'50',
  // 							'100',
  // 							'200',
  // 							'500',
  // 							'1000',
  // 							'5000',
  // 							'10000',
  // 							'50000',
  // 							'100000',
  // 						],
  // 					},
  // 					hasRestart: false,
  // 				},
  // 			},
  // 			serverTime: '2023-11-26 00:03:31',
  // 			additional: null,
  // 		},
  // 		game: game,
  // 		launcher: {
  // 			version: '1.31.0',
  // 		},
  // 		jackpots: null,
  // 	},
  // };
  return jsonBase;
}

export function buildJsonForSpin(
  jsonBase: any,
  balance: number,
  stake: number,
  originalBalance: number,
  balance2: number
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
  return jsonBase;
}

export function buildJsonForChoice(jsonBase: any): string {
  // jsonBase.rtg = jsonBase.result.user.balance.cash

  // jsonBase.result.user.balance.cash = balance

  // jsonBase.result.user.currency.code = 'USD';
  // jsonBase.result.user.limits.maxGambleStake = 20;
  return JSON.stringify(jsonBase);
}

// import stringifyObject from 'stringify-object'

export function buildJson2(
  jsonBase: any,
  balance: number,
  coins: number,
  experience: number
): string {
  jsonBase.result.user.balance.cash = balance;
  jsonBase.result.user.balance.freeBets = coins;
  jsonBase.result.user.balance.sessionFreeBets = experience;
  jsonBase.result.user.currency.code = 'USD';
  jsonBase.result.user.currency.symbol = '$';
  jsonBase.result.user.limits.maxTotalStake = 10;
  //console.log(jsonBase.result.user.stakes.types);
  const newTypes: string[] = [];

  jsonBase.result.user.stakes.types.forEach((type: string) => {
    if (parseInt(type) <= 2) {
      newTypes.push(type);
    }
  });
  jsonBase.result.user.stakes.types = newTypes;
  const pretty = JSON.stringify(jsonBase);

  return jsonBase;
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
  const end = jsonBase.result.user.balance.cash.atEnd;
  jsonBase.result.user.balance.freeBets.atEnd = coins.toString();
  jsonBase.result.user.balance.sessionFreeBets.atEnd = coins.toString(); // experience.toString();
  jsonBase.result.user.balance.cash.afterBet = original_crystals - bet;
  jsonBase.result.user.balance.cash.atStart = original_crystals;
  jsonBase.result.user.balance.cash.atEnd = balance;
  jsonBase.rtg = end;
  //console.log(jsonBase);
  return JSON.stringify(jsonBase);
}

export function buildJsonForChoice(jsonBase: any): string {
  // jsonBase.rtg = jsonBase.result.user.balance.cash

  // jsonBase.result.user.balance.cash = balance

  // jsonBase.result.user.currency.code = 'USD';
  // jsonBase.result.user.limits.maxGambleStake = 20;
  return JSON.stringify(jsonBase);
}
