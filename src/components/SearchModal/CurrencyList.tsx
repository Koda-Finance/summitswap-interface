import { Currency, CurrencyAmount, currencyEquals, ETHER, Token } from '@koda-finance/summitswap-sdk'
import React, { CSSProperties, MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'
import { VariableSizeList } from 'react-window'
import styled from 'styled-components'
import { Flex, Text } from '@koda-finance/summitswap-uikit'
import { useActiveWeb3React } from '../../hooks'
import { useSelectedTokenList, WrappedTokenInfo } from '../../state/lists/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from '../../state/user/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { LinkStyledButton } from '../Shared'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import Column from '../Column'
import { RowFixed } from '../Row'
import CurrencyLogo from '../CurrencyLogo'
import { MouseoverTooltip } from '../Tooltip'
import { FadedSpan, MenuItem } from './styleds'
import Loader from '../Loader'
import { isTokenOnList } from '../../utils'

function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === ETHER ? 'ETHER' : ''
}
const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const LogoContainer = styled.div`
  position: relative;
  flex-shrink: 0;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background: white;
  > img,
  > svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
  }
`

function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const { tags } = currency
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  isAddedByUserOn,
  currencyRef,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  isAddedByUserOn: boolean
  currencyRef: any
}) {
  const { account, chainId } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useSelectedTokenList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <Flex justifyContent="space-between" width="100%" ref={currencyRef}>
        <LogoContainer>
          <CurrencyLogo currency={currency} size="24px" />
        </LogoContainer>
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <Column style={{ marginLeft: 16 }}>
            <Text title={currency.name} color="sidebarColor" fontSize="16px" fontWeight="600">
              {currency.symbol}
            </Text>
            <FadedSpan>
              {isAddedByUserOn && !isOnSelectedList && customAdded && !(currency instanceof WrappedTokenInfo) ? (
                <Text>
                  Added by user&nbsp;
                  <LinkStyledButton
                    style={{ padding: 0 }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (chainId && currency instanceof Token) removeToken(chainId, currency.address)
                    }}
                  >
                    (Remove)
                  </LinkStyledButton>
                </Text>
              ) : null}
              {isAddedByUserOn && !isOnSelectedList && !customAdded && !(currency instanceof WrappedTokenInfo) ? (
                <Text>
                  Found by address&nbsp;
                  <LinkStyledButton
                    style={{ padding: 0 }}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (currency instanceof Token) addToken(currency)
                    }}
                  >
                    (Add)
                  </LinkStyledButton>
                </Text>
              ) : null}
            </FadedSpan>
          </Column>
          <TokenTags currency={currency} />
          <RowFixed style={{ justifySelf: 'flex-end', marginRight: 8 }}>
            {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
          </RowFixed>
        </Flex>
      </Flex>
    </MenuItem>
  )
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  variableListRef,
  showETH,
  isAddedByUserOn,
}: {
  height: number
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  variableListRef?: MutableRefObject<VariableSizeList | undefined>
  showETH: boolean
  isAddedByUserOn: boolean
}) {
  const rowHeights = useRef({})
  const itemData = useMemo(() => (showETH ? [Currency.ETHER, ...currencies] : [...currencies]), [currencies, showETH])
  const setRowHeight = (index, size: any) => {
    variableListRef?.current?.resetAfterIndex(0)
    rowHeights.current = { ...rowHeights.current, [index]: size }
  }
  function Row({ data, index, style }) {
    const rowRef = useRef({}) as any

    const currency: Currency = data[index]
    const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
    const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
    const handleSelect = () => onCurrencySelect(currency)

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef?.current?.clientHeight)
      }
      // eslint-disable-next-line
    }, [rowRef])

    return (
      <CurrencyRow
        style={style}
        currency={currency}
        isSelected={isSelected}
        onSelect={handleSelect}
        otherSelected={otherSelected}
        isAddedByUserOn={isAddedByUserOn}
        currencyRef={rowRef as any}
      />
    )
  }

  const getRowHeight = (index: number): number => {
    return rowHeights.current[index] + 16 || 56
  }

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <VariableSizeList
      height={height}
      ref={variableListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={getRowHeight}
      itemKey={itemKey}
    >
      {Row}
    </VariableSizeList>
  )
}
