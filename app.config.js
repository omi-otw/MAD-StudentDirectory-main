module.exports = ({ config }) => {
  const isProduction = process.env.EXPO_PUBLIC_ENV === "production";

  return {
    ...config,
    name: "Rafsanjani Directory",
    slug: "rafsanjani-student-directory",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rafsanjanidirectory",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0D1F4E",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rafsanjani.studentdirectory",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0D1F4E",
      },
      package: "com.rafsanjani.studentdirectory",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          imageWidth: 220,
          resizeMode: "contain",
          backgroundColor: "#0D1F4E",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      ...(config.extra ?? {}),
      apiUrl: isProduction ? "https://api.yourapp.com" : "http://localhost:3000",
    },
  };
};
