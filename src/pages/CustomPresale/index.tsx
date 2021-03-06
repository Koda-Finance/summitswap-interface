/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useLocation } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { TranslateString } from 'utils/translateTextHelpers'
import { Button, useWalletModal, Box, ButtonMenu, ButtonMenuItem } from '@koda-finance/summitswap-uikit'
import login from 'utils/login'
import { useFactoryPresaleContract } from '../../hooks/useContract'
import { PRESALE_FACTORY_ADDRESS } from '../../constants/presale'
import PresalesList from './PresalesList'
import CreatePresaleForm from './CreatePresaleForm'
import Presale from './Presale'

export default function CustomPresale() {
  const { account, activate, deactivate } = useWeb3React()

  const [presaleAddress, setPresaleAddress] = useState('')
  const [presaleAddresses, setPresaleAddresses] = useState<string[]>([])
  const [buttonIndex, setButtonIndex] = useState(0)

  const factoryContract = useFactoryPresaleContract(PRESALE_FACTORY_ADDRESS)
  const location = useLocation()

  useEffect(() => {
    const presaleAddressUrl = new URLSearchParams(location.search).get('address')
    if (ethers.utils.isAddress(presaleAddressUrl || '') && presaleAddresses.includes(presaleAddressUrl || '')) {
      setPresaleAddress(presaleAddressUrl || '')
    } else {
      setPresaleAddress('')
    }
  }, [presaleAddress, location, presaleAddresses])

  useEffect(() => {
    async function fetchPresales() {
      setPresaleAddresses(await factoryContract?.getPresaleAddresses())
    }
    if (factoryContract) fetchPresales()
  }, [factoryContract, location])

  const handleLogin = useCallback(
    (connectorId: string) => {
      login(connectorId, activate)
    },
    [activate]
  )
  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)

  return presaleAddress ? (
    <>
      <Presale />
    </>
  ) : (
    <>
      <Box marginTop="30px">
        <ButtonMenu activeIndex={buttonIndex} onItemClick={(index) => setButtonIndex(index)}>
          <ButtonMenuItem>Create</ButtonMenuItem>
          <ButtonMenuItem>List </ButtonMenuItem>
        </ButtonMenu>
      </Box>
      {buttonIndex === 1 && <PresalesList setButtonIndex={setButtonIndex} />}
      {buttonIndex === 0 && (
        <>
          {account ? (
            <CreatePresaleForm setPresaleAddress={setPresaleAddress} />
          ) : (
            <Button m={40} style={{ fontFamily: 'Poppins' }} onClick={onPresentConnectModal}>
              {TranslateString(292, 'CONNECT WALLET')}
            </Button>
          )}
        </>
      )}
    </>
  )
}
