/**
 * Manifesto oficial de Assets Sonoros - Sons para Awareness
 * Instituto Figura Viva - Registro Confluência
 * Cada som possui metadados completos de licença, duração, MIME, autoria e descrição textual acessível.
 */

import { GuidedScene, SoundAssetManifest, SoundId } from '../types';

export const SOUND_LIBRARY_MANIFEST: Record<SoundId, SoundAssetManifest> = {
  'agua-corrente': {
    id: 'agua-corrente',
    title: 'Água Corrente',
    description: 'Fluxo límpido de um riacho sereno contornando seixos lisos.',
    category: 'Água & Fluidez',
    durationSeconds: 60,
    author: 'Acervo Acústico Figura Viva / CC Natureza',
    license: 'Creative Commons CC-BY 4.0',
    sourceUrl: '/assets/sounds/agua-corrente.wav',
    mimeType: 'audio/wav',
    sizeBytes: 1048576, // 1 MB
    version: '1.2.0',
    textualDescription:
      'Murmúrio líquido constante de frequências médias com estalidos sutis de bolhas que se desfazem ritmicamente na margem.',
    defaultPosition: { x: -0.6, y: 0.2, distanceTier: 'medio', label: 'À esquerda e ligeiramente à frente' },
  },
  'folhas-vento': {
    id: 'folhas-vento',
    title: 'Folhas ao Vento',
    description: 'Sussurro de copas de árvores acariciadas por uma brisa amena de entardecer.',
    category: 'Vento & Vegetação',
    durationSeconds: 60,
    author: 'Acervo Acústico Figura Viva / CC Natureza',
    license: 'Creative Commons CC-BY 4.0',
    sourceUrl: '/assets/sounds/folhas-vento.wav',
    mimeType: 'audio/wav',
    sizeBytes: 1048576,
    version: '1.1.0',
    textualDescription:
      'Frêmito suave de folhagens com modulações dinâmicas de intensidade, remetendo ao toque contínuo do vento entre galhos altos.',
    defaultPosition: { x: 0.5, y: -0.4, distanceTier: 'longe', label: 'À direita e atrás' },
  },
  'chuva-suave': {
    id: 'chuva-suave',
    title: 'Chuva Suave',
    description: 'Precipitação mansa caindo sobre terra fofa e folhas largas.',
    category: 'Atmosfera & Chuva',
    durationSeconds: 60,
    author: 'Acervo Acústico Figura Viva / CC Natureza',
    license: 'Creative Commons CC-BY 4.0',
    sourceUrl: '/assets/sounds/chuva-suave.wav',
    mimeType: 'audio/wav',
    sizeBytes: 1048576,
    version: '1.2.0',
    textualDescription:
      'Manta contínua de microimpactos orgânicos, gerando uma textura aveludada e homogênea de ruído natural relaxante.',
    defaultPosition: { x: 0.0, y: 0.7, distanceTier: 'medio', label: 'À frente central' },
  },
  'passaro-distante': {
    id: 'passaro-distante',
    title: 'Pássaro Distante',
    description: 'Trinado sutil e espaçado vindo da mata mais profunda.',
    category: 'Fauna & Espaço',
    durationSeconds: 60,
    author: 'Acervo Acústico Figura Viva / CC Natureza',
    license: 'Creative Commons CC-BY 4.0',
    sourceUrl: '/assets/sounds/passaro-distante.wav',
    mimeType: 'audio/wav',
    sizeBytes: 1048576,
    version: '1.0.0',
    textualDescription:
      'Chilreio melódico agudo em intervalos irregulares, com reverberação aberta sugerindo distância na clareira florestal.',
    defaultPosition: { x: 0.7, y: 0.5, distanceTier: 'longe', label: 'À direita distante' },
  },
};

export const GUIDED_SCENES: GuidedScene[] = [
  {
    id: 'cena-1-nascente',
    soundId: 'agua-corrente',
    title: 'Cena I — A Nascente no Caminho',
    configuredPosition: { x: -0.7, y: 0.1, distanceTier: 'medio', label: 'À esquerda' },
    revealedDescription:
      'Nesta cena, o som foi posicionado à esquerda, a uma distância intermediária.',
    guidanceNote:
      'Observe como o murmúrio da água se manifesta no seu campo auditivo. A percepção pode variar conforme o ambiente e o dispositivo.',
  },
  {
    id: 'cena-2-copa',
    soundId: 'folhas-vento',
    title: 'Cena II — Brisa nas Alturas',
    configuredPosition: { x: 0.6, y: -0.5, distanceTier: 'longe', label: 'À direita e atrás' },
    revealedDescription:
      'Nesta cena, o som foi posicionado à direita e em plano traseiro, a maior distância.',
    guidanceNote:
      'Diferenciar frente e trás depende muito de fones de ouvido e acústica pessoal. Não há resposta errada.',
  },
  {
    id: 'cena-3-terra-molhada',
    soundId: 'chuva-suave',
    title: 'Cena III — Acolhimento da Chuva',
    configuredPosition: { x: 0.0, y: 0.3, distanceTier: 'perto', label: 'À frente e próximo' },
    revealedDescription:
      'Nesta cena, a chuva suave foi posicionada à frente, em plano de proximidade.',
    guidanceNote:
      'Perceba a textura e a sensação de envolvimento espacial da precipitação sobre o chão.',
  },
  {
    id: 'cena-4-clareira',
    soundId: 'passaro-distante',
    title: 'Cena IV — O Trinado da Clareira',
    configuredPosition: { x: 0.8, y: 0.4, distanceTier: 'longe', label: 'À direita distante' },
    revealedDescription:
      'Nesta cena, o pássaro distante foi posicionado à direita, na margem externa do palco.',
    guidanceNote:
      'Sons intermitentes e agudos revelam como a atenção se desloca entre momentos de presença e silêncio.',
  },
];
