// Referências dos cartões → Amazon. "direto" = página de produto encontrada na busca; "busca" = pesquisa no site (título não confirmado).
export interface AmazonLink { work: string; url: string; kind: "direto" | "busca" }
export const AMAZON_LINKS: AmazonLink[] = [
  {"work": "Eu e Tu", "url": "https://www.amazon.com.br/dp/8588208164", "kind": "direto"},
  {"work": "Pele negra, máscaras brancas", "url": "https://www.amazon.com.br/dp/6586497205", "kind": "direto"},
  {"work": "Gestalt-terapia: fundamentos epistemológicos e influências filosóficas", "url": "https://www.amazon.com.br/s?k=Gestalt-terapia%3A+fundamentos+epistemol%C3%B3gicos+e+influ%C3%AAncias+filos%C3%B3ficas+Lilian+Meyer+Fraz%C3%A3o+e+Karina+Okajima+Fukumitsu+%28org.%29", "kind": "busca"},
  {"work": "Pedagogia do oprimido", "url": "https://www.amazon.com.br/dp/8577534189", "kind": "direto"},
  {"work": "Gestalt: uma terapia do contato", "url": "https://www.amazon.com.br/dp/8532304524", "kind": "direto"},
  {"work": "De pessoa a pessoa: psicoterapia dialógica", "url": "https://www.amazon.com.br/dp/8532304559", "kind": "direto"},
  {"work": "Relação e cura em Gestalt-terapia", "url": "https://www.amazon.com.br/s?k=Rela%C3%A7%C3%A3o+e+cura+em+Gestalt-terapia+Richard+Hycner+e+Lynne+Jacobs", "kind": "busca"},
  {"work": "Ideias para adiar o fim do mundo", "url": "https://www.amazon.com.br/s?k=Ideias+para+adiar+o+fim+do+mundo+Ailton+Krenak", "kind": "busca"},
  {"work": "Princípios de psicologia topológica", "url": "https://www.amazon.com.br/dp/B09NGZ7P99", "kind": "direto"},
  {"work": "Fenomenologia da percepção", "url": "https://www.amazon.com.br/dp/8546902313", "kind": "direto"},
  {"work": "Ego, fome e agressão", "url": "https://www.amazon.com.br/s?k=Ego%2C+fome+e+agress%C3%A3o+Frederick+%28Fritz%29+Perls", "kind": "busca"},
  {"work": "Gestalt-terapia explicada", "url": "https://www.amazon.com.br/s?k=Gestalt-terapia+explicada+Frederick+%28Fritz%29+Perls", "kind": "busca"},
  {"work": "Gestalt-terapia", "url": "https://www.amazon.com.br/dp/853230625X", "kind": "direto"},
  {"work": "Living at the boundary", "url": "https://www.amazon.com/dp/0939266512", "kind": "direto"},
  {"work": "Gestalt-terapia integrada", "url": "https://www.amazon.com.br/dp/8532307590", "kind": "direto"},
  {"work": "O ciclo do contato: temas básicos na abordagem gestáltica", "url": "https://www.amazon.com.br/dp/655549042X", "kind": "direto"},
  {"work": "O self desdobrado: perspectiva de campo em Gestalt-terapia", "url": "https://www.amazon.com.br/dp/8532308457", "kind": "direto"},
  {"work": "Processo, diálogo e awareness: ensaios em Gestalt-terapia", "url": "https://www.amazon.com.br/dp/8532306632", "kind": "direto"},
  {"work": "Processo criativo em Gestalt-terapia", "url": "https://www.amazon.com.br/dp/8532308538", "kind": "direto"},
  {"work": "Psicologia da Gestalt", "url": "https://www.amazon.com.br/dp/8531903513", "kind": "direto"},
];
const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
/** Link da Amazon para uma obra citada; sem correspondência, uma busca pelo autor e título. */
export function amazonLinkFor(author: string, work: string): AmazonLink {
  const key = normalize(work);
  const found = AMAZON_LINKS.find(item => normalize(item.work) === key);
  return found ?? { work, kind: "busca", url: `https://www.amazon.com.br/s?k=${encodeURIComponent(`${work} ${author}`)}` };
}
