;(window as any).forboleX = {
  sendTransaction: (address: string, transactionData: any) => {
    window.postMessage(
      {
        target: 'Forbole X',
        event: 'sendTransaction',
        data: {
          address,
          transactionData,
        },
      },
      window.location.origin
    )
  },
}

export {}
