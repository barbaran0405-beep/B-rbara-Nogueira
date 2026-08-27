import React from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Body, Card, Label, PrimaryButton, Screen, Title } from "../components/ui";
import { spacing } from "../theme/index";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "DNAReveal">;

export function DNARevealScreen({ route, navigation }: Props) {
  const { dna } = route.params;

  return (
    <Screen>
      <Title>Padrões que você relatou</Title>
      <View style={{ height: spacing.md }} />
      <Body>
        Isto não é um diagnóstico — é uma leitura do que você contou, para você reconhecer e
        trabalhar a partir dela.
      </Body>
      <View style={{ height: spacing.lg }} />

      <Label>DNA atual</Label>
      <View style={{ height: spacing.sm }} />
      <Card>
        <Body>{dna.atual}</Body>
      </Card>

      <View style={{ height: spacing.lg }} />

      <Label>DNA assumido</Label>
      <View style={{ height: spacing.sm }} />
      <Card>
        <Body>{dna.assumido}</Body>
      </Card>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Escolher minha realidade" onPress={() => navigation.replace("RealitySelect")} />
    </Screen>
  );
}
