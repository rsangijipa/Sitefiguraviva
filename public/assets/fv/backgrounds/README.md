# Fundos decorativos — Instituto Figura Viva

As classes `.fv-bg-*` já existem em `src/app/globals.css`. Basta soltar o
arquivo aqui com o nome exato: a seção acende sem alteração de componente.

## Nomes esperados

| Arquivo         | Seção                          |
| --------------- | ------------------------------ |
| `hero`          | Hero da home                   |
| `explore`       | Bloco "Explore o Figura Viva"  |
| `formations`    | Cursos e formações             |
| `enrollment`    | Inscrição                      |
| `manifesto`     | Nossa essência / manifesto     |
| `laura-archive` | Memória Viva Laura Perls       |
| `library`       | Biblioteca                     |
| `bookshelf`     | Estante de preferidos          |
| `articles`      | Blog / artigos                 |
| `resources`     | Recursos terapêuticos          |
| `gallery`       | Galeria                        |
| `testimonials`  | Depoimentos                    |
| `faq`           | FAQ                            |
| `cta`           | CTA final (sobre Verde Raiz)   |
| `footer`        | Rodapé (sobre Verde Raiz)      |
| `login`         | Login                          |
| `admin`         | Painel administrativo          |

## Placeholders

Cada caminho já tem um arquivo transparente de 1x1 px comprometido. Eles não
desenham nada — existem só para que a classe `.fv-bg-*` possa ser aplicada na
seção antes da arte chegar, sem gerar um 404 por seção a cada carregamento.
Substitua pelo arquivo real; nenhuma alteração de código é necessária.

## Formatos

Cada nome quer dois arquivos: `nome.avif` e `nome.webp`. O AVIF é servido
quando o navegador aceita; o WebP é a queda. O CSS já resolve a escolha.

O hero aceita ainda `hero-mobile.avif` / `hero-mobile.webp`, usados abaixo de
768px. Para acrescentar variante móvel a outra seção, some a regra dentro do
bloco `@media (max-width: 768px)` no final do `globals.css` — apontar para um
arquivo que não existe custa um 404 por seção, então só declare o que existe.

## Peso

- Hero: até 250 KB
- Demais seções: até 150 KB
- Variantes móveis: metade disso

## Ajuste fino, sem reexportar

Três variáveis controlam a aplicação, na própria seção ou em CSS:

    --fv-bg-strength        opacidade no tema claro (padrão 1)
    --fv-bg-strength-dark   opacidade no tema escuro (padrão .2)
    --fv-bg-position        padrão `center`
    --fv-bg-size            padrão `cover`

Exemplo: `<section className="fv-section fv-bg fv-bg-hero" style={{ "--fv-bg-strength": .8 }}>`

## Regras

- Fundo é decoração: entra por `::before`, nunca como `<img alt="">`.
- Nenhum texto dentro da imagem.
- Nenhuma pessoa gerada por IA — docente, aluno ou paciente simulado é vedado
  pelo Design System. Fotografia vem do acervo real.
- O logotipo nunca é redesenhado por IA; usa-se o arquivo oficial.
