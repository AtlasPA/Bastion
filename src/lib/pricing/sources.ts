import type { PriceSource } from "@/generated/prisma/client";

// Each source returns TCGplayer-derived market prices. A linked product
// stores `sourceId` as "<card id>|<variant>" so refreshes are exact.

export type CardVariant = {
  key: string;
  label: string;
  marketCents: number | null;
};

export type CardSearchResult = {
  sourceId: string; // card id WITHOUT variant
  label: string; // "Charizard — Base Set 4/102"
  variants: CardVariant[];
};

const dollarsToCents = (v: unknown): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && isFinite(n) && n > 0
    ? Math.round(n * 100)
    : null;
};

async function getJson(url: string, headers: Record<string, string> = {}) {
  // The free card APIs (pokemontcg.io especially) throw transient 5xxs —
  // retry twice with a short pause before giving up.
  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt));
    const res = await fetch(url, {
      headers: {
        // Scryfall (and good API citizenship generally) requires these.
        "User-Agent": "BastionGameVault/1.0 (bastiongamevault.com)",
        Accept: "application/json",
        ...headers,
      },
    });
    if (res.ok) return res.json();
    lastError = `${new URL(url).host} ${res.status}`;
    if (res.status < 500) break; // 4xx won't improve on retry
  }
  throw new Error(lastError);
}

// ---------- Pokémon (pokemontcg.io) ----------

const POKE_HEADERS = (): Record<string, string> =>
  process.env.POKEMONTCG_API_KEY
    ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
    : {};

function pokeVariants(card: {
  tcgplayer?: { prices?: Record<string, { market?: number | null }> };
}): CardVariant[] {
  const prices = card.tcgplayer?.prices ?? {};
  return Object.entries(prices).map(([key, p]) => ({
    key,
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
    marketCents: dollarsToCents(p?.market),
  }));
}

async function searchPokemon(query: string): Promise<CardSearchResult[]> {
  const data = await getJson(
    `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`name:"${query}"`)}&pageSize=12&orderBy=-set.releaseDate`,
    POKE_HEADERS()
  );
  return (data.data ?? []).map(
    (card: {
      id: string;
      name: string;
      number: string;
      set: { name: string; printedTotal?: number };
      tcgplayer?: { prices?: Record<string, { market?: number | null }> };
    }) => ({
      sourceId: card.id,
      label: `${card.name} — ${card.set.name} ${card.number}${card.set.printedTotal ? `/${card.set.printedTotal}` : ""}`,
      variants: pokeVariants(card),
    })
  );
}

async function fetchPokemon(cardId: string, variant: string) {
  const data = await getJson(
    `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(cardId)}`,
    POKE_HEADERS()
  );
  return dollarsToCents(data.data?.tcgplayer?.prices?.[variant]?.market);
}

// ---------- Magic (Scryfall) ----------

async function searchScryfall(query: string): Promise<CardSearchResult[]> {
  const data = await getJson(
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=released`
  );
  return (data.data ?? []).slice(0, 12).map(
    (card: {
      id: string;
      name: string;
      set_name: string;
      collector_number: string;
      prices?: { usd?: string | null; usd_foil?: string | null };
    }) => ({
      sourceId: card.id,
      label: `${card.name} — ${card.set_name} #${card.collector_number}`,
      variants: [
        { key: "normal", label: "Normal", marketCents: dollarsToCents(card.prices?.usd) },
        { key: "foil", label: "Foil", marketCents: dollarsToCents(card.prices?.usd_foil) },
      ].filter((v) => v.marketCents !== null),
    })
  );
}

async function fetchScryfall(cardId: string, variant: string) {
  const card = await getJson(
    `https://api.scryfall.com/cards/${encodeURIComponent(cardId)}`
  );
  return dollarsToCents(
    variant === "foil" ? card.prices?.usd_foil : card.prices?.usd
  );
}

// ---------- Yu-Gi-Oh! (YGOPRODeck) ----------

async function searchYgo(query: string): Promise<CardSearchResult[]> {
  const data = await getJson(
    `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}&num=8&offset=0`
  );
  const results: CardSearchResult[] = [];
  for (const card of (data.data ?? []).slice(0, 8) as {
    name: string;
    card_sets?: { set_code: string; set_name: string; set_rarity: string; set_price?: string }[];
  }[]) {
    for (const set of (card.card_sets ?? []).slice(0, 6)) {
      results.push({
        sourceId: set.set_code,
        label: `${card.name} — ${set.set_name} (${set.set_code}, ${set.set_rarity})`,
        variants: [
          {
            key: "set",
            label: set.set_rarity,
            marketCents: dollarsToCents(set.set_price),
          },
        ],
      });
    }
  }
  return results.slice(0, 12);
}

async function fetchYgo(setCode: string) {
  const data = await getJson(
    `https://db.ygoprodeck.com/api/v7/cardsetsinfo.php?setcode=${encodeURIComponent(setCode)}`
  );
  return dollarsToCents(data.set_price);
}

// ---------- Unified interface ----------

export const SOURCE_LABELS: Record<PriceSource, string> = {
  POKEMONTCG: "Pokémon (TCGplayer market)",
  SCRYFALL: "Magic (TCGplayer market)",
  YGOPRODECK: "Yu-Gi-Oh! (TCGplayer market)",
  PRICECHARTING: "PriceCharting (games & slabs)",
};

export async function searchCards(
  source: PriceSource,
  query: string
): Promise<CardSearchResult[]> {
  switch (source) {
    case "POKEMONTCG":
      return searchPokemon(query);
    case "SCRYFALL":
      return searchScryfall(query);
    case "YGOPRODECK":
      return searchYgo(query);
    case "PRICECHARTING":
      throw new Error("PriceCharting is not connected yet.");
  }
}

/** sourceId format: "<card id>|<variant key>" */
export async function fetchMarketCents(
  source: PriceSource,
  sourceId: string
): Promise<number | null> {
  const [cardId, variant = ""] = sourceId.split("|");
  switch (source) {
    case "POKEMONTCG":
      return fetchPokemon(cardId, variant);
    case "SCRYFALL":
      return fetchScryfall(cardId, variant);
    case "YGOPRODECK":
      return fetchYgo(cardId);
    case "PRICECHARTING":
      return null;
  }
}
