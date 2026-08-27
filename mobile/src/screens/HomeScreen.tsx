import React from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Body, PrimaryButton, Screen, SecondaryButton, Title } from "../components/ui";
import { spacing } from "../theme/index";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Title>JÁ É</Title>
        <View style={{ height: spacing.sm }} />
        <Body>Sua vida está acontecendo.</Body>
        <View style={{ height: spacing.xl }} />
        <PrimaryButton
          label="ENTRAR"
          onPress={() => navigation.navigate("RealityMode")}
          style={{ paddingHorizontal: spacing.xxl }}
        />
      </View>

      <View style={{ gap: spacing.xs, paddingBottom: spacing.lg }}>
        <SecondaryButton label="Eu assumido" onPress={() => navigation.navigate("AssumedSelf")} />
        <SecondaryButton label="Diário" onPress={() => navigation.navigate("Journal")} />
        <SecondaryButton label="Desafio da semana" onPress={() => navigation.navigate("Challenge")} />
        <SecondaryButton label="Banco de evidências" onPress={() => navigation.navigate("Evidence")} />
        <SecondaryButton label="Estou duvidando" onPress={() => navigation.navigate("Crisis")} />
        <SecondaryButton label="Privacidade" onPress={() => navigation.navigate("Privacy")} />
      </View>
    </Screen>
  );
}
