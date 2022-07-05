import { referralClient } from 'apollo/client'
import { REFERRAL_HISTORIES } from 'apollo/queries'
import { useEffect, useState } from 'react'
import { CHAIN_ID } from 'constants/index'
import { REFERRAL_CLIENT } from 'constants/graphs'
import { useActiveWeb3React } from 'hooks'

type ReferralHistoriesResponse = {
  data: {
    account: Account | null
  }
}

type Account = {
  id: string
  referralRewards: ReferralRewardResponse[]
}

type ReferralRewardResponse = {
  id: string
  timestamp: string
  inputToken: Token
  outputToken: Token
  inputTokenAmount: string
  outputTokenAmount: string
  referrer: {
    id: string
  }
  leadInf: {
    id: string
  }
  referrerReward: string
  leadReward: string
}

type Token = {
  id: string
  name: string
  symbol: string
}

type ReferralReward = {
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

const useReferralHistories = (walletAddress?: string | null, outputTokenAddress?: string | null, leadInfAddress?: string | null, page = 1, perPage = 20): ReferralReward[] => {
  const [data, setData] = useState<ReferralReward[]>([])
  const { chainId } = useActiveWeb3React()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (CHAIN_ID !== chainId || REFERRAL_CLIENT === "") throw new Error('Swap history is not supported on current network!')

        const _walletAddress = walletAddress?.toLowerCase() || ""
        const _outputTokenAddress = outputTokenAddress?.toLowerCase() || ""
        const _leadInfAddress = leadInfAddress?.toLowerCase() || ""

        const dataTemp: ReferralReward[] = []
        const referralHistoriesResponse: ReferralHistoriesResponse = await referralClient.query({
          query: REFERRAL_HISTORIES(_walletAddress, _outputTokenAddress, _leadInfAddress, page, perPage),
          fetchPolicy: 'cache-first',
        });
        if (!referralHistoriesResponse.data.account || referralHistoriesResponse.data.account.referralRewards.length === 0) return
        referralHistoriesResponse.data.account.referralRewards.forEach((referralReward: ReferralRewardResponse) => {
          dataTemp.push({
            id: referralReward.id,
            timestamp: referralReward.timestamp,
            inputToken: referralReward.inputToken.id,
            inputTokenName: referralReward.inputToken.name,
            inputTokenSymbol: referralReward.inputToken.symbol,
            inputTokenAmount: referralReward.inputTokenAmount,
            outputToken: referralReward.outputToken.id,
            outputTokenName: referralReward.outputToken.name,
            outputTokenSymbol: referralReward.outputToken.symbol,
            outputTokenAmount: referralReward.outputTokenAmount,
            referrer: referralReward.referrer.id,
            referrerReward: referralReward.referrerReward,
            lead: referralReward.leadInf.id,
            leadReward: referralReward.leadReward,
          })
        })
        setData((prevValue) => [...prevValue, ...dataTemp])
      } catch (error) {
        console.error("Failed to fetch referral histories", error)
        setData([])
      }
    }

    fetchData()
  }, [setData, walletAddress, outputTokenAddress, chainId, leadInfAddress, page, perPage])

  return data
}

export default useReferralHistories
