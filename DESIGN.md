# Aura Design System · DESIGN.md

> Google Stitch compatible. Auto-generated for AI agents.

## 1. Brand Identity

| Field | Value |
|-------|-------|
| **Brand name** | Aura |
| **Tagline** | Catálogo Premium |
| **Personality** | Minimalista, sereno, refinado, premium accesible |
| **Audience** | Compradores que valoran diseño y calidad, exploran desde mobile |
| **Anti-references** | Purple gradients, glassmorphism excesivo, sombras estridentes, cards dentro de cards, animaciones con bounce, inter font everywhere, CTAs múltiples compitiendo |
| **Voice** | Directo, sin hype, sin signos de exclamación, tono editorial |
| **Register** | Brand mode (diseño ES el producto) |

## 2. Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#060606` | Fondo principal (true black) |
| `--bg-surface` | `#0d0d0d` | Superficies elevadas (cards, nav strips) |
| `--bg-elevated` | `#111111` | Inputs, elementos interactivos |
| `--accent` | `#bf9b4e` | Dorado apagado — CTAs primarios, precios, highlights |
| `--accent-dim` | `#9b7a34` | Hover states del accent |
| `--text` | `#ededed` | Texto principal (~95% white) |
| `--text-secondary` | `#8a8a8a` | Texto secundario (~54% white) — mínimo para legibilidad |
| `--text-tertiary` | `#5a5a5a` | Texto terciario (~35% white) — solo para elementos decorativos |
| `--border` | `#1a1a1a` | Bordes estándar |
| `--red` | `#e05555` | Error, out of stock |
| `--green` | `#3cb371` | Success, available |
| `--amber` | `#d4a030` | Warning, preorder |

**Contraste mínimo**: `white/40` sobre `#060606` (3.5:1 ratio). Nunca usar `white/30` o menor para texto funcional.

## 3. Typography

| Token | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| `--font-serif` | Playfair Display | 400–700 | 26px / 22px / 18px / 14px | Headings, nombres de producto |
| `--font-sans` | Geist | 400–600 | 13px / 12px / 11px / 10px | Body, labels, UI elements |
| `--font-mono` | Geist Mono | 400 | 12px | Código, valores numéricos, slugs |

**Escala tipográfica fija para UI** (product mode). No usar fluid typography (vw units) en app UI. Solo en marketing pages.

## 4. Spacing

| Step | Value | Usage |
|------|-------|-------|
| `0.5` | 2px | Icon gaps, dot indicators |
| `1` | 4px | Tight padding |
| `1.5` | 6px | Element gaps |
| `2` | 8px | Standard gap |
| `2.5` | 10px | Section padding |
| `3` | 12px | Card padding |
| `4` | 16px | Page padding, section gap |
| `5` | 20px | Large section gap |
| `6` | 24px | Major section gap |

**Sistema**: Tailwind multiples of 4. No valores arbitrarios sin justificar.

## 5. Border Radius

| Token | Usage |
|-------|-------|
| `rounded-lg` (8px) | Badges, small pills |
| `rounded-xl` (12px) | Inputs, small cards, buttons |
| `rounded-2xl` (16px) | Cards, panels, sheets |
| `rounded-3xl` (24px) | Modal bottoms, hero images |

**Nunca**: border-radius inconsistente. Mismo componente = mismo radius.

## 6. Elevation / Depth

| Level | Implementation |
|-------|---------------|
| Base | `bg-[#060606]` (flat, no shadow) |
| Raised | `bg-[#0d0d0d]` + `border border-[#1a1a1a]` |
| Floating | `bg-[#0d0d0d]` + `border border-[#1a1a1a]` + `shadow-2xl shadow-black/40` |
| Overlay/modal | `bg-[#0d0d0d]/98` + `backdrop-blur-2xl` + `border border-[#1a1a1a]` |

**Nunca**: box-shadow sin border. No usar drop-shadow de Tailwind por defecto.

## 7. Components

### Button (Primary)
```
bg-white text-black rounded-xl h-11 px-5 text-[13px] font-semibold
hover:bg-white/90 active:scale-[0.98] transition-all
```
Solo en CTAs principales. Máximo 1 por pantalla/scroll segment (YC principle).

### Button (Secondary)
```
bg-[#111] border border-[#1a1a1a] text-white/60 rounded-xl h-10 px-4 text-xs font-medium
hover:text-white hover:border-white/10 transition-all
```

### Input
```
bg-[#111] border border-[#1a1a1a] rounded-xl h-11 px-3 text-[13px] text-white
placeholder:text-white/15 focus:border-white/10
```

### Card
```
bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden
```

### Pill / Badge
```
rounded-full px-3.5 py-1.5 text-[11px] font-medium
```

### Status badges
```
AVAILABLE: text-[#3cb371] bg-[#3cb371]/5
PREORDER: text-[#d4a030] bg-[#d4a030]/5
OUT_OF_STOCK: text-[#e05555] bg-[#e05555]/5
```

## 8. Interaction

| Pattern | Implementation |
|---------|---------------|
| Hover links | `text-white/40 → text-white/80` transition-colors |
| Active press | `active:scale-[0.98]` en botones y cards |
| Focus | `outline-1 outline-[#bf9b4e] outline-offset-2` |
| Loading | Spinner `animate-spin` (nunca skeleton genérico sin diseño) |
| Reveal | `animate-fade-up` 0.5s cubic-bezier(0.16,1,0.3,1) |
| Carousel | `transition-transform duration-400 ease-out` + touch swipe 40px threshold |

**Nunca**: scroll-jacking, animaciones en loop infinito, hover states como única forma de revelar información, "link salad" (múltiples CTAs compitiendo).

## 9. Navigation (Mobile)

- **Header**: 44px fijo, glass backdrop, border-bottom sutil
- **Bottom nav**: 48px fijo, safe-area-inset-bottom, 4 tabs con dot indicator activo
- **Menú drawer**: Sheet desde abajo, backdrop blur, items minimalistas con icono

## 10. Page Templates

### Product Catalog
1. Header 44px
2. Hero compacto (Five-Second Filter)
3. Sticky search 44px
4. Featured horizontal scroll
5. Category grid → subcategory pills
6. Product grid 2 cols (mobile) / 3-4 (desktop)
7. Bottom nav

### Product Detail
1. Header flotante 44px (back + actions)
2. Image carousel full-width (aspect 4:5 or 1:1)
3. Card con info (raised above carousel con -mt-4)
4. Breadcrumb, status, name, price, description, specs
5. Related products scroll
6. Sticky action bar (solo mobile)

### Admin Panel
1. Header 44px flotante
2. Stats grid (2-4 cols)
3. Action buttons
4. Product list (vertical cards en mobile, tabla en desktop)
5. Status badges inline
