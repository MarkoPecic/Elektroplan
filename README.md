# Elektroplan Kruševac — sajt

Statičan sajt, bez build koraka i bez framework-a. Otvori `index.html` u
browseru ili postavi celu fasciklu na bilo koji hosting (Netlify, Vercel,
cPanel, Nginx). Nema Node zavisnosti.

## Struktura

```
export/
├── index.html              jedina stranica (semantički HTML + JSON-LD)
├── assets/
│   ├── css/styles.css      svi stilovi (varijable → sekcije → responsive)
│   ├── js/main.js          interakcije (kalkulator, carousel, FAQ, hover)
│   └── img/                slike, logo, favicon
├── robots.txt              pravila za pretraživače i AI agente
├── sitemap.xml             sitemap sa slikama
├── llms.txt                mašinski čitljiv opis firme za AI asistente
└── README.md
```

## Konvencije u kodu

**HTML** — jedna sekcija po `<section id="…">`, id-jevi su i anchor linkovi u
navigaciji: `#pocetna`, `#kako-radimo`, `#cene`, `#subvencija`, `#projekti`,
`#pitanja`, `#ponuda`.

**CSS klase** — imenovane po šemi `sekcija__element`, npr. `hero__title`,
`cene__price-grid`, `footer__link`. Klase su generisane iz dizajna, jedna klasa
po jedinstvenoj kombinaciji stilova, pa se ista kartica u tri kolone deli istu
klasu. Paleta i radijusi su u `:root` custom propertijima.

**JS hookovi** — nikad preko klasa, uvek preko `data-` atributa:

| Atribut | Uloga |
|---|---|
| `data-action="kwh"` | input kalkulatora u hero sekciji |
| `data-action="hotspot"` | tačke na hero slici |
| `data-slider`, `data-slider-track`, `data-dot` | carousel projekata |
| `data-action="slider-prev/next/dot"` | kontrole carousela |
| `data-faq`, `data-faq-body`, `data-faq-icon` | akordeon pitanja |
| `data-count="100"` | brojači koji se animiraju pri ulasku u vidno polje |
| `data-btn`, `data-l1`, `data-l2`, `data-btn-arrow` | hover animacija dugmeta |

**Hover dugmića** — tekst dugmeta postoji dva puta (`data-l1` vidljiv,
`data-l2` kopija ispod, `aria-hidden`); GSAP ih pomera za -100% na hover. Ako
menjaš tekst dugmeta, promeni ga na **oba** spana.

**Responsive** — breakpointi 1100px (tablet: hamburger meni), 900px (mobile
layout), 620px i 560px (tipografija). Media query blokovi su na kraju
`styles.css` i targetiraju `data-` atribute.

## Šta treba pre puštanja u produkciju

1. **Domen** — zameni `https://www.elektroplan.rs` u `index.html` (canonical,
   OG, JSON-LD), `robots.txt`, `sitemap.xml`, `llms.txt` ako je domen drugi.
2. **Kontakt forma** — trenutno je demo, ne šalje ništa. U `main.js`, funkcija
   `initForm()`: zameni telo `fetch` POST-om ka svom endpointu, Formspree,
   Netlify Forms ili PHP skripti.
3. **Slike** — konvertuj `.jpg` u `.webp` ili `.avif` i posluži ih kroz
   `<picture>`; zadrži `fetchpriority="high"` samo na hero slici.
4. **Geo koordinate** — u JSON-LD i `geo.position` meta tagovima stoje
   koordinate centra Kruševca. Zameni tačnim koordinatama kancelarije.
5. **Google Business Profile** — obavezno, detalji u sekciji SEO ispod.
6. **HTTPS + kompresija** — uključi gzip/brotli i cache header za
   `assets/**` (godina), `index.html` (bez cache-a).
