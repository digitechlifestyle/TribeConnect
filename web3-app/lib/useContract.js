/**
 * TribeConnect — useContract hook
 * Returns ethers Contract instances backed by the WalletConnect provider.
 * Chain IDs: XRPL EVM Devnet 1440002 · Testnet 1449000 · Mainnet 1440001
 */
import { usePublicClient, useWalletClient, useChainId } from "wagmi";
import { useMemo } from "react";
import { ethers }  from "ethers";
import { CONTRACT_ABI }       from "./contractABI";
import { CONTRACT_ADDRESSES } from "./constants";

const CHAIN_ID_TO_KEY = {
  1440002: "xrplDevnet",
  1449000: "xrplTestnet",
  1440001: "xrplMainnet",
  31337:   "localhost",
};

/**
 * Returns:
 *   readContract   — ethers.Contract (read-only, no signer)
 *   writeContract  — ethers.Contract (write, wallet-backed)
 *   contractAddress
 *   networkKey
 */
export function useContract() {
  const chainId     = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const networkKey      = CHAIN_ID_TO_KEY[chainId] || "xrplDevnet";
  const contractAddress = CONTRACT_ADDRESSES[networkKey];

  const readContract = useMemo(() => {
    if (!publicClient || !contractAddress) return null;
    try {
      // wagmi v2: use public client's transport as an ethers provider
      const provider = new ethers.providers.JsonRpcProvider(
        publicClient.transport?.url ||
        `https://rpc.evm.${{ 1440002: "devnet", 1449000: "testnet", 1440001: "" }[chainId] || "devnet"}.xrpl.org`
      );
      return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    } catch (_) {
      return null;
    }
  }, [publicClient, contractAddress, chainId]);

  const writeContract = useMemo(() => {
    if (!walletClient || !contractAddress) return null;
    try {
      const { account, chain, transport } = walletClient;
      const network = { chainId: chain.id, name: chain.name, ensAddress: null };
      const provider = new ethers.providers.Web3Provider(transport, network);
      const signer   = provider.getSigner(account.address);
      return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    } catch (_) {
      return null;
    }
  }, [walletClient, contractAddress]);

  return { readContract, writeContract, contractAddress, networkKey };
}
