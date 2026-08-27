import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Body, Card, Label, PrimaryButton, Screen, SecondaryButton, TextField, Title } from "../components/ui";
import { spacing } from "../theme/index";
import { challengesApi } from "../api/index";
import type { Challenge } from "../api/types";

export function ChallengeScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [reflection, setReflection] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    challengesApi.list().then((r) => setChallenges(r.challenges));
  }

  useEffect(load, []);

  const pending = challenges.find((c) => c.status === "pending");

  async function handleGenerate() {
    setBusy(true);
    try {
      await challengesApi.generate();
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleClose(done: boolean) {
    if (!pending) return;
    setBusy(true);
    try {
      await challengesApi.close(pending.id, done, reflection.trim() || undefined);
      setReflection("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Desafio de identidade</Title>
      <View style={{ height: spacing.lg }} />

      {pending ? (
        <>
          <Card>
            <Body>{pending.description}</Body>
          </Card>
          <View style={{ height: spacing.md }} />
          <Label>Como foi</Label>
          <View style={{ height: spacing.sm }} />
          <TextField
            value={reflection}
            onChangeText={setReflection}
            placeholder="O que você fez, o que percebeu..."
            multiline
          />
          <View style={{ height: spacing.md }} />
          <PrimaryButton label="Marquei como feito" onPress={() => handleClose(true)} loading={busy} />
          <SecondaryButton label="Ainda não fiz" onPress={() => handleClose(false)} />
        </>
      ) : (
        <PrimaryButton label="Gerar desafio desta semana" onPress={handleGenerate} loading={busy} />
      )}

      <View style={{ height: spacing.xl }} />
      <Label>Histórico</Label>
      <View style={{ height: spacing.sm }} />
      {challenges
        .filter((c) => c.status !== "pending")
        .map((c) => (
          <Card key={c.id} style={{ marginBottom: spacing.sm }}>
            <Label>{c.status === "done" ? "Feito" : "Não feito"}</Label>
            <View style={{ height: spacing.xs }} />
            <Body>{c.description}</Body>
            {c.closure_reflection && (
              <>
                <View style={{ height: spacing.xs }} />
                <Body>{c.closure_reflection}</Body>
              </>
            )}
          </Card>
        ))}
    </Screen>
  );
}
