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
