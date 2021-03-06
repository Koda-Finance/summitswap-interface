import React, { useState } from 'react'
import { Button, Text } from '@koda-finance/summitswap-uikit'
import styled from 'styled-components'
import copyText from 'utils/copyText'
import Tooltip from 'components/Tooltip'
import { BSC_SCAN } from 'constants/createToken'
import { AutoRow, RowFlatCenter } from '../../components/Row'
import { CreatedTokenDetails } from './types'

export const TokenCard = styled.div`
  margin-top: 30px;
  background: #011724;
  border-radius: 20px;
  padding: 25px 28px;
  width: 90%;
  max-width: 1200px;
`

const TextTokenHeading = styled(Text)`
  font-weight: 700;
  font-size: 23px;
  font-weight: 700;
  line-height: 45px;
  width: 230px;
  min-width: 230px;
  @media (max-width: 550px) {
    font-size: 16px;
    width: 160px;
    min-width: 160px;
  }
  @media (max-width: 380px) {
    font-size: 11px;
    width: 100px;
    min-width: 100px;
  }
`
const TextTokenValue = styled(Text)`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 700;
  font-size: 21px;
  line-height: 36px;
  color: #00d5a5;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (max-width: 550px) {
    font-size: 15px;
  }
  @media (max-width: 380px) {
    font-size: 10px;
  }
`

const Row = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
`

interface Props {
  tokenDetails: CreatedTokenDetails
  setCreatedTokenDetails: React.Dispatch<React.SetStateAction<CreatedTokenDetails | undefined>>
}

const TokenDetails = ({ tokenDetails, setCreatedTokenDetails }: Props) => {
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)

  const displayTooltip = () => {
    setIsTooltipDisplayed(true)
    setTimeout(() => {
      setIsTooltipDisplayed(false)
    }, 1000)
  }
  return (
    <>
      <RowFlatCenter>
        <Text textAlign="center" mt={40} marginX={2} fontSize="35px" fontWeight={700} fontFamily="Poppins">
          Your token has been created!
        </Text>
      </RowFlatCenter>
      <TokenCard>
        <Row>
          <TextTokenHeading>Name:</TextTokenHeading>
          <TextTokenValue>{tokenDetails.name}</TextTokenValue>
        </Row>
        <Row>
          <TextTokenHeading>Symbol:</TextTokenHeading>
          <TextTokenValue>{tokenDetails.symbol}</TextTokenValue>
        </Row>
        <Row>
          <TextTokenHeading>Total Supply:</TextTokenHeading>
          <TextTokenValue>{tokenDetails.supply}</TextTokenValue>
        </Row>
        <Row>
          <TextTokenHeading>Token Address:</TextTokenHeading>
          <TextTokenValue>{tokenDetails.address}</TextTokenValue>
        </Row>
        <AutoRow justifyContent="space-evenly">
          <a href={`${BSC_SCAN}/tx/${tokenDetails.transactionAddress}`} rel="noreferrer" target="_blank">
            <Button scale="sm" mb={20} marginX="5px" style={{ minWidth: '200px', fontFamily: 'Poppins' }}>
              View Transaction
            </Button>
          </a>
          <Tooltip placement="top" text="Address Copied" show={isTooltipDisplayed}>
            <Button
              disabled={isTooltipDisplayed}
              marginX="5px"
              scale="sm"
              mb={20}
              style={{ minWidth: '200px', fontFamily: 'Poppins' }}
              onClick={() => copyText(tokenDetails.address, displayTooltip)}
            >
              Copy Address
            </Button>
          </Tooltip>
          <Button
            mb={20}
            marginX="5px"
            scale="sm"
            style={{ minWidth: '200px', fontFamily: 'Poppins' }}
            onClick={() => setCreatedTokenDetails(undefined)}
          >
            Home
          </Button>
        </AutoRow>
      </TokenCard>
    </>
  )
}

export default TokenDetails
