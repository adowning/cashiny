// import { PrismaClient } from '../generated/prisma';
// await loadGames();
import { GameCategory, GameProvider } from '../../client/'
import * as gamesData from './games2.json'
import { PrismaClient } from '@prisma/client'

interface OperatorKey {
  id: string
}

// const prisma = new PrismaClient();
export default async function loadGames(prisma: PrismaClient, key: OperatorKey): Promise<any> {
  await prisma.$connect()
  console.log('loading games')
  await prisma.game.deleteMany({})

  const _games: any[] = []
  // const data = await import(__dirname + '/games2.json')
  async function insertGames(gamesData: any) {
    await prisma.game.createMany({
      data: gamesData,
      skipDuplicates: true,
    })
  }
  // const shops = await prisma.operatorAccess.findMany();
  // const shop = shops[0];
  //   shops.forEach((shop) => {
  for (const _game of (gamesData as any).default) {
    // const injpg = Math.random() > 0.7;
    // const jpgnum = Math.floor(Math.random() * 3);
    const game: any = _game
    //   let jpgId = null
    //   if (injpg) {
    //     jpgId = jackpotGroups[jpgnum].id
    //   }
    // console.log(key);
    game.operatorId = key.id // 'cmaq8ugkl004fmjykfj4zotcy'; // shop.id;
    delete game.shop_id
    delete game.type
    //   game.jackpotGroupId = jpgId != null ? jpgId : undefined
    delete game.jpg_id
    delete game.label
    delete game.device
    delete game.id
    // game.vipLevel = parseInt(game.vip_level) || 0;
    // game.rezerv = parseInt(game.rezerv) || 0;
    // game.cask = parseInt(game.cask) || 0;
    // game.bet = parseInt(game.bet) || 0;
    // game.bids = parseInt(game.bids) || 0;
    // game.view = parseInt(game.view) || 0;
    // game.statIn = parseInt(game.stat_in) || 0;
    // game.statOut = parseInt(game.stat_out) || 0;
    // game.createdAt = parseInt(game.created_at);
    // game.updatedOff = parseInt(game.updated_off);
    // game.updatedAt = new Date(game.updated_at);
    // game.standardRtp = parseInt(game.standard_rtp) || 0;
    // game.originalId = parseInt(game.original_id) || 0;
    // game.denomination = parseInt(game.denomination) || 1;
    // game.popularity = parseInt(game.popularity) || 0;
    delete game.popularity
    // game.currentRtp = parseInt(game.current_rtp) || 0;
    // game.rtpStatIn = parseInt(game.rtp_stat_in) || 0;
    // game.rtpStatOut = parseInt(game.rtp_stat_out) || 0;
    // game.slug = game.name;
    delete game.created_at
    delete game.updated_at
    delete game.updated_off
    delete game.standard_rtp
    delete game.updated_off
    // game.category_temp = parseInt(game.category_temp);
    // game.linesPercentConfigSpin = game.lines_percent_config_spin;
    // game.linesPercentConfigSpinBonus = game.lines_percent_config_spin_bonus;
    // game.linesPercentConfigBonus = game.lines_percent_config_bonus;
    // game.linesPercentConfigBonusBonus = game.lines_percent_config_bonus_bonus;
    // game.linesPercentConfigBonusBonus = game.lines_percent_config_spin_bonus_bonus;
    delete game.original_id
    delete game.stat_in
    delete game.stat_out

    delete game.lines_percent_config_spin
    delete game.lines_percent_config_bonus_bonus
    delete game.lines_percent_config_spin_bonus
    delete game.lines_percent_config_spin_bonus_bonus
    delete game.lines_percent_config_bonus
    game.scaleMode = game.scalemode
    delete game.scalemode
    game.slotViewState = game.slotviewstate
    delete game.slotviewstate
    delete game.category_temp
    delete game.category_temp
    delete game.updated_off
    delete game.current_rtp
    delete game.rtp_stat_in
    delete game.rtp_stat_out
    delete game.vip_level
    game.goldsvetData = {
      // id: game.id,
      // developer: 'redtiger',
      // type: 'slots',
      // vip_level: '5',
      // name: 'AncientDiscoRTG',
      // title: 'AncientDisco',
      // shop_id: '1',
      jpg_id: '0',
      label: game.label,
      device: game.device,
      gamebank: game.gamebank,
      lines_percent_config_spin: game.lines_percent_config_spin,
      lines_percent_config_spin_bonus: game.lines_percent_config_spin_bonus,
      lines_percent_config_bonus: game.lines_percent_config_bonus,
      lines_percent_config_bonus_bonus: game.lines_percent_config_bonus_bonus,
      rezerv: game.rezerv,
      cask: game.cask,
      advanced: game.advanced,
      bet: game.bet,
      scalemode: game.scalemode,
      slotviewstate: game.slotviewstate,
      view: game.view,
      denomination: game.denomination,
      category_temp: game.category_temp,
      original_id: game.original_id,
      bids: game.bids,
      stat_in: game.stat_in,
      stat_out: game.stat_out,
      standard_rtp: game.standard_rtp,
      current_rtp: game.current_rtp,
      rtp_stat_in: game.rtp_stat_in,
      rtp_stat_out: game.rtp_stat_out,
      // scalemode: game.scalemode,
      // slotviewstate: game.slotviewstate,
    }
    delete game.scalemode
    delete game.slotviewstate
    delete game.slotViewState
    delete game.scaleMode
    delete game.jpg_id
    delete game.label
    delete game.device
    delete game.gamebank
    delete game.lines_percent_config_spin
    delete game.lines_percent_config_spin_bonus
    delete game.lines_percent_config_bonus
    delete game.lines_percent_config_bonus_bonus
    delete game.rezerv
    delete game.cask
    delete game.advanced
    delete game.bet
    delete game.scalemode
    delete game.slotviewstate
    delete game.view
    delete game.denomination
    delete game.category_temp
    delete game.original_id
    delete game.bids
    delete game.stat_in
    delete game.stat_out
    delete game.standard_rtp
    delete game.current_rtp
    delete game.rtp_stat_in
    delete game.rtp_stat_out
    delete game.active
    delete game.featured
    game.provider =
      GameProvider[game.developer as keyof typeof GameProvider] || GameProvider.INTERNAL
    delete game.developer
    // game.category = game.type || 'slots';
    game.category =
      GameCategory[
        game.type
          ? ((game.type as string).toUpperCase() as keyof typeof GameCategory)
          : GameCategory.SLOTS
      ] || GameCategory.SLOTS
    // game.featured = Math.floor(Math.random() * 100) < 10 ? true : false;
    // if (game.developer === 'nolimit') game.featured = true;
    // if (game.developer === 'BigFishGames') game.featured = false;
    // _games.push(game);
    if (_games.filter((item) => item.name == game.name).length == 0) _games.push(game)
  }
  //   })
  // const feats = _games.filter((item) => item.featured == true);
  await insertGames(_games)
  return await prisma.game.findMany()
}
