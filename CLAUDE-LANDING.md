# CLAUDE.md — BT-Barber Landing

Landing page de marketing para o produto **BT-Barber**. Este repo é **separado** do app
principal (`bt-barber`) e fica em outro domínio. A única integração é o CTA, que aponta
para o app via link.

## O produto

BT-Barber é uma plataforma de agendamento para barbearias (pt-BR, mercado brasileiro).
Dois públicos:

- **Cliente final:** descobre barbearias, escolhe barbeiro e serviços, agenda horário,
  e pode comprar produtos da loja da barbearia.
- **Dono de barbearia:** painel admin para gerenciar serviços, barbeiros, agendamentos
  e pedidos de produtos.

### Funcionalidades reais (já implementadas no app — pode prometer)

- Agendamento online com escolha de barbeiro específico (ou "qualquer barbeiro")
- Cada barbeiro tem seu próprio leque de serviços (M:N) — o cliente só vê o que aquele
  barbeiro faz
- Múltiplos serviços em um único agendamento
- Conflitos de horário tratados em nível de banco (impossível dois clientes pegarem o
  mesmo barbeiro/horário)
- Loja de produtos por barbearia, com carrinho e checkout
- Painel admin com gestão de pedidos e fluxo de status
- Login com Google
- Mobile-first, com layout desktop completo

### O que NÃO existe ainda (não prometer)

- Pagamento online (checkout é manual/presencial)
- App nativo iOS/Android (é web mobile-first)
- Notificações push / SMS / WhatsApp automatizado
- Programa de fidelidade

## CTA — para onde mandar o usuário

```
https://app.bt-barber.com/?utm_source=landing&utm_medium=hero
```

(ajustar `utm_medium` por seção: `hero`, `features`, `cta-final`, `owners`, etc.)

Botão principal recomendado: **"Agendar agora"** (cliente final).
Botão secundário: **"Sou dono de barbearia"** → `/owners?utm_*`.

## Identidade visual (replicar do app)

Tema **dark por padrão** (sem toggle — o app também é dark-only). `<body className="... dark">`.

### Tokens (idênticos ao app — copiar em `globals.css`)

```css
.dark {
  --background: 220 16% 8%;
  --foreground: 210 25% 96%;
  --card: 220 14% 12%;
  --primary: 212 100% 60%;          /* azul vibrante */
  --primary-foreground: 220 25% 8%;
  --accent: 198 95% 55%;            /* ciano */
  --accent-foreground: 220 25% 8%;
  --muted: 220 13% 16%;
  --muted-foreground: 215 16% 65%;
  --border: 218 14% 28%;
  --ring: 212 100% 60%;
  --radius: 0.75rem;
}
```

### Tipografia

Fonte **Sora** (Google Fonts), via `next/font`:

```ts
import { Sora } from "next/font/google";
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
```

Headings em `font-display` com `tracking-tight`. Body em `font-sans`. Ambos resolvem
para Sora.

### Sombras e animações úteis (já no `tailwind.config.ts`)

- `shadow-card`, `shadow-card-hover`, `shadow-glow` (azul) — usar nos cards de feature
- `bg-gradient-primary` (135deg primary → accent) — bom para hero / CTAs grandes
- Animações: `animate-fade-in`, `animate-slide-up`, `animate-float`, `animate-shimmer`
- `ease-smooth` (cubic-bezier 0.16, 1, 0.3, 1) para transições

## Tom de voz

- **pt-BR**, direto e amigável (não corporativo).
- Falar de **horários**, **barbeiros**, **clientes** — não "profissionais" ou
  "estabelecimentos".
- Evitar jargão técnico ("plataforma SaaS", "stack", "API").
- Headlines curtas. Bullets curtos. Sem parágrafos longos.

Exemplos de copy aprovado (linha editorial):
- "Agende seu corte em 30 segundos."
- "Escolha seu barbeiro de confiança — não um qualquer."
- "Sua barbearia, sem caderninho."

## Convenções técnicas

- Next 14 App Router, RSC por padrão. Só usar `"use client"` em componentes
  interativos (FAQ accordion, menu mobile).
- Imagens: usar `next/image`. Screenshots do app vão em `public/screenshots/`.
- Sem analytics ainda — quando entrar, será Vercel Analytics (já usado no app).
- SEO: definir `metadata` em `layout.tsx` e por seção. OG card dinâmico em
  `app/opengraph-image.tsx`.
- **Não** instalar Prisma, NextAuth, Zustand, react-hook-form. Esta landing é
  estática-ish e não precisa de banco nem de estado global.

## Estrutura recomendada da página (uma single-page, scroll)

1. **Hero** — headline + subheadline + 2 CTAs + screenshot/mockup do app
2. **Features** — 4 cards: Agendamento, Barbeiros, Produtos, Painel admin
3. **Como funciona** — 3 passos (Escolha → Agende → Pronto)
4. **Para donos de barbearia** — seção B2B, CTA secundário
5. **FAQ** — 5-7 perguntas (preço, cancelamento, pagamento, etc.)
6. **CTA final** — banner com gradient-primary
7. **Footer** — links legais, contato

## Comandos

```bash
pnpm install
pnpm dev        # :3000
pnpm build
pnpm lint
```