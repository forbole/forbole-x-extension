import React from 'react'
import qs from 'query-string'

const App: React.FC = () => {
  const query = {
    isChromeExt: true,
    ...qs.parse(window.location.search),
  }
  const url = qs.stringifyUrl({ url: `${process.env.REACT_APP_WEB_APP_BASE_URL}/wallets`, query })
  return <iframe title="Forbole X" allow="hid;clipboard-write" height={600} width={520} src={url} />
}

export default App
