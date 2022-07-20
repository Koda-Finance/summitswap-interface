import React, { Box, ButtonMenu, ButtonMenuItem, Flex } from '@koda-finance/summitswap-uikit'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Search from 'components/InfoSearch'

const NavWrapper = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 40px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
  }
`

const InfoNav = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const isPools = location.pathname === '/info/pools'
  const isTokens = location.pathname === '/info/tokens'
  let activeIndex = 0
  if (isPools) {
    activeIndex = 1
  }
  if (isTokens) {
    activeIndex = 2
  }
  return (
    <NavWrapper>
      <Box>
        <ButtonMenu activeIndex={activeIndex} scale="sm" variant="primary">
          <ButtonMenuItem as={Link} to="/info">
            {t('Overview')}
          </ButtonMenuItem>
          <ButtonMenuItem as={Link} to="/info/pools">
            {t('Pools')}
          </ButtonMenuItem>
          <ButtonMenuItem as={Link} to="/info/tokens">
            {t('Tokens')}
          </ButtonMenuItem>
        </ButtonMenu>
      </Box>
      <Box width={['100%', '100%', '250px']}>
        <Search />
      </Box>
    </NavWrapper>
  )
}

export default InfoNav
