
const TP_URL = 'https://auth.testproject.io/auth/realms/TP/protocol/openid-connect/auth?client_id=tp.app&redirect_uri=https%3A%2F%2Fapp.testproject.io%2Fcallback.html&response_type=id_token%20token&scope=openid%20profile&state=4adb86e624dc4987984d661b4db4ab5e&nonce=2593fac0a84d4a54a078f9de4dd3eed9'

const projects = {
  1: {
    name: 'ESS TESTING',
    url: 'https://app.testproject.io/#/projects/654523/tests?testFolderId=0'
  },
  2: {
    name: 'HR/ESS/PAYROLL/TKM',
    url: 'https://app.testproject.io/#/projects/985345/tests?testFolderId=0'
  },
  3: {
    name: 'HRIS',
    url: 'https://app.testproject.io/#/projects/1116195/tests?testFolderId=0'
  },
  4: {
    name: 'RERUN ESS TESTING',
    url: 'https://app.testproject.io/#/projects/1053231/tests?testFolderId=0'
  },
  5: {
    name: 'Sample Project',
    url: 'https://app.testproject.io/#/projects/1169153/tests?testFolderId=0'
  },
  6: {
    name: 'WEBPAYROLL TESTING',
    url: 'https://app.testproject.io/#/projects/481410/tests?testFolderId=0'
  },
  7: {
    name: 'WebPayroll: 12 Cases Scenarios',
    url: 'https://app.testproject.io/#/projects/697696/tests?testFolderId=0'
  },
  8: {
    name: 'WEBTKM TESTING',
    url: 'https://app.testproject.io/#/projects/597891/tests?testFolderId=0'
  } ,
  9: {
    name: 'WEBTRACC TESTING',
    url: 'https://app.testproject.io/#/projects/223187/tests?testFolderId=0'
  } ,
  10: {
    name: 'ZAP-PENETRATION SCRIPTS',
    url: 'https://app.testproject.io/#/projects/979453/tests?testFolderId=0'
  } 
}

exports.TP_URL = TP_URL
exports.projects = projects