/**
 * Paleta cinematográfica/minimalista: fundo quase preto, texto off-white quente,
 * um único acento (dourado apagado) usado com moderação. Sem gradientes néon,
 * sem roxo/estrelas/símbolos místicos — ver docs/produto/02-arquitetura-produto.md.
 */
export const colors = {
  background: "#0B0B0D",
  surface: "#15151833",
  surfaceRaised: "#1C1C20",
  border: "#2A2A2E",
  textPrimary: "#F4F1EA",
  textSecondary: "#A9A6A0",
  textMuted: "#6E6B66",
  accent: "#C9A227",
  danger: "#B9543F",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: "300" as const,
    letterSpacing: 0.5,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    color: colors.textMuted,
  },
};
