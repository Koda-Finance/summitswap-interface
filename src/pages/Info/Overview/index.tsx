import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Box, Text, Heading, Card, Skeleton, LineChart, BarChart } from '@koda-finance/summitswap-uikit'
import { fromUnixTime } from 'date-fns'
import { useTranslation } from 'react-i18next'
import TokenTable from 'components/InfoTables/TokensTable'
import PoolTable from 'components/InfoTables/PoolsTable'
import { formatAmount } from 'utils/formatInfoNumbers'
import {
  useAllPoolData,
  useAllTokenData,
  useProtocolChartData,
  useProtocolData,
  useProtocolTransactions,
} from 'state/info/hooks'
import TransactionTable from 'components/InfoTables/TransactionsTable'
import getLocale from 'utils/getLocale'
import InfoPageLayout from '../index'

export const ChartCardsContainer = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  padding: 0;
  gap: 1em;

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  } ;
`

const Overview: React.FC = () => {
  const { t } = useTranslation()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [liquidityDateHover, setLiquidityDateHover] = useState<string | undefined>()
  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [volumeDateHover, setVolumeDateHover] = useState<string | undefined>()

  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()
  const [transactions] = useProtocolTransactions()

  const currentDate = new Date().toLocaleString(getLocale(), { month: 'short', year: 'numeric', day: 'numeric' })

  // Getting latest liquidity and volumeUSD to display on top of chart when not hovered
  useEffect(() => {
    if (volumeHover == null && protocolData) {
      setVolumeHover(protocolData.volumeUSD)
    }
  }, [protocolData, volumeHover])
  useEffect(() => {
    if (liquidityHover == null && protocolData) {
      setLiquidityHover(protocolData.liquidityUSD)
    }
  }, [liquidityHover, protocolData])

  const formattedLiquidityData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.liquidityUSD,
        }
      })
    }
    return []
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.volumeUSD,
        }
      })
    }
    return []
  }, [chartData])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((token) => token.data)
      .filter((token) => token)
  }, [allTokens])

  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((pool) => pool.data)
      .filter((pool) => pool)
  }, [allPoolData])

  const somePoolsAreLoading = useMemo(() => {
    return Object.values(allPoolData).some((pool) => !pool.data)
  }, [allPoolData])

  return (
    <InfoPageLayout>
      <ChartCardsContainer>
        <Card>
          <Box p={['16px', '16px', '24px']}>
            <Text bold color="white">
              {t('Liquidity')}
            </Text>
            {(liquidityHover ?? 0) > 0 ? (
              <Text bold fontSize="24px">
                ${formatAmount(liquidityHover)}
              </Text>
            ) : (
              <Skeleton width="128px" height="36px" />
            )}
            <Text>{liquidityDateHover ?? currentDate}</Text>
            <Box height="250px">
              <LineChart
                data={formattedLiquidityData}
                setHoverValue={setLiquidityHover}
                setHoverDate={setLiquidityDateHover}
              />
            </Box>
          </Box>
        </Card>
        <Card>
          <Box p={['16px', '16px', '24px']}>
            <Text bold color="white">
              {t('Volume 24H')}
            </Text>
            {(volumeHover ?? 0) > 0 ? (
              <Text bold fontSize="24px">
                ${formatAmount(volumeHover)}
              </Text>
            ) : (
              <Skeleton width="128px" height="36px" />
            )}
            <Text>{volumeDateHover ?? currentDate}</Text>
            <Box height="250px">
              <BarChart data={formattedVolumeData} setHoverValue={setVolumeHover} setHoverDate={setVolumeDateHover} />
            </Box>
          </Box>
        </Card>
      </ChartCardsContainer>
      <Heading size="lg" mt="40px" mb="16px">
        {t('Top Tokens')}
      </Heading>
      <TokenTable tokenDatas={formattedTokens} />
      <Heading size="lg" mt="40px" mb="16px">
        {t('Top Pools')}
      </Heading>
      <PoolTable poolDatas={poolDatas} loading={somePoolsAreLoading} />
      <Heading size="lg" mt="40px" mb="16px">
        {t('Transactions')}
      </Heading>
      <TransactionTable transactions={transactions ?? []} />
    </InfoPageLayout>
  )
}

export default Overview
