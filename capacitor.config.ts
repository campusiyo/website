import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.campusiyo.app",
  appName: "Campusiyo",
  webDir: "public",
  server: {
    androidScheme: "https",
    cleartext: true,
    url: "https://campusiyo.in",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#0B0D12",
      androidSplashResourceName: "ic_splash_logo",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
