import React, { useState, useEffect } from 'react'
import { Box, Text, Button, Flex } from '@koda-finance/summitswap-uikit'
import _ from 'lodash'
import useReferralHistories from 'hooks/useReferralHistories'
import { CHAIN_ID } from 'constants/index'
import { REFERRAL_CLIENT } from 'constants/graphs'
import { useActiveWeb3React } from '../../hooks'
import ReferralTransactionRow from './ReferralTransactionRow'
import { ReferralReward } from './types'
import RewardedTokens from './RewardedTokens'

export default function SwapList() {
  const { account, chainId } = useActiveWeb3React()
  const [page, setPage] = useState(1)
  const [hasLoadMore, setHasLoadMore] = useState(true)
  const referralHistories = useReferralHistories(account, null, null, page)

  const fetchNextReferralHistories = () => {
    setHasLoadMore(false)
    setPage((prevState) => prevState + 1)
  }

  useEffect(() => {
    setHasLoadMore(true)
  }, [referralHistories.length])

  return (
    <>
      <Text bold mb={2}>
        Referred swap history
      </Text>
      {CHAIN_ID !== chainId || REFERRAL_CLIENT === ""
        ? <Text bold>Swap history is not supported on current network!</Text>
        : (referralHistories.length === 0)
        ? <Text bold> No history to be displayed!</Text>
        : (
          <Flex flexDirection="column">
            <Box mb={2}>
              {_.map(referralHistories, (referralHistory: ReferralReward) => (
                <ReferralTransactionRow key={`${referralHistory.id}-${referralHistory.timestamp}`} account={account} {...referralHistory} />
              ))}
            </Box>
            {hasLoadMore && (
              <Text color="primary" bold style={{ cursor: 'pointer' }} onClick={fetchNextReferralHistories}>
                Load More...
              </Text>
            )}
          </Flex>
        )
      }
      <RewardedTokens />
    </>
  )
}
