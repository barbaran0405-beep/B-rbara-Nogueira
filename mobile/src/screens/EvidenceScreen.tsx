import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Body, Card, Label, Screen, Title } from "../components/ui";
import { spacing } from "../theme/index";
import { evidenceApi } from "../api/index";
import type { BridgeEvent } from "../api/types";

export function EvidenceScreen() {
  const [evidence, setEvidence] = useState<BridgeEvent[]>([]);

  useEffect(() => {
    evidenceApi.list().then((r) => setEvidence(r.evidence));
  }, []);

  return (
    <Screen>
      <Title>Banco de evidências</Title>
      <View style={{ height: spacing.sm }} />
      <Body>Veja o que mudou desde que você começou.</Body>
      <View style={{ height: spacing.lg }} />

      {evidence.length === 0 && <Body>Ainda não há evidências registradas.</Body>}

      {evidence.map((e) => (
        <Card key={e.id} style={{ marginBottom: spacing.md }}>
          <Label>{e.origin === "challenge" ? "Desafio concluído" : "Registro"}</Label>
          <View style={{ height: spacing.xs }} />
          <Body>{e.acontecimento}</Body>
          {e.evidencia && (
            <>
              <View style={{ height: spacing.xs }} />
              <Body>{e.evidencia}</Body>
            </>
          )}
        </Card>
      ))}
    </Screen>
  );
}
