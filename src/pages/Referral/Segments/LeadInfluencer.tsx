import React, { useEffect, useState } from 'react'
import { Text, Box, Button, Flex } from '@koda-finance/summitswap-uikit'
import { Contract, Event, ethers } from 'ethers'
import { useFormik } from 'formik'
import { useWeb3React } from '@web3-react/core'
import { AddressZero } from '@ethersproject/constants'

import { useReferralContract } from 'hooks/useContract';
import { isAddress } from 'utils'
import checkIfUint256 from 'utils/checkUint256'
import useReferralHistories from 'hooks/useReferralHistories'
import { PaginatedRewards, ReferralReward } from '../types'
import { StyledWhiteBr } from '../StyledBr';
import StyledInput from '../StyledInput'
import { REFERRAL_DEPLOYMENT_BLOCKNUMBER, MAX_QUERYING_BLOCK_AMOUNT } from '../../../constants'
import LeadHistory from './LeadHistory'
import { SegmentsProps } from './SegmentsProps'
import { CenterSign } from '../CenterDiv'
import { isdecimals, isPercentage } from '../utility'

interface SetSubInfluencerSegmentProps extends SegmentsProps {
  contract: Contract | null
}

const getRewardsPaginated = (rewards: ReferralReward[]) => {
  const pagination: PaginatedRewards = {}
  return rewards.reduce((acc, reward) => {
    const input = acc[reward.referrer]
    if (input) {
      acc[reward.referrer].push(reward)
    } else {
      acc[reward.referrer] = []
    }
    return acc
  }, pagination)
}

const SetSubInfluencerSegment: React.FC<SetSubInfluencerSegmentProps> = ({
  contract,
  outputToken,
  openModel,
  transactionSubmitted,
  transactionFailed
}) => {

  interface FormInputs {
    subWalletAdress?: string
    leadFee?: string
    refFee?: string
  }

  const validateInputs = (inputs: FormInputs) => {
    if (!isAddress(inputs.subWalletAdress)) {
      transactionFailed('Sub influencers wallet adresses is not valid!')
      return false
    }

    const _leadFee = Number(inputs.leadFee)
    const _refFee = Number(inputs.refFee)
    if (!inputs.leadFee || !isdecimals(_leadFee) || !isPercentage(_leadFee)) {
      transactionFailed('Lead influencers fee is not a valid value!')
      return false
    }

    if (!inputs.refFee || !isdecimals(_refFee) || !isPercentage(_refFee)) {
      transactionFailed('Sub influencers fee is not a valid value!')
      return false
    }

    return true
  }

  const formik = useFormik<FormInputs>({
    initialValues: {
      subWalletAdress: undefined,
      leadFee: undefined,
      refFee: undefined,
    },
    onSubmit: async (values) => {
      if (!contract) return
      if (!outputToken) return

      openModel('Set Sub Influencer')

      if (!validateInputs(values)) return

      try {
        const transaction = await contract.setSubInfluencer(
          outputToken.address,
          values.subWalletAdress,
          ethers.utils.parseUnits(values.leadFee?.toString() || '0', 7),
          ethers.utils.parseUnits(values.refFee?.toString() || '0', 7)
        )
        transactionSubmitted(transaction, 'Sub influencer set successfully')
      } catch (err){
        const callError = err as any
        const callErrorMessage = callError.reason ?? callError.data?.message ?? callError.message
        transactionFailed(callErrorMessage)
      }
  }})

  return <>
    <Text bold>
      Set Sub Influencer
    </Text>
    <StyledWhiteBr />
    <form onSubmit={formik.handleSubmit}>
      <Text mb="4px" small>
        Sub influencer wallet address
      </Text>
      <StyledInput name="subWalletAdress" type="text" onChange={formik.handleChange} value={formik.values.subWalletAdress} autoComplete="off" placeholder={AddressZero}/>
      <Text mb="4px" small>
        Lead influencer fee
      </Text>
      <Flex>
        <StyledInput name="leadFee" type="number" onChange={formik.handleChange} value={formik.values.leadFee} min="0" max="100" placeholder="0" step={0.01} />
        <CenterSign>
          <Text bold>%</Text>
        </CenterSign>
      </Flex>
      <Text mb="4px" small>
        Sub influencer fee
      </Text>
      <Flex>
        <StyledInput name="refFee" type="number" onChange={formik.handleChange} value={formik.values.refFee} min="0" max="100" placeholder="0" step={0.01} />
        <CenterSign>
          <Text bold>%</Text>
        </CenterSign>
      </Flex>
      <Box style={{marginTop: '12px'}}>
        <Button type="submit">Submit</Button>
      </Box>
    </form>
  </>
}


const LeadInfluencer: React.FC<SegmentsProps> = ({
  outputToken,
  openModel,
  transactionSubmitted,
  transactionFailed,
  onDismiss
}) => {
  const refContract = useReferralContract(true)
  const [subReward, setSubReward] = useState<PaginatedRewards>({})
  const { account } = useWeb3React()
  const [page, setPage] = useState(1)
  const referralHistories = useReferralHistories(account, outputToken?.address, null, page)
  const [selectedAddress, setSelectedAddress] = useState('')

  useEffect(() => {
    const rewards = getRewardsPaginated(referralHistories as ReferralReward[])
    const subAdresses = Object.keys(rewards)
    const firstAddress = subAdresses.length ? subAdresses[0] : ''

    setSelectedAddress(firstAddress)
    setSubReward(rewards)
    if (referralHistories.length > 0) {
      setPage(prevPage => prevPage + 1)
    }
  }, [referralHistories, referralHistories.length])

  const modelFunctions = {
    openModel,
    transactionSubmitted,
    transactionFailed,
    onDismiss
  }

  return <>
    <SetSubInfluencerSegment
      contract={refContract}
      outputToken={outputToken} {...modelFunctions}/>
    <LeadHistory
      paginatedRewards={subReward}
      selectedAddress={selectedAddress}
      setSelectedAddress={setSelectedAddress}
      outputToken={outputToken} />
  </>
}


export default LeadInfluencer
