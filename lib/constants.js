/**
 * TribeConnect — Contract Addresses
 *
 * Updated automatically by web3/scripts/deploy.js after each deploy.
 * Replace placeholder values with actual deployed addresses.
 */
export const CONTRACT_ADDRESSES = {
  localhost:    "0x0000000000000000000000000000000000000000", // hardhat local
  xrplDevnet:  process.env.NEXT_PUBLIC_CONTRACT_DEVNET  || "0x0000000000000000000000000000000000000000",
  xrplTestnet: process.env.NEXT_PUBLIC_CONTRACT_TESTNET || "0x0000000000000000000000000000000000000000",
  xrplMainnet: process.env.NEXT_PUBLIC_CONTRACT_MAINNET || "0x0000000000000000000000000000000000000000",
};
