import React from "react";

function App() {
  const clearStorage = React.useCallback(() => {
    chrome.storage.local.clear();
  }, []);
  return (
    <div className="App">
      <button onClick={clearStorage}>Clear Storage</button>
    </div>
  );
}

export default App;
