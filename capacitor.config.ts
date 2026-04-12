import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.huellitas.app',
  appName: 'HuellitasApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
