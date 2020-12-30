import React from "react";

function App() {
  React.useEffect(() => {
    chrome.runtime.sendMessage("hhklieoefpolodfechjdmjjdnnmhidge", {
      key: "val",
    });
  }, []);
  return (
    <div className="App">
      <h1>Home</h1>
    </div>
  );
}

export default App;
