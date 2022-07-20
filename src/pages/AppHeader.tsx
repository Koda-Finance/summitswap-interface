import React from 'react'
import styled from 'styled-components'
import { Box } from '@koda-finance/summitswap-uikit'

import TopLogoIcon from 'img/top_logo.png'
import { useLocation } from 'react-router-dom'

const StyledBox = styled(Box)`
  text-align: center;
`

const TopLogo = styled.img`
  position: absolute;
  right: 40px;
  bottom: 0px;
  height: calc(100% + 40px);
`

const StyledContainer = styled(Box)<{ theme: any }>`
  margin-top: 135px;
  @media (min-width: 440px) {
    margin-top: 85px;
  }
  ${({ theme }) => theme.mediaQueries.nav} {
    margin-top: 0px;
  }
  position: relative;
  width: 100%;
  height: 130px;
  background: url('/images/app-header.jpg');
  background-size: 100% calc(100% + 40px);
  background-position-y: -40px;
  display: flex;
  justify-content: center;
  align-items: center;
  > div {
    color: ${({ theme }) => theme.colors.sidebarColor};
    font-weight: 900;
    font-size: 30px;
    z-index: 2;
  }
`

export default function AppHeader() {
  const location = useLocation()
  return (
    <StyledContainer>
      <StyledBox>
        {location.pathname.search('/swap') !== -1 && 'Swap'}
        {location.pathname === '/pool' && 'Liquidity'}
        {location.pathname.search('/add') !== -1 && 'Liquidity'}
        {location.pathname === '/find' && 'Liquidity'}
        {location.pathname === '/summitcheck' && 'Summit Check'}
        {location.pathname === '/referral' && 'Summit Referral'}
        {location.pathname === '/cross-chain-swap' && 'Cross-Chain Swap'}
        {location.pathname === '/onboarding' && 'Onboarding'}
        {location.pathname.search('/staking') !== -1 && 'Staking'}
        {location.pathname === '/create-token' && 'Create Token'}
        {location.pathname === '/presale' && 'Create Presale'}
        {location.pathname.search('/info') !== -1 && 'SummitSwap Info & Analytics'}
      </StyledBox>
      <TopLogo src={TopLogoIcon} alt="" />
    </StyledContainer>
  )
}
