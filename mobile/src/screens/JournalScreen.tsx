import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Body, Card, Label, PrimaryButton, Screen, TextField, Title } from "../components/ui";
import { colors, spacing } from "../theme/index";
import { journalApi } from "../api/index";
import type { JournalEntry } from "../api/types";

const CATEGORIES = [
  { id: "acontecimento", label: "Acontecimento" },
  { id: "desejo", label: "Desejo" },
  { id: "emocao", label: "Emoção" },
  { id: "crenca", label: "Crença" },
  { id: "acao", label: "Ação" },
  { id: "evidencia", label: "Evidência" },
  { id: "revisao", label: "Revisão" },
];

export function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("acontecimento");
  const [saving, setSaving] = useState(false);
  const [newPatterns, setNewPatterns] = useState<string[]>([]);

  function load() {
    journalApi.list().then((r) => setEntries(r.entries));
  }

  useEffect(load, []);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const { newPatterns } = await journalApi.add(content.trim(), category);
      setContent("");
      setNewPatterns(newPatterns);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Title>Diário</Title>
      <View style={{ height: spacing.lg }} />

      <Label>Categoria</Label>
      <View style={{ height: spacing.sm }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {CATEGORIES.map((c) => (
          <Pressable key={c.id} onPress={() => setCategory(c.id)}>
            <View
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: category === c.id ? colors.accent : colors.border,
              }}
            >
              <Body>{c.label}</Body>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing.md }} />
      <TextField value={content} onChangeText={setContent} placeholder="Hoje aconteceu..." multiline />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Registrar" onPress={handleSave} loading={saving} disabled={!content.trim()} />

      {newPatterns.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Label>Padrão percebido</Label>
          <View style={{ height: spacing.sm }} />
          {newPatterns.map((p, i) => (
            <Card key={i} style={{ marginBottom: spacing.sm }}>
              <Body>{p}</Body>
            </Card>
          ))}
        </View>
      )}

      <View style={{ height: spacing.xl }} />
      <Label>Registros</Label>
      <View style={{ height: spacing.sm }} />
      {entries.map((e) => (
        <Card key={e.id} style={{ marginBottom: spacing.sm }}>
          <Label>{e.category}</Label>
          <View style={{ height: spacing.xs }} />
          <Body>{e.content}</Body>
        </Card>
      ))}
    </Screen>
  );
}
