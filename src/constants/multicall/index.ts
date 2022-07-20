import { ChainId } from '@koda-finance/summitswap-sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B', // TODO
  [ChainId.BSCTESTNET]: `${process.env.REACT_APP_MULTI_CALL_TEST}`,
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
