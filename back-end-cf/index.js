/**
 * IS_CN: 如果为世纪互联版本，请将 0 改为 1
 * EXPOSE_PATH：暴露路径，如全盘展示请留空，否则按 '/媒体/音乐' 的格式填写
 * ONEDRIVE_REFRESHTOKEN: refresh_token
 */
const IS_CN = 0;
const EXPOSE_PATH = ""
const ONEDRIVE_REFRESHTOKEN = "0.ASsA5zmNXDMuwEG1qYwDIF6VlvLno01tv3xGqvBXgHjwv3wrAHI.AQABAAAAAAAm-06blBE1TpVMil8KPQ41voNjeAvuXYLqpU9ESRy3PtfTB0ImSauKWuekXc5f1mSrL76Lc7OgM5ew4Ji76uVycNN7ubwUMqg99p7VAW7N2qLoXtnopZTlwDPQX1Bw0d0iF-a5vJsnJbazc_tv3vpbop_6oK0cLN_WerM0qqhxFxrSzhf5hEYqO8qnLilD25LgIA8JZ1lVSVw_IfY6V9LE9j7arRhJp7ZG40aZUJS3HXFm4cuf5IBREO_honhfUYrscXPjS5XZ7L2r98lT_kOW3gty4Cn2mfT7FfjDOFDh6AwiPg-yZaXxsHwtIgYGgM8aGPKsbirYzgo6-xG2S393XNXChp4HtDs5ao820o2M_vJ8k287G9ncmgfNdZkzTIIZS1WaqwTamstQkW4BXug0d38b5jFnz7KhHo_SrVzMHsETI9a6_b4D2o0Dsp101-YFZQzt1ER86f9m6MOdBmze00M2QBgTyVHvMIl4YZ8C35522w4S1RrOfciiFigOHfJHc6efFzCj7lTCNAa1msPf2O7guY7SDSYI8_uxnlibjzepgy8-Hn-mb2j811svj9veNHuxG2_MGXwB4dXF_WNIwgpzLvahCvheZfAFPuQBgDN9nEQuRFQCNV1t4iQ9v2wt64ME3B271qAL0IFYLX9nt1D1QzljV2QYbX1Zb57AZG57cM55Aa7u6A-iY8lbz1Vsit_5MnrawY59kz8SORBXbATPSqqWk8O2CgdASsFuHCAA"


async function handleRequest(request) {
  let requestPath
  let querySplited
  let queryString = request.url.split('?')[1]
  if (queryString) {
    querySplited = queryString.split('=')
  }
  if (querySplited && querySplited[0] === 'file') {
    const file = querySplited[1]
    const fileName = file.split('/').pop();
    requestPath = file.replace('/' + fileName, '')
    const url = await fetchFiles(requestPath, fileName)
    return Response.redirect(url, 302)
  } else {
    const { headers } = request
    const contentType = headers.get('content-type')
    let body={}
    if (contentType && contentType.includes('form')) {
      const formData = await request.formData()
      for (let entry of formData.entries()) {
        body[entry[0]] = entry[1]
      }
    }
    requestPath = body ? body['?path'] : '';
    const files = await fetchFiles(requestPath, null, body.passwd);
    return new Response(files, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})


const clientId = [
  '4da3e7f2-bf6d-467c-aaf0-578078f0bf7c',
  '04c3ca0b-8d07-4773-85ad-98b037d25631'

]
const clientSecret = [
  '7/+ykq2xkfx:.DWjacuIRojIaaWL0QI6',
  'h8@B7kFVOmj0+8HKBWeNTgl@pU/z4yLB'
]

const oauthHost = [
  'https://login.microsoftonline.com',
  'https://login.partner.microsoftonline.cn'
]

const apiHost = [
  'https://graph.microsoft.com',
  'https://microsoftgraph.chinacloudapi.cn'
]

const OAUTH = {
  'redirectUri': 'https://scfonedrive.github.io',
  'refreshToken': ONEDRIVE_REFRESHTOKEN,
  'clientId': clientId[IS_CN],
  'clientSecret': clientSecret[IS_CN],
  'oauthUrl': oauthHost[IS_CN] + '/common/oauth2/v2.0/',
  'apiUrl': apiHost[IS_CN] + '/v1.0/me/drive/root',
  'scope': apiHost[IS_CN] + '/Files.ReadWrite.All offline_access'
}

async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get('content-type')
  if (contentType.includes('application/json')) {
    return await response.json()
  } else if (contentType.includes('application/text')) {
    return await response.text()
  } else if (contentType.includes('text/html')) {
    return await response.text()
  } else {
    return await response.text()
  }
}

async function getContent(url) {
  const response = await fetch(url)
  const result = await gatherResponse(response)
  return result
}

async function getContentWithHeaders(url, headers) {
  const response = await fetch(url, { headers: headers })
  const result = await gatherResponse(response)
  return result
}

async function fetchFormData(url, data) {
  const formdata = new FormData();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formdata.append(key, data[key])
    }
  }
  const requestOptions = {
    method: 'POST',
    body: formdata
  };
  const response = await fetch(url, requestOptions)
  const result = await gatherResponse(response)
  return result
}

async function fetchAccessToken() {
  url = OAUTH['oauthUrl'] + 'token'
  data = {
    'client_id': OAUTH['clientId'],
    'client_secret': OAUTH['clientSecret'],
    'grant_type': 'refresh_token',
    'requested_token_use': 'on_behalf_of',
    'refresh_token': OAUTH['refreshToken']
  }
  const result = await fetchFormData(url, data)
  return result.access_token
}

async function fetchFiles(path, fileName, passwd) {
  if (!path || path === '/') {
    if (EXPOSE_PATH === '') {
      path = ''
    } else {
      path = ':' + EXPOSE_PATH
    }
  } else {
    if (EXPOSE_PATH === '') {
      path = ':' + path
    } else {
      path = ':' + EXPOSE_PATH + path
    }
  }

  const accessToken = await fetchAccessToken()
  const uri = OAUTH.apiUrl + encodeURI(path) + '?expand=children(select=name,size,parentReference,lastModifiedDateTime,@microsoft.graph.downloadUrl)'

  const body = await getContentWithHeaders(uri, {
    Authorization: 'Bearer ' + accessToken
  })
  if (fileName) {
    let thisFile = null
    body.children.forEach(file => {
      if (file.name === decodeURIComponent(fileName)) {
        thisFile = file['@microsoft.graph.downloadUrl']
        return
      }
    })
    return thisFile
  } else {
    let files = []
    let encrypted = false
    for (let i = 0; i < body.children.length; i++) {
      const file = body.children[i]
      if (file.name === '.password') {
        const PASSWD = await getContent(file['@microsoft.graph.downloadUrl'])
        if (PASSWD !== passwd) {
          encrypted = true;
          break
        } else {
          continue
        }
      }
      files.push({
        name: file.name,
        size: file.size,
        time: file.lastModifiedDateTime,
        url: file['@microsoft.graph.downloadUrl']
      })
    }
    let parent
    if (body.children.length) {
      parent = body.children[0].parentReference.path
    } else {
      parent = body.parentReference.path
    }
    parent = parent.split(':').pop().replace(EXPOSE_PATH, '') || '/'
    parent = decodeURIComponent(parent)
    if (encrypted) {
      return JSON.stringify({ parent: parent, files: [], encrypted: true })
    } else {
      return JSON.stringify({ parent: parent, files: files })
    }
  }
}
