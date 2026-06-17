// Veloz Maintenance AI — premium fleet-tech design system

export const Colors = {
  // Brand
  navy: "#050B18",
  navy2: "#0A1628",
  navy3: "#0F1F38",
  panel: "#142847",
  panelHi: "#1B355F",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(120,180,255,0.18)",

  // Accents
  blue: "#3D8BFF",
  blueDeep: "#1E5BFF",
  cyan: "#5EE7FF",
  electric: "#7CC4FF",

  // Text
  text: "#EAF1FB",
  textMuted: "#8FA3C2",
  textDim: "#5F7494",

  // Status (operational color system)
  green: "#22D399",
  greenSoft: "rgba(34,211,153,0.14)",
  amber: "#FFB547",
  amberSoft: "rgba(255,181,71,0.14)",
  red: "#FF5470",
  redSoft: "rgba(255,84,112,0.14)",

  // Misc
  white: "#FFFFFF",
  glass: "rgba(255,255,255,0.04)",
} as const;

export const Gradients = {
  bg: ["#050B18", "#091428", "#0A1628"] as const,
  card: ["#13294C", "#0E1E3A"] as const,
  cardHi: ["#1E407A", "#102246"] as const,
  blue: ["#3D8BFF", "#1E5BFF"] as const,
  cyan: ["#5EE7FF", "#3D8BFF"] as const,
  green: ["#22D399", "#0FA67A"] as const,
  amber: ["#FFD27A", "#FF9D24"] as const,
  red: ["#FF7A91", "#E2334E"] as const,
  steel: ["#27406B", "#0E1E3A"] as const,
};

export type StatusKey = "operational" | "attention" | "out";

export const statusMeta: Record<StatusKey, { label: string; color: string; soft: string; dot: string }> = {
  operational: { label: "Road Ready", color: Colors.green, soft: Colors.greenSoft, dot: Colors.green },
  attention: { label: "Service Due", color: Colors.amber, soft: Colors.amberSoft, dot: Colors.amber },
  out: { label: "Out of Service", color: Colors.red, soft: Colors.redSoft, dot: Colors.red },
};

export default Colors;
