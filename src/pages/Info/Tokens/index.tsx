import { Heading } from '@koda-finance/summitswap-uikit'
import { useTranslation } from 'react-i18next'
import React, { useMemo } from 'react'
import TokenTable from 'components/InfoTables/TokensTable'
import TopTokenMovers from 'components/TopTokenMovers'
import { useAllTokenData } from 'state/info/hooks'
import InfoPageLayout from '../index'

const TokensOverview: React.FC = () => {
  const { t } = useTranslation()

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((token) => token.data)
      .filter((token) => token)
  }, [allTokens])

  return (
    <InfoPageLayout>
      <TopTokenMovers />
      <Heading size="lg" mt="40px" mb="16px" id="info-tokens-title">
        {t('All Tokens')}
      </Heading>
      <TokenTable tokenDatas={formattedTokens} />
    </InfoPageLayout>
  )
}

export default TokensOverview
