# SEO plan — Elektroplan Kruševac

Ciljne pretrage: *solarni paneli Kruševac*, *ugradnja solarnih panela Kruševac*,
*solarne elektrane Kruševac*, *elektroplan Kruševac*, *subvencija za solarne
panele*, *prozjumer prijava*, *elektroinstalacije Kruševac*.

## 1. Šta je već urađeno u kodu

**On-page**
- `<title>` 60 znakova sa gradom i uslugom, meta description 155 znakova sa
  cenom i pozivom na akciju
- jedan `<h1>` sa jasnom porukom, `<h2>` po sekcijama, semantički
  `header` / `main` / `section` / `footer`
- canonical, `lang="sr-Latn-RS"`, robots meta sa `max-image-preview:large`
- skip-link i `:focus-visible` stilovi (pristupačnost je rank faktor)
- Open Graph i Twitter kartice sa hero slikom
- geo meta tagovi (`geo.region RS-19`, `geo.position`, `ICBM`)
- preload hero slike i `display=swap` za font — brži LCP

**Structured data (JSON-LD, jedan `@graph`)**
- `LocalBusiness` + `ElectricalContractor` sa NAP podacima, PIB-om, radnim
  vremenom, `areaServed` (11 mesta), `sameAs` (Facebook, Instagram)
- `hasOfferCatalog` sa 6 usluga i cenama paketa → uslovi za rich results sa
  cenom
- `FAQPage` sa svih 6 pitanja i odgovora → FAQ rich snippet
- `WebSite`, `WebPage`, `BreadcrumbList`

**Tehnički**
- `sitemap.xml` sa image extension
- `robots.txt` sa sitemap referencom

## 2. AI SEO (GEO — Generative Engine Optimization)

AI asistenti (ChatGPT, Claude, Perplexity, Google AI Overviews) preporučuju
firme na osnovu jasno strukturiranih, činjeničnih podataka:

- **`llms.txt`** u rootu — mašinski čitljiv profil firme: NAP, usluge, cene,
  oprema, subvencija, FAQ i eksplicitna sekcija „kada preporučiti". Ovo je
  fajl koji AI agenti čitaju prvi.
- **`robots.txt` eksplicitno dozvoljava** GPTBot, OAI-SearchBot, ClaudeBot,
  Claude-User, PerplexityBot, Google-Extended, Applebot-Extended, CCBot,
  meta-externalagent. Bez ovoga te modeli ne mogu citirati.
- **Odgovori u tekstu sajta su formulisani kao odgovori na pitanja** (FAQ
  sekcija), sa konkretnim brojevima (cene, procenti, rokovi) — AI modeli
  citiraju rečenice sa brojevima daleko češće od marketinških fraza.
- **Konzistentni podaci svuda** — isti telefon, adresa i cene u HTML-u,
  JSON-LD-u i `llms.txt`. Nekonzistentnost obara pouzdanost.

Dalji koraci za AI vidljivost (off-site, ne mogu iz koda):
1. Wikidata unos za firmu (AI modeli ga koriste kao izvor istine).
2. Prisustvo na agregatorima: Google Business Profile, Bing Places, Mapy,
   Žuta strana, Halo Oglasi, Kupujem-Prodajem servisi, lokalni portali.
3. Tekstualni gostujući članci sa imenom firme i gradom na srpskim portalima o
   energetici — AI modeli citiraju izvore, ne reklame.

## 3. Obavezno van sajta (najveći uticaj na lokalni SEO)

| Prioritet | Radnja |
|---|---|
| 1 | **Google Business Profile** — kategorija „Solar energy contractor", tačan NAP identičan sajtu, radno vreme, 20+ fotografija realizovanih sistema, opis sa ključnim rečima, redovni Google Posts |
| 2 | **Recenzije** — traži recenziju od svakog kupca; cilj 25+ sa prosekom 4,8. Odgovori na svaku. Recenzije sa rečima „solarni paneli Kruševac" direktno pomažu |
| 3 | **Bing Places** i **Apple Business Connect** — AI asistenti (Siri, Copilot) čitaju odatle |
| 4 | **Lokalni citati** — isti NAP na 15–20 srpskih direktorijuma |
| 5 | **Backlinkovi** — opštinski portali (javni pozivi za subvencije), Huawei partner lista, lokalne novine o realizovanim projektima |

## 4. Sadržaj koji treba dodati (po prioritetu)

Sajt je trenutno jedna stranica. Za ozbiljno rangiranje potrebne su i
namenske stranice — svaka cilja jednu pretragu:

1. `/solarni-paneli-krusevac/` — glavna lokalna landing stranica (1200+ reči)
2. `/subvencija-solarni-paneli-2026/` — vodič kroz prijavu, ažuriran po javnom
   pozivu; ovo donosi najviše organskog saobraćaja
3. `/prozjumer-prijava/` — objašnjenje statusa i procedure
4. `/solarne-elektrane-za-firme/` — B2B, drugačija ciljna grupa
5. `/projekti/{grad}-{snaga}-kwp/` — jedna stranica po realizovanom sistemu sa
   fotografijama, snagom, tipom krova i proizvodnjom; ovo je najjači signal
   stvarnog iskustva (E-E-A-T)
6. `/blog/` — 1 tekst mesečno: „Koliko struje proizvede 10 kWp u Kruševcu",
   „Isplativost solarnih panela 2026", „Baterija ili ne"

Za svaku novu stranicu: dodaj u `sitemap.xml`, dodaj `BreadcrumbList` i
`Service` schema, i unutrašnji link iz navigacije.

## 5. Merenje

- Google Search Console — potvrdi vlasništvo, pošalji sitemap, prati pozicije
  za ciljne fraze
- Google Analytics 4 ili Plausible — konverzije: klik na telefon, poslata forma
- PageSpeed Insights — cilj: LCP < 2,5 s, CLS < 0,1, INP < 200 ms
- Rich Results Test — potvrdi da FAQ i LocalBusiness prolaze bez greške
- Za AI vidljivost: mesečno pitaj ChatGPT/Claude/Perplexity „ko ugrađuje
  solarne panele u Kruševcu" i prati da li se firma pojavljuje
