/**
 * TribeConnect — App bootstrap
 *
 * Provider stack (innermost first):
 *   WagmiProvider (WalletConnect-only, no MetaMask/RainbowKit)
 *   QueryClientProvider (react-query for wagmi v2)
 *   Web3Provider (unified Xaman + WalletConnect context)
 *
 * WalletModal is rendered at root level so any component can trigger it
 * via useWeb3().openModal() without worrying about z-index stacking.
 */
import "../styles/globals.css";

import { WagmiProvider }           from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster }                 from "react-hot-toast";
import { useState, useEffect }     from "react";

import { wagmiConfig }             from "../lib/wagmiConfig";
import { Web3Provider, useWeb3 }   from "../contexts/Web3Context";
import WalletModal                 from "../components/Wallet/WalletModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// ── Inner wrapper (needs useWeb3 which requires Web3Provider above it) ──
function AppInner({ Component, pageProps, theme, setTheme }) {
  const { modalOpen, closeModal, handleWalletConnected } = useWeb3();

  return (
    <>
      <Component {...pageProps} theme={theme} setTheme={setTheme} />

      {/* Global wallet modal — rendered at root to avoid z-index issues */}
      <WalletModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConnected={handleWalletConnected}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background:   "var(--tc-card, #1e293b)",
            color:        "var(--tc-text, #f1f5f9)",
            border:       "1px solid var(--tc-border, rgba(255,255,255,0.1))",
            borderRadius: "12px",
            fontSize:     "14px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────
export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("dark");

  // Apply saved theme before first paint
  useEffect(() => {
    const saved = localStorage.getItem("tc-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("tc-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <AppInner
            Component={Component}
            pageProps={pageProps}
            theme={theme}
            setTheme={toggleTheme}
          />
        </Web3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
