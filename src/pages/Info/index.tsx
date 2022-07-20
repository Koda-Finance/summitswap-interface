import React from 'react'
import { PoolUpdater, ProtocolUpdater, TokenUpdater } from 'state/info/updaters'
import InfoNav from 'components/InfoNav'

const InfoPageLayout: React.FC = ({ children }) => {
  return (
    <div className="main-content">
      <ProtocolUpdater />
      <PoolUpdater />
      <TokenUpdater />
      <InfoNav />
      {children}
    </div>
  )
}


export default InfoPageLayout