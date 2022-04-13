import { ChainId, JSBI, Percent, Token, WETH } from '@koda-finance/summitswap-sdk'

export const MAX_QUERYING_BLOCK_AMOUNT = 5000;
export const NETWORK_URL = `${process.env.REACT_APP_NETWORK_URL}`
export const ROUTER_ADDRESS = `${process.env.REACT_APP_ROUTER_ADDRESS}`
export const LOCKER_ADDRESS = `${process.env.REACT_APP_LOCKER_ADDRESS}`
export const FACTORY_ADDRESS = `${process.env.REACT_APP_FACTORY_ADDRESS}`
export const INIT_CODE_HASH = `${process.env.REACT_APP_INIT_CODE_HASH}`
export const REFERRAL_ADDRESS = `${process.env.REACT_APP_REFERRAL_ADDRESS}`
export const REFERRAL_DEPLOYMENT_BLOCKNUMBER = +`${process.env.REACT_APP_REFERRAL_DEPLOYMENT_BLOCKNUMBER}`

export const ADDITIONAL_ROUTER_ADDRESSES: string[] = process.env.REACT_APP_ADDITIONAL_ROUTER_ADDRESS?.split(",") ?? []
export const ADDITIONAL_FACTORY_ADDRESSES: string[] = process.env.REACT_APP_ADDITIONAL_FACTORY_ADDRESS?.split(",") ?? []
export const ADDITIONAL_INIT_CODE_HASHES: string[] = process.env.REACT_APP_ADDITIONAL_INIT_CODE_HASH?.split(",") ?? []

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
export const SUMMITCHECK_API = `${process.env.REACT_APP_SUMMITCHECK_API}`
export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? '56')

export const ONBOARDING_API = `${process.env.REACT_APP_ONBOARDING_API}`

export const PANCAKESWAP_ROUTER_V2_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
export const WBNB_MAINNET_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

export const DEFAULT_SLIPPAGE_TOLERANCE = 0.8

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const KODA = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x8094e772fA4A60bdEb1DfEC56AB040e17DD608D5', 9, 'KODA', 'KODA Token', 100, true, 11.25, 11.23),
  [ChainId.BSCTESTNET]: new Token(ChainId.BSCTESTNET, '0x063646d9C4eCB1c341bECdEE162958f072C43561', 9, 'KODA', 'KODA Token', 100, true, 11.25, 11.23)
}[CHAIN_ID] as Token
export const DAI = new Token(ChainId.MAINNET, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 18, 'DAI', 'Dai Stablecoin')
export const BUSD = new Token(ChainId.MAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'Binance USD')
export const USDT = new Token(ChainId.MAINNET, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD')

export const UST = new Token(
  ChainId.MAINNET,
  '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
  18,
  'UST',
  'Wrapped UST Token'
  ) 

export const BUSDs = {
  [ChainId.MAINNET]: BUSD,
  [ChainId.BSCTESTNET]: new Token(ChainId.BSCTESTNET, '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7', 18, 'BUSD', 'Binance USD'),
}

export const KAPEX = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x11441AFb1D10E3Ce4E39666FC4F4A2A5d6d8C0Da', 18, 'KAPEX', 'KAPEX Token'),
  [ChainId.BSCTESTNET]: new Token(ChainId.BSCTESTNET, '0x4e35b5D0Fc6A410e7Dd09C02673b5110c1B1D5a5', 18, 'KAPEX', 'KAPEX Token'),
}[CHAIN_ID] as Token;

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.BSCTESTNET]: [WETH[ChainId.BSCTESTNET]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, BUSD, USDT, UST, KODA],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, BUSD, USDT],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, BUSD, USDT],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      KODA,
      new Token(ChainId.MAINNET, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB'),
    ],
    [BUSD, USDT],
    [DAI, USDT],
  ],
}

export const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org:443'

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 80
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH

