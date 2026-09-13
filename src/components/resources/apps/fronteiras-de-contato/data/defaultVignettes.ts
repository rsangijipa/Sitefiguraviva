import { Vignette } from "../types";

export const DEFAULT_VIGNETTES: Vignette[] = [
  {
    id: "vig-1-trabalho-urgencia",
    title: "A Mensagem de Urgência no Fim de Semana",
    category: "Trabalho & Profissional",
    context:
      "Você integra uma equipe com entregas complexas e construiu uma reputação de disponibilidade e eficiência.",
    situation:
      "No sábado à noite, durante um momento de descanso com pessoas queridas, sua liderança direta envia três mensagens consecutivas pedindo um parecer sobre um relatório que será apresentado na segunda-feira pela manhã.",
    responses: [
      {
        id: "resp-1a",
        movementType: "approach",
        relationalMovementLabel: "Aproximação / Confluência com a Demanda",
        actionText:
          'Interromper o momento de descanso imediatamente, abrir o computador, enviar o parecer completo e justificar: "Prontinho! Desculpe a demora, estava fora."',
        distanceDelta: -45,
        fieldDynamic: {
          label: "Fronteira Porosa / Confluência",
          boundaryState: "confluent",
          separationDistance: 35,
          tensionLevel: "high",
          organicDescription:
            "Os dois campos se fundem quase sem membrana protetora. A urgência do outro invade integralmente o espaço próprio de repouso.",
        },
        possibleReadings: [
          "Tentativa de manter a imagem de competência, controle e confiabilidade inabalável.",
          "Medo de desapontar a figura de autoridade ou de sofrer retaliações tácitas no ambiente corporativo.",
          "Dificuldade em tolerar a ansiedade do outro suspensa até o próximo dia útil.",
          "Ajuste relacional que preserva alianças no curto prazo, mas acumula erosão interna e ressentimento crônico.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Confluência e Porosidade de Fronteira",
          didacticExplanation:
            'Em situações corporativas, a resposta confluente não é "incorreta" se houver uma crise real de sobrevivência institucional. Porém, quando repetida como padrão habitual, sinaliza uma fronteira de contato excessivamente porosa, onde o organismo assume a ansiedade alheia como sua antes de checar a necessidade própria.',
        },
      },
      {
        id: "resp-1b",
        movementType: "withdrawal",
        relationalMovementLabel: "Afastamento / Silêncio Defensivo",
        actionText:
          "Desligar as notificações do aplicativo, não responder a nenhuma mensagem e só abrir a conversa na segunda-feira às 08h59, agindo com frieza.",
        distanceDelta: 60,
        fieldDynamic: {
          label: "Fronteira Rígida / Retirada Abrupta",
          boundaryState: "rigid",
          separationDistance: 190,
          tensionLevel: "moderate",
          organicDescription:
            "Os dois campos se afastam bruscamente. A membrana se torna opaca e impenetrável; protege o espaço interno, mas congela a comunicação.",
        },
        possibleReadings: [
          "Tentativa urgente de autopreservação e resguardo do espaço privado diante de uma invasão.",
          "Punição silenciosa ao invasor, sem nomear a questão de forma clara.",
          "Possibilidade de alimentar fantasias catastróficas ou ansiedade durante o resto do fim de semana por não ter comunicado a posição.",
          "Estratégia protetiva funcional se a relação já for caracterizada por assédio ou abuso relacional.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Retirada e Rigidez de Fronteira",
          didacticExplanation:
            "O afastamento total preserva a autonomia imediata, mas quando feito com silenciamento hostil ou sem balizamento mínimo, pode transferir a tensão para o corpo na forma de retroflexão (engolir a raiva) ou criar ruídos desnecessários no campo.",
        },
      },
      {
        id: "resp-1c",
        movementType: "boundary",
        relationalMovementLabel: "Expressão Clara de Limite com Contato",
        actionText:
          'Enviar uma mensagem curta e serena: "Olá. Estou em momento de descanso com a família. Segunda-feira às 08h30 analiso o parecer e envio antes da apresentação."',
        distanceDelta: 0,
        fieldDynamic: {
          label: "Fronteira Clara e Semipermeável",
          boundaryState: "clear",
          separationDistance: 110,
          tensionLevel: "low",
          organicDescription:
            "Ambos os campos mantêm identidades distintas e respeitadas. Há uma membrana flexível que comunica presença sem permitir a invasão.",
        },
        possibleReadings: [
          "Diferenciação clara entre o tempo de trabalho e o tempo de vida, comunicada sem agressividade nem submissão.",
          "Disposição para sustentar o desconforto inicial da recusa temporária em nome da sustentabilidade do vínculo.",
          "Sinalização de previsibilidade (define dia e horário precisos para o retorno).",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: true,
          objectiveAnswerNote:
            "Resposta didaticamente referenciada pelo Instituto como comunicação assertiva de contato.",
          conceptName: "Fronteira de Contato Diferenciada",
          didacticExplanation:
            "O Instituto considera este movimento como o protótipo de contato maduro: não há confluência (não se abre mão da própria integridade) nem isolamento destrutivo (o outro não é ignorado nem punido). O contato acontece precisamente na fronteira onde Eu e Outro se reconhecem.",
        },
      },
    ],
    reflectiveQuestion:
      "Quando alguém atravessa seu tempo sagrado de descanso, você tende a se acomodar para evitar atrito ou se fecha em silêncio com ressentimento? Qual seria o preço de pronunciar seu limite?",
    instituteCoreLesson:
      "A fronteira de contato saudável não é nem um muro de concreto impermeável nem uma ausência de parede: é uma membrana viva, sensível e responsiva ao contexto.",
  },
  {
    id: "vig-2-amizade-desabafo",
    title: "O Desabafo Ininterrupto na Amizade",
    category: "Amizades & Grupos",
    context:
      "Uma amizade de muitos anos está atravessando um término doloroso há cerca de seis meses.",
    situation:
      "Vocês marcaram um café para comemorar uma conquista profissional importante sua. No entanto, logo nos primeiros minutos, a pessoa começa um monólogo carregado de mágoas sobre o ex-parceiro, e a conversa já dura uma hora sem que ela pergunte nada sobre a sua vida.",
    responses: [
      {
        id: "resp-2a",
        movementType: "approach",
        relationalMovementLabel: "Absorção / Esquecimento de Si",
        actionText:
          'Ouvir pacientemente com acenos constantes, guardar a própria comemoração em segredo para não parecer "egoísta" e continuar consolando a pessoa até o final da tarde.',
        distanceDelta: -40,
        fieldDynamic: {
          label: "Campo Absortivo / Confluência Empática",
          boundaryState: "confluent",
          separationDistance: 45,
          tensionLevel: "moderate",
          organicDescription:
            "O campo do Eu se desvanece para abrigar a dor do Outro. O equilíbrio energético se torna assimétrico.",
        },
        possibleReadings: [
          "Generosidade compassiva e suporte leal a quem está em vulnerabilidade.",
          "Invisibilização da própria necessidade de celebração e de ser visto pelo outro.",
          "Alimentação involuntária de uma dinâmica onde a amizade só tem espaço para uma das partes.",
          "Risco de desgaste cumulativo e explosão tardia por negligência de si.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Deflexão e Confluência Cuidadora",
          didacticExplanation:
            "O cuidado empático é indispensável nas relações humanas, mas quando uma pessoa sistematicamente se anula para acolher o outro, a relação deixa de ser de contato Eu-Tu e passa a ser funcionalizada. Não há resposta única: em luto agudo, acolher pode ser prioritário; em dores crônicas, sustentar o próprio espaço é vital.",
        },
      },
      {
        id: "resp-2b",
        movementType: "withdrawal",
        relationalMovementLabel: "Desconexão Interna / Afastamento Físico",
        actionText:
          'Inventar repentinamente um compromisso inadiável ("nossa, esqueci que tenho médico"), pagar a conta apressadamente e passar as semanas seguintes evitando atender as ligações da pessoa.',
        distanceDelta: 75,
        fieldDynamic: {
          label: "Recuo Evasivo / Fronteira Retraída",
          boundaryState: "withdrawn",
          separationDistance: 185,
          tensionLevel: "high",
          organicDescription:
            "O Eu recua abruptamente sem oferecer fechamento ou explicação. A distância se amplia por esquiva da conversa difícil.",
        },
        possibleReadings: [
          "Esgotamento emocional agudo sem recursos no momento para mediar o diálogo.",
          "Medo de confrontar a pessoa em sofrimento e ser julgado como insensível.",
          "Abandono velado que deixa a outra pessoa desorientada e fragilizada.",
          "Padrão de descontinuidade relacional quando o contato se torna desconfortável.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Deflexão por Evasão",
          didacticExplanation:
            "Defletir (mudar de assunto ou escapar fisicamente) é um mecanismo comum quando a pessoa não se sente autorizada a colocar um limite verbal. Embora poupe o confronto imediato, costuma corroer a confiança mútua.",
        },
      },
      {
        id: "resp-2c",
        movementType: "boundary",
        relationalMovementLabel: "Expressão de Contato com Dupla Presença",
        actionText:
          'Tocar suavemente a mão da pessoa, acolher sua dor e colocar: "Sei como isso está doendo em você e estou aqui. Mas hoje eu também trouxe algo muito importante pra mim que gostaria de compartilhar com você. Podemos abrir um espaço para o meu momento agora?"',
        distanceDelta: 0,
        fieldDynamic: {
          label: "Fronteira com Troca Recíproca",
          boundaryState: "clear",
          separationDistance: 100,
          tensionLevel: "low",
          organicDescription:
            "Os dois campos se tocam na fronteira sem se invadirem. Há espaço para a dor de um e para a alegria do outro no mesmo horizonte relacional.",
        },
        possibleReadings: [
          "Capacidade de sustentar simultaneamente a empatia pelo outro e a validação de si.",
          "Convite para que o amigo saia temporariamente da espiral de ruminação e exercite alteridade.",
          "Risco de que o amigo reaja defensivamente se estiver muito egocentrado na dor.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: true,
          objectiveAnswerNote:
            "Considerada a resposta com maior potencial de reciprocidade transformadora.",
          conceptName: "Encontro Dialógico e Fronteira de Contato",
          didacticExplanation:
            "O Instituto ressalta que o contato saudável exige duas presenças inteiras. Afirmar o próprio desejo de compartilhar não diminui a compaixão; pelo contrário, resgata a amizade da armadilha do atendimento unilateral.",
        },
      },
    ],
    reflectiveQuestion:
      "Quando a dor do outro monopoliza o espaço, o que acontece com a sua voz? Você costuma se calar por culpa de existir ou consegue convidar o outro à reciprocidade?",
    instituteCoreLesson:
      "Amizade genuína requer a capacidade de alternar quem sustenta e quem é sustentado. Onde só um fala, não há fronteira de contato: há saturação de um lado e deserção do outro.",
  },
  {
    id: "vig-3-familia-intrusao",
    title: "A Opinião Não Solicitada no Almoço Familiar",
    category: "Família & Convivência",
    context:
      "Você escolheu uma transição de carreira ou estilo de vida que foge das expectativas tradicionais de sua família de origem.",
    situation:
      'No almoço de domingo com toda a família reunida, um familiar próximo faz um comentário depreciativo em tom de piada sobre sua estabilidade financeira e questiona na frente de todos quando você vai "criar juízo".',
    responses: [
      {
        id: "resp-3a",
        movementType: "withdrawal",
        relationalMovementLabel: "Afastamento Silencioso com Retroflexão",
        actionText:
          "Engolir a seco, forçar um sorriso amarelo, abaixar os olhos para o prato e passar o restante do almoço em silêncio mastigando com tensão no maxilar.",
        distanceDelta: 40,
        fieldDynamic: {
          label: "Contração Interna / Retroflexão",
          boundaryState: "rigid",
          separationDistance: 150,
          tensionLevel: "high",
          organicDescription:
            "O campo do Eu se contrai para dentro de suas próprias fronteiras. A energia que se dirigiria ao ambiente é redirecionada contra o próprio corpo.",
        },
        possibleReadings: [
          "Preservação da paz coletiva do almoço a expensas da humilhação pessoal.",
          "Lealdade aos pactos familiares implícitos de hierarquia ou não confronto.",
          "Sintomatização corporal da raiva não dita (gastrite, cefaleia, tensão muscular).",
          "Estratégia temporária de contenção para evitar uma briga generalizada diante de idosos ou crianças.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Retroflexão",
          didacticExplanation:
            "Retroflexão é o ato de fazer a si mesmo aquilo que se gostaria de fazer ao outro (ou ao ambiente). Em contextos familiares autoritários, pode ser um ajuste de sobrevivência inteligente, mas quando crônico, torna o corpo o depositário de mágoas não expressas.",
        },
      },
      {
        id: "resp-3b",
        movementType: "approach",
        relationalMovementLabel: "Contra-ataque Reativo / Explosão",
        actionText:
          "Bater na mesa, apontar os fracassos e hipocrisias daquele familiar na frente de todos e gritar que ninguém ali tem moral para julgar suas escolhas de vida.",
        distanceDelta: -30,
        fieldDynamic: {
          label: "Colisão Frontal / Ruptura Dramática",
          boundaryState: "porous",
          separationDistance: 50,
          tensionLevel: "high",
          organicDescription:
            "Os dois campos colidem com violência. As fronteiras se perdem na fúria e o campo se desestabiliza em torno da desavença.",
        },
        possibleReadings: [
          "Descarga catártica de anos de microagressões acumuladas.",
          "Demonstração crua de vulnerabilidade ferida e tentativa desesperada de demarcar autonomia.",
          'Efeito colateral: desvia a atenção da inadequação do agressor e coloca o sujeito no papel de "descontrolado".',
          "Possível ruptura prolongada de laços familiares importantes.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Reatividade e Ruptura de Fronteira",
          didacticExplanation:
            "Reagir agressivamente muitas vezes parece expressão de limite, mas na perspectiva didática do Instituto trata-se de perda de fronteira: a ofensa alheia desregulou o sujeito a ponto de ele ser comandado pela provocação do outro em vez de responder pelo seu próprio centro.",
        },
      },
      {
        id: "resp-3c",
        movementType: "boundary",
        relationalMovementLabel: "Demarcação Firme e Serena de Limite",
        actionText:
          'Olhar diretamente nos olhos do familiar, modular a voz com calma e dizer: "Minhas escolhas profissionais e meu caminho de vida não são pauta de piada nesta mesa. Esse assunto diz respeito a mim."',
        distanceDelta: 0,
        fieldDynamic: {
          label: "Fronteira Firme e Inegociável",
          boundaryState: "clear",
          separationDistance: 115,
          tensionLevel: "low",
          organicDescription:
            "A membrana se torna nítida, firme e protegida, sem invadir nem se desintegrar. O limite é estabelecido com dignidade e compostura.",
        },
        possibleReadings: [
          "Posicionamento de adulto diante de outros adultos, rompendo dinâmicas de infantilização.",
          "Nomeação clara do comportamento inaceitável sem entrar no mérito do debate nem devolver a provocação.",
          "Capacidade de sustentar o silêncio constrangedor subsequente sem pedir desculpas por ter se defendido.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: true,
          objectiveAnswerNote:
            "Resposta referenciada didaticamente como Diferenciação de Si com autoridade relacional.",
          conceptName: "Diferenciação do Eu na Família",
          didacticExplanation:
            'O Instituto destaca que a fronteira madura em sistemas familiares requer falar na primeira pessoa ("eu"), delimitar o território inviolável e recusar o convite à briga teatral. A calma firme desativa a dinâmica da provocação.',
        },
      },
    ],
    reflectiveQuestion:
      "Como o seu corpo reage quando sua autonomia é diminuída por quem deveria torcer por você? Você teme mais a desaprovação da família ou a traição aos seus próprios valores?",
    instituteCoreLesson:
      "Diferenciação não é indiferença nem briga: é a coragem de permanecer você mesmo mesmo quando o grupo ao seu redor exige que você volte a caber na gaveta deles.",
  },
  {
    id: "vig-4-casal-necessidade",
    title: "O Desejo de Solidão Dentro do Vínculo Amoroso",
    category: "Relações Afetivas",
    context:
      "Você e seu/sua parceira moram juntos e têm uma rotina intensa de trabalho e convivência.",
    situation:
      "Depois de uma semana estressante, você percebe uma necessidade visceral de passar o sábado inteiro a sós, em silêncio, lendo e caminhando. O parceiro, no entanto, planejou carinhosamente um passeio a dois de dia inteiro como surpresa.",
    responses: [
      {
        id: "resp-4a",
        movementType: "approach",
        relationalMovementLabel: "Submissão Culposa / Acompanhar sem Vontade",
        actionText:
          "Fingir entusiasmo imediato com a surpresa, passar o dia no passeio com um cansaço surdo e, no final do dia, irritar-se com facilidade com detalhes bobos da rotina.",
        distanceDelta: -35,
        fieldDynamic: {
          label: "Aproximação Não Autêntica / Confluência Tóxica",
          boundaryState: "confluent",
          separationDistance: 40,
          tensionLevel: "moderate",
          organicDescription:
            "Os corpos estão juntos espacialmente, mas a ausência de desejo autêntico cria um campo pesado de dissonância e falsidade disfarçada.",
        },
        possibleReadings: [
          'Dificuldade de dizer "não" ao amor por medo de ser interpretado como rejeição ou desamor.',
          "Priorização do sentimento do outro em detrimento do próprio equilíbrio fisiológico e psíquico.",
          "Vazamento posterior de hostilidade passiva decorrente da insatisfação reprimida.",
          "Alimenta a ideia de que intimidade amorosa exige renúncia contínua da individualidade.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Falso Contato e Confluência Neurótica",
          didacticExplanation:
            "Estar presente de corpo e ausente de alma é uma forma frequente de desencontro afetivo. A confluência para evitar frustrar o parceiro quase sempre gera uma fatura invisível que será cobrada mais adiante em forma de irritabilidade ou desinteresse sexual.",
        },
      },
      {
        id: "resp-4b",
        movementType: "boundary",
        relationalMovementLabel: "Negociação Afetiva de Espaço e Reencontro",
        actionText:
          'Abraçar a pessoa com afeto genuíno, agradecer o cuidado da surpresa e explicar: "Amo seu cuidado, mas estou no meu limite de saturação mental. Preciso muito deste sábado em silêncio comigo mesmo para recarregar. Podemos fazer esse mesmo passeio juntos amanhã ou no próximo sábado?"',
        distanceDelta: 15,
        fieldDynamic: {
          label: "Fronteira Elástica e Afetiva",
          boundaryState: "clear",
          separationDistance: 95,
          tensionLevel: "low",
          organicDescription:
            "A membrana se abre para validar o gesto do outro, mas demarca com carinho a necessidade própria, apontando uma ponte segura para o reencontro futuro.",
        },
        possibleReadings: [
          "Diferenciação da necessidade individual sem desvalorizar o carinho da parceria.",
          "Oferecimento de uma alternativa concreta no tempo, dissipando a fantasia de desamor.",
          "Confiança na musculatura do vínculo para suportar pequenas frustrações temporárias.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: true,
          objectiveAnswerNote:
            "Didaticamente apresentada como a arte do Contato com Retirada Saudável.",
          conceptName: "Ritmo Contato-Retirada",
          didacticExplanation:
            "Na perspectiva do Instituto, a vida relacional é uma respiração: inspirar (contato) e expirar (retirada). Quando não há permissão para a retirada, o contato se torna sufocante e empobrecido.",
        },
      },
      {
        id: "resp-4c",
        movementType: "withdrawal",
        relationalMovementLabel: "Rejeição Seca / Fechamento Defensivo",
        actionText:
          'Dizer secamente: "Você devia ter me perguntado antes. Não vou a lugar nenhum hoje, preciso ficar em paz", trancar-se no quarto e colocar os fones de ouvido.',
        distanceDelta: 65,
        fieldDynamic: {
          label: "Isolamento Defensivo / Egotismo",
          boundaryState: "rigid",
          separationDistance: 175,
          tensionLevel: "high",
          organicDescription:
            "A barreira é erguida como uma muralha áspera. O carinho do outro é repelido com frieza punitiva, gerando mágoa e sensação de rejeição.",
        },
        possibleReadings: [
          "Sensação de que qualquer oferta do outro representa uma invasão e perda de liberdade.",
          "Dificuldade de lidar com a vulnerabilidade e transformar uma necessidade em pedido amoroso.",
          "Mecanismo de proteção que ataca para evitar ser engolfado pela relação.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Egotismo e Hiperindividualismo",
          didacticExplanation:
            "Embora a necessidade de ficar sozinho seja legítima, a forma hostil de comunicá-la revela uma fronteira hiperdefensiva (egotismo), na qual o indivíduo se protege do encontro como se todo contato fosse uma ameaça à sua autonomia.",
        },
      },
    ],
    reflectiveQuestion:
      "Para você, o que significa pedir distância em uma relação amorosa? A solidão soa como uma recarga nutritiva ou como uma ameaça velada de abandono?",
    instituteCoreLesson:
      "Quem não sabe se retirar sem agredir também não sabe se aproximar sem sufocar. A intimidade requer duas pessoas que suportem estar sozinhas diante do outro.",
  },
  {
    id: "vig-5-autonomia-favor",
    title: "O Empréstimo Financeiro para Parente Distante",
    category: "Autonomia & Limites",
    context:
      "Você organizou suas finanças com muito sacrifício pessoal ao longo de anos para construir uma reserva de segurança.",
    situation:
      'Um familiar distante com histórico de endividamentos crônicos e más escolhas liga pedindo uma quantia significativa emprestada com a promessa informal de "devolver no mês que vem", afirmando que você é a última esperança dele.',
    responses: [
      {
        id: "resp-5a",
        movementType: "approach",
        relationalMovementLabel: "Ceder por Culpa / Resgate Salvador",
        actionText:
          "Emprestar o dinheiro mesmo sabendo que a chance de retorno é mínima, comprometendo sua própria reserva de emergência e passando noites com insônia e preocupação.",
        distanceDelta: -45,
        fieldDynamic: {
          label: "Confluência pelo Papel de Salvador",
          boundaryState: "confluent",
          separationDistance: 30,
          tensionLevel: "high",
          organicDescription:
            "O Eu assume as consequências das escolhas alheias. As contas e dores do outro vazam integralmente para o território pessoal.",
        },
        possibleReadings: [
          "Vulnerabilidade à chantagem emocional e crença de que recusar equivale a causar o mal do outro.",
          "Fantasia onipotente de salvação que desresponsabiliza o familiar.",
          'Sacrifício da segurança pessoal para manter o estatuto de "bom parente" no imaginário coletivo.',
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Triângulo Dramático (O Salvador)",
          didacticExplanation:
            "Salvar alguém às custas da própria integridade é uma armadilha relacional. A confluência culposa não educa o outro e invariavelmente transforma o salvador em futura vítima ressentida ou em perseguidor quando o dinheiro não for devolvido.",
        },
      },
      {
        id: "resp-5b",
        movementType: "withdrawal",
        relationalMovementLabel: "Mentira Protetiva / Esquiva",
        actionText:
          "Inventar que está completamente sem dinheiro no banco, desculpar-se mil vezes e depois evitar frequentar eventos familiares onde possa encontrar a pessoa.",
        distanceDelta: 50,
        fieldDynamic: {
          label: "Fronteira Oculta com Engano",
          boundaryState: "rigid",
          separationDistance: 160,
          tensionLevel: "moderate",
          organicDescription:
            "O sujeito se esconde atrás de uma cortina de fumaça. A fronteira real não é assumida abertamente, exigindo mentiras contínuas para se sustentar.",
        },
        possibleReadings: [
          'Dificuldade de sustentar o "não" puro e assumir que tem recursos mas escolhe não emprestar.',
          "Necessidade de justificativa externa insuperável para se autorizar a negar um pedido.",
          "Estratégia pragmática de menor atrito em famílias altamente manipuladoras.",
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: false,
          conceptName: "Deflexão e Não Apropriação do Desejo",
          didacticExplanation:
            "Embora resolva o problema imediato do dinheiro, a mentira impede o sujeito de experimentar o poder e a autoridade da sua própria recusa. O limite existe, mas é terceirizado para uma escassez fictícia.",
        },
      },
      {
        id: "resp-5c",
        movementType: "boundary",
        relationalMovementLabel: "Recusa Honesta com Limite Claro",
        actionText:
          'Dizer com firmeza e tom fraterno: "Compreendo o aperto difícil pelo qual você está passando, mas eu não realizo empréstimos financeiros nem mexo na minha reserva de segurança. Espero que você encontre uma saída para reorganizar isso."',
        distanceDelta: 0,
        fieldDynamic: {
          label: "Fronteira Nítida e Adulta",
          boundaryState: "clear",
          separationDistance: 110,
          tensionLevel: "low",
          organicDescription:
            "Cada um permanece dono e responsável pelo seu próprio espaço econômico e existencial. A recusa é transparente e não pede permissão para existir.",
        },
        possibleReadings: [
          "Reconhecimento da dor alheia sem se deixar engolfar pela responsabilidade que pertence ao outro.",
          "Não utilização de desculpas circunstanciais; o limite é colocado como princípio de vida.",
          'Capacidade de suportar ser considerado "duro" ou "egoísta" por quem esperava ser resgatado.',
        ],
        instituteAnalysis: {
          hasObjectiveAnswer: true,
          objectiveAnswerNote:
            "Modelo didático de fronteira autônoma e diferenciação material.",
          conceptName: "Autonomia e Limite Saudável",
          didacticExplanation:
            "Dizer um não transparente e tranquilo é o ato supremo de saneamento de fronteiras. O Instituto ensina que ajudar alguém é diferente de impedir que essa pessoa enfrente as consequências pedagógicas da própria realidade.",
        },
      },
    ],
    reflectiveQuestion:
      "Você precisa inventar uma desculpa para dizer não, ou consegue assumir seu limite sem culpa? O que você teme que pensem de você caso seu dinheiro ou sua energia continuem pertencendo a você?",
    instituteCoreLesson:
      'Dizer "não" para o outro quando a nossa verdade interior é um "não" é a única forma de fazer com que os nossos "sins" tenham valor e legitimidade real.',
  },
];
