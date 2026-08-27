import React, { useState } from "react";
import { View } from "react-native";
import { Body, Card, Label, PrimaryButton, Screen, TextField, Title } from "../components/ui";
import { spacing } from "../theme/index";
import { crisisApi } from "../api/index";
import type { CrisisReframe } from "../api/types";

export function CrisisScreen() {
  const [fato, setFato] = useState("");
  const [result, setResult] = useState<CrisisReframe | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!fato.trim()) return;
    setLoading(true);
    try {
      const reframe = await crisisApi.reframe(fato.trim());
      setResult(reframe);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>Estou duvidando</Title>
      <View style={{ height: spacing.md }} />
      <Body>O que aconteceu?</Body>
      <View style={{ height: spacing.sm }} />
      <TextField value={fato} onChangeText={setFato} placeholder="Descreva o fato, sem interpretação..." multiline />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Separar" onPress={handleSubmit} loading={loading} disabled={!fato.trim()} />

      {result && (
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <View>
            <Label>Fato</Label>
            <Card style={{ marginTop: spacing.xs }}>
              <Body>{result.fato}</Body>
            </Card>
          </View>
          <View>
            <Label>Interpretação</Label>
            <Card style={{ marginTop: spacing.xs }}>
              <Body>{result.interpretacao}</Body>
            </Card>
          </View>
          <View>
            <Label>Medo</Label>
            <Card style={{ marginTop: spacing.xs }}>
              <Body>{result.medo}</Body>
            </Card>
          </View>
          <View>
            <Label>Padrão antigo</Label>
            <Card style={{ marginTop: spacing.xs }}>
              <Body>{result.padraoAntigo}</Body>
            </Card>
          </View>
          <View>
            <Label>Resposta da identidade assumida</Label>
            <Card style={{ marginTop: spacing.xs }}>
              <Body>{result.respostaIdentidadeAssumida}</Body>
            </Card>
          </View>
        </View>
      )}
    </Screen>
  );
}
