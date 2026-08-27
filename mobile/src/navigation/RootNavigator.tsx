import React from "react";
import { ActivityIndicator, View } from "react-native";
import { DarkTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/index";
import { useUser } from "../context/UserContext";
import type { RootStackParamList } from "./types";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { DNARevealScreen } from "../screens/DNARevealScreen";
import { RealitySelectScreen } from "../screens/RealitySelectScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { RealityModeScreen } from "../screens/RealityModeScreen";
import { AssumedSelfScreen } from "../screens/AssumedSelfScreen";
import { JournalScreen } from "../screens/JournalScreen";
import { ChallengeScreen } from "../screens/ChallengeScreen";
import { EvidenceScreen } from "../screens/EvidenceScreen";
import { CrisisScreen } from "../screens/CrisisScreen";
import { PrivacyScreen } from "../screens/PrivacyScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.background },
};

export function RootNavigator() {
  const { loading, onboardingComplete, hasPrimaryReality } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const initialRouteName: keyof RootStackParamList = !onboardingComplete
    ? "Onboarding"
    : !hasPrimaryReality
      ? "RealitySelect"
      : "Home";

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: "" }} />
        <Stack.Screen name="DNAReveal" component={DNARevealScreen} options={{ title: "" }} />
        <Stack.Screen name="RealitySelect" component={RealitySelectScreen} options={{ title: "" }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RealityMode" component={RealityModeScreen} options={{ title: "Sua realidade" }} />
        <Stack.Screen name="AssumedSelf" component={AssumedSelfScreen} options={{ title: "" }} />
        <Stack.Screen name="Journal" component={JournalScreen} options={{ title: "" }} />
        <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: "" }} />
        <Stack.Screen name="Evidence" component={EvidenceScreen} options={{ title: "" }} />
        <Stack.Screen name="Crisis" component={CrisisScreen} options={{ title: "" }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: "" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
