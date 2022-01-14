import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Text, Box, Button, useWalletModal, Flex } from '@summitswap-uikit'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import _ from 'lodash'
import { injected, walletconnect } from 'connectors'
import ReferralTransactionRow from 'components/PageHeader/ReferralTransactionRow'
import { useAllSwapList } from 'state/transactions/hooks'
import { TranslateString } from 'utils/translateTextHelpers'
import { useReferralContract } from 'hooks/useContract'
import { REFERRAL_ADDRESS, NULL_ADDRESS } from '../../constants'
import ReferalLinkImage from '../../img/referral-link.png'
import InviteImage from '../../img/invite.png'
import CoinStackImage from '../../img/coinstack.png'
import RewardedTokens from './RewardedTokens'

import './style.css'

const Tooltip = styled.div<{ isTooltipDisplayed: boolean }>`
  display: ${({ isTooltipDisplayed }) => (isTooltipDisplayed ? 'block' : 'none')};
  position: absolute;
  bottom: 36px;
  right: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background-color: ${({ theme }) => theme.colors.sidebarBackground} !important;
  color: ${({ theme }) => theme.colors.invertedContrast};
  border-radius: 16px;
  opacity: 0.7;
  width: fit-content;
  padding: 10px;
`
const LinkBox = styled(Box)`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.sidebarBackground};
  display: flex;
  align-items: center;
  > div:first-of-type {
    flex: 1;
    overflow: hidden;
    > div {
      overflow: hidden;
      max-width: calc(100% - 20px);
      white-space: nowrap;
      text-overflow: ellipsis;
      word-break: break-all;
    }
  }
  > div:last-of-type {
    cursor: pointer;
    position: relative;
  }
`

const Content = styled(Box)<any>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  opacity: ${({ open }) => (open ? 1 : 0)};
  transition: 0.3s;
  pointer-events: ${({ open }) => (open ? 'initial' : 'none')};
  > div {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.sidebarBackground} !important;
    min-width: 200px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.3s;
    &:hover {
      color: lightgrey;
    }
  }
`

interface IProps {
  isLanding?: boolean
  match?: any
}

const Referral: React.FC<IProps> = () => {
  const { account, chainId, deactivate, activate } = useWeb3React()
  const [referralURL, setReferralURL] = useState('')
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)
  const [allSwapList, setAllSwapList] = useState([])
  const [referrerAddress, setReferrerAddress] = useState<string | null>(null)
  const swapListTemp = useAllSwapList()
  const location = useLocation()

  const referralContract = useReferralContract(REFERRAL_ADDRESS, true)

  const getAllSwapList = async () => {
    const tmp: any = await swapListTemp
    setAllSwapList(tmp)
  }

  const handleLogin = (connectorId: string) => {
    if (connectorId === 'walletconnect') {
      return activate(walletconnect())
    }
    return activate(injected)
  }

  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)

  useEffect(() => {
    getAllSwapList()
  })

  useEffect(() => {
    setReferralURL(
      `http://${document.location.hostname}${
        document.location.port ? `:${document.location.port}` : ''
      }/#/swap?ref=${account}`
    )
  }, [location, account])

  useEffect(() => {
    async function getReferral() {
      if (account && referralContract) {
        const referrer = await referralContract.getReferrer(account)

        setReferrerAddress(referrer)
      }
    }

    getReferral()
  }, [referralContract, account])

  return (
    <div className="main-content">
      <Box>
        {account && (
          <>
            <Text mb="8px" bold>
              My Referral link
            </Text>
            <LinkBox mb={4}>
              <Box>
                <Text>{referralURL}</Text>
              </Box>
              <Box
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(referralURL)
                    setIsTooltipDisplayed(true)
                    setTimeout(() => {
                      setIsTooltipDisplayed(false)
                    }, 1000)
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="22" viewBox="0 0 19 22" fill="none">
                  <path
                    d="M13 0L2 0C0.9 0 0 0.9 0 2L0 15C0 15.55 0.45 16 1 16C1.55 16 2 15.55 2 15L2 3C2 2.45 2.45 2 3 2L13 2C13.55 2 14 1.55 14 1C14 0.45 13.55 0 13 0ZM17 4L6 4C4.9 4 4 4.9 4 6L4 20C4 21.1 4.9 22 6 22H17C18.1 22 19 21.1 19 20V6C19 4.9 18.1 4 17 4ZM16 20H7C6.45 20 6 19.55 6 19L6 7C6 6.45 6.45 6 7 6L16 6C16.55 6 17 6.45 17 7V19C17 19.55 16.55 20 16 20Z"
                    fill="white"
                  />
                </svg>
                <Tooltip isTooltipDisplayed={isTooltipDisplayed}>Copied</Tooltip>
              </Box>
            </LinkBox>
          </>
        )}
        {/* {account && <BalanceCard />} */}
        {account && allSwapList && allSwapList.length <= 0 && <Text>No recent transactions</Text>}
        {account && chainId && allSwapList && allSwapList.length > 0 && (
          <Box mb={2}>
            {_.map(allSwapList, (x: any, index) => (
                <ReferralTransactionRow {...x} index={allSwapList.length - index} />
              )
            )}
          </Box>
        )}
        {account && (
          <>
            <Text bold mb={3}>
              Rewarded Tokens
            </Text>
            <RewardedTokens />
          </>
        )}
        {!account && (
          <Flex mb={3} justifyContent="center">
            <Button style={{ fontFamily: 'Poppins' }} onClick={onPresentConnectModal}>
              {TranslateString(292, 'CONNECT WALLET')}
            </Button>
          </Flex>
        )}
      </Box>

      <div className="invite-friends-area">
        <h2 className="float-title">How to invite friends</h2>

        {!!referrerAddress && referrerAddress !== NULL_ADDRESS && (
          <div className="inviter-box">
            My Inviter: &nbsp;{' '}
            <span className="white-text">{`${referrerAddress?.substring(0, 5)}...${referrerAddress?.substring(
              38
            )}`}</span>{' '}
            &nbsp; <span className="yellow-ball">10%</span>
          </div>
        )}

        <div className="clear" />

        <div className="friends-box">
          <span className="number-circle">1</span>

          <div className="align-center">
            <img src={ReferalLinkImage} alt="Referral Link" />
          </div>

          <h3>Get Referral Link</h3>

          <p className="max-width-90">Connect your wallet to generate your referral link above</p>
        </div>

        <div className="friends-box">
          <span className="number-circle">2</span>

          <div className="align-center">
            <img src={InviteImage} alt="Invite" />
          </div>

          <h3>Invite</h3>

          <p>Share referral link of your favourite projects to your community, friends and family.</p>
        </div>

        <div className="friends-box no-margin-right">
          <span className="number-circle">3</span>

          <div className="align-center">
            <img src={CoinStackImage} alt="Earn Crypto" />
          </div>

          <h3>Earn Crypto</h3>

          <p>Earn Tokens Get rewards for every one of your friends buys forever.*</p>
        </div>

        <div className="clear" />
      </div>

      <div className="reward-section font-15">
        <p>
          Reward options-
          <br />
          Recieve your rewards in
        </p>
        <p>
          A, The projects token, <br />
          B, Auto-Convert it to KAPEX without fee or <br />
          C, Convert it to BNB or BUSD subject to fee.
        </p>
      </div>

      <p className="paragraph">
        Known as the trusted swap site, SummitSwap offers its user base many advantages over alternatives. One of these
        features is a unique referal system that allows tokens to reward their communities whilst growing their
        projects.
      </p>

      <p className="paragraph">
        <u>How does it work from a user perspective?</u>
      </p>

      <p className="paragraph">All you need to do is send the referral link above to a future user.</p>

      <p className="paragraph">
        *Our referrals are FOREVER referrals, this means that if you have already been referred to us by someone, they
        will earn commissions forever, providing the project pairing continues to support it.
      </p>

      <p className="paragraph">Please note: The referral fees are only applicable to projects that have this set up.</p>

      <p className="paragraph">
        <u>How does it work from a Team/Project/Token Perspective?</u>
      </p>

      <p className="paragraph">
        Step 1: A project must be whitelisted with SummitSwap. This means they submit their token details for a manual
        check, to prove they are trustworthy and allow SummitSwap to show this information as part of our SummitCheck
        whitelisting system.
      </p>

      <p className="paragraph">The token will then have the logo shown and you can search for it by name.</p>

      <p className="paragraph">
        Step 2: Project decides that they will run a referral promotion. The project can reward their users any
        percentage on just buys of their token when they purchase through SummitSwap on specific pairings. For example,
        TOKEN-EG / BNB pairing. They then set the percentage, for example 1%.
      </p>

      <p className="paragraph">
        The project can either fund the rewards with KAPEX our native utility token, or they can feed their own token to
        the reward pool. This means the referrer can earn either KAPEX or TOKEN-EG.
      </p>

      <p className="paragraph">
        The project may chose to remove fees from the reward pool contract so that rewards are paid in full to thier
        loyal community. Although our native invetment token KODA and our utility token KAPEX does this, please note
        that every project will have their own set up and may chose to keep the transactions with fees included. You can
        find out this information on their whitelisting project profile through SummitCheck.
      </p>
    </div>
  )
}

export default Referral
