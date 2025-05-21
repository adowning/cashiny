export interface GetBonusData {
  type: string;
  rate: number;
  currentCash: string;
  totalCash: string;
  restCash: string;
  bonusCash: string;
  expireDate: string;
}

export interface BonusItem {
  type: number;
  status: number;
  now: string;
  max: number;
  min: number;
  award: number;
  ended_at: number;
  created_at: number;
  gain_amount: number;
  currency: string;
  receive: number;
  wager: number;
  rate: number;
  deposit: number;
  id: string | number;
  children: any;
}

export interface GetBonusList {
  list: Array<BonusItem>;
}

export type GetUserBonusResponse = {
  code: number;
  data: GetBonusList;
  message: string;
};
