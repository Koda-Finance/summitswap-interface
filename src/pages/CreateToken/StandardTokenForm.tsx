import React, { useState, useEffect } from 'react'
import { useFormik, FormikProps } from 'formik'
import { ethers } from 'ethers'
import { Button, AutoRenewIcon, Text } from '@koda-finance/summitswap-uikit'
import CreateTokenForm from 'components/CreateTokenForm'
import { ColumnFlatCenter } from '../../components/Row'
import { TokenType, MAX_TOKEN_SUPPLY } from '../../constants/createToken'
import { useTokenCreatorContract } from '../../hooks/useContract'
import InputFormik, { StandardTokenValues } from '../../components/FormikInput'
import CreateTokenLoadingCard from './CreateTokenLoadingCard'
import AppBody from '../AppBody'
import { CreatedTokenDetails } from './types'

interface Props {
  setShowTokenDropdown: React.Dispatch<React.SetStateAction<boolean>>
  setCreatedTokenDetails: React.Dispatch<React.SetStateAction<CreatedTokenDetails | undefined>>
}

const StandardTokenForm = ({ setShowTokenDropdown, setCreatedTokenDetails }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  useEffect(() => {
    if (isFailed) {
      setTimeout(() => {
        setIsFailed(false)
      }, 4000)
    }
  }, [isFailed])

  const factory = useTokenCreatorContract(TokenType.Standard)

  const validate = (values: StandardTokenValues) => {
    const errors: StandardTokenValues = {}

    if (!values.name) {
      errors.name = 'Required*'
    }

    if (!values.symbol) {
      errors.symbol = 'Required*'
    }

    if (!values.supply) {
      errors.supply = 'Required*'
    } else if (!Number.isInteger(values.supply)) {
      errors.supply = 'Total supply should be an interger'
    } else if (Number(values.supply) < 0) {
      errors.supply = 'Total supply should greater than 0'
    } else if (BigInt(values.supply) > BigInt(MAX_TOKEN_SUPPLY)) {
      errors.supply = 'Invalid Total Supply.'
    }

    if (!values.decimals) {
      errors.decimals = 'Required*'
    } else if (!Number.isInteger(values.decimals)) {
      errors.decimals = 'Decimals should be an interger.'
    } else if (Number(values.decimals) < 2) {
      errors.decimals = 'Decimals must be greater than or equal to 2.'
    } else if (Number(values.decimals) > 64) {
      errors.decimals = 'Decimals cant be greater than 64.'
    }

    return errors
  }

  const formik: FormikProps<StandardTokenValues> = useFormik({
    initialValues: {
      name: '',
      symbol: '',
      supply: '',
      decimals: '',
    } as StandardTokenValues,
    onSubmit: async (values) => {
      try {
        setShowTokenDropdown(false)
        setIsLoading(true)
        if (!factory) {
          return
        }
        const tx = await factory.createStandardToken(
          values.name,
          values.symbol,
          values.decimals,
          ethers.utils.parseUnits(String(values.supply), String(values.decimals)),
          { value: await factory.createTokenFee() }
        )
        await tx.wait()
        const tokenAddress: string = await factory.customStandardTokens(
          (await factory.customStandardTokensMade()).sub(1)
        )
        setCreatedTokenDetails({
          address: tokenAddress,
          name: values.name || '',
          supply: values.supply || '',
          symbol: values.symbol || '',
          transactionAddress: tx.hash,
        })
        setIsLoading(false)
      } catch (e) {
        setShowTokenDropdown(true)
        setIsFailed(true)
        setIsLoading(false)
        console.error(e)
      }
    },
    validate,
  })

  return (
    <>
      {!isLoading && (
        <CreateTokenForm onSubmit={formik.handleSubmit}>
          <AppBody>
            <InputFormik
              formik={formik}
              label="Name"
              message="Name of Your Token"
              inputAttributes={{ name: 'name', placeholder: 'Ex: Ethereum', type: 'text' }}
            />
            <InputFormik
              formik={formik}
              label="Symbol"
              message="Symbol of Your Token"
              inputAttributes={{ name: 'symbol', placeholder: 'Ex: ETH', type: 'text' }}
            />
            <InputFormik
              formik={formik}
              label="Decimals"
              message="Token Decimals"
              inputAttributes={{ name: 'decimals', placeholder: 'Ex: 18', type: 'number' }}
            />
            <InputFormik
              formik={formik}
              label="Total Supply"
              message="Total Token Supply"
              inputAttributes={{ name: 'supply', placeholder: 'Ex: 1000000', type: 'number' }}
            />
            {isFailed && (
              <Text mt={2} color="failure" fontWeight="600" textAlign="center">
                Token Creation Failed.
              </Text>
            )}
            <ColumnFlatCenter>
              <Button
                width={220}
                m={30}
                type="submit"
                disabled={isLoading || isFailed || !formik.isValid || !formik.touched.name}
                endIcon={isLoading && <AutoRenewIcon spin color="currentColor" />}
              >
                Create Token
              </Button>
            </ColumnFlatCenter>
          </AppBody>
        </CreateTokenForm>
      )}
      {isLoading && <CreateTokenLoadingCard />}
    </>
  )
}

export default StandardTokenForm
