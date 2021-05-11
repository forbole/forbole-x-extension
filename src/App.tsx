import React from 'react'

const App: React.FC = () => {
  return (
    <iframe
      title="Forbole X"
      height={600}
      width={480}
      src={`${process.env.REACT_APP_WEB_APP_BASE_URL}/wallets?hide-menu=true`}
    />
  )
}

export default App
