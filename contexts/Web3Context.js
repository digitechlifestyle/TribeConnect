/**
 * TribeConnect — Web3Context
 *
 * Unified context bridging:
 *   • Xaman (native XRPL) — address, balance, sign-in, NFTs, XRP payments
 *   • WalletConnect/wagmi — EVM address, chain, smart contract access
 *
 * Both wallets can be active simultaneously:
 *   Xaman handles XRP payments + NFT mints;
 *   WalletConnect handles XRPL EVM Sidechain smart contracts.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAccount, useDisconnect } from "wagmi";
import toast from "react-hot-toast";
import {
  getAccountInfo,
  buildPremiumPaymentTx,
  buildCreatorSubPaymentTx,
  buildPostAnchorTx,
  buildVerificationBadgeMint,
  buildMembershipTokenMint,
} from "../lib/xrplClient";
import { restoreSession, saveSession, clearSession } from "../lib/xrplWallet";

// ── Context ──────────────────────────────────────────────────────────────
const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  // ── Xaman / XRPL state ────────────────────────────────────────────────
  const [xrplAddress,  setXrplAddress]  = useState(null);
  const [xrplBalance,  setXrplBalance]  = useState("0");
  const [walletType,   setWalletType]   = useState(null); // "xaman" | "walletconnect"
  const [authLoading,  setAuthLoading]  = useState(true);
  const [txPending,    setTxPending]    = useState(false);

  // ── WalletConnect / wagmi state ───────────────────────────────────────
  const { address: evmAddress, isConnected: evmConnected, chain } = useAccount();
  const { disconnect: wcDisconnect } = useDisconnect();

  // ── EVM contract helpers (read + write via wagmi / ethers) ────────────
  // Populated by useContract hook in components that need it
  const [readContract,  setReadContract]  = useState(null);
  const [writeContract, setWriteContract] = useState(null);

  // ── Wallet modal state (lifted so Header/Sidebar can trigger) ─────────
  const [modalOpen, setModalOpen] = useState(false);

  // ── Premium / profile cache (from EVM contract) ───────────────────────
  const [profile,       setProfile]       = useState(null);
  const [hasProfile,    setHasProfile]    = useState(false);
  const [premiumTier,   setPremiumTier]   = useState(0);
  const [premiumExpiry, setPremiumExpiry] = useState(0);

  // ── Restore session on mount ──────────────────────────────────────────
  useEffect(() => {
    async function restoreAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setXrplAddress(data.address);
          setWalletType(data.walletType || "xaman");
          if (data.address) refreshBalance(data.address);
          setAuthLoading(false);
          return;
        }
      } catch (_) {}

      // Fallback: localStorage (for non-Xaman sessions)
      const saved = restoreSession();
      if (saved?.xrplAddress) {
        setXrplAddress(saved.xrplAddress);
        setWalletType(saved.walletType || "xaman");
        refreshBalance(saved.xrplAddress);
      }
      setAuthLoading(false);
    }

    restoreAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep wallet type consistent if wagmi connects without Xaman
  useEffect(() => {
    if (evmConnected && evmAddress && !xrplAddress) {
      setWalletType("walletconnect");
    }
  }, [evmConnected, evmAddress, xrplAddress]);

  // ── Balance ───────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async (addr) => {
    const target = addr || xrplAddress;
    if (!target) return;
    try {
      const info = await getAccountInfo(target);
      setXrplBalance(info ? info.balance : "0");
    } catch (_) {}
  }, [xrplAddress]);

  // ── Load EVM profile from smart contract ─────────────────────────────
  const loadProfile = useCallback(async () => {
    if (!readContract || !evmAddress) return;
    try {
      const hp = await readContract.hasProfile(evmAddress);
      setHasProfile(hp);
      if (hp) {
        const p  = await readContract.getProfile(evmAddress);
        const pt = await readContract.premiumTier(evmAddress);
        const pe = await readContract.premiumExpiry(evmAddress);
        setProfile(p);
        setPremiumTier(Number(pt));
        setPremiumExpiry(Number(pe));
      }
    } catch (e) {
      console.error("[Web3Context] loadProfile:", e);
    }
  }, [readContract, evmAddress]);

  useEffect(() => {
    if (evmConnected && readContract) loadProfile();
    else {
      setProfile(null);
      setHasProfile(false);
      setPremiumTier(0);
    }
  }, [evmConnected, readContract, loadProfile]);

  // ── EVM smart-contract tx wrapper ─────────────────────────────────────
  const sendEvmTx = useCallback(
    async (fn, successMsg = "Transaction confirmed!") => {
      if (!writeContract) {
        toast.error("Connect WalletConnect for smart contract actions");
        return null;
      }
      try {
        setTxPending(true);
        const tx = await fn(writeContract);
        toast.loading("Transaction pending…", { id: "tx" });
        await tx.wait();
        toast.success(successMsg, { id: "tx" });
        await loadProfile();
        return tx;
      } catch (e) {
        const msg = e?.reason || e?.message || "Transaction failed";
        toast.error(msg.slice(0, 100), { id: "tx" });
        return null;
      } finally {
        setTxPending(false);
      }
    },
    [writeContract, loadProfile]
  );

  // ── Xaman: generic payload creator ───────────────────────────────────
  const xamanSendTx = useCallback(async (txjson, customMeta = {}) => {
    if (!xrplAddress) {
      toast.error("Connect Xaman first");
      return null;
    }
    const res = await fetch("/api/xumm/payload", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ txjson, custom_meta: customMeta }),
    });
    if (!res.ok) throw new Error("Failed to create Xaman payload");
    return res.json(); // { uuid, qrUrl, wsUrl, deepLink }
  }, [xrplAddress]);

  // ── XRPL payment helpers ──────────────────────────────────────────────
  const sendPremiumPayment = (tier, months) =>
    xamanSendTx(buildPremiumPaymentTx(xrplAddress, tier, months), {
      identifier:  "tc-premium",
      instruction: `Upgrade to ${tier} for ${months} month(s)`,
    });

  const sendCreatorSub = (creatorAddr, tierName, priceDrops) =>
    xamanSendTx(
      buildCreatorSubPaymentTx(xrplAddress, creatorAddr, tierName, priceDrops),
      { identifier: "tc-creator-sub", instruction: `Subscribe to creator tier: ${tierName}` }
    );

  const anchorPost = (ipfsCid, postId) =>
    xamanSendTx(buildPostAnchorTx(xrplAddress, ipfsCid, postId), {
      identifier:  "tc-post",
      instruction: "Anchor post on XRP Ledger",
    });

  const mintVerificationBadge = (metadataCID) =>
    xamanSendTx(buildVerificationBadgeMint(xrplAddress, metadataCID), {
      identifier: "tc-badge",
    });

  const mintMembershipToken = (metadataCID, tierLevel) =>
    xamanSendTx(buildMembershipTokenMint(xrplAddress, metadataCID, tierLevel), {
      identifier: "tc-membership",
    });

  // ── EVM social-graph actions (smart contract) ─────────────────────────
  const createProfile   = (name, bio, avatarCID, coverCID)  => sendEvmTx(c => c.createProfile(name, bio, avatarCID, coverCID),   "Profile created!");
  const updateProfile   = (name, bio, avatarCID, coverCID)  => sendEvmTx(c => c.updateProfile(name, bio, avatarCID, coverCID),   "Profile updated!");
  const createPost      = (type, desc, mediaCID, exclusive) => sendEvmTx(c => c.createPost(type, desc, mediaCID, !!exclusive),    "Post published!");
  const likePost        = (postId)                          => sendEvmTx(c => c.likePost(postId),                                 "Liked!");
  const unlikePost      = (postId)                          => sendEvmTx(c => c.unlikePost(postId),                               "Unliked");
  const addComment      = (postId, text)                    => sendEvmTx(c => c.addComment(postId, text),                         "Comment added!");
  const deletePost      = (postId)                          => sendEvmTx(c => c.deletePost(postId),                               "Post deleted");
  const followUser      = (addr)                            => sendEvmTx(c => c.followUser(addr),                                 "Following!");
  const unfollowUser    = (addr)                            => sendEvmTx(c => c.unfollowUser(addr),                               "Unfollowed");
  const sendDM          = (to, content)                     => sendEvmTx(c => c.sendDirectMessage(to, content),                   "Message sent!");
  const createGroup     = (name, desc, imageCID)            => sendEvmTx(c => c.createGroup(name, desc, imageCID),                "Group created!");
  const joinGroup       = (id)                              => sendEvmTx(c => c.joinGroup(id),                                    "Joined!");
  const sendGroupMsg    = (id, msg)                         => sendEvmTx(c => c.sendGroupMessage(id, msg),                        "Sent!");
  const createCreatorTier      = (price, name, desc)        => sendEvmTx(c => c.createCreatorTier(price, name, desc),             "Tier created!");
  const subscribeToCreator     = (creator, tier, value)     => sendEvmTx(c => c.subscribeToCreator(creator, tier, { value }),     "Subscribed! 🎬");
  const withdrawRevenue        = ()                         => sendEvmTx(c => c.withdrawRevenue(),                                "Revenue withdrawn!");
  const requestVerification    = (legalName, acctType)      => sendEvmTx(c => c.requestVerification(legalName, acctType),         "Verification requested!");

  // ── Sign out ──────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    setXrplAddress(null);
    setXrplBalance("0");
    setWalletType(null);
    setProfile(null);
    setHasProfile(false);
    clearSession();
    if (evmConnected) wcDisconnect();
  }, [evmConnected, wcDisconnect]);

  // ── WalletModal callback ──────────────────────────────────────────────
  const handleWalletConnected = useCallback(
    ({ address, walletType: wt, evmAddress: eva }) => {
      if (address) {
        setXrplAddress(address);
        setWalletType(wt || "xaman");
        refreshBalance(address);
        saveSession({ xrplAddress: address, walletType: wt || "xaman" });
      }
      setModalOpen(false);
    },
    [refreshBalance]
  );

  // ── Demo mode (no real wallet needed for testing) ────────────────────
  const [demoMode, setDemoMode] = useState(false);

  const connectDemo = useCallback(() => {
    const demoAddr = "rDemoTribeConnect1234567890XRPL";
    setXrplAddress(demoAddr);
    setXrplBalance("1250.50");
    setWalletType("demo");
    setDemoMode(true);
    setProfile({ name: "Demo User", verified: true, bio: "Testing TribeConnect 🚀" });
    setHasProfile(true);
    setPremiumTier(2);
    setPremiumExpiry(Date.now() / 1000 + 86400 * 30);
    setModalOpen(false);
    toast.success("🎮 Demo mode active — explore everything!", { duration: 4000 });
  }, []);

  const xamanSendTxWithDemo = useCallback(async (txjson, customMeta = {}) => {
    if (demoMode) {
      toast.success("✅ Demo TX sent! (simulated — no real XRP used)", { duration: 3000 });
      return { uuid: "demo-uuid", deepLink: null, qrUrl: null };
    }
    return xamanSendTx(txjson, customMeta);
  }, [demoMode, xamanSendTx]);

  // ── Derived ───────────────────────────────────────────────────────────
  const isPro     = demoMode || (premiumTier >= 1 && premiumExpiry > Date.now() / 1000);
  const isCreator = demoMode || (premiumTier >= 2 && premiumExpiry > Date.now() / 1000);
  const isConnected = !!xrplAddress || evmConnected;

  return (
    <Web3Context.Provider value={{
      // Identity
      xrplAddress,
      evmAddress:    evmAddress || null,
      walletType,
      isConnected,
      authLoading,
      txPending,
      chain,
      evmConnected,

      // Profile (EVM)
      profile,
      hasProfile,
      premiumTier,
      premiumExpiry,
      isPro,
      isCreator,
      loadProfile,

      // Balance (XRPL)
      xrplBalance,
      refreshBalance: () => refreshBalance(),

      // Wallet modal
      modalOpen,
      openModal:  () => setModalOpen(true),
      closeModal: () => setModalOpen(false),
      handleWalletConnected,

      // Low-level contract setter (called by useContract hook)
      setReadContract,
      setWriteContract,

      // Demo mode
      demoMode,
      connectDemo,

      // Actions — Xaman / XRPL
      xamanSendTx: xamanSendTxWithDemo,
      sendPremiumPayment,
      sendCreatorSub,
      anchorPost,
      mintVerificationBadge,
      mintMembershipToken,

      // Actions — EVM (smart contract)
      createProfile,
      updateProfile,
      createPost,
      likePost,
      unlikePost,
      addComment,
      deletePost,
      followUser,
      unfollowUser,
      sendDM,
      createGroup,
      joinGroup,
      sendGroupMsg,
      createCreatorTier,
      subscribeToCreator,
      withdrawRevenue,
      requestVerification,

      // Sign out
      disconnect,

      // Raw contracts for custom queries
      readContract,
      writeContract,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used inside <Web3Provider>");
  return ctx;
};
