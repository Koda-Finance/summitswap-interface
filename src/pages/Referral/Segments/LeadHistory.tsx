import React, { useCallback } from 'react'
import { Text, Box } from '@koda-finance/summitswap-uikit'
import { Token } from '@koda-finance/summitswap-sdk'
import { ethers } from 'ethers'

import DropdownWrapper from 'components/DropdownWrapper'
import { PaginatedRewards, ReferralReward } from '../types'
import { StyledBr, StyledWhiteBr } from '../StyledBr'
import ReferralTransactionRow from '../ReferralTransactionRow'

interface LeadHistoryProps {
  paginatedRewards: PaginatedRewards
  selectedAddress: string
  setSelectedAddress: (val: string) => void
  outputToken?: Token
}

interface HistoryListProps {
  history: ReferralReward[]
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  return (
    <>
      {history.map((record) => {
        return (
          <Box key={`${record.id}-${record.timestamp}`}>
            <ReferralTransactionRow {...record} />
          </Box>
        )
      })}
    </>
  )
}

const LeadHistory: React.FC<LeadHistoryProps> = ({
  paginatedRewards,
  selectedAddress,
  setSelectedAddress,
  outputToken,
}) => {
  const addresses = Object.keys(paginatedRewards)
  const headerLabel = "Check Sub Influencer's History"

  const formatTotalSum = useCallback(() => {
    if (!outputToken) return "0"

    const sumAmount = paginatedRewards[selectedAddress]
      .map((record) => Number(record.outputTokenAmount))
      .reduce((acc, currentReward) => {
        return currentReward + acc
      })

    return sumAmount
  }, [outputToken, paginatedRewards, selectedAddress])


  return addresses.length ? (
    <>
      <Box style={{ marginTop: '21px' }}>
        <Text bold>{headerLabel}</Text>
        <StyledWhiteBr />
      </Box>
      <DropdownWrapper
        options={addresses}
        onChange={(option) => {
          setSelectedAddress(option.value)
        }}
        value={selectedAddress}
      />
      <StyledBr />
      <HistoryList history={paginatedRewards[selectedAddress]} />
      <StyledBr />
      <Text bold color="primary"> <span style={{ color: 'white' }}>Total bought: </span>{formatTotalSum()} <span style={{ color: 'white' }}>{outputToken?.symbol || ""}</span></Text>
    </>
  ) : (
    <Box style={{ marginTop: '21px' }}>
      <Text bold>No sub influencers history available!</Text>
    </Box>
  )
}

export default LeadHistory
