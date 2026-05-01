/**
 * TribeConnect — Contract ABI
 * Generated from web3/contracts/TribeConnect.sol
 * Run `npx hardhat compile` to regenerate from source.
 */
export const CONTRACT_ABI = [
  // ── Profile ───────────────────────────────────────────────────────────
  "function createProfile(string name, string bio, string avatarCID, string coverCID) external",
  "function updateProfile(string name, string bio, string avatarCID, string coverCID) external",
  "function getProfile(address user) external view returns (tuple(string name, string bio, string avatarCID, string coverCID, bool verified, uint8 premiumTier))",
  "function hasProfile(address user) external view returns (bool)",

  // ── Posts ─────────────────────────────────────────────────────────────
  "function createPost(uint8 postType, string description, string mediaCID, bool isExclusive) external returns (uint256)",
  "function likePost(uint256 postId) external",
  "function unlikePost(uint256 postId) external",
  "function addComment(uint256 postId, string comment) external",
  "function deletePost(uint256 postId) external",
  "function getPost(uint256 postId) external view returns (tuple(uint256 id, address author, uint8 postType, string description, string mediaCID, bool isExclusive, uint256 likes, uint256 timestamp, bool isDeleted))",
  "function getUserPosts(address user) external view returns (uint256[])",

  // ── Social graph ──────────────────────────────────────────────────────
  "function followUser(address user) external",
  "function unfollowUser(address user) external",
  "function isFollowing(address follower, address followed) external view returns (bool)",
  "function getFollowers(address user) external view returns (address[])",
  "function getFollowing(address user) external view returns (address[])",

  // ── Messaging ─────────────────────────────────────────────────────────
  "function sendDirectMessage(address to, string content) external",
  "function getDirectMessages(address other) external view returns (tuple(address from, string content, uint256 timestamp)[])",

  // ── Groups ────────────────────────────────────────────────────────────
  "function createGroup(string name, string description, string imageCID) external returns (uint256)",
  "function joinGroup(uint256 groupId) external",
  "function leaveGroup(uint256 groupId) external",
  "function sendGroupMessage(uint256 groupId, string message) external",
  "function getGroup(uint256 groupId) external view returns (tuple(uint256 id, address creator, string name, string description, string imageCID, uint256 memberCount, uint256 timestamp))",

  // ── Premium ───────────────────────────────────────────────────────────
  "function upgradePremium(uint8 tier, uint256 months) external payable",
  "function premiumTier(address user) external view returns (uint8)",
  "function premiumExpiry(address user) external view returns (uint256)",

  // ── Creator subscriptions ─────────────────────────────────────────────
  "function createCreatorTier(uint256 pricePerMonth, string name, string description) external returns (uint8)",
  "function subscribeToCreator(address creator, uint8 tierId) external payable",
  "function isSubscribed(address subscriber, address creator) external view returns (bool)",
  "function getCreatorTiers(address creator) external view returns (tuple(uint8 id, uint256 pricePerMonth, string name, string description, bool active)[])",
  "function withdrawRevenue() external",

  // ── Verification ──────────────────────────────────────────────────────
  "function requestVerification(string legalName, string accountType) external",
  "function approveVerification(address user) external",
  "function denyVerification(address user) external",

  // ── Events ────────────────────────────────────────────────────────────
  "event ProfileCreated(address indexed user, string name)",
  "event PostCreated(uint256 indexed postId, address indexed author, bool isExclusive)",
  "event PostLiked(uint256 indexed postId, address indexed liker)",
  "event UserFollowed(address indexed follower, address indexed followed)",
  "event PremiumUpgraded(address indexed user, uint8 tier, uint256 expiry)",
  "event SubscriptionStarted(address indexed subscriber, address indexed creator, uint8 tierId)",
  "event VerificationApproved(address indexed user)",
  "event RevenueWithdrawn(address indexed creator, uint256 amount)",
];
