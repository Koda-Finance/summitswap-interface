import { Contract } from '@ethersproject/contracts'
import { ChainId, FACTORY_ADDRESS, WETH } from '@koda-finance/summitswap-sdk'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { useMemo } from 'react'
import { STAKING_ADDRESS } from 'constants/staking'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { 
  LOCKER_ADDRESS,
  REFERRAL_ADDRESS,
  TOKEN_CREATOR_ADDRESS
} from '../constants'
import CREATE_STANDARD_TOKEN_ABI from '../constants/abis/createStandardToken.json';
import CREATE_LIQUIDITY_TOKEN_ABI from '../constants/abis/createLiquidityToken.json';
import CREATE_BABY_TOKEN_ABI from '../constants/abis/createBabyToken.json';
import CREATE_BUYBACK_TOKEN_ABI from '../constants/abis/createBuybackToken.json';
import ERC20_ABI from '../constants/abis/erc20.json'
import WETH_ABI from '../constants/abis/weth.json'
import REFERRAL_ABI from '../constants/abis/summitReferral.json'
import FACTORY_ABI from '../constants/abis/summitswapFactory.json'
import LOCKER_ABI from '../constants/abis/summitswaLocker.json'
import STAKING_ABI from '../constants/abis/kodaStaking.json'
import ROUTER_ABI from '../constants/abis/summitswap-router.json'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useStakingContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(STAKING_ADDRESS, STAKING_ABI, withSignerIfPossible)
}

export function useReferralContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(REFERRAL_ADDRESS, REFERRAL_ABI, withSignerIfPossible)
}

export function useFactoryContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(FACTORY_ADDRESS, FACTORY_ABI, withSignerIfPossible)
}

export function useLockerContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(LOCKER_ADDRESS, LOCKER_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.BSCTESTNET:
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useRouterContract(routerAddress: string): Contract | null {
  return useContract(routerAddress, ROUTER_ABI)
}

export function useTokenCreatorContract(tokenType: 'STANDARD' | 'LIQUIDITY' | 'BABY' | 'BUYBACK'): Contract | null {
  let createTokenAbi
  switch(tokenType) {
    case 'STANDARD':
      createTokenAbi = CREATE_STANDARD_TOKEN_ABI
      break
    case 'LIQUIDITY':
      createTokenAbi = CREATE_LIQUIDITY_TOKEN_ABI
      break
    case 'BABY':
      createTokenAbi = CREATE_BABY_TOKEN_ABI
      break
    case 'BUYBACK':
      createTokenAbi = CREATE_BUYBACK_TOKEN_ABI
      break
  }
  return useContract(TOKEN_CREATOR_ADDRESS[tokenType], createTokenAbi)
}