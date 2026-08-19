export interface Provider {
  brand_id: number;
  name: string;
  logo: string | null;
  game_count?: number;
}

export interface Game {
  game_id: number;
  game_uid: string;
  name: string;
  provider: string;
  brand_id?: number;
  category: string;
  logo: string | null;
  rtp?: number;
  max_multiplier?: string;
}

export interface LaunchGameParams {
  userId: string;
  gameUid: string;
  balance: number;
  currencyCode?: string;
  language?: string;
  returnUrl?: string;
  callbackUrl?: string;
}

export interface SettlementCallbackPayload {
  game_id?: number;
  game_uid: string;
  game_round?: string;
  member_account: string; // userId
  bet_amount: number;
  win_amount: number;
  credit_amount: number; // authoritative new balance
  timestamp?: number;
  serial_number: string; // idempotency key
  game_name?: string;
}
