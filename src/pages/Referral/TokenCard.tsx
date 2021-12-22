import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, Text, Button } from '@summitswap-uikit'
import { useTokenContract, useReferralContract } from 'hooks/useContract'
import web3 from 'web3'
import { useWeb3React } from '@web3-react/core'

import { REF_CONT_ADDRESS } from '../../constants'

interface Props {
    addr: string;
    isProcessing: boolean;
    setProcessing: any;
}

const StyledContainer = styled(Box)`
    padding: 16px;
    background: ${({ theme }) => theme.colors.menuItemBackground};
    display: flex;
    justify-content: space-between;
    align-items: center;
    >div:first-of-type {
        font-size: 20px;
    }
`

const TokenCard: React.FC<Props> = ({ addr, isProcessing, setProcessing }) => {
    const { account } = useWeb3React()
    const [balance, setBalance] = useState(0.0)
    const [tokenSymbol, setTokenSymbol] = useState('')

    const tokenContract = useTokenContract(addr, true)
    const refContract = useReferralContract(REF_CONT_ADDRESS)

    useEffect(() => {
        const handleGetBasicInfo = async () => {
            const testTokenSymbol = await tokenContract?.symbol()
            const testBalance = await refContract?.rewardBalance(account, addr)
            setTokenSymbol(testTokenSymbol)
            setBalance(parseFloat(web3.utils.fromWei(web3.utils.hexToNumberString(testBalance._hex))))
        }
        handleGetBasicInfo()
    }, [tokenContract, refContract, addr, account])

    const handleClaim = async () => {
        try {
            setProcessing(true)
            await refContract?.claimReward(addr)
            setTimeout(async () => {
                try {
                    const testBalance = await refContract?.rewardBalance(account, addr)
                    setBalance(parseFloat(web3.utils.fromWei(web3.utils.hexToNumberString(testBalance._hex))))
                    setProcessing(false)
                }
                catch {
                    setProcessing(false)
                }
            }, 20000)
        }
        catch {
            setProcessing(false)
        }
    }
    return (
        <>
            {balance !== 0 &&
                <StyledContainer>
                    <Text>{balance.toFixed(5)} {tokenSymbol}</Text>
                    <Button onClick={handleClaim} disabled={isProcessing || balance === 0}>
                        CLAIM
                    </Button>
                </StyledContainer>
            }
        </>
    )
}

export default TokenCard