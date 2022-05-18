import { BigNumber } from 'ethers'
import { KODA, KAPEX } from '.'

export const lockingPeriods = {
  _0Months: 0,
  _3Months: 7948800,
  _6Months: 15811200,
  _12Months: 31536000,
}

export const APYs = {
  [KODA.address]: {
    [lockingPeriods._0Months]: BigNumber.from(55),
    [lockingPeriods._3Months]: BigNumber.from(80),
    [lockingPeriods._6Months]: BigNumber.from(105),
    [lockingPeriods._12Months]: BigNumber.from(150),
  },
  [KAPEX.address]: {
    [lockingPeriods._0Months]: BigNumber.from(0),
    [lockingPeriods._3Months]: BigNumber.from(80),
    [lockingPeriods._6Months]: BigNumber.from(105),
    [lockingPeriods._12Months]: BigNumber.from(150),
  },
}

export const maximumKodaYearlyReward = BigNumber.from('9000000000000000000')
