import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useBabyTokenContract } from 'hooks/useContract';
import { CREATE_TOKEN_FEE_RECEIVER_ADDRESS, ROUTER_ADDRESS } from '../../constants/index';
import { Form, Label, LabelText, BigLabelText, Submit, Inputs, MessageContainer, Message, Required } from './standardTokenForm';

export const Select = styled.select`
    height: 2.5rem;
    padding: 0 1rem 0 1rem;
    border-radius: 0 30px 30px 0;
    background-color: #011724;
    color: white;
    flex: 1;
`

const BabyTokenForm = () => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [supply, setSupply] = useState('');
    const [router, setRouter] = useState('0xD99D1c33F9fC3444f8101754aBC46c52416550D1'); // PancakeSwap
    const [rewardToken, setRewardToken] = useState('');
    const [marketingWallet, setMarketingWallet] = useState('');
    const [tokenFeeBps, setTokenFee] = useState('');
    const [liquidityFeeBps, setLiquidityFee] = useState('');
    const [marketingFeeBps, setMarketingFee] = useState('');
    const [minimumTokenBalanceForDividends, setMinimumBalance] = useState('');
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(false);
    const [error, setError] = useState('');
    const [txAddress, setTxAddress] = useState('');
    const dividendTracker = "0x87064D365710C0C025628ed1294548FEA4f5AD67";

    const factory = useBabyTokenContract();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (window.ethereum) {
            if ((parseInt(minimumTokenBalanceForDividends)) < ((parseInt(supply)) / 1000)){
                try{
                    if (!factory){return}
                    const tx = await factory.createBabyToken(
                        name,
                        symbol,
                        ethers.utils.parseUnits(supply, 18),
                        [
                          rewardToken,
                          router,
                          marketingWallet,
                          dividendTracker
                        ],
                        [
                          (parseInt(tokenFeeBps)),
                          (parseInt(liquidityFeeBps)),
                          (parseInt(marketingFeeBps)),
                        ],
                        ethers.utils.parseUnits(minimumTokenBalanceForDividends, 18),
                        {value: ethers.utils.parseUnits("0.01")}
                    );
                    setLoading(true);
                    setTxAddress(tx.hash)
                    setLoading(false);
                    setCreated(true);
                } catch {
                    setError("It was not possible to create the token");
                }
            } else {
              setError("Minimum Token Balance must be 0.1% or less than Total Supply")
            }
        }
    }

    useEffect(() => {
        console.log(loading, created)
    }, [loading, created, txAddress])

    return (
        <>
            {!created && !loading && (
                    <Form onSubmit={(e) => {handleSubmit(e)}}>
                    <div>
                        <Label htmlFor="name"> 
                            <LabelText>
                                Name
                                <Required>*</Required>
                            </LabelText> 
                            <Inputs 
                                type="text" 
                                name="name" 
                                value={name} 
                                placeholder='Ex: Ethereum' 
                                required
                                onChange={(e) => {setName(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="symbol"> 
                            <LabelText>
                                Symbol
                                <Required>*</Required>
                            </LabelText>  
                            <Inputs 
                                type="text" 
                                name="symbol" 
                                value={symbol} 
                                placeholder='Ex: ETH' 
                                required
                                onChange={(e) => {setSymbol(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="supply"> 
                            <LabelText>
                                Total Supply
                                <Required>*</Required>
                            </LabelText> 
                            <Inputs 
                                type="number" 
                                name="supply" 
                                value={supply} 
                                placeholder='Ex: 10000' 
                                required
                                onChange={(e) => {setSupply(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="rewardTokenAddress"> 
                            <BigLabelText>
                                Reward Token Address
                                <Required>*</Required>
                            </BigLabelText> 
                            <Inputs 
                                type="text" 
                                name="rewardTokenAddress" 
                                value={rewardToken} 
                                placeholder='Ex: 0x...'
                                required
                                onChange={(e) => {setRewardToken(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="router"> 
                            <LabelText>
                                Router
                                <Required>*</Required>
                            </LabelText> 
                            <Select onChange={(e) => {setRouter(e.target.value)}} name="router" id="router">
                                <option value="0xD99D1c33F9fC3444f8101754aBC46c52416550D1" selected>PancakeSwap</option>
                                <option value={ROUTER_ADDRESS}>SummitSwap</option>
                            </Select>
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="marketingWallet"> 
                            <BigLabelText>
                                Marketing Wallet Address
                                <Required>*</Required>
                            </BigLabelText> 
                            <Inputs 
                                type="text" 
                                name="marketingWallet" 
                                value={marketingWallet} 
                                placeholder='Ex: 0x...'
                                required
                                onChange={(e) => {setMarketingWallet(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="tokenFee"> 
                            <BigLabelText>
                                Token reward fee (%)
                                <Required>*</Required>
                            </BigLabelText> 
                            <Inputs 
                                type="number" 
                                name="tokenFee" 
                                value={tokenFeeBps} 
                                placeholder='Ex: 1' 
                                required
                                onChange={(e) => {setTokenFee(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="liquidityfee"> 
                            <BigLabelText>
                                Transaction fee to generate liquidity (%)
                                <Required>*</Required>
                            </BigLabelText> 
                            <Inputs 
                                type="number" 
                                name="liquidityfee" 
                                value={liquidityFeeBps} 
                                placeholder='Ex: 1' 
                                required
                                onChange={(e) => {setLiquidityFee(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="marketingFee"> 
                            <BigLabelText>
                                Marketing fee (%)
                                <Required>*</Required>
                            </BigLabelText> 
                            <Inputs 
                                type="number" 
                                name="marketingFee" 
                                value={marketingFeeBps} 
                                placeholder='Ex: 1' 
                                required
                                onChange={(e) => {setMarketingFee(e.target.value)}}
                            />
                        </Label>
                    </div>
                    <div>
                        <Label htmlFor="minimumTokenBalanceForDividends"> 
                            <BigLabelText>
                                Minimum token balance for dividends 
                                <Required>*</Required>
                            </BigLabelText> 
                            <Inputs 
                                type="number" 
                                name="minimumTokenBalanceForDividends" 
                                value={minimumTokenBalanceForDividends} 
                                placeholder='Ex: 1000' 
                                required
                                onChange={(e) => {setMinimumBalance(e.target.value)}}
                            />
                        </Label>
                    </div>
                    {error && <p>{error}</p>}
                    <Submit type="submit" value="CREATE TOKEN" />
                </Form>
            )}
            {loading && (
                <Message>Please wait until the transaction is complete...</Message>
            )}
            {created && (
                <MessageContainer>
                    <Message>Your token was successfully created!!</Message>
                    <Message><a href={`https://testnet.bscscan.com/tx/${txAddress}`}>View your Transaction</a></Message>
                </MessageContainer>
                
            )}
        </>
    )
}

export default BabyTokenForm;