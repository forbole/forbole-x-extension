import React from 'react'
import qs from 'query-string'

const App: React.FC = () => {
  const query = {
    'hide-menu': true,
    ...qs.parse(window.location.search),
  }
  return (
    <iframe
      title="Forbole X"
      height={600}
      width={520}
      src={qs.stringifyUrl({ url: `${process.env.REACT_APP_WEB_APP_BASE_URL}/wallets`, query })}
    />
  )
}

export default App
