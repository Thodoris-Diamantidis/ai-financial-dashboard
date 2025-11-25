export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  change: number;
  market_cap: number;
  last_updated: string;
}

export interface PriceCardsData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: string;
  changeDirection: string;
  image: string;
}
