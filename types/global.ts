import { StringToBoolean } from "class-variance-authority/types";

export type User = {
  id: string;
  name: string;
  email: string;
};
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
  logo?: string;
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
  logo?: string;
};

export type AlertlistProps = {
  alertlist: AlertWithData[];
};

export type AlertWithData = {
  company: string;
  symbol: string;
  priceFormatted?: string;
  changeFormatted?: string;
  logo?: string;
  option?: string;
  targetPrice?: number;
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

export type RawNewsArticle = {
  id: number;
  headline?: string;
  summary?: string;
  source?: string;
  url?: string;
  datetime?: number;
  image?: string;
  category?: string;
  related?: string;
};

export type MarketNewsArticle = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related: string;
  image?: string;
};
