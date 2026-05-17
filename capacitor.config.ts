import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.trackmysalah',
  appName: 'TrackMySalah',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_notification',
      iconColor: '#16a34a',
    },
  },
};

export default config;
