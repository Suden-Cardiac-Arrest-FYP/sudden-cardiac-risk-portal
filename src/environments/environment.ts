export const environment = {
  production: false,
  serverUrl: 'https://user-mgt-svc.mihishicloud.dev/User-Mgt/api',
  ScaInferenceUrl: 'https://sca-inference.svc.mihishicloud.dev/sca-inference-service/api',


  LogoLight: '',
  LogoDark: 'https://i.postimg.cc/9f5qsBh6/images.jpg',
  WORKSPACEID: 'WS680',
  auth0: {
    domain: 'dev-z21vlb2t2zdiulr0.us.auth0.com',
    clientId: 'KzrIsgwd0gvpZCMfhBN45VPphZhO2KIo',
    //domain: 'dev-yi2vtudtt52q3bgx.us.auth0.com',
    // clientId: '56bSrJyNAAcsE7Hfs88lBH3BEXYesuwA',
    authorizationParams: {
      // audience: 'https://h-pos.us.auth0.com/api/v2/',
      redirect_uri: 'http://localhost:4200',
    },
  },
};
