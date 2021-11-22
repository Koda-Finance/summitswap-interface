// Kindacode.com
import React, { useState } from 'react';
import axios from "axios";
import styled from 'styled-components'
import { Button } from '@summitswap-uikit'


const CheckForm: React.FunctionComponent = () => {
  const [term, setTerm] = useState('');
  const [paraText, setParaText] = useState({ token_name: '', total_supply: '', holders_count: 0, owner_address: '', owner_address_balance: '', top_holders: [{ tokenHolderAddress: '', tokenHolderQuantity: '', percentage: 0 }], burned_tokens: 0 });
  const [dataFetched, setDataFetched] = useState(false);
  const [loading, setLoading] = useState(false)

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();
    console.log(term);

    if (term.trim()) {
      setLoading(true);

      fetch(`http://localhost:3000/summit-check-token/${term}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          /*
          let textPara = "";
          Object.entries(data).map(([key, value]) => {
            // Pretty straightforward - use key for the key and value for the value.
            // Just to clarify: unlike object destructuring, the parameter names don't matter here.
            
              textPara += `${key}: ${value}`;
            
            return console.log(value);
          });&& paraText.length>0 && paraText.map((item)=><p>{item}</p>)
          */
          setParaText({ token_name: data.token_name, total_supply: data.total_supply, holders_count: data.holders_count, owner_address: data.owner_address, owner_address_balance: data.owner_address_balance, top_holders: data.top_holders, burned_tokens: data.burned_tokens });
          setDataFetched(true);
          setLoading(false);
          setTerm('');
        });
    }

  }

  const Container = styled.div`
  width: 100%;
`
  const Form = styled.form`
  display: flex;
`
  const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 10px 20px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 30px 0 0 30px;
  color: ${({ theme }) => theme.colors.inputColor};
  background: ${({ theme }) => theme.colors.menuItemBackground};
  -webkit-appearance: none;
  font-size: 16px;
  font-weight: 400;
  ::placeholder {
    color: rgba(255, 255, 255, .4);
    font-size: 16px;
    font-weight: 400;
  }
  transition: border 100ms;
  :focus {
    // border: 1px solid ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`
  const ResultsBox = styled.div`
  border-radius: 16px;
  background: #011724;
  box-shadow: inset 0px 2px 2px -1px rgb(74 74 104 / 10%);
  padding: 40px;
  font-weight: 600;
  font-size: 16px;
  margin: 15px 0;
  line-height: 16px;
  > p, > div > p {
    margin-bottom: 15px;
    line-height: 26px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    > span.value {
      background: #00121d;
      padding: 5px;
      word-break: break-all;
      margin-left: auto;
    }
  }
  > h4 {
    color: #2BA55D;
    margin-bottom: 15px;
  }
`

  return (
    <Container>
      <Form onSubmit={submitForm}>
        <SearchInput
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          type="text"
          placeholder="Enter address"
          className="input"
          name="token_address"
        />
        <Button style={{ borderRadius: "0 33px 33px 0" }} type="submit" className="btn" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </Form>
      <br />

      {dataFetched &&
        <div id="result">
          <ResultsBox>
            <p>
              <span>Token Name:</span>
              <span className='value'>{paraText.token_name}</span>
            </p>
            <p>
              <span>Total Supply:</span>
              <span className='value'>{paraText.total_supply}</span>
            </p>
            <p>
              <span>Holders:</span>
              <span className='value'>{paraText.holders_count}</span>
            </p>
            <p>
              <span>Owner Address:</span>
              <span className='value'>{paraText.owner_address}</span>
            </p>
            <p>
              <span>Owner Address Balance:</span>
              <span className='value'>{paraText.owner_address_balance}</span>
            </p>
            <p>
              <span>Burned Tokens:</span>
              <span className='value'>{paraText.burned_tokens}</span>
            </p>
          </ResultsBox>

          <ResultsBox>
            <h4>Top Holders</h4>
            {paraText.top_holders.map(holder => <div>
              <p>
                <span>Holder Address:</span>
                <span className='value'>{holder.tokenHolderAddress}</span>
              </p>
              <p>
                <span>Holder Quantity:</span>
                <span className='value'>{holder.tokenHolderQuantity}</span>
              </p>
              <p>
                <span>Percentage:</span>
                <span className='value'>{holder.percentage}%</span>
              </p>
              <hr />
            </div>)}
          </ResultsBox>
        </div>
      }

    </Container>
  );
};

export default CheckForm;