import React, { useMemo } from 'react'
import { Heading } from "@koda-finance/summitswap-uikit"
import { useTranslation } from 'react-i18next'
import PoolTable from 'components/InfoTables/PoolsTable'
import { useAllPoolData } from 'state/info/hooks'
import InfoPageLayout from '../index'

const PoolsOverview: React.FC = () => {
  const { t } = useTranslation()

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((pool) => pool.data)
      .filter((pool) => pool)
  }, [allPoolData])

  return (
    <InfoPageLayout>
      <Heading size="lg" mt="40px" mb="16px" id="info-pools-title">
        {t('All Pools')}
      </Heading>
      <PoolTable poolDatas={poolDatas} />
    </InfoPageLayout>
  )
}

export default PoolsOverview
