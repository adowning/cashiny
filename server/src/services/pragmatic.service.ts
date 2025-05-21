import { auth } from '@/auth';
import { db } from '@cashflow/database';
// import { GetUserAmount, GetUserAmountResponseData, GetUserBalance, GetUserBalanceResponseData, GetUserEmailVerifyResponseData, GetUserInfoResponseData, UpdateCashtag, UpdateEmail, UpdatePassword, UpdateSuspendUser, User } from '@cashflow/types';
import type { User as BetterAuthUser } from 'better-auth';
import { Context, HonoRequest } from 'hono';

import { getUserFromBetterAuthUser } from './auth.service';
import { UserWithProfile } from '@cashflow/types';

// GET /user/amount - get user amount
export async function getUserAmount(userId: string) {
  // Fetch user's main balance and potentially other relevant data
  // Based on the GetUserAmount interface, we need amount, currency, withdraw, rate.
  // Schema has user.balance (Decimal). Withdraw and rate are not directly available.
  // Currency info can be derived from the active profile's bank.
  // const user = await getUserFromBetterAuthUser(_user);

  const userAmountData = {
    amount: user!.profile!.balance, // Convert Decimal to number
    currency: {
      fiat: true, // Assuming all currencies linked via bank are fiat, adjust if needed
      name: 'Unknown',
      symbol: '$', // Placeholder, determine symbol based on currency type if possible
      type: 'USD',
    },
    withdraw: 0, // Placeholder - needs implementation based on withdrawal logic/history
    rate: 1, // Placeholder - needs implementation based on exchange rates or internal logic
  };

  const response = {
    code: 200,
    data: userAmountData,
    message: 'User amount fetched successfully',
  };

  return new Response(JSON.stringify(response));
}

export async function gameRun(c: Context) {
  var gameCode = c.req.query('gameCode');
  var token = c.req.query('mgckey');
  if (!gameCode || !token) {
    return c.res.render('game/maintenancing.ejs');
  }
  const game = await db.game.findUniqueOrThrow({ where: { id: gameCode } });
  // const game = await Game.findOne({ where: { g_name: gameCode } })
  if (!game) {
    return c.res.render('game/maintenancing.ejs');
  }

  // c.res.(`gs2c/index`, {
  //   title: gameCode,
  //   gameName: gameCode,
  //   resourceName: ASSET_HOST,
  //   // serviceApi:
  //     (process.env.GAME_HOST || 'http://pragmatic.kro.kr:8940') +
  //     '/gs2c/v3/gameService',
  //   gameHost: process.env.GAME_HOST || 'http://pragmatic.kro.kr:8940',
  //   replayHost: process.env.REPLAY_HOST || 'http://pragmatic.kro.kr:8940',
  //   token: token,
  //   lang: c.req.query('lang')  || 'en',
  //   currency: 'KRW',
  // })
}

// http://localhost:8940/gs2c/minilobby/start?mgckey=AUTHTOKEN@3d0c5f53365ccad556066c76212d1d83b8c37568fedab686b5d1f5a210525185~stylename@gameplayresell
// // ~SESSION@382c00ecfac51eedccc93f992cdc84f74ba1429d191071587945ae555c42ad97&gameSymbol=vs5strh
export async function miniLobbyGameRun(req: HonoRequest) {
  const gameCode = req.query.gameSymbol;
  const token = req.query.mgckey;
  const { Game, User } = req.app.db;
  // const user = await User.findOne({ where: { token: token } });
  let user = await User.findAll();
  user = user[0];
  // console.log(user)
  if (user.agentCode == 'justslot') {
    const agentCode = user.userCode.split('#JS#')[0];
    const userCode = user.userCode.split('#JS#')[1];
    const url = 'http://justslot.kro.kr:2422/api';
    const jsonBody = {
      method: 'game_launch',
      agent_code: agentCode,
      agent_token: 'token',
      user_code: userCode,
      provider_code: 'PRAGMATIC_OLD',
      game_code: gameCode,
      rtp: user.targetRtp,
    };
    try {
      const ret = await axios.post(url, jsonBody);
      if (ret.data.status == 1) {
        return res.redirect(ret.data.launch_url);
      } else {
        return res.render('game/maintenancing.ejs');
      }
    } catch (error) {
      console.log(error.message);
      return res.render('game/maintenancing.ejs');
    }
  } else {
    console.log(gameCode);
    const game = await Game.findOne({ where: { gameCode: gameCode } });
    if (game.status == 1) {
      gameRun(req, res);
    } else {
      return res.render('game/maintenancing.ejs');
    }
  }
}

export async function gameDemo(user: UserWithProfile, req: HonoRequest) {
  var gameCode = req.query.game;
  var token = req.query.token;

  const { Game } = req.app.db;
  const game = await Game.findOne({ where: { gameCode } });
  if (!game) {
    return res.render('game/maintenancing.ejs');
  }

  res.render(`gs2c/index`, {
    title: gameCode,
    gameName: gameCode,
    resourceName: ASSET_HOST,
    serviceApi: (process.env.GAME_HOST || 'http://pragmatic.kro.kr:8940') + '/gs2c/v3/gameService',
    gameHost: process.env.REAL_GAME_HOST || 'http://pragmatic.kro.kr:8940',
    replayHost: process.env.REPLAY_HOST || 'http://pragmatic.kro.kr:8940',
    token: token,
    lang: 'ko',
    currency: 'KRW',
  });
}

export async function gameList(req: HonoRequest) {}

export async function gamesWithPattern(req: HonoRequest) {
  const { Game } = req.app.db;
  let results = await Game.findAll();
  let games = results.map((item) => ({
    id: item.id,
    banner: item.banner,
    status: item.status,
    gameCode: item.gameCode,
    gameName: item.gameName,
    enName: item.enName,
    memo: item.memo,
  }));

  var dto = {};
  dto.draw = Number(req.body.draw);
  dto.recordsTotal = games.length;
  dto.recordsFiltered = games.length;
  dto.data = games;
  return res.json(dto);
}

export function gameMaintenance(req: HonoRequest) {
  res.render(`game/maintenancing.ejs`);
}

export async function changeGameStatus(req: HonoRequest) {
  const { id, status } = req.body;
  const { Game } = req.app.db;
  const game = await Game.findOne({ where: { id: id } });
  const retObj = await game.update({ status: Number(status) });
  res.json({
    status: !!retObj,
    msg: !!retObj ? '      ' : '      ',
  });
}
