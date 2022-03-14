import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TokenDropdown from 'components/TokenDropdown'
import { Token, WETH } from '@koda-finance/summitswap-sdk'
import { Link } from 'react-router-dom'
import { Button, Input } from '@koda-finance/summitswap-uikit'
import { useFactoryContract, useLockerContract, useTokenContract } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import axios from 'axios'
import {
  CHAIN_ID,
  MAX_UINT256,
  MINIMUM_BNB_FOR_ONBOARDING,
  NULL_ADDRESS,
  ONBOARDING_API,
  REFERRAL_ADDRESS,
} from '../../constants'

// TODO add date picker for locking
// TODO add token as a path parameter
export default function CrossChainSwap() {
  const { account, library } = useWeb3React()
  const [tokenAddress, setSelectedToken] = useState<Token>()
  const [pairAddress, setPairAddress] = useState<string>()

  const [isEnoughBnbInPool, setIsEnoughBnbInPool] = useState(false)

  const [referralRewardAmount, setReferralRewardAmount] = useState<string>()
  const [referrerPercentage, setReferrerPercentage] = useState<string>()
  const [firstBuyPercentage, setFirstBuyPercentage] = useState<string>()

  const factoryContract = useFactoryContract()
  const lockerContract = useLockerContract(true)
  const lpContract = useTokenContract(pairAddress)
  const tokenContract = useTokenContract(tokenAddress?.address, true)

  useEffect(() => {
    async function fetchBnbBalance() {
      if (!pairAddress) return
      if (!tokenContract) return
      if (!library) return

      const bnbBalance = (await library.getBalance(pairAddress)) as BigNumber

      console.log(bnbBalance)

      setIsEnoughBnbInPool(bnbBalance.gte(ethers.utils.parseUnits(`${MINIMUM_BNB_FOR_ONBOARDING}`)))
    }

    fetchBnbBalance()
  }, [library, pairAddress, tokenContract])

  useEffect(() => {
    async function fetchPair() {
      if (!tokenAddress || !factoryContract) {
        setPairAddress(undefined)
        return
      }

      const fetchedPair = (await factoryContract.getPair(WETH[CHAIN_ID].address, tokenAddress.address)) as string

      if (fetchedPair === NULL_ADDRESS) {
        setPairAddress(undefined)
      } else {
        setPairAddress(fetchedPair)
      }
    }

    fetchPair()
  }, [tokenAddress, factoryContract])

  const handleTokenSelect = useCallback((inputCurrency) => {
    setSelectedToken(inputCurrency)
  }, [])

  const lockLiquidity = useCallback(() => {
    async function lock() {
      if (!lpContract) return
      if (!account) return
      if (!lockerContract) return

      const lpBalance = (await lpContract.balanceOf(account).then((o) => o.toString())) as string

      await lockerContract.lockTokens(lpContract.address, lpBalance, '1646997906', account, '2')
    }

    lock()
  }, [lpContract, account, lockerContract])

  const approveLiquidity = useCallback(() => {
    async function approve() {
      if (!lpContract) return
      if (!account) return
      if (!lockerContract) return

      await lpContract.approve(lockerContract.address, MAX_UINT256)
    }

    approve()
  }, [lpContract, account, lockerContract])

  const sendTokensToReferralContract = useCallback(() => {
    async function send() {
      if (!tokenContract) return
      if (!referralRewardAmount) return

      await tokenContract.transfer(REFERRAL_ADDRESS, ethers.utils.parseEther(referralRewardAmount))
    }

    send()
  }, [tokenContract, referralRewardAmount])

  const submit = useCallback(() => {
    async function submitToken() {
      if (!firstBuyPercentage) return
      if (!referrerPercentage) return
      if (!tokenContract) return

      await axios.post(ONBOARDING_API, {
        message: `
          ✅%0AToken: ${tokenContract?.address}.%0AReferrer Fee: ${referrerPercentage}.%0AFirst Buy Fee: ${firstBuyPercentage}`,
      })
    }

    submitToken()
  }, [firstBuyPercentage, referrerPercentage, tokenContract])

  return (
    <div className="main-content">
      <p className="paragraph">Select your token</p>
      <TokenDropdown
        onCurrencySelect={handleTokenSelect}
        selectedCurrency={tokenAddress}
        showETH={false}
        showOnlyUnknownTokens
      />
      <h3>Requirements:</h3>
      <p className="paragraph">
        1. Add liquidity on <b>BNB/{tokenAddress?.symbol ?? 'YOUR COIN'}</b>. Suggest minimum <b>75 BNB</b>. This will
        be used to pair with the native token
      </p>
      {tokenAddress ? (
        <>
          <Button as={Link} to={`/add/ETH/${tokenAddress?.address}`}>
            Add Liquidity
          </Button>
          <p className="paragraph">
            {!lpContract && <p className="paragraph">❌ Pair not found, please add liquidity first</p>}
            {!isEnoughBnbInPool && lpContract && <p className="paragraph">❌ Not enough liquidity, please add more</p>}
          </p>
        </>
      ) : (
        <></>
      )}
      <p className="paragraph">2. Lock your liquidity for 1 year</p>
      {tokenAddress ? (
        <>
          <Button disabled={!isEnoughBnbInPool || !lpContract} onClick={approveLiquidity}>
            Approve Liquidity
          </Button>
          &nbsp;
          <Button disabled={!isEnoughBnbInPool || !lpContract} onClick={lockLiquidity}>
            Lock Liquidity
          </Button>
        </>
      ) : (
        <></>
      )}
      <p className="paragraph">
        3. Send some of <b>{tokenAddress?.symbol ?? 'YOUR TOKEN'}</b> to the referral contract for referral rewards
        <br />
        (Up to you how much but each time you load it you can use as a bit of a PR stunt to the community - Note: these
        tokens are unrecoverable other than through referral scheme)
        {tokenAddress ? (
          <>
            <Input
              type="number"
              placeholder="Enter token amount"
              onChange={(o) => setReferralRewardAmount(o.target.value)}
              style={{ marginTop: '10px', marginBottom: '10px' }}
            />
            <Button onClick={sendTokensToReferralContract}>Transfer</Button>
          </>
        ) : (
          <></>
        )}
      </p>
      <p className="paragraph">
        4. Specify details
        <ul>
          <li>
            How much % do you want the referrers to earn?
            {tokenAddress ? (
              <Input
                type="number"
                placeholder="Referrer %"
                onChange={(o) => setReferrerPercentage(o.target.value)}
                style={{ marginTop: '10px', marginBottom: '10px' }}
              />
            ) : (
              <></>
            )}
          </li>
          <li>
            How much % do you want the referees to earn on their first buy?
            {tokenAddress ? (
              <Input
                type="number"
                placeholder="First buy referree %"
                onChange={(o) => setFirstBuyPercentage(o.target.value)}
                style={{ marginTop: '10px', marginBottom: '10px' }}
              />
            ) : (
              <></>
            )}
          </li>
        </ul>
      </p>
      <p className="paragraph">
        5. If your token has fees remove referral contract from them
        <br />
        <b>Referral contract - {REFERRAL_ADDRESS}</b>
      </p>
      {tokenAddress ? <Button onClick={submit}>Submit</Button> : <></>}

      <p className="paragraph">
        Once set up we will announce to our community that you are listed and that you are offering X referral scheme
        through our own referral link. Future actions, ⦁ Set up influencers as required. (Further explanation will be
        required after you have successfully launched on SummitSwap).
      </p>
    </div>
  )
}
