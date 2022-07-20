/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Duration } from 'date-fns'
import styled from 'styled-components'
import {
  Text,
  Box,
  Heading,
  Button,
  Card,
  Flex,
  Breadcrumbs,
  Link as UIKitLink,
  LinkExternal,
  Spinner,
  Image,
  useMatchBreakpoints,
  Percent,
  ChartCard,
} from '@koda-finance/summitswap-uikit'
import { getBscScanLink } from 'utils'
import truncateHash from 'utils/truncateHash'
import useCMCLink from 'hooks/useCMCLink'
import { CurrencyLogo } from 'components/CurrencyLogoByAddress'
import { formatAmount } from 'utils/formatInfoNumbers'
import {
  usePoolDatas,
  useTokenData,
  usePoolsForToken,
  useTokenChartData,
  useTokenPriceData,
  useTokenTransactions,
} from 'state/info/hooks'
import PoolTable from 'components/InfoTables/PoolsTable'
import TransactionTable from 'components/InfoTables/TransactionsTable'
import { ONE_HOUR_SECONDS } from 'constants/info'
import { useTranslation } from 'react-i18next'
import { useActiveWeb3React } from 'hooks'
import InfoPageLayout from '../index'

const ContentLayout = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const StyledCMCLink = styled(UIKitLink)`
  width: 24px;
  height: 24px;
  margin-right: 8px;

  & :hover {
    opacity: 0.8;
  }
`
const DEFAULT_TIME_WINDOW: Duration = { weeks: 1 }

export default function TokenPage({
  match: {
    params: { address: routeAddress },
  },
}) {
  const { isXs, isSm } = useMatchBreakpoints()
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  // In case somebody pastes checksummed address into url (since GraphQL expects lowercase address)
  const address = routeAddress.toLowerCase()

  const cmcLink = useCMCLink(address)

  const tokenData = useTokenData(address)
  const poolsForToken = usePoolsForToken(address)
  const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(address)
  const chartData = useTokenChartData(address)

  // pricing data
  const priceData = useTokenPriceData(address, ONE_HOUR_SECONDS, DEFAULT_TIME_WINDOW)
  const adjustedPriceData = useMemo(() => {
    // Include latest available price
    if (priceData && tokenData && priceData.length > 0) {
      return [
        ...priceData,
        {
          time: new Date().getTime() / 1000,
          open: priceData[priceData.length - 1].close,
          close: tokenData?.priceUSD,
          high: tokenData?.priceUSD,
          low: priceData[priceData.length - 1].close,
        },
      ]
    }
    return undefined
  }, [priceData, tokenData])

  return (
    <InfoPageLayout>
      {tokenData ? (
        !tokenData.exists ? (
          <Card>
            <Box p="16px">
              <Text>
                {t('No pool has been created with this token yet. Create one')}
                <Link style={{ display: 'inline', marginLeft: '6px' }} to={`/add/${address}`}>
                  {t('here.')}
                </Link>
              </Text>
            </Box>
          </Card>
        ) : (
          <>
            {/* Stuff on top */}
            <Flex justifyContent="space-between" mb="24px" flexDirection={['column', 'column', 'row']}>
              <Breadcrumbs mb="32px">
                <Link to="/info">
                  <Text color="primary">{t('Info')}</Text>
                </Link>
                <Link to="/info/tokens">
                  <Text color="primary">{t('Tokens')}</Text>
                </Link>
                <Flex>
                  <Text mr="8px">{tokenData.symbol}</Text>
                  <Text>{`(${truncateHash(address)})`}</Text>
                </Flex>
              </Breadcrumbs>
              <Flex justifyContent={[null, null, 'flex-end']} mt={['8px', '8px', 0]}>
                {chainId && (
                  <LinkExternal mr="8px" color="primary" href={getBscScanLink(chainId, address, 'address')}>
                    {t('View on BscScan')}
                  </LinkExternal>
                )}
                {cmcLink && (
                  <StyledCMCLink href={cmcLink} rel="noopener noreferrer nofollow" target="_blank">
                    <Image src="/images/CMC-logo.svg" height={22} width={22} alt={t('View token on CoinMarketCap')} />
                  </StyledCMCLink>
                )}
              </Flex>
            </Flex>
            <Flex justifyContent="space-between" flexDirection={['column', 'column', 'column', 'row']}>
              <Flex flexDirection="column" mb={['8px', null]}>
                <Flex alignItems="center">
                  <CurrencyLogo size="32px" address={address} />
                  <Text
                    ml="12px"
                    bold
                    lineHeight="0.7"
                    fontSize={isXs || isSm ? '24px' : '40px'}
                    id="info-token-name-title"
                  >
                    {tokenData.name}
                  </Text>
                  <Text ml="12px" lineHeight="1" color="textSubtle" fontSize={isXs || isSm ? '14px' : '20px'}>
                    ({tokenData.symbol})
                  </Text>
                </Flex>
                <Flex mt="8px" ml="46px" alignItems="center">
                  <Text mr="16px" bold fontSize="24px">
                    ${formatAmount(tokenData.priceUSD, { notation: 'standard' })}
                  </Text>
                  <Percent value={tokenData.priceUSDChange} fontWeight={600} />
                </Flex>
              </Flex>
              <Flex>
                <Link to={`/add/${address}`}>
                  <Button mr="8px" variant="tertiary">
                    {t('Add Liquidity')}
                  </Button>
                </Link>
                <Link to={`/swap?inputCurrency=${address}`}>
                  <Button>{t('Trade')}</Button>
                </Link>
              </Flex>
            </Flex>

            {/* data on the right side of chart */}
            <ContentLayout>
              <Card>
                <Box p="24px">
                  <Text bold small color="primary" fontSize="12px" textTransform="uppercase">
                    {t('Liquidity')}
                  </Text>
                  <Text bold fontSize="24px">
                    ${formatAmount(tokenData.liquidityUSD)}
                  </Text>
                  <Percent value={tokenData.liquidityUSDChange} />

                  <Text mt="24px" bold color="primary" fontSize="12px" textTransform="uppercase">
                    {t('Volume 24H')}
                  </Text>
                  <Text bold fontSize="24px" textTransform="uppercase">
                    ${formatAmount(tokenData.volumeUSD)}
                  </Text>
                  <Percent value={tokenData.volumeUSDChange} />

                  <Text mt="24px" bold color="primary" fontSize="12px" textTransform="uppercase">
                    {t('Volume 7D')}
                  </Text>
                  <Text bold fontSize="24px">
                    ${formatAmount(tokenData.volumeUSDWeek)}
                  </Text>

                  <Text mt="24px" bold color="primary" fontSize="12px" textTransform="uppercase">
                    {t('Transactions 24H')}
                  </Text>
                  <Text bold fontSize="24px">
                    {formatAmount(tokenData.txCount, { isInteger: true })}
                  </Text>
                </Box>
              </Card>
              {/* charts card */}
              <ChartCard
                variant="token"
                chartData={chartData ?? []}
                tokenData={tokenData}
                tokenPriceData={adjustedPriceData}
              />
            </ContentLayout>

            {/* pools and transaction tables */}
            <Heading size="lg" mb="16px" mt="40px">
              {t('Pools')}
            </Heading>

            <PoolTable poolDatas={poolDatas ?? []} />

            <Heading size="lg" mb="16px" mt="40px">
              {t('Transactions')}
            </Heading>

            <TransactionTable transactions={transactions ?? []} />
          </>
        )
      ) : (
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      )}
    </InfoPageLayout>
  )
}
