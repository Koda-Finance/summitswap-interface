import React, { useRef, useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Text, Input, Flex, Skeleton, useMatchBreakpoints } from '@koda-finance/summitswap-uikit'
import useFetchSearchResults from 'state/info/queries/search'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/CurrencyLogoByAddress'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useTranslation } from 'react-i18next'
import useDebounce from 'hooks/useDebounce'
import { MINIMUM_SEARCH_CHARACTERS } from 'constants/info'
import { PoolData } from 'state/info/types'
import { useHistory } from 'react-router-dom'

const Container = styled.div`
  position: relative;
  z-index: 30;
  width: 100%;
`

const StyledInput = styled(Input)`
  z-index: 9999;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`

const Menu = styled.div<{ hide: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  flex-direction: column;
  z-index: 9999;
  width: 100%;
  top: 50px;
  max-height: 400px;
  overflow: auto;
  right: 0;
  padding: 1.5rem;
  padding-bottom: 2.5rem;
  position: absolute;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.primary};
  margin-top: 4px;
  ${({ theme }) => theme.mediaQueries.sm} {
    margin-top: 0;
    width: 500px;
    max-height: 600px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: 0;
    width: 800px;
    max-height: 600px;
  }
`

const Blackout = styled.div`
  position: absolute;
  min-height: 100%;
  width: 100vw;
  z-index: 10;
  background-color: black;
  opacity: 0.7;
  left: 0;
  top: 0;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr;
  margin: 8px 0;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: 1.5fr repeat(3, 1fr);
  }
`

const Break = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  margin: 16px 0;
`

const HoverText = styled.div<{ hide: boolean }>`
  color: ${({ theme }) => theme.colors.secondary};
  display: ${({ hide }) => (hide ? 'none' : 'block')};
  margin-top: 16px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const HoverRowLink = styled.div`
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const OptionButton = styled.div<{ enabled: boolean }>`
  width: fit-content;
  padding: 4px 8px;
  border-radius: 8px;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  margin-right: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, enabled }) => (enabled ? theme.colors.primary : 'transparent')};
  color: ${({ theme, enabled }) => (enabled ? theme.card.background : theme.colors.secondary)};
  :hover {
    opacity: 0.6;
    cursor: pointer;
  }
`

const Search = () => {
  const history = useHistory()
  const { isXs, isSm } = useMatchBreakpoints()
  const { t } = useTranslation()

  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const showMoreRef = useRef<HTMLDivElement>(null)

  const [showMenu, setShowMenu] = useState(false)
  const [value, setValue] = useState('')
  const debouncedSearchTerm = useDebounce(value, 600)

  const { tokens, pools, tokensLoading, poolsLoading, error } = useFetchSearchResults(debouncedSearchTerm)

  const [tokensShown, setTokensShown] = useState(3)
  const [poolsShown, setPoolsShown] = useState(3)

  useEffect(() => {
    setTokensShown(3)
    setPoolsShown(3)
  }, [debouncedSearchTerm])

  const handleOutsideClick = (e: any) => {
    const menuClick = menuRef.current && menuRef.current.contains(e.target)
    const inputCLick = inputRef.current && inputRef.current.contains(e.target)
    const showMoreClick = showMoreRef.current && showMoreRef.current.contains(e.target)

    if (!menuClick && !inputCLick && !showMoreClick) {
      setPoolsShown(3)
      setTokensShown(3)
      setShowMenu(false)
    }
  }

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('click', handleOutsideClick)
      document.querySelector('body')!.style.overflow = 'hidden'
    } else {
      document.removeEventListener('click', handleOutsideClick)
      document.querySelector('body')!.style.overflow = 'visible'
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [showMenu])

  const handleItemClick = (to: string) => {
    setShowMenu(false)
    setPoolsShown(3)
    setTokensShown(3)
    history.push(to)
  }

  // filter on view
  const tokensForList = useMemo(() => {
    return tokens.sort((t0, t1) => ((t0?.volumeUSD ?? 0) > (t1?.volumeUSD ?? 0) ? -1 : 1))
  }, [tokens])

  const poolForList = useMemo(() => {
    return pools.sort((p0, p1) => ((p0?.volumeUSD ?? 0) > (p1?.volumeUSD ?? 0) ? -1 : 1))
  }, [pools])

  const contentUnderTokenList = () => {
    const isLoading = tokensLoading
    const noTokensFound =
      tokensForList.length === 0 && !isLoading && debouncedSearchTerm.length >= MINIMUM_SEARCH_CHARACTERS
    return (
      <>
        {isLoading && <Skeleton />}
        {noTokensFound && <Text>{t('No results')}</Text>}
        {debouncedSearchTerm.length < MINIMUM_SEARCH_CHARACTERS && (
          <Text>{t('Search pools or tokens')}</Text>
        )}
      </>
    )
  }

  const contentUnderPoolList = () => {
    const isLoading = poolsLoading
    const noPoolsFound =
      poolForList.length === 0 && !poolsLoading && debouncedSearchTerm.length >= MINIMUM_SEARCH_CHARACTERS
    return (
      <>
        {isLoading && <Skeleton />}
        {noPoolsFound && <Text>{t('No results')}</Text>}
        {debouncedSearchTerm.length < MINIMUM_SEARCH_CHARACTERS && (
          <Text>{t('Search pools or tokens')}</Text>
        )}
      </>
    )
  }

  return (
    <>
      {showMenu ? <Blackout /> : null}
      <Container>
        <StyledInput
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          placeholder={t('Search pools or tokens')}
          ref={inputRef}
          onFocus={() => {
            setShowMenu(true)
          }}
        />
        <Menu hide={!showMenu} ref={menuRef}>
          {error && <Text color="failure">{t('Error occurred, please try again')}</Text>}

          <ResponsiveGrid>
            <Text bold color="primary">
              {t('Tokens')}
            </Text>
            {!isXs && !isSm && (
              <Text textAlign="end" fontSize="12px">
                {t('Price')}
              </Text>
            )}
            {!isXs && !isSm && (
              <Text textAlign="end" fontSize="12px">
                {t('Volume 24H')}
              </Text>
            )}
            {!isXs && !isSm && (
              <Text textAlign="end" fontSize="12px">
                {t('Liquidity')}
              </Text>
            )}
          </ResponsiveGrid>
          {tokensForList.slice(0, tokensShown).map((token, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <HoverRowLink onClick={() => handleItemClick(`/info/token/${token?.address}`)} key={i}>
                <ResponsiveGrid>
                  <Flex>
                    <CurrencyLogo address={token?.address} />
                    <Text ml="10px">
                      <Text>{`${token?.name} (${token?.symbol})`}</Text>
                    </Text>
                  </Flex>
                  {!isXs && !isSm && <Text textAlign="end">${formatAmount(token?.priceUSD)}</Text>}
                  {!isXs && !isSm && <Text textAlign="end">${formatAmount(token?.volumeUSD)}</Text>}
                  {!isXs && !isSm && <Text textAlign="end">${formatAmount(token?.liquidityUSD)}</Text>}
                </ResponsiveGrid>
              </HoverRowLink>
            )
          })}
          {contentUnderTokenList()}
          <HoverText
            onClick={() => {
              setTokensShown(tokensShown + 5)
            }}
            hide={tokensForList.length <= tokensShown}
            ref={showMoreRef}
          >
            {t('See more...')}
          </HoverText>

          <Break />
          <ResponsiveGrid>
            <Text bold color="primary" mb="8px">
              {t('Pools')}
            </Text>
            {!isXs && !isSm && (
              <Text textAlign="end" fontSize="12px">
                {t('Volume 24H')}
              </Text>
            )}
            {!isXs && !isSm && (
              <Text textAlign="end" fontSize="12px">
                {t('Volume 7D')}
              </Text>
            )}
            {!isXs && !isSm && (
              <Text textAlign="end" fontSize="12px">
                {t('Liquidity')}
              </Text>
            )}
          </ResponsiveGrid>
          {poolForList.slice(0, poolsShown).map((p, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <HoverRowLink onClick={() => handleItemClick(`/info/pool/${p?.address}`)} key={i}>
                <ResponsiveGrid>
                  <Flex>
                    <DoubleCurrencyLogo address0={p?.token0.address} address1={p?.token1.address} />
                    <Text ml="10px" style={{ whiteSpace: 'nowrap' }}>
                      <Text>{`${p?.token0.symbol} / ${p?.token1.symbol}`}</Text>
                    </Text>
                  </Flex>
                  {!isXs && !isSm && <Text textAlign="end">${formatAmount(p?.volumeUSD)}</Text>}
                  {!isXs && !isSm && <Text textAlign="end">${formatAmount(p?.volumeUSDWeek)}</Text>}
                  {!isXs && !isSm && <Text textAlign="end">${formatAmount(p?.liquidityUSD)}</Text>}
                </ResponsiveGrid>
              </HoverRowLink>
            )
          })}
          {contentUnderPoolList()}
          <HoverText
            onClick={() => {
              setPoolsShown(poolsShown + 5)
            }}
            hide={poolForList.length <= poolsShown}
            ref={showMoreRef}
          >
            {t('See more...')}
          </HoverText>
        </Menu>
      </Container>
    </>
  )
}

export default Search
