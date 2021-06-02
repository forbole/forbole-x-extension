import qs from 'query-string'

const openChromeExtension = (params: any) => {
  const query: any = {}
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === 'string') {
      query[key] = params[key]
    } else {
      query[key] = JSON.stringify(params[key])
    }
  })
  chrome.windows.create({
    url: qs.stringifyUrl({ url: 'index.html', query }),
    type: 'popup',
    width: 520,
    height: 600,
    top: 0,
    left: 0,
  })
}

export default openChromeExtension