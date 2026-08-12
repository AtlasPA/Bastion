import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Condition } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // Owner account — signing in with this email gets admin access.
  await db.user.upsert({
    where: { email: "sdysart90@gmail.com" },
    update: { role: "ADMIN" },
    create: { email: "sdysart90@gmail.com", name: "Owner", role: "ADMIN" },
  });

  const games = await db.category.upsert({
    where: { slug: "video-games" },
    update: {},
    create: { name: "Video Games", slug: "video-games" },
  });
  const cards = await db.category.upsert({
    where: { slug: "trading-cards" },
    update: {},
    create: { name: "Trading Cards", slug: "trading-cards" },
  });

  type SeedProduct = {
    sku: string;
    title: string;
    slug: string;
    description: string;
    condition: Condition;
    priceCents: number;
    categoryId: string;
    image: string;
  };

  const products: SeedProduct[] = [
    {
      sku: "BAS-0001",
      title: "Super Mario 64 (Nintendo 64)",
      slug: "super-mario-64-n64",
      description: "Cartridge only. Label in great shape, tested and working.",
      condition: "NM",
      priceCents: 3999,
      categoryId: games.id,
      image: "/seed/game.svg",
    },
    {
      sku: "BAS-0002",
      title: "Pokemon Emerald (Game Boy Advance)",
      slug: "pokemon-emerald-gba",
      description: "Authentic cartridge, new battery installed. Saves confirmed working.",
      condition: "LP",
      priceCents: 8999,
      categoryId: games.id,
      image: "/seed/game.svg",
    },
    {
      sku: "BAS-0003",
      title: "Halo 2 (Original Xbox)",
      slug: "halo-2-xbox",
      description: "Complete in box with manual. Disc has light scratches, plays fine.",
      condition: "MP",
      priceCents: 999,
      categoryId: games.id,
      image: "/seed/game.svg",
    },
    {
      sku: "BAS-0004",
      title: "Chrono Trigger (SNES)",
      slug: "chrono-trigger-snes",
      description: "Cartridge only. Label wear consistent with age, tested and working.",
      condition: "HP",
      priceCents: 12999,
      categoryId: games.id,
      image: "/seed/game.svg",
    },
    {
      sku: "BAS-0005",
      title: "The Legend of Zelda: Ocarina of Time (Nintendo 64)",
      slug: "zelda-ocarina-of-time-n64",
      description: "Gold cartridge variant. Cleaned, tested, working.",
      condition: "LP",
      priceCents: 3499,
      categoryId: games.id,
      image: "/seed/game.svg",
    },
    {
      sku: "BAS-0006",
      title: "Charizard Holo - Base Set 4/102 (Pokemon)",
      slug: "charizard-holo-base-set",
      description: "Unlimited print. Moderate edge wear and light scratching on the holo.",
      condition: "MP",
      priceCents: 24999,
      categoryId: cards.id,
      image: "/seed/card.svg",
    },
    {
      sku: "BAS-0007",
      title: "Blue-Eyes White Dragon - LOB-001 (Yu-Gi-Oh!)",
      slug: "blue-eyes-white-dragon-lob",
      description: "Legend of Blue Eyes, Ultra Rare. Light whitening on back edges.",
      condition: "LP",
      priceCents: 7999,
      categoryId: cards.id,
      image: "/seed/card.svg",
    },
    {
      sku: "BAS-0008",
      title: "Sol Ring - Commander 2021 (Magic: The Gathering)",
      slug: "sol-ring-commander-2021",
      description: "Pack fresh to sleeve. The Commander staple.",
      condition: "NM",
      priceCents: 299,
      categoryId: cards.id,
      image: "/seed/card.svg",
    },
    {
      sku: "BAS-0009",
      title: "Umbreon VMAX Alt Art - Evolving Skies 215/203 (Pokemon)",
      slug: "umbreon-vmax-alt-art",
      description: "The Moonbreon. Pulled and sleeved immediately, pristine.",
      condition: "NM",
      priceCents: 39999,
      categoryId: cards.id,
      image: "/seed/card.svg",
    },
    {
      sku: "BAS-0010",
      title: "Mewtwo Holo - Base Set 10/102 (Pokemon)",
      slug: "mewtwo-holo-base-set",
      description: "Unlimited print. Light played wear, presents well in a binder.",
      condition: "LP",
      priceCents: 2999,
      categoryId: cards.id,
      image: "/seed/card.svg",
    },
  ];

  for (const p of products) {
    const { image, ...data } = p;
    await db.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...data,
        status: "ACTIVE",
        images: { create: [{ url: image, sortOrder: 0 }] },
      },
    });
  }

  console.log(`Seeded ${products.length} products in 2 categories.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
