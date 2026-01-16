import { StringToBoolean } from "class-variance-authority/types";

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

export interface CryptoComboBox {
  value: string;
  label: string;
  icon: string;
  price: string;
  change: string;
}

export interface CoinComboboxProp {
  coins: CryptoComboBox[] | undefined;
  isLoading: boolean;
  isError: boolean;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export interface chartData {
  date: string;
  price: Number;
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export type StockWithWatchlistStatus = Stock & {
  isInWatchlist: boolean;
};

export interface SearchCommandProps {
  renderAs?: "button" | "text";
  label?: string;
  initialStocks: StockWithWatchlistStatus[];
}

export interface FinnhubSearchResult {
  symbol: string;
  description: string;
  displaySymbol?: string;
  type: string;
}

export interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSearchResult[];
}

export interface StockDetailsPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

export type QuoteData = {
  c?: number;
  dp?: number;
};

export type ProfileData = {
  name?: string;
  marketCapitalization?: number;
};

export type FinancialsData = {
  metric?: { [key: string]: number };
};

export type WatchlistTableProps = {
  watchlist: StockWithData[];
};

export type StockWithData = {
  symbol: string;
  company: string;
  currentPrice?: number;
  changePercent?: number;
  priceFormatted?: string;
  changeFormatted?: string;
  marketCap?: string;
  peRatio?: string;
};

export type WelcomeEmailData = {
  email: string;
  name: string;
  intro: string;
};

export type SignUpFormData = {
  name: string;
  email: string;
  password: string;
};
