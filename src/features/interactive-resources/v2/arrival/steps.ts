export const arrivalSteps=[
 {id:"palavra",label:"Palavra",title:"Uma palavra para este momento",description:"Pode ser uma palavra ou uma frase breve. Não precisa explicar tudo.",asset:"palavra"},
 {id:"corpo",label:"Corpo",title:"O que você percebe no corpo?",description:"Escolha uma região, perceba uma sensação e registre somente o que fizer sentido.",asset:"corpo"},
 {id:"emocao",label:"Emoção",title:"Que emoção aparece?",description:"Uma palavra pode ajudar a nomear. Se nenhuma se aproxima, você pode pular.",asset:"emocao"},
 {id:"intensidade",label:"Intensidade",title:"Que intensidade você percebe?",description:"Escolha um número de 0 a 10, se essa escala fizer sentido agora.",asset:"intensidade"},
 {id:"necessidade",label:"Necessidade",title:"Alguma necessidade se apresenta?",description:"Você pode escolher até três possibilidades, ou seguir sem escolher.",asset:"necessidade"},
 {id:"permanencia",label:"Reflexão",title:"O que acontece quando você fica um instante com isso?",description:"Uma percepção breve, nas suas palavras. Também cabe não escrever.",asset:"reflexao"},
] as const;
export type ArrivalStep=typeof arrivalSteps[number]["id"];
export const arrivalArt=(asset:string)=>`/brand/recursos/chegada/${asset}.webp`;
