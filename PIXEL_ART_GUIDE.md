# 🎮 Guia de Estilo & Diretrizes de Pixel Art do Omnia (Pixel Art Master Spec)

> **REGRA DE OURO VISUAL DO OMNIA:**
> Todos os sprites do aplicativo (Mascotes, Chefões de Foco RPG, Ícones e Efeitos de Combate) devem obrigatoriamente seguir este guia de estilo uniforme. **Nenhum elemento em alta resolução, ilustração vetorial realista ou micro-pixel art pode ser misturado com os personagens retro.**

---

## 1. O Problema dos "Mixels" & Princípio da Consistência
- **O que são Mixels?** Misturar tamanhos diferentes de pixels em uma mesma tela (por exemplo, um mascote em estilo 32x32 com blocos grossos ao lado de um monstro hiperdetalhado com micro-pixels minúsculos).
- **Diretriz Omnia:** Tanto os Mascotes de Estudo quanto os Chefões da Procrastinação pertencem ao **mesmo universo de RPG clássico de 16-bits (estilo Super Nintendo e Game Boy Advance)**, como em *Chrono Trigger*, *Pokémon GBA* e *EarthBound*.

---

## 2. Especificações Técnicas de Grade (Grid & Dimensions)

| Propriedade | Padrão dos Mascotes (Pets) | Padrão dos Chefões (Bosses) |
| :--- | :--- | :--- |
| **Grade Lógica Nativa** | 32×32 a 48×48 pixels | 48×48 a 64×64 pixels |
| **Resolução Exportada** | 288×288 pixels (Upscale limpo Nearest-Neighbor) | 288×288 pixels (Upscale limpo Nearest-Neighbor) |
| **Escala de Pixel (Texel)** | Blocos quadrados nítidos de ~6×6 pixels | Blocos quadrados nítidos de ~4×4 a 6×6 pixels |
| **Renderização CSS** | `image-rendering: pixelated;` | `image-rendering: pixelated;` |
| **Canal Alpha** | Fundo 100% transparente (sem resíduos brancos) | Fundo 100% transparente (sem resíduos brancos) |

---

## 3. Diretrizes de Desenho & Proporções (Chibi / JRPG)

1. **Silhueta e Proporção:**
   - Proporção estilizada e expressiva: cabeça grande com feições claras, corpo compacto e elementos acadêmicos icônicos (óculos, chapéu de formatura, ampulheta, livros, canetas).
   - A silhueta deve ser imediatamente reconhecível a 64px de distância.

2. **Contornos Obligatórios (Outlines):**
   - Todo personagem deve possuir um **contorno externo escuro fechado (1 a 2 pixels de espessura)**.
   - Isso garante que o sprite mantenha contraste impecável contra todos os 6 temas do app (do fundo claro do **Aiko** ao fundo preto do **Hacker**).

3. **Paleta de Cores & Cel-Shading:**
   - Paleta retro limitada: máximo de 4 a 5 gradações por cor (Destaque, Cor Base, Sombra 1, Sombra Profunda).
   - Sombreamento em blocos definidos (*cel-shading*), sem gradientes contínuos ou difusão aerografada.

4. **Identidade dos 4 Chefões Acadêmicos:**
   - **Gólem da Procrastinação:** Criatura de pedra ancestral com pedras arredondadas e ampulheta brilhante no peito (Tom: Âmbar/Dourado `#f59e0b`).
   - **Dragão dos Prazos Atrasados:** Dragãozinho carismático vermelho e laranja, cuspindo chamas e folhas de prova queimadas (Tom: Carmesim/Fogo `#ef4444`).
   - **Espectro da Exaustão Mental:** Fantasma flutuante violeta envolto em névoa e fumaça de café (Tom: Roxo/Violeta `#8b5cf6`).
   - **Titã da Prova Final:** Cavaleiro/robô de armadura cibernética magenta e dourada, com espada de caneta e carimbo de nota 10 (Tom: Magenta `#ec4899`).

---

## 4. Estados & Variações Obrigatórias por Personagem

Cada personagem no Omnia deve contar com seus pares de animação e reação:

### Mascotes:
- `_happy`: Posição padrão acordado, olhos alegres, comemoração.
- `_focus`: Posição concentrada (olhos compenetrados, lendo ou com óculos).
- `_sleep`: Posição dormindo (olhos fechados, bolha de sono 'Zzz').

### Chefões:
- `_idle`: Postura de desafio em pé / flutuando.
- `_hurt`: Frame clássico de RPG levando golpe (olhos girando ou piscando em branco, tremor, reação de choque cômica).
