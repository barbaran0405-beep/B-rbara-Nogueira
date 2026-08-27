import React, { useState } from "react";
import { View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Body, Label, PrimaryButton, Screen, SecondaryButton, TextField } from "../components/ui";
import { spacing } from "../theme/index";
import { onboardingApi } from "../api/index";
import type { OnboardingAnswers } from "../api/types";
import { useUser } from "../context/UserContext";
import type { RootStackParamList } from "../navigation/types";

const QUESTIONS: { field: keyof OnboardingAnswers; prompt: string; placeholder: string }[] = [
  { field: "rotina", prompt: "Como é sua rotina, no dia a dia?", placeholder: "Conte como costuma ser um dia comum..." },
  { field: "trabalho", prompt: "Como você trabalha hoje?", placeholder: "O que você faz, como se sente com isso..." },
  { field: "financas", prompt: "Como está sua situação financeira?", placeholder: "" },
  { field: "relacionamentos", prompt: "Como estão seus relacionamentos?", placeholder: "" },
  { field: "autoimagem", prompt: "Como você se enxerga hoje?", placeholder: "" },
  { field: "desejaMudar", prompt: "O que mais deseja mudar?", placeholder: "" },
  { field: "medos", prompt: "O que mais teme?", placeholder: "" },
  { field: "crencasDinheiro", prompt: "O que você acredita sobre dinheiro?", placeholder: "" },
  { field: "crencasAmor", prompt: "O que você acredita sobre amor?", placeholder: "" },
  { field: "crencasSucesso", prompt: "O que você acredita sobre sucesso?", placeholder: "" },
  { field: "reacaoAoErro", prompt: "Como você reage quando algo dá errado?", placeholder: "" },
  { field: "padroesRepetidos", prompt: "Quais padrões você sente que se repetem na sua vida?", placeholder: "" },
  {
    field: "tercaFeiraIdeal",
    prompt:
      "Se sua vida estivesse exatamente como você deseja, como seria uma terça-feira comum?",
    placeholder: "Onde você acorda, quem está ao seu lado, como passa o dia, como se sente...",
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: { navigation: Nav }) {
  const { refresh } = useUser();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [current, setCurrent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  async function handleNext() {
    if (!current.trim()) return;
    const nextAnswers = { ...answers, [question.field]: current.trim() };
    setAnswers(nextAnswers);
    setCurrent("");

    if (!isLast) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { dna } = await onboardingApi.submit(nextAnswers as OnboardingAnswers);
      await refresh();
      navigation.replace("DNAReveal", { dna });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível continuar agora.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginBottom: spacing.xl }}>
        <Label>
          {step + 1} de {QUESTIONS.length}
        </Label>
      </View>
      <Body>{question.prompt}</Body>
      <View style={{ height: spacing.lg }} />
      <TextField
        value={current}
        onChangeText={setCurrent}
        placeholder={question.placeholder}
        multiline
      />
      {error && (
        <View style={{ marginTop: spacing.md }}>
          <Body>{error}</Body>
        </View>
      )}
      <View style={{ height: spacing.xl }} />
      <PrimaryButton
        label={isLast ? "Concluir" : "Continuar"}
        onPress={handleNext}
        loading={submitting}
        disabled={!current.trim()}
      />
      {step > 0 && (
        <SecondaryButton
          label="Voltar"
          onPress={() => {
            setStep(step - 1);
            setCurrent((answers[QUESTIONS[step - 1].field] as string) ?? "");
          }}
        />
      )}
    </Screen>
  );
}
