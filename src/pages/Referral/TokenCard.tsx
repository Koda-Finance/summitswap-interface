import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, Text, Button } from '@koda-finance/summitswap-uikit'
import { useTokenContract, useReferralContract } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import CurrencyLogo from 'components/CurrencyLogo'
import { Token, WETH } from '@koda-finance/summitswap-sdk'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { useToken } from 'hooks/Tokens'
import { REFERRAL_ADDRESS, BUSDs, CHAIN_ID, KAPEXs, NULL_ADDRESS, BNB_COINGECKO_ID } from '../../constants'
import { useClaimingFeeModal } from './useClaimingFeeModal'

interface Props {
  tokenAddress: string
  hasClaimedAll: boolean
  isLoading: boolean
  selectedToken?: Token
  tokenPrices: null | {
    [geckoId: string]: {
      [price: string]: number
    }
  }
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setCanClaimAll: React.Dispatch<React.SetStateAction<boolean>>
}

const CurrencyLogoWrapper = styled(Box)`
  color: ${({ theme }) => theme.colors.invertedContrast};
  border-radius: 5px;
  padding: 3px;
  display: inline-flex;
  align-items: center;
  background: ${({ theme }) => `${theme.colors.sidebarBackground}99`};
`

const StyledContainer = styled(Box)`
  padding: 16px;
  background: ${({ theme }) => theme.colors.menuItemBackground};
  display: flex;
  border-radius: 20px;
  justify-content: space-between;
  align-items: center;
  > div:first-of-type {
    font-size: 20px;
  }
`

const ClaimWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: right;
  gap: 10px;
  align-items: center;
`

const TokenCard: React.FC<Props> = ({ tokenAddress, selectedToken, tokenPrices, hasClaimedAll, isLoading, setIsLoading, setCanClaimAll }) => {
  const { account } = useWeb3React()

  const [balance, setBalance] = useState<BigNumber | undefined>(undefined)
  const [tokenSymbol, setTokenSymbol] = useState<string>('')
  const [isTokenPriceValid, setIsTokenPriceValid] = useState<boolean>(true);
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [hasReferralEnough, setHasReferralEnough] = useState(true)
  const [claimed, setClaimed] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [claimToken, setClaimToken] = useState<Token | undefined>()
  const [claimableTokens, setClaimableTokens] = useState<Token[]>([])
  const [rewardTokenAddress, setRewardTokenAddress] = useState<string>()

  const outputToken = useToken(tokenAddress)
  const rewardToken = useToken(rewardTokenAddress)
  const tokenContract = useTokenContract(tokenAddress, true)
  const refContract = useReferralContract(true)

  useEffect(() => {
    if (!outputToken) return
    if (!rewardToken) return

    const tokenList: Token[] = [BUSDs[CHAIN_ID], KAPEXs[CHAIN_ID], outputToken, rewardToken].filter(o => !!o && o !== NULL_ADDRESS);
    const uniqueTokenAddresses = [...new Set(tokenList.map((o) => o.address))]
    const uniqueTokenList = uniqueTokenAddresses.map((o) => tokenList.find((oo) => oo.address === o)) as Token[]

    setClaimableTokens(uniqueTokenList)
  }, [outputToken, rewardToken])

  useEffect(() => {
    if (!outputToken) return

    setClaimToken(outputToken)
  }, [outputToken])

  useEffect(() => {
    async function fetchRewardToken() {
      if (!refContract) return
      if (!tokenAddress) return

      const feeInfo = await refContract.feeInfo(tokenAddress)

      setRewardTokenAddress(feeInfo.tokenR)
    }

    fetchRewardToken()
  }, [tokenAddress, refContract])
  useEffect(() => {
    const handleGetBasicInfo = async () => {
      if (!tokenContract) return
      if (!refContract) return

      const newBalance = (await refContract.balances(tokenAddress, account)) as BigNumber
      const referralAddressBalance = await tokenContract.balanceOf(REFERRAL_ADDRESS)
      const hasReferralEnoughBalance = referralAddressBalance.gte(newBalance)

      setTokenSymbol(await tokenContract.symbol())
      setTokenDecimals(await tokenContract.decimals())
      setBalance(newBalance)
      setHasReferralEnough(hasReferralEnoughBalance)

      if (!hasReferralEnoughBalance) {
        setCanClaimAll(false)
      }

      setIsLoading(false)
    }

    handleGetBasicInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenContract, refContract, tokenAddress, account, setIsLoading, setCanClaimAll, selectedToken])

  useEffect(() => {
    const handleSetIsTokenPriceValid = async () => {
      setIsTokenPriceValid(await isClaimTokenPriceHigherThanGasFee())
    }

    handleSetIsTokenPriceValid()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, refContract, claimToken, balance, selectedToken, tokenDecimals, tokenPrices?.length])

  async function isClaimTokenPriceHigherThanGasFee(): Promise<boolean> {
    if (!account) return false
    if (!refContract) return false
    if (!claimToken) return false
    if (!balance || !tokenDecimals) return false
    if (!selectedToken || !tokenPrices) return true

    try {
      const estimatedGasInBNB = await refContract.estimateGas
        .claimRewardIn(tokenAddress, claimToken.address ?? WETH[CHAIN_ID].address)
      
      const estimatedGas = ethers.utils.formatUnits(estimatedGasInBNB.mul(2), tokenDecimals)
      const estimatedGasInUsd = Number(estimatedGas) * (tokenPrices[BNB_COINGECKO_ID]?.usd ?? 0)

      const tokenPriceInUsd = selectedToken.coingeckoId ? tokenPrices[selectedToken.coingeckoId]?.usd ?? 0 : 0
      const tokenPrice = ethers.utils.formatUnits(balance, tokenDecimals)
      const totalTokenPriceInUsd = Number(tokenPrice) * tokenPriceInUsd

      return totalTokenPriceInUsd >= estimatedGasInUsd
    
    } catch (err) {
      console.log("Error: ", err)
      return false
    }
  }

  async function claim() {
    if (!tokenContract) return
    if (!refContract) return
    if (!claimToken) return

    closeClaimingFeeModal();
    setIsLoading(true)

    if (!(await isClaimTokenPriceHigherThanGasFee())) {
      setIsTokenPriceValid(false);
      return;
    }

    try {
      await refContract.claimRewardIn(tokenAddress, claimToken.address ?? WETH[CHAIN_ID].address)
      setClaimed(true)
    } catch (err) {
      const newBalance = (await refContract.balances(tokenAddress, account)) as BigNumber
      const referralAddressBalance = await tokenContract.balanceOf(REFERRAL_ADDRESS)

      setBalance(newBalance)
      setHasReferralEnough(referralAddressBalance.gte(newBalance))
    }

    setIsLoading(false)
  }

  const [openClaimingFeeModal, closeClaimingFeeModal] = useClaimingFeeModal({
    symbol: claimToken?.symbol as string,
    onConfirm: claim,
  })

  const handleClaim = async () => {
    if (!claimToken) return

    if (claimToken.address === BUSDs[CHAIN_ID].address || claimToken.address === undefined) {
      openClaimingFeeModal()
    } else {
      await claim()
    }
  }

  const handleTokenSelect = useCallback((inputCurrency) => {
    setClaimToken(inputCurrency)
  }, [])

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      {tokenSymbol && balance && !claimed && !hasClaimedAll && (
        <>
          <StyledContainer>
            <Text>
              {tokenSymbol} {ethers.utils.formatUnits(balance, outputToken?.decimals)}
            </Text>

            <ClaimWrapper>
              <Button onClick={handleClaim} disabled={isLoading || !hasReferralEnough || !isTokenPriceValid || claimed || hasClaimedAll}>
                CLAIM IN&nbsp;
                <CurrencyLogoWrapper
                  onClick={(e) => {
                    if (isLoading || !hasReferralEnough || !isTokenPriceValid || claimed || hasClaimedAll) return

                    setModalOpen(true)
                    e.stopPropagation()
                  }}
                >
                  <CurrencyLogo currency={claimToken} size="24px" />
                  &nbsp;{claimToken?.symbol}
                </CurrencyLogoWrapper>
              </Button>
            </ClaimWrapper>
          </StyledContainer>

          {!hasReferralEnough ? (
            <Text color="primary" fontSize="14px">
              Doesn&apos;t have enough reward tokens in pool, please contact the project owners
            </Text>
          ) : !isTokenPriceValid ? (
            <Text color="primary" fontSize="14px">
              Claim token price must at least double the estimated gas fee.
            </Text>
          ) : ""}
        </>
      )}
      <CurrencySearchModal
        isOpen={modalOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={handleTokenSelect}
        selectedCurrency={claimToken}
        otherSelectedCurrency={null}
        tokens={claimableTokens}
        isAddedByUserOn={false}
        showUnknownTokens={false}
        showETH
      />
    </>
  )
}

export default TokenCard
