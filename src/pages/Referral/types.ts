import { BigNumber } from 'ethers'
import { Result } from 'ethers/lib/utils';

export interface ReferralReward extends Result {
  id: string
  timestamp: string
  inputToken: string
  inputTokenName: string
  inputTokenSymbol: string
  inputTokenAmount: string
  outputToken: string
  outputTokenName: string
  outputTokenSymbol: string
  outputTokenAmount: string
  referrer: string
  referrerReward: string
  lead: string
  leadReward: string
}

export interface Influencer {
  outputToken: string;
  referee: string;
  referrer: string;
}

export interface InfInfo {
  lead: string;
  leadFee: BigNumber;
  refFee: BigNumber;
  isActive: boolean;
  isLead: boolean;
}

export interface FeeInfo {
  tokenR: string;
  refFee: BigNumber;
  devFee: BigNumber;
  promRefFee?: BigNumber;
  promStartTimestamp?: Number;
  promEndTimestamp?: Number;
  promStart?: string;
  promEnd?: string;
}

export type PaginatedRewards = { [key: string]: ReferralReward[] }
