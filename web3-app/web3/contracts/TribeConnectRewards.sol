// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TribeConnectRewards
 * @notice On-chain incentive engine for TribeConnect.
 *
 * Reward categories:
 *  1. Daily streak   — claim once per 24h, 7-day bonus
 *  2. Content pool   — owner distributes daily viral rewards
 *  3. Referrals      — 2 XRP per qualified referral (30-day activity)
 *  4. Milestones     — creator subscriber counts (100 / 500 / 1K)
 *  5. Challenges     — weekly pools, owner picks winners
 *
 * All amounts in drops (1 XRP = 1e18 wei on XRPL EVM).
 */
contract TribeConnectRewards is ReentrancyGuard, Ownable, Pausable {

    // ── Constants ──────────────────────────────────────────────────────
    uint256 public constant DAILY_STREAK_AMOUNT  = 0.1  ether; // 0.1 XRP
    uint256 public constant STREAK_7DAY_BONUS    = 1    ether; // 1 XRP
    uint256 public constant REFERRAL_AMOUNT      = 2    ether; // 2 XRP per referral
    uint256 public constant MILESTONE_100_AMOUNT = 5    ether; // 5 XRP
    uint256 public constant MILESTONE_500_AMOUNT = 15   ether; // 15 XRP
    uint256 public constant MILESTONE_1K_AMOUNT  = 50   ether; // 50 XRP
    uint256 public constant CLAIM_COOLDOWN       = 23 hours;   // allow slight drift

    // ── Streak tracking ────────────────────────────────────────────────
    struct StreakInfo {
        uint256 lastClaim;
        uint256 currentStreak;
        uint256 totalClaimed;
    }
    mapping(address => StreakInfo) public streaks;

    // ── Referral tracking ──────────────────────────────────────────────
    mapping(address => address)  public referredBy;      // who referred this user
    mapping(address => uint256)  public referralCount;   // how many they referred
    mapping(address => uint256)  public referralEarned;  // XRP earned from referrals
    mapping(address => uint256)  public joinedAt;        // when user first joined

    // ── Milestone tracking ─────────────────────────────────────────────
    mapping(address => mapping(uint256 => bool)) public milestoneClaimed; // user → threshold → claimed

    // ── Challenge pool ─────────────────────────────────────────────────
    struct Challenge {
        string  title;
        uint256 prizePool;
        uint256 endsAt;
        bool    distributed;
    }
    Challenge[] public challenges;
    mapping(uint256 => address[]) public challengeWinners;

    // ── Events ─────────────────────────────────────────────────────────
    event StreakClaimed(address indexed user, uint256 amount, uint256 streak);
    event ReferralRegistered(address indexed referrer, address indexed referee);
    event ReferralRewarded(address indexed referrer, uint256 amount);
    event MilestoneClaimed(address indexed creator, uint256 threshold, uint256 amount);
    event ChallengeCreated(uint256 indexed id, string title, uint256 prize);
    event ChallengeDistributed(uint256 indexed id, address[] winners);
    event FundsDeposited(address indexed from, uint256 amount);

    // ── Constructor ────────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    receive() external payable { emit FundsDeposited(msg.sender, msg.value); }

    // ── Streak ─────────────────────────────────────────────────────────

    /**
     * @notice Claim daily streak reward. Can claim once per 23h.
     *         Streak resets if more than 48h since last claim.
     */
    function claimDailyStreak() external nonReentrant whenNotPaused {
        StreakInfo storage s = streaks[msg.sender];
        require(block.timestamp >= s.lastClaim + CLAIM_COOLDOWN, "Too soon");

        // Reset streak if missed a day
        if (block.timestamp > s.lastClaim + 48 hours) s.currentStreak = 0;

        s.currentStreak++;
        s.lastClaim = block.timestamp;

        uint256 amount = DAILY_STREAK_AMOUNT;
        if (s.currentStreak % 7 == 0) amount += STREAK_7DAY_BONUS;

        s.totalClaimed += amount;
        _send(msg.sender, amount);
        emit StreakClaimed(msg.sender, amount, s.currentStreak);
    }

    // ── Referrals ──────────────────────────────────────────────────────

    /** @notice Register the referrer when a new user first joins. */
    function registerReferral(address referrer) external whenNotPaused {
        require(joinedAt[msg.sender] == 0, "Already registered");
        require(referrer != msg.sender, "Cannot self-refer");
        require(referrer != address(0), "Invalid referrer");

        joinedAt[msg.sender]  = block.timestamp;
        referredBy[msg.sender] = referrer;
        referralCount[referrer]++;

        emit ReferralRegistered(referrer, msg.sender);
    }

    /**
     * @notice Claim referral reward for a specific referee who has been
     *         active for 30+ days.
     */
    function claimReferralReward(address referee) external nonReentrant whenNotPaused {
        require(referredBy[referee] == msg.sender, "Not your referral");
        require(block.timestamp >= joinedAt[referee] + 30 days, "Referee too new");

        // Mark as paid by zeroing the referrer mapping
        referredBy[referee] = address(0);

        uint256 amount = REFERRAL_AMOUNT;
        referralEarned[msg.sender] += amount;
        _send(msg.sender, amount);
        emit ReferralRewarded(msg.sender, amount);
    }

    // ── Milestones ─────────────────────────────────────────────────────

    /**
     * @notice Creator claims milestone reward.
     * @param subscriberCount Verified off-chain via oracle / owner signature.
     *        In production: use Chainlink or owner-signed proof.
     */
    function claimMilestone(uint256 subscriberCount) external nonReentrant whenNotPaused {
        uint256[3] memory thresholds = [uint256(100), uint256(500), uint256(1000)];
        uint256[3] memory amounts    = [MILESTONE_100_AMOUNT, MILESTONE_500_AMOUNT, MILESTONE_1K_AMOUNT];

        bool paid = false;
        for (uint i = 0; i < thresholds.length; i++) {
            if (subscriberCount >= thresholds[i] && !milestoneClaimed[msg.sender][thresholds[i]]) {
                milestoneClaimed[msg.sender][thresholds[i]] = true;
                _send(msg.sender, amounts[i]);
                emit MilestoneClaimed(msg.sender, thresholds[i], amounts[i]);
                paid = true;
            }
        }
        require(paid, "No eligible milestone");
    }

    // ── Challenges ─────────────────────────────────────────────────────

    /** @notice Owner creates a new weekly challenge with XRP prize pool. */
    function createChallenge(string calldata title, uint256 durationDays) external payable onlyOwner {
        require(msg.value > 0, "Need prize pool");
        challenges.push(Challenge({
            title:       title,
            prizePool:   msg.value,
            endsAt:      block.timestamp + durationDays * 1 days,
            distributed: false,
        }));
        emit ChallengeCreated(challenges.length - 1, title, msg.value);
    }

    /** @notice Owner distributes prizes to winners (equal split). */
    function distributeChallenge(uint256 id, address[] calldata winners) external nonReentrant onlyOwner {
        Challenge storage c = challenges[id];
        require(block.timestamp >= c.endsAt, "Not ended");
        require(!c.distributed, "Already distributed");
        require(winners.length > 0, "No winners");

        c.distributed = true;
        challengeWinners[id] = winners;

        uint256 share = c.prizePool / winners.length;
        for (uint i = 0; i < winners.length; i++) {
            _send(winners[i], share);
        }
        emit ChallengeDistributed(id, winners);
    }

    // ── Content pool distribution (viral rewards) ──────────────────────

    /**
     * @notice Owner distributes daily viral content rewards.
     * @param creators Array of top-10 creator addresses.
     * @param amounts  Corresponding XRP amounts (must sum ≤ balance).
     */
    function distributeContentRewards(
        address[] calldata creators,
        uint256[]  calldata amounts
    ) external nonReentrant onlyOwner {
        require(creators.length == amounts.length, "Length mismatch");
        for (uint i = 0; i < creators.length; i++) {
            _send(creators[i], amounts[i]);
        }
    }

    // ── Admin ──────────────────────────────────────────────────────────

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function withdrawReserve(uint256 amount) external nonReentrant onlyOwner {
        _send(owner(), amount);
    }

    function balance() external view returns (uint256) { return address(this).balance; }

    // ── Internal ───────────────────────────────────────────────────────

    function _send(address to, uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient reward pool");
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "Transfer failed");
    }
}
