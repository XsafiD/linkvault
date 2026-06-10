import { Stack } from "expo-router";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import colors from "../constants/colors";
import { getDatabase } from "../database/db";
import { migrateDbIfNeeded } from "../database/migrations";

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    (async () => {
      const db = await getDatabase();
      await migrateDbIfNeeded(db);
      setDbReady(true);
    })();
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-url"
          options={{ presentation: "modal", title: "Tambah URL" }}
        />
        <Stack.Screen
          name="edit-url"
          options={{ title: "Edit URL" }}
        />
        <Stack.Screen
          name="detail-url"
          options={{ title: "Detail" }}
        />
        <Stack.Screen
          name="categories/[id]"
          options={{ title: "Detail Kategori" }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Pengaturan" }}
        />
      </Stack>
    </>
  );
};

export default RootLayout;
