import { gql } from 'graphql-request'
import { useEffect, useState } from 'react'
import { ProtocolData } from 'state/info/types'
import { infoClient } from 'utils/graphql'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { getChangeForPeriod, getPercentChange } from 'utils/infoDataHelpers'
import { getDeltaTimestamps } from 'utils/infoQueryHelpers'

interface SummitFactory {
  totalTransactions: string
  totalVolumeUSD: string
  totalLiquidityUSD: string
}

interface OverviewResponse {
  summitFactories: SummitFactory[]
}

/**
 * Latest Liquidity, Volume and Transaction count
 */
const getOverviewData = async (block?: number): Promise<{ data?: OverviewResponse; error: boolean }> => {
  try {
    const query = gql`query overview {
      summitFactories(
        ${block ? `block: { number: ${block}}` : ``}
        first: 1) {
        totalTransactions
        totalVolumeUSD
        totalLiquidityUSD
      }
    }`
    const data = await infoClient.request<OverviewResponse>(query)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch info overview', error)
    return { data: undefined, error: true }
  }
}

const formatSummitFactoryResponse = (rawSummitFactory?: SummitFactory): {
  totalTransactions: number,
  totalVolumeUSD: number,
  totalLiquidityUSD: number,
} | undefined => {
  if (rawSummitFactory) {
    return {
      totalTransactions: parseFloat(rawSummitFactory.totalTransactions),
      totalVolumeUSD: parseFloat(rawSummitFactory.totalVolumeUSD),
      totalLiquidityUSD: parseFloat(rawSummitFactory.totalLiquidityUSD),
    }
  }
  return undefined
}

interface ProtocolFetchState {
  error: boolean
  data?: ProtocolData
}

const useFetchProtocolData = (): ProtocolFetchState => {
  const [fetchState, setFetchState] = useState<ProtocolFetchState>({
    error: false,
  })
  const [t24, t48] = getDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24, block48] = blocks ?? []

  useEffect(() => {
    const fetch = async () => {
      const { error, data } = await getOverviewData()
      const { error: error24, data: data24 } = await getOverviewData(block24?.number ?? undefined)
      const { error: error48, data: data48 } = await getOverviewData(block48?.number ?? undefined)
      const anyError = error || error24 || error48
      const overviewData = formatSummitFactoryResponse(data?.summitFactories?.[0])
      const overviewData24 = formatSummitFactoryResponse(data24?.summitFactories?.[0])
      const overviewData48 = formatSummitFactoryResponse(data48?.summitFactories?.[0])
      const allDataAvailable = overviewData && overviewData24 && overviewData48
      if (anyError || !allDataAvailable) {
        setFetchState({
          error: true,
        })
      } else {
        const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
          overviewData!.totalVolumeUSD,
          overviewData24!.totalVolumeUSD,
          overviewData48!.totalVolumeUSD,
        )
        const liquidityUSDChange = getPercentChange(overviewData!.totalLiquidityUSD, overviewData24!.totalLiquidityUSD)
        // 24H transactions
        const [txCount, txCountChange] = getChangeForPeriod(
          overviewData!.totalTransactions,
          overviewData24!.totalTransactions,
          overviewData48!.totalTransactions,
        )
        const protocolData: ProtocolData = {
          volumeUSD,
          volumeUSDChange: typeof volumeUSDChange === 'number' ? volumeUSDChange : 0,
          liquidityUSD: overviewData!.totalLiquidityUSD,
          liquidityUSDChange,
          txCount,
          txCountChange,
        }
        setFetchState({
          error: false,
          data: protocolData,
        })
      }
    }
    const allBlocksAvailable = block24?.number && block48?.number
    if (allBlocksAvailable && !blockError && !fetchState.data) {
      fetch()
    }
  }, [block24, block48, blockError, fetchState])

  return fetchState
}

export default useFetchProtocolData
