import React from 'react'
import { Flex, Text } from '@koda-finance/summitswap-uikit'
import web3 from 'web3'
import { ethers, BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useToken } from '../../hooks/Tokens'
import { ReferralReward } from './types'

const ReferralTransactionRow: React.FC<ReferralReward> = ({
  timestamp,
  inputToken: inputTokenAddress,
  inputTokenSymbol,
  outputToken: outputTokenAddress,
  outputTokenSymbol,
  inputTokenAmount,
  outputTokenAmount,
  referrer,
  referrerReward,
  leadReward,
}) => {
  const { account } = useWeb3React()

  const rewardAmount = account?.toLowerCase() === referrer ? referrerReward : leadReward

  const date = `${new Date(Number(timestamp) * 1000).getFullYear() - 2000}/${
    new Date(Number(timestamp) * 1000).getMonth() + 1
  }/${new Date(Number(timestamp) * 1000).getDate()}`

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Text mb="2px" color="primary">
        <span style={{ color: 'white' }}>{date}</span> {rewardAmount}{' '}
        <span style={{ color: 'white' }}>{outputTokenSymbol} from Swap</span>{' '}
        {inputTokenAmount}{' '}
        <span style={{ color: 'white' }}>{inputTokenSymbol}</span>
        <span style={{ color: 'white' }}> to</span> {outputTokenAmount}{' '}
        <span style={{ color: 'white' }}>{outputTokenSymbol}</span>
      </Text>
    </Flex>
  )
}

export default ReferralTransactionRow
