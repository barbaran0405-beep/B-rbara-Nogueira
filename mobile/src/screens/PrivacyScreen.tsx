import React, { useEffect, useState } from "react";
import { Alert, Switch, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Body, Card, Label, PrimaryButton, Screen, SecondaryButton, Title } from "../components/ui";
import { colors, spacing } from "../theme/index";
import { clearUserId, privacyApi } from "../api/index";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

export function PrivacyScreen({ navigation }: Props) {
  const [privateMode, setPrivateMode] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);
  const [exportPreview, setExportPreview] = useState<string | null>(null);

  useEffect(() => {
    privacyApi.getSettings().then((s) => {
      setPrivateMode(s.privateMode);
      setBiometricLock(s.biometricLock);
    });
  }, []);

  async function updateSettings(nextPrivate: boolean, nextBiometric: boolean) {
    setPrivateMode(nextPrivate);
    setBiometricLock(nextBiometric);
    await privacyApi.updateSettings(nextPrivate, nextBiometric);
  }

  async function handleExport() {
    const data = await privacyApi.exportData();
    setExportPreview(JSON.stringify(data, null, 2));
  }

  function confirmDeleteReality() {
    Alert.alert(
      "Apagar realidade",
      "Isso apaga sua realidade principal e todo o histórico do Modo Realidade. Não pode ser desfeito.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            await privacyApi.deleteReality();
            navigation.reset({ index: 0, routes: [{ name: "RealitySelect" }] });
          },
        },
      ]
    );
  }

  function confirmDeleteAccount() {
    Alert.alert("Apagar conta", "Isso apaga todos os seus dados permanentemente.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar tudo",
        style: "destructive",
        onPress: async () => {
          await privacyApi.deleteAccount();
          await clearUserId();
          navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        },
      },
    ]);
  }

  return (
    <Screen>
      <Title>Privacidade</Title>
      <View style={{ height: spacing.lg }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Body>Modo privado (não gravar esta sessão)</Body>
        <Switch value={privateMode} onValueChange={(v) => updateSettings(v, biometricLock)} />
      </View>
      <View style={{ height: spacing.md }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Body>Bloqueio por biometria</Body>
        <Switch value={biometricLock} onValueChange={(v) => updateSettings(privateMode, v)} />
      </View>

      <View style={{ height: spacing.xl }} />
      <Label>Seus dados</Label>
      <View style={{ height: spacing.sm }} />
      <SecondaryButton label="Exportar meus dados" onPress={handleExport} />
      {exportPreview && (
        <Card style={{ marginTop: spacing.sm, maxHeight: 240 }}>
          <Body>{exportPreview}</Body>
        </Card>
      )}

      <View style={{ height: spacing.xl }} />
      <Label>Zona de risco</Label>
      <View style={{ height: spacing.sm }} />
      <SecondaryButton
        label="Apagar minha realidade"
        onPress={confirmDeleteReality}
        style={{ borderWidth: 1, borderColor: colors.danger, borderRadius: 12 }}
      />
      <View style={{ height: spacing.sm }} />
      <SecondaryButton
        label="Apagar minha conta"
        onPress={confirmDeleteAccount}
        style={{ borderWidth: 1, borderColor: colors.danger, borderRadius: 12 }}
      />

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Voltar" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
