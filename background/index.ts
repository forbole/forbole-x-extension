import CryptoJS from "crypto-js";

const decryptWallets = (encryptedWalletsString: string, password: string) => {
  try {
    const wallets = JSON.parse(
      CryptoJS.AES.decrypt(encryptedWalletsString, password).toString(
        CryptoJS.enc.Utf8
      )
    );
    return wallets;
  } catch (err) {
    return null;
  }
};

chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  switch (request.event) {
    case "ping":
      chrome.storage.local.get(["wallets"], (result) => {
        sendResponse({
          isFirstTimeUser: !result.wallets,
        });
      });
      break;
    case "getWallets":
      chrome.storage.local.get(["wallets"], (result) => {
        const { password } = request.data;
        const wallets = decryptWallets(result.wallets, password);
        sendResponse(
          !wallets
            ? { err: "incorrect password" }
            : {
                wallets: (wallets || []).map((w: any) => ({
                  name: w.name,
                  pubkey: w.pubkey,
                })),
              }
        );
      });
      break;
    case "addWallet":
      chrome.storage.local.get(["wallets"], (result) => {
        const { password, wallet } = request.data;
        const wallets = decryptWallets(result.wallets, password);
        const encryptedWalletsString = CryptoJS.AES.encrypt(
          JSON.stringify([wallet, ...(wallets || [])]),
          password
        ).toString();
        chrome.storage.local.set(
          { wallets: encryptedWalletsString },
          function () {
            sendResponse({ success: true });
          }
        );
      });
      break;
    default:
      sendResponse({ error: "unknown event" });
  }
});
