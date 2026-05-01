/**
 * useXrpPrice — live XRP/USD price feed
 *
 * Fetches from CoinGecko (free, no API key).
 * Falls back to Binance public ticker if CoinGecko fails.
 * Auto-refreshes every 60 seconds.
 *
 * Returns:
 *   xrpPrice      {number}  current USD price of 1 XRP
 *   usdToDrops    {fn}      convert USD amount → drops (string)
 *   usdToXrp      {fn}      convert USD amount → XRP string (2dp)
 *   loading       {bool}
 *   error         {bool}
 *   lastUpdated   {Date|null}
 */
import { useState, useEffect, useCallback } from "react";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd";
const BINANCE_URL =
  "https://api.binance.com/api/v3/ticker/price?symbol=XRPUSDT";

const DROPS_PER_XRP = 1_000_000;
const REFRESH_MS    = 60_000; // 60 seconds
const FALLBACK_PRICE = 0.50;  // used only if both APIs fail on first load

async function fetchPrice() {
  // Try CoinGecko first
  try {
    const res  = await fetch(COINGECKO_URL, { cache: "no-store" });
    const data = await res.json();
    const price = data?.ripple?.usd;
    if (price && price > 0) return price;
  } catch (_) {}

  // Fallback: Binance
  try {
    const res  = await fetch(BINANCE_URL, { cache: "no-store" });
    const data = await res.json();
    const price = parseFloat(data?.price);
    if (price && price > 0) return price;
  } catch (_) {}

  return null; // both failed
}

export function useXrpPrice() {
  const [xrpPrice,    setXrpPrice]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    const price = await fetchPrice();
    if (price) {
      setXrpPrice(price);
      setLastUpdated(new Date());
      setError(false);
    } else {
      setError(true);
      // Keep last known price if we have one
      if (!xrpPrice) setXrpPrice(FALLBACK_PRICE);
    }
    setLoading(false);
  }, [xrpPrice]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Convert USD amount to drops (integer string).
   * e.g. usdToDrops(12, 0.60) → "20000000" (20 XRP)
   */
  const usdToDrops = useCallback(
    (usdAmount, priceOverride) => {
      const price = priceOverride || xrpPrice || FALLBACK_PRICE;
      const xrp   = usdAmount / price;
      return String(Math.ceil(xrp * DROPS_PER_XRP));
    },
    [xrpPrice]
  );

  /**
   * Convert USD amount to human-readable XRP string.
   * e.g. usdToXrp(5) → "8.33 XRP"
   */
  const usdToXrp = useCallback(
    (usdAmount, priceOverride) => {
      const price = priceOverride || xrpPrice || FALLBACK_PRICE;
      const xrp   = usdAmount / price;
      return xrp < 0.01
        ? xrp.toFixed(4)
        : xrp < 1
        ? xrp.toFixed(2)
        : xrp.toFixed(2);
    },
    [xrpPrice]
  );

  return { xrpPrice, usdToDrops, usdToXrp, loading, error, lastUpdated };
}

/**
 * Standalone helper — use inside async functions where hooks aren't available.
 * Returns current XRP price in USD.
 */
export async function getXrpPriceUsd() {
  const price = await fetchPrice();
  return price || FALLBACK_PRICE;
}
