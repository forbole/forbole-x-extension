const sendMsgToBackground = (extId: string, msg: any) =>
  new Promise<any>((resolve, reject) => {
    chrome.runtime.sendMessage(extId, msg, (response) => {
      if (response.err) {
        reject(new Error(response.err))
      } else {
        resolve(response)
      }
    })
  })

export default sendMsgToBackground
