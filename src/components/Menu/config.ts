import { MenuEntry } from '@koda-finance/summitswap-uikit'

const config: MenuEntry[] = [
  // {
  //   label: "Home",
  //   icon: "HomeIcon",
  //   href: "/",
  // },
  {
    label: 'Trade',
    icon: 'TradeIcon',
    href: '/swap',
  },
  {
    label: 'Referral',
    icon: 'ReferralIcon',
    href: '/referral',
  },
  {
    label: 'Staking',
    icon: 'StakingIcon',
    href: '/staking/deposit',
  },
  {
    label: 'Cross-Chain',
    icon: 'RubicIcon',
    href: '/cross-chain-swap',
    showConnectButton: false,
  },
  {
    label: "Info",
    icon: "InfoIcon",
    href: "/info",
  },
  // {
  //  label: 'Create Token',
  //   icon: 'SunIcon',
  //   href: '/create-token',
  // },
  // {
  //   label: 'Pre-sale',
  //   icon: 'RubicIcon', // TODO:: will be changed after Ui-kit is updated
  //   href: '/presale',
  // },
  // {
  //   label: "Onboarding",
  //   icon: "OnboardingIcon",
  //   href: "/onboarding",
  // },
  // {
  //   label: "Pools",
  //   icon: "PoolsIcon",
  //   href: "/pools",
  // },
  // {
  //   label: "Prediction",
  //   icon: "PredictionIcon",
  //   href: "/prediction",
  // },
  // {
  //   label: "Lottery",
  //   icon: "LotteryIcon",
  //   href: "/lottery",
  // },
  // {
  //   label: "Collectibles",
  //   icon: "CollectiblesIcon",
  //   href: "/nft",
  // },
  // {
  //   label: "Trust Scores",
  //   icon: "TrustScoresIcon",
  //   href: "/nft",
  // },
  // {
  //   label: "Games",
  //   icon: "GamesIcon",
  //   href: "/nft",
  // },
  // {
  //   label: "Team Battle",
  //   icon: "TeamBattleIcon",
  //   href: "/nft",
  // },
  // {
  //   label: "Team & Profile",
  //   icon: "TeamProfileIcon",
  //   href: "/nft",
  // },
  // {
  //   label: "IFO",
  //   icon: "IFOIcon",
  //   href: "/nft",
  // },
  // {
  //   label: "More",
  //   icon: "MoreIcon",
  //   href: "/nft",
  // },
]

export default config
