import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Body, Card, Label, Screen, SecondaryButton } from "../components/ui";
import { colors, spacing } from "../theme/index";
import { realityApi } from "../api/index";
import type { Scene } from "../api/types";

export function RealityModeScreen() {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { scene } = await realityApi.enter();
      setScene(scene);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar na sua realidade agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    enter();
  }, [enter]);

  async function handleChoice(optionId: string) {
    if (!scene) return;
    setChoosing(true);
    setError(null);
    try {
      const { scene: next } = await realityApi.choose(scene.id, optionId);
      setScene(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível registrar sua escolha.");
    } finally {
      setChoosing(false);
    }
  }

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {scene?.isPendingRecap && <Label>Enquanto você esteve fora</Label>}
      <View style={{ height: spacing.md }} />
      <Card>
        <Body>{scene?.narrative}</Body>
      </Card>

      {error && (
        <View style={{ marginTop: spacing.md }}>
          <Body>{error}</Body>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
      <View style={{ gap: spacing.sm }}>
        {scene?.options.map((option) => (
          <SecondaryButton
            key={option.id}
            label={option.label}
            onPress={() => handleChoice(option.id)}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              opacity: choosing ? 0.5 : 1,
            }}
          />
        ))}
      </View>
    </Screen>
  );
}
