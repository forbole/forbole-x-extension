/* eslint-disable no-undef */
chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  chrome.windows.create({
    url: "index.html",
    type: "popup",
    width: 300,
    height: 600,
    top: 200,
    left: 200,
  });
});
