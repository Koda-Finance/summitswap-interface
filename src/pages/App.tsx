import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch, Redirect, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useWalletModal } from '@koda-finance/summitswap-uikit'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import InvalidReferralLinkModal from 'components/InvalidReferralLinkModal'
import { utils } from 'ethers'
import login from '../utils/login'
import Banner from '../components/Banner'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './AddLiquidity/redirects'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import AddLiquidity from './AddLiquidity'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import Swap from './Swap'
import CrossChainSwap from './CrossChainSwap'
import Referral from './Referral'
import Onboarding from './Onboarding'
import SummitCheck from './SummitCheck'
import SummitInfoOverview from './Info/Overview'
import SummitInfoPools from './Info/Pools'
import SummitInfoTokens from './Info/Tokens'
import SummitInfoPool from './Info/Pools/PoolPage'
import SummitInfoToken from './Info/Tokens/TokenPage'
import CustomPresale from './CustomPresale'
import { EN, allLanguages } from '../constants/localisation/languageCodes'
import { LanguageContext } from '../hooks/LanguageContext'
import { TranslationsContext } from '../hooks/TranslationsContext'
import langSrc from '../constants/localisation/translate/index'
import AppHeader from './AppHeader'
import Menu from '../components/Menu'
import SupportChatWidget from '../components/SupportChatWidget'
import CreateToken from './CreateToken'
import DepositPage from './Staking/DepositPage'
import WithdrawPage from './Staking/WithdrawPage'
import ClaimPage from './Staking/ClaimPage'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  background-repeat: no-repeat;
  background-position: bottom 24px center;
  background-size: 90%;

  ${({ theme }) => theme.mediaQueries.xs} {
    background-size: auto;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    background-repeat: no-repeat;
    background-position: center 420px, 10% 230px, 90% 230px;
    background-size: contain, 266px, 266px;
  }
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  const { account, deactivate, activate, error } = useWeb3React()

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError || !account) {
      localStorage.removeItem('walletconnect')
    }
  }, [error, account])

  const [selectedLanguage, setSelectedLanguage] = useState<any>(undefined)
  const [translatedLanguage, setTranslatedLanguage] = useState<any>(undefined)
  const [translations, setTranslations] = useState<Array<any>>([])
  const [isInvalidRefLink, setIsInvalidRefLink] = useState<boolean>(false)

  const location = useLocation()

  const handleLogin = (connectorId: string) => {
    login(connectorId, activate)
  }

  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)

  const getStoredLang = (storedLangCode: string) => {
    return allLanguages.filter((language) => {
      return language.code === storedLangCode
    })[0]
  }

  useEffect(() => {
    const storedLangCode = localStorage.getItem('pancakeSwapLanguage')
    if (storedLangCode) {
      const storedLang = getStoredLang(storedLangCode)
      setSelectedLanguage(storedLang)
    } else {
      setSelectedLanguage(EN)
    }
  }, [])

  const getLang = () => {
    return langSrc[selectedLanguage.code] ? langSrc[selectedLanguage.code].src : []
  }

  const fetchTranslationsForSelectedLanguage = async () => {
    setTranslations(getLang())
    setTranslatedLanguage(selectedLanguage)
  }

  useEffect(() => {
    if (selectedLanguage) {
      fetchTranslationsForSelectedLanguage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage])

  useEffect(() => {
    const referrerParam = new URLSearchParams(location.search).get('ref')
    const outputParam = new URLSearchParams(location.search).get('output')
    if (referrerParam && !utils.isAddress(referrerParam)) {
      setIsInvalidRefLink(true)
      return
    }
    setIsInvalidRefLink(false)
    if (referrerParam && outputParam) {
      const referralCached: Record<string, string> = JSON.parse(localStorage.getItem('referral') ?? '{}')
      referralCached[outputParam] = referrerParam
      localStorage.setItem('referral', JSON.stringify(referralCached))
      onPresentConnectModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return (
    <Suspense fallback={null}>
      <AppWrapper>
        <LanguageContext.Provider
          value={{ selectedLanguage, setSelectedLanguage, translatedLanguage, setTranslatedLanguage }}
        >
          <TranslationsContext.Provider value={{ translations, setTranslations }}>
            <InvalidReferralLinkModal isOpen={isInvalidRefLink} />
            <SupportChatWidget />
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path={['/', '/send']}>
                  <Redirect to={`/swap${location.search}`} />
                </Route>
                <Menu>
                  <BodyWrapper>
                    <AppHeader />
                    <Banner />
                    <Route exact path="/swap" component={Swap} />
                    <Route exact path="/create-token" component={CreateToken} />
                    <Route exact path="/cross-chain-swap" component={CrossChainSwap} />
                    <Route exact path="/swap?ref=:ref" component={Referral} />
                    <Route exact path="/referral" component={Referral} />
                    <Route exact path="/onboarding" component={Onboarding} />
                    <Route exact strict path="/find" component={PoolFinder} />
                    <Route exact strict path="/pool" component={Pool} />
                    <Route exact path="/add" component={AddLiquidity} />
                    <Route exact path="/info" component={SummitInfoOverview} />
                    <Route exact path="/info/pools" component={SummitInfoPools} />
                    <Route exact path="/info/tokens" component={SummitInfoTokens} />
                    <Route exact path="/info/token/:address" component={SummitInfoToken} />
                    <Route exact path="/info/pool/:address" component={SummitInfoPool} />
                    <Route exact path="/staking/deposit" component={DepositPage} />
                    <Route exact path="/staking/claim" component={ClaimPage} />
                    <Route exact path="/staking/withdraw" component={WithdrawPage} />
                    <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                    <Route exact path="/presale" component={CustomPresale} />

                    {/* Redirection: These old routes are still used in the code base */}
                    <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                    <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                    <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                    <Route exact path="/summitcheck" component={SummitCheck} />

                    {/* <Route component={RedirectPathToSwapOnly} /> */}
                  </BodyWrapper>
                </Menu>
              </Switch>
            </Web3ReactManager>
            <Marginer />
          </TranslationsContext.Provider>
        </LanguageContext.Provider>
      </AppWrapper>
    </Suspense>
  )
}
