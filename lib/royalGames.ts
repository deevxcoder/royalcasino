import { Provider, Game } from "./types";

export const ROYAL_GAMES_BRAND_ID = 88888;

export const ROYAL_GAMES_PROVIDER: Provider = {
  brand_id: ROYAL_GAMES_BRAND_ID,
  name: "Royal Games",
  logo: null,
  game_count: 6,
};

export const ROYAL_GAMES: Game[] = [
  {
    game_id: 88801,
    game_uid: "royal_coinflip",
    name: "Coin Flip Royale",
    provider: "Royal Games",
    category: "Casual / Instant Win",
    logo: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&q=80",
  },
  {
    game_id: 88802,
    game_uid: "royal_andarbahar",
    name: "Andar Bahar Live",
    provider: "Royal Games",
    category: "Table / Live Indian",
    logo: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80",
  },
  {
    game_id: 88803,
    game_uid: "royal_chickencross",
    name: "Chicken Road Cross",
    provider: "Royal Games",
    category: "Crash / Stepper",
    logo: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80",
  },
  {
    game_id: 88804,
    game_uid: "royal_aviator",
    name: "Aviator Royale Crash",
    provider: "Royal Games",
    category: "Crash / Flash",
    logo: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&q=80",
  },
  {
    game_id: 88805,
    game_uid: "royal_mines",
    name: "Mines Gold",
    provider: "Royal Games",
    category: "Originals / Instant",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
  },
  {
    game_id: 88806,
    game_uid: "royal_roulette",
    name: "European Roulette",
    provider: "Royal Games",
    category: "Table / Wheel",
    logo: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80",
  },
];

export function isRoyalGame(gameUid: string | number): boolean {
  const uidStr = String(gameUid);
  return uidStr.startsWith("royal_") || uidStr.startsWith("888");
}
