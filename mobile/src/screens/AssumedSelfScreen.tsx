import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Body, Label, PrimaryButton, Screen, TextField, Title } from "../components/ui";
import { spacing } from "../theme/index";
import { assumedSelfApi } from "../api/index";
import type { AssumedSelfMessage } from "../api/types";

export function AssumedSelfScreen() {
  const [messages, setMessages] = useState<AssumedSelfMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    assumedSelfApi.messages().then((r) => setMessages(r.messages));
  }, []);

  async function handleSend() {
    if (!draft.trim()) return;
    const content = draft.trim();
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content, created_at: new Date().toISOString() }]);
    setSending(true);
    try {
      const { reply } = await assumedSelfApi.send(content);
      setMessages((prev) => [
        ...prev,
        { role: "assumed_self", content: reply, created_at: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen>
      <Title>Eu assumido</Title>
      <View style={{ height: spacing.xs }} />
      <Label>Representação da identidade que você está construindo</Label>
      <View style={{ height: spacing.lg }} />

      <View style={{ gap: spacing.md }}>
        {messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <Body>{m.content}</Body>
          </View>
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
      <TextField value={draft} onChangeText={setDraft} placeholder="Escreva algo..." multiline />
      <View style={{ height: spacing.md }} />
      <PrimaryButton label="Enviar" onPress={handleSend} loading={sending} disabled={!draft.trim()} />
    </Screen>
  );
}
