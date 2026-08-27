import React, { useState } from "react";
import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Body, Card, Label, PrimaryButton, Screen, TextField, Title } from "../components/ui";
import { colors, spacing } from "../theme/index";
import { realityApi } from "../api/index";
import { useUser } from "../context/UserContext";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "RealitySelect">;

const AREAS = [
  { id: "financeira", label: "Financeira" },
  { id: "amorosa", label: "Amorosa" },
  { id: "profissional", label: "Profissional" },
  { id: "fisica", label: "Física" },
  { id: "familiar", label: "Familiar" },
];

export function RealitySelectScreen({ navigation }: Props) {
  const { refresh } = useUser();
  const [area, setArea] = useState<string | null>(null);
  const [tercaFeiraIdeal, setTercaFeiraIdeal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!area || !tercaFeiraIdeal.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await realityApi.create(area, tercaFeiraIdeal.trim());
      await refresh();
      navigation.replace("Home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar sua realidade agora.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Title>Uma realidade por vez</Title>
      <View style={{ height: spacing.md }} />
      <Body>
        Se apenas uma área da sua vida mudasse primeiro, qual mudança teria maior impacto sobre
        todas as outras?
      </Body>
      <View style={{ height: spacing.lg }} />

      <View style={{ gap: spacing.sm }}>
        {AREAS.map((a) => (
          <Pressable key={a.id} onPress={() => setArea(a.id)}>
            <Card
              style={{
                borderColor: area === a.id ? colors.accent : colors.border,
              }}
            >
              <Body>{a.label}</Body>
            </Card>
          </Pressable>
        ))}
      </View>

      {area && (
        <>
          <View style={{ height: spacing.xl }} />
          <Label>Já vivendo essa mudança</Label>
          <View style={{ height: spacing.sm }} />
          <Body>Como seria uma terça-feira comum, já dentro dessa realidade?</Body>
          <View style={{ height: spacing.sm }} />
          <TextField
            value={tercaFeiraIdeal}
            onChangeText={setTercaFeiraIdeal}
            placeholder="Onde você acorda, o que faz, como se sente..."
            multiline
          />
        </>
      )}

      {error && (
        <View style={{ marginTop: spacing.md }}>
          <Body>{error}</Body>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
      <PrimaryButton
        label="Entrar nesta realidade"
        onPress={handleCreate}
        loading={submitting}
        disabled={!area || !tercaFeiraIdeal.trim()}
      />
    </Screen>
  );
}
