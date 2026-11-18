export type Side = "esquerdo" | "direito";
/** Regiões com lado: direito/esquerdo são os da pessoa (na vista frontal, o direito dela fica à esquerda de quem olha). */
export const PAIRED = ["ombros", "braços", "mãos", "pernas", "pés"] as const;
export const isPaired = (region: string) => (PAIRED as readonly string[]).includes(region);
