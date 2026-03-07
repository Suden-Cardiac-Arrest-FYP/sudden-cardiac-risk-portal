export const environment = {
  production: false,
  serverUrl: 'https://user-mgt-svc.mihishicloud.dev/User-Mgt/api',
  ScaInferenceUrl: 'https://sca-inference.svc.mihishicloud.dev/sca-inference-service/api',

  LogoLight:
    'https://my-fyp-s3-bucket.s3.eu-west-2.amazonaws.com/sca-official-logo.png',
  LogoDark:
    'https://my-fyp-s3-bucket.s3.eu-west-2.amazonaws.com/sca-official-logo.png',
  WORKSPACEID: 'WS680',
  auth0: {
    domain: 'dev-yi2vtudtt52q3bgx.us.auth0.com',
    clientId: '56bSrJyNAAcsE7Hfs88lBH3BEXYesuwA',
    authorizationParams: {
      // audience: 'https://h-pos.us.auth0.com/api/v2/',
      redirect_uri: 'https://imo-mgt-fe.onrender.com',
    },
  },
};
