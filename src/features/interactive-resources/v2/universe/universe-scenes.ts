/** Convites e texto psicoeducativo dos universos 3D. Sempre abertos: sem pontuação, sem resposta certa. */
export type UniverseKind = "house" | "garden" | "bridge" | "studio" | "island" | "observatory";
export interface UniverseInvitation { title: string; text: string; goal: string }
export interface UniverseConfig {
  kind: UniverseKind; title: string; tagline: string; psycho: string; label: string;
  invitations: UniverseInvitation[]; hotspots: [number, number, number][];
}
const inv = (title: string, text: string, goal: string): UniverseInvitation => ({ title, text, goal });

export const UNIVERSES: Record<UniverseKind, UniverseConfig> = {
  house: {
    kind: "house", title: "Casa das Emoções", label: "Casa 3D",
    tagline: "Um lugar para dar formas, cores e palavras ao que sentimos.",
    psycho: "Emoções são experiências humanas que podem mudar. Podemos sentir mais de uma coisa ao mesmo tempo; não existe emoção proibida ou obrigatoriamente boa.",
    invitations: [
      inv("Alegria", "Como a alegria aparece em você? Ela pode ser pequena, grande ou misturada com outras sensações.", "Identificação e expressão"),
      inv("Tristeza", "Se a tristeza tivesse uma cor ou formato hoje, qual seria? O que ela poderia precisar?", "Acolhimento e necessidades"),
      inv("Raiva", "Onde a raiva aparece no corpo? O que pode ajudar a cuidar de você e dos outros quando ela surge?", "Limites e expressão segura"),
      inv("Medo", "Do que o medo tenta avisar? Você prefere observar de longe, pedir companhia ou fazer uma pausa?", "Segurança e contato"),
      inv("Surpresa", "Nem toda surpresa é igual. Como você percebe a diferença entre curiosidade e desconforto?", "Diferenciação emocional"),
    ],
    hotspots: [[-5.2, 3.35, -.1], [-2.6, 3.35, -.1], [0, 3.35, -.1], [2.6, 3.35, -.1], [5.2, 3.35, -.1]],
  },
  garden: {
    kind: "garden", title: "Jardim dos Sentidos", label: "Jardim 3D",
    tagline: "Descubra cores, texturas e sensações no ritmo do seu corpo.",
    psycho: "Nossos sentidos nos ajudam a perceber o mundo. Prestar atenção ao que escutamos, vemos e sentimos pode ampliar a consciência do momento presente.",
    invitations: [
      inv("O que vejo?", "Encontre três detalhes. Qual deles chamou sua atenção primeiro?", "Percepção visual e figura-fundo"),
      inv("O que escuto?", "Experimente ficar em silêncio por um instante. Que sons ou movimentos você nota?", "Atenção e escuta"),
      inv("Meu corpo avisa", "Observe o corpo da cabeça aos pés. Há alguma parte querendo movimento, descanso ou cuidado?", "Awareness corporal"),
      inv("O que posso escolher?", "Há algo aqui que você gostaria de aproximar, afastar, mudar ou deixar como está?", "Autonomia e limites"),
    ],
    hotspots: [[-4, 1.4, -3], [4, 1.7, -3], [-3, 1.6, 4], [3, 1.6, 4], [0, 1.9, 0]],
  },
  bridge: {
    kind: "bridge", title: "Ponte das Escolhas", label: "Ponte 3D",
    tagline: "Uma travessia com muitos caminhos possíveis.",
    psycho: "Escolher envolve perceber o que queremos, o que precisamos e o que é possível. Pedir ajuda, mudar de ideia ou dizer não também são maneiras de cuidar dos próprios limites.",
    invitations: [
      inv("Primeira possibilidade", "Há um caminho à sua frente. O que você imagina que pode acontecer se for por ele?", "Antecipação sem julgamento"),
      inv("Outra possibilidade", "Que outra opção você consegue encontrar? Qual parece mais confortável agora?", "Flexibilidade"),
      inv("Pedir companhia", "Como seria atravessar com alguém por perto? Quem poderia acompanhar você?", "Apoio e vínculo"),
      inv("Posso dizer não", "Há momentos em que não queremos continuar. Como você poderia comunicar esse limite?", "Assertividade"),
      inv("Recomeçar", "Se a ponte não funcionar como você esperava, o que gostaria de experimentar de outro jeito?", "Criatividade diante de frustração"),
    ],
    hotspots: [[-4, 1.4, -3], [4, 1.7, -3], [-3, 1.6, 4], [3, 1.6, 4], [0, 1.9, 0]],
  },
  studio: {
    kind: "studio", title: "Ateliê do Aqui e Agora", label: "Ateliê 3D",
    tagline: "Criar, transformar e expressar sem precisar acertar.",
    psycho: "Na experimentação criativa, o processo pode ser mais importante que o resultado. Podemos observar o que aparece enquanto desenhamos, construímos, mudamos ou destruímos uma forma.",
    invitations: [
      inv("Uma cor de agora", "Que cor combina com seu momento? Ela pode mudar durante a brincadeira.", "Expressão simbólica"),
      inv("Construção livre", "Imagine algo que represente uma experiência sua. Como você começaria a construir?", "Criatividade e representação"),
      inv("Mudar também vale", "O que acontece quando uma criação não sai como imaginado? Você pode modificar, continuar ou recomeçar.", "Flexibilidade"),
      inv("Dar nome", "Se sua criação pudesse falar, o que ela contaria sobre este momento?", "Narrativa e significado"),
    ],
    hotspots: [[-5, 2.1, 1], [-1, 2.1, 1], [3, 2.1, 1], [5.2, 3.2, -1]],
  },
  island: {
    kind: "island", title: "Ilha dos Encontros", label: "Ilha 3D",
    tagline: "Uma paisagem para explorar o eu, o outro e as distâncias.",
    psycho: "Em cada relação temos necessidades, desejos e limites. É possível buscar proximidade, pedir espaço e encontrar maneiras de conversar e negociar.",
    invitations: [
      inv("Perto e longe", "Qual distância entre as cadeiras parece confortável para uma conversa neste momento?", "Fronteira de contato"),
      inv("Minha vez, sua vez", "Como você percebe quando quer falar e quando prefere escutar?", "Reciprocidade"),
      inv("Dizer o que preciso", "Complete se quiser: agora eu gostaria de...", "Expressão de necessidades"),
      inv("Duas perspectivas", "Como duas pessoas podem sentir coisas diferentes sobre a mesma situação?", "Perspectiva e respeito"),
    ],
    hotspots: [[-4, 1.4, -3], [4, 1.7, -3], [-3, 1.6, 4], [3, 1.6, 4], [0, 1.9, 0]],
  },
  observatory: {
    kind: "observatory", title: "Observatório das Necessidades", label: "Observatório 3D",
    tagline: "Olhar para dentro com a delicadeza de quem observa estrelas.",
    psycho: "Identificar necessidades como descanso, companhia, movimento e segurança ajuda a comunicar o que sentimos. Elas podem variar entre pessoas e situações.",
    invitations: [
      inv("O que eu preciso?", "Neste momento, seu corpo ou sua mente pedem movimento, sossego, companhia ou outra coisa?", "Autopercepção"),
      inv("Meu lugar seguro", "O que ajuda um lugar a parecer acolhedor para você?", "Segurança percebida"),
      inv("Pessoas de apoio", "Com quem você pode conversar quando algo fica difícil?", "Rede de apoio"),
      inv("Minha constelação", "Escolha três coisas ou pessoas importantes para você e imagine como seriam estrelas no céu.", "Recursos pessoais"),
      inv("Um pedido possível", "Se fosse pedir uma ajuda hoje, como gostaria de dizer?", "Comunicação de necessidades"),
    ],
    hotspots: [[-4, 7, 0], [-1, 7.2, -3], [2.2, 7.3, -2.5], [4, 7, 1], [0, 8.3, 0]],
  },
};
