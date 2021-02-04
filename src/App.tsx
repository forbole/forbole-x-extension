import React from 'react'

const App: React.FC = () => {
  const clearStorage = React.useCallback(() => {
    chrome.storage.local.clear()
  }, [])
  return (
    <div className="App">
      <button type="button" onClick={clearStorage}>
        Clear Storage
      </button>
    </div>
  )
}

export default App
