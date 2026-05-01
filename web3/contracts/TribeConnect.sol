// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TribeConnect
 * @notice Decentralised social media platform — posts, profiles, follows,
 *         groups, DMs, on-chain premium memberships, creator subscriptions,
 *         and verification badges.
 * @dev    Built on top of the SocialMediaDapp starter. Media stored on IPFS
 *         (Pinata); only CIDs are stored on-chain.
 */
contract TribeConnect is ReentrancyGuard, Ownable, Pausable {

    // ─────────────────────────────────────────────────────────────────────
    //  Structs
    // ─────────────────────────────────────────────────────────────────────

    struct Profile {
        address owner;
        string  name;
        string  bio;
        string  avatarCID;      // IPFS CID
        string  coverCID;       // IPFS CID
        uint32  timeCreated;
        uint32  id;
        uint32  postCount;
        uint32  followerCount;
        uint32  followingCount;
        bool    verified;
        uint8   premiumTier;    // 0=free 1=pro 2=creator
    }

    struct Post {
        address author;
        string  postType;       // "text" | "image" | "video"
        string  description;
        string  mediaCID;       // IPFS CID (empty for text posts)
        uint32  timeCreated;
        uint32  postID;
        uint32  likes;
        uint32  commentCount;
        bool    isDeleted;
        bool    isExclusive;    // creator-only content
    }

    struct Comment {
        address author;
        string  content;
        uint32  timestamp;
    }

    struct Message {
        address sender;
        uint32  timestamp;
        string  content;
    }

    struct Group {
        string  name;
        string  description;
        string  imageCID;
        uint32  groupID;
        uint32  memberCount;
        address creator;
        bool    isActive;
    }

    struct CreatorTier {
        uint256 price;          // in wei (per month)
        string  name;
        string  description;
        bool    isActive;
    }

    struct Subscription {
        address subscriber;
        address creator;
        uint8   tierId;
        uint256 expiresAt;
        bool    isActive;
    }

    struct VerificationRequest {
        address applicant;
        string  legalName;
        string  accountType;
        uint32  requestedAt;
        uint8   status;         // 0=pending 1=approved 2=denied
    }

    // ─────────────────────────────────────────────────────────────────────
    //  State
    // ─────────────────────────────────────────────────────────────────────

    mapping(address => Profile)               public profiles;
    mapping(address => bool)                  public hasProfile;

    mapping(uint256 => Post)                  public posts;
    mapping(uint256 => Comment[])             private postComments;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    mapping(address => uint256[])             private userPostIds;
    mapping(address => mapping(address => bool)) private _following;
    mapping(address => address[])             private _followers;
    mapping(address => address[])             private _followingList;

    mapping(bytes32 => Message[])             private directMessages;
    mapping(address => address[])             private dmConversations;

    mapping(uint256 => Group)                 public groups;
    mapping(uint256 => mapping(address => bool)) public groupMembers;
    mapping(uint256 => Message[])             private groupMessages;
    mapping(address => uint256[])             private userGroups;

    // Premium memberships
    mapping(address => uint8)                 public premiumTier;     // 0/1/2
    mapping(address => uint256)               public premiumExpiry;
    uint256 public proPricePerMonth     = 0.005 ether;   // ~$9.99 at ~$2000 ETH
    uint256 public creatorPricePerMonth = 0.012 ether;   // ~$24.99

    // Creator subscriptions
    mapping(address => CreatorTier[])         public creatorTiers;
    mapping(bytes32 => Subscription)          private subscriptions;
    mapping(address => address[])             private creatorSubscribers;
    mapping(address => address[])             private userSubscriptions;

    // Verification
    mapping(address => VerificationRequest)   public verificationRequests;
    mapping(address => bool)                  public pendingVerification;

    // Revenue tracking
    mapping(address => uint256)               public creatorRevenue;  // claimable
    uint256 public platformFeePercent = 15;   // 15% platform cut

    // Counters
    uint256 public userCounter;
    uint256 public postCounter;
    uint256 public groupCounter;

    // ─────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────

    event ProfileCreated(address indexed user, string name, uint256 userId);
    event ProfileUpdated(address indexed user);
    event PostCreated(address indexed author, uint256 indexed postId, string postType);
    event PostLiked(address indexed liker, uint256 indexed postId);
    event PostUnliked(address indexed unliker, uint256 indexed postId);
    event PostDeleted(address indexed author, uint256 indexed postId);
    event CommentAdded(address indexed commenter, uint256 indexed postId, string comment);
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed unfollower, address indexed unfollowed);
    event DirectMessageSent(address indexed sender, address indexed recipient);
    event GroupCreated(uint256 indexed groupId, address indexed creator, string name);
    event GroupMessageSent(uint256 indexed groupId, address indexed sender, string message);
    event UserJoinedGroup(uint256 indexed groupId, address indexed user);
    event PremiumUpgraded(address indexed user, uint8 tier, uint256 expiresAt);
    event CreatorTierCreated(address indexed creator, uint8 tierId, uint256 price);
    event SubscriptionStarted(address indexed subscriber, address indexed creator, uint8 tierId);
    event SubscriptionExpired(address indexed subscriber, address indexed creator);
    event VerificationRequested(address indexed user);
    event VerificationApproved(address indexed user);
    event VerificationDenied(address indexed user);
    event RevenueWithdrawn(address indexed creator, uint256 amount);

    // ─────────────────────────────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────────────────────────────

    modifier requiresProfile() {
        require(hasProfile[msg.sender], "TC: no profile");
        _;
    }

    modifier requiresPremium(uint8 minTier) {
        require(
            premiumTier[msg.sender] >= minTier &&
            premiumExpiry[msg.sender] >= block.timestamp,
            "TC: premium required"
        );
        _;
    }

    modifier postExists(uint256 postId) {
        require(postId < postCounter, "TC: invalid post");
        require(!posts[postId].isDeleted, "TC: post deleted");
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Profile
    // ─────────────────────────────────────────────────────────────────────

    function createProfile(
        string calldata name,
        string calldata bio,
        string calldata avatarCID,
        string calldata coverCID
    ) external whenNotPaused {
        require(!hasProfile[msg.sender], "TC: profile exists");
        require(bytes(name).length > 0 && bytes(name).length <= 64, "TC: invalid name");

        profiles[msg.sender] = Profile({
            owner:          msg.sender,
            name:           name,
            bio:            bio,
            avatarCID:      avatarCID,
            coverCID:       coverCID,
            timeCreated:    uint32(block.timestamp),
            id:             uint32(userCounter),
            postCount:      0,
            followerCount:  0,
            followingCount: 0,
            verified:       false,
            premiumTier:    0
        });
        hasProfile[msg.sender] = true;
        unchecked { ++userCounter; }
        emit ProfileCreated(msg.sender, name, userCounter - 1);
    }

    function updateProfile(
        string calldata name,
        string calldata bio,
        string calldata avatarCID,
        string calldata coverCID
    ) external requiresProfile whenNotPaused {
        Profile storage p = profiles[msg.sender];
        if (bytes(name).length > 0)     p.name      = name;
        if (bytes(bio).length > 0)      p.bio       = bio;
        if (bytes(avatarCID).length > 0) p.avatarCID = avatarCID;
        if (bytes(coverCID).length > 0)  p.coverCID  = coverCID;
        emit ProfileUpdated(msg.sender);
    }

    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }

    function getAllUsers(uint256 offset, uint256 limit)
        external view
        returns (Profile[] memory users, uint256 total)
    {
        total = userCounter;
        // Note: iteration over all users is O(n) — for large sets use events / subgraph
        return (users, total);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Posts
    // ─────────────────────────────────────────────────────────────────────

    function createPost(
        string calldata postType,
        string calldata description,
        string calldata mediaCID,
        bool isExclusive
    ) external requiresProfile whenNotPaused {
        if (isExclusive) {
            require(
                premiumTier[msg.sender] >= 2 &&
                premiumExpiry[msg.sender] >= block.timestamp,
                "TC: creator plan required for exclusive posts"
            );
        }

        uint256 id = postCounter;
        posts[id] = Post({
            author:       msg.sender,
            postType:     postType,
            description:  description,
            mediaCID:     mediaCID,
            timeCreated:  uint32(block.timestamp),
            postID:       uint32(id),
            likes:        0,
            commentCount: 0,
            isDeleted:    false,
            isExclusive:  isExclusive
        });
        userPostIds[msg.sender].push(id);
        unchecked {
            ++postCounter;
            ++profiles[msg.sender].postCount;
        }
        emit PostCreated(msg.sender, id, postType);
    }

    function editPost(uint256 postId, string calldata newDescription)
        external requiresProfile postExists(postId)
    {
        require(posts[postId].author == msg.sender, "TC: not author");
        posts[postId].description = newDescription;
    }

    function deletePost(uint256 postId)
        external requiresProfile postExists(postId)
    {
        require(posts[postId].author == msg.sender || owner() == msg.sender, "TC: not author");
        posts[postId].isDeleted = true;
        emit PostDeleted(msg.sender, postId);
    }

    function likePost(uint256 postId) external requiresProfile postExists(postId) {
        require(!hasLiked[postId][msg.sender], "TC: already liked");
        hasLiked[postId][msg.sender] = true;
        unchecked { ++posts[postId].likes; }
        emit PostLiked(msg.sender, postId);
    }

    function unlikePost(uint256 postId) external requiresProfile postExists(postId) {
        require(hasLiked[postId][msg.sender], "TC: not liked");
        hasLiked[postId][msg.sender] = false;
        unchecked { --posts[postId].likes; }
        emit PostUnliked(msg.sender, postId);
    }

    function addComment(uint256 postId, string calldata comment)
        external requiresProfile postExists(postId)
    {
        require(bytes(comment).length > 0 && bytes(comment).length <= 1000, "TC: invalid comment");
        postComments[postId].push(Comment({
            author:    msg.sender,
            content:   comment,
            timestamp: uint32(block.timestamp)
        }));
        unchecked { ++posts[postId].commentCount; }
        emit CommentAdded(msg.sender, postId, comment);
    }

    function getPost(uint256 postId) external view returns (Post memory) {
        return posts[postId];
    }

    function getAllPosts(uint256 offset, uint256 limit)
        external view
        returns (Post[] memory result, uint256 total)
    {
        total = postCounter;
        if (offset >= total) return (new Post[](0), total);
        uint256 end = offset + limit > total ? total : offset + limit;
        result = new Post[](end - offset);
        for (uint256 i = offset; i < end; ++i) {
            result[i - offset] = posts[i];
        }
    }

    function getUserPosts(address user) external view returns (Post[] memory) {
        uint256[] memory ids = userPostIds[user];
        Post[] memory result = new Post[](ids.length);
        for (uint256 i; i < ids.length; ++i) {
            result[i] = posts[ids[i]];
        }
        return result;
    }

    function getPostComments(uint256 postId) external view returns (Comment[] memory) {
        return postComments[postId];
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Follow / Unfollow
    // ─────────────────────────────────────────────────────────────────────

    function followUser(address userToFollow) external requiresProfile whenNotPaused {
        require(userToFollow != msg.sender, "TC: cannot follow self");
        require(hasProfile[userToFollow], "TC: target no profile");
        require(!_following[msg.sender][userToFollow], "TC: already following");

        _following[msg.sender][userToFollow] = true;
        _followers[userToFollow].push(msg.sender);
        _followingList[msg.sender].push(userToFollow);

        unchecked {
            ++profiles[msg.sender].followingCount;
            ++profiles[userToFollow].followerCount;
        }
        emit UserFollowed(msg.sender, userToFollow);
    }

    function unfollowUser(address userToUnfollow) external requiresProfile {
        require(_following[msg.sender][userToUnfollow], "TC: not following");
        _following[msg.sender][userToUnfollow] = false;

        _removeFromArray(_followers[userToUnfollow], msg.sender);
        _removeFromArray(_followingList[msg.sender], userToUnfollow);

        unchecked {
            --profiles[msg.sender].followingCount;
            --profiles[userToUnfollow].followerCount;
        }
        emit UserUnfollowed(msg.sender, userToUnfollow);
    }

    function checkIsFollowing(address follower, address followed) external view returns (bool) {
        return _following[follower][followed];
    }

    function getUserFollowers(address user) external view returns (address[] memory) {
        return _followers[user];
    }

    function getUserFollowing(address user) external view returns (address[] memory) {
        return _followingList[user];
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Direct Messages
    // ─────────────────────────────────────────────────────────────────────

    function sendDirectMessage(address recipient, string calldata content)
        external requiresProfile whenNotPaused
    {
        require(hasProfile[recipient], "TC: recipient no profile");
        require(bytes(content).length > 0 && bytes(content).length <= 2000, "TC: invalid message");

        bytes32 threadId = _dmThreadId(msg.sender, recipient);
        directMessages[threadId].push(Message({
            sender:    msg.sender,
            timestamp: uint32(block.timestamp),
            content:   content
        }));

        // Track conversation participants
        if (!_hasConversation(dmConversations[msg.sender], recipient)) {
            dmConversations[msg.sender].push(recipient);
            dmConversations[recipient].push(msg.sender);
        }
        emit DirectMessageSent(msg.sender, recipient);
    }

    function getDirectMessages(address otherUser) external view returns (Message[] memory) {
        bytes32 threadId = _dmThreadId(msg.sender, otherUser);
        return directMessages[threadId];
    }

    function getDMConversations() external view returns (address[] memory) {
        return dmConversations[msg.sender];
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Groups
    // ─────────────────────────────────────────────────────────────────────

    function createGroup(
        string calldata name,
        string calldata description,
        string calldata imageCID
    ) external requiresProfile whenNotPaused {
        require(bytes(name).length > 0 && bytes(name).length <= 100, "TC: invalid name");
        uint256 id = groupCounter;
        groups[id] = Group({
            name:        name,
            description: description,
            imageCID:    imageCID,
            groupID:     uint32(id),
            memberCount: 1,
            creator:     msg.sender,
            isActive:    true
        });
        groupMembers[id][msg.sender] = true;
        userGroups[msg.sender].push(id);
        unchecked { ++groupCounter; }
        emit GroupCreated(id, msg.sender, name);
    }

    function joinGroup(uint256 groupId) external requiresProfile whenNotPaused {
        require(groupId < groupCounter, "TC: invalid group");
        require(groups[groupId].isActive, "TC: group inactive");
        require(!groupMembers[groupId][msg.sender], "TC: already member");

        groupMembers[groupId][msg.sender] = true;
        userGroups[msg.sender].push(groupId);
        unchecked { ++groups[groupId].memberCount; }
        emit UserJoinedGroup(groupId, msg.sender);
    }

    function sendGroupMessage(uint256 groupId, string calldata message)
        external requiresProfile whenNotPaused
    {
        require(groupId < groupCounter, "TC: invalid group");
        require(groupMembers[groupId][msg.sender], "TC: not a member");
        require(bytes(message).length > 0 && bytes(message).length <= 2000, "TC: invalid message");

        groupMessages[groupId].push(Message({
            sender:    msg.sender,
            timestamp: uint32(block.timestamp),
            content:   message
        }));
        emit GroupMessageSent(groupId, msg.sender, message);
    }

    function getGroupMessages(uint256 groupId) external view returns (Message[] memory) {
        require(groupMembers[groupId][msg.sender] || owner() == msg.sender, "TC: not member");
        return groupMessages[groupId];
    }

    function getGroupDetails(uint256 groupId)
        external view
        returns (Group memory group)
    {
        return groups[groupId];
    }

    function getUserGroups(address user) external view returns (uint256[] memory) {
        return userGroups[user];
    }

    function getAllGroupIds() external view returns (uint256[] memory ids) {
        ids = new uint256[](groupCounter);
        for (uint256 i; i < groupCounter; ++i) ids[i] = i;
    }

    function deactivateGroup(uint256 groupId) external {
        require(
            groups[groupId].creator == msg.sender || owner() == msg.sender,
            "TC: not creator"
        );
        groups[groupId].isActive = false;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Premium Memberships (on-chain payments)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Purchase or renew a premium tier. Pays in ETH.
     * @param tier 1 = Pro, 2 = Creator
     * @param months Number of months to purchase
     */
    function upgradePremium(uint8 tier, uint256 months)
        external payable requiresProfile whenNotPaused nonReentrant
    {
        require(tier == 1 || tier == 2, "TC: invalid tier");
        require(months >= 1 && months <= 12, "TC: 1-12 months");

        uint256 price = tier == 1
            ? proPricePerMonth * months
            : creatorPricePerMonth * months;
        require(msg.value >= price, "TC: insufficient payment");

        uint256 currentExpiry = premiumExpiry[msg.sender];
        uint256 base = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiry = base + (months * 30 days);

        premiumTier[msg.sender]   = tier;
        premiumExpiry[msg.sender] = newExpiry;
        profiles[msg.sender].premiumTier = tier;

        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        emit PremiumUpgraded(msg.sender, tier, newExpiry);
    }

    function setPremiumPrices(uint256 proPrice, uint256 creatorPrice) external onlyOwner {
        proPricePerMonth     = proPrice;
        creatorPricePerMonth = creatorPrice;
    }

    function isPremium(address user, uint8 minTier) external view returns (bool) {
        return premiumTier[user] >= minTier && premiumExpiry[user] >= block.timestamp;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Creator Subscriptions
    // ─────────────────────────────────────────────────────────────────────

    function createCreatorTier(
        uint256 pricePerMonth,
        string calldata name,
        string calldata description
    ) external requiresPremium(2) {
        require(pricePerMonth > 0, "TC: price must be > 0");
        creatorTiers[msg.sender].push(CreatorTier({
            price:       pricePerMonth,
            name:        name,
            description: description,
            isActive:    true
        }));
        uint8 tierId = uint8(creatorTiers[msg.sender].length - 1);
        emit CreatorTierCreated(msg.sender, tierId, pricePerMonth);
    }

    function subscribeToCreator(address creator, uint8 tierId)
        external payable requiresProfile whenNotPaused nonReentrant
    {
        require(hasProfile[creator], "TC: creator no profile");
        require(tierId < creatorTiers[creator].length, "TC: invalid tier");
        CreatorTier memory tier = creatorTiers[creator][tierId];
        require(tier.isActive, "TC: tier inactive");
        require(msg.value >= tier.price, "TC: insufficient payment");

        bytes32 subKey = keccak256(abi.encodePacked(msg.sender, creator));
        uint256 currentExpiry = subscriptions[subKey].expiresAt;
        uint256 base = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;

        subscriptions[subKey] = Subscription({
            subscriber: msg.sender,
            creator:    creator,
            tierId:     tierId,
            expiresAt:  base + 30 days,
            isActive:   true
        });

        // Track subscriber relationships
        if (!_hasConversation(creatorSubscribers[creator], msg.sender)) {
            creatorSubscribers[creator].push(msg.sender);
            userSubscriptions[msg.sender].push(creator);
        }

        // Split revenue: (100 - platformFeePercent)% to creator
        uint256 platformCut = (msg.value * platformFeePercent) / 100;
        uint256 creatorCut  = msg.value - platformCut;
        creatorRevenue[creator] += creatorCut;

        // Refund excess
        if (msg.value > tier.price) {
            payable(msg.sender).transfer(msg.value - tier.price);
        }
        emit SubscriptionStarted(msg.sender, creator, tierId);
    }

    function isSubscribedTo(address subscriber, address creator) external view returns (bool) {
        bytes32 subKey = keccak256(abi.encodePacked(subscriber, creator));
        Subscription memory sub = subscriptions[subKey];
        return sub.isActive && sub.expiresAt >= block.timestamp;
    }

    function getCreatorTiers(address creator) external view returns (CreatorTier[] memory) {
        return creatorTiers[creator];
    }

    function getCreatorSubscribers(address creator) external view returns (address[] memory) {
        return creatorSubscribers[creator];
    }

    function getUserSubscriptions(address user) external view returns (address[] memory) {
        return userSubscriptions[user];
    }

    /** @notice Creator withdraws their earned subscription revenue */
    function withdrawRevenue() external nonReentrant {
        uint256 amount = creatorRevenue[msg.sender];
        require(amount > 0, "TC: nothing to withdraw");
        creatorRevenue[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit RevenueWithdrawn(msg.sender, amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Verification
    // ─────────────────────────────────────────────────────────────────────

    function requestVerification(
        string calldata legalName,
        string calldata accountType
    ) external requiresProfile {
        require(!pendingVerification[msg.sender], "TC: request pending");
        require(!profiles[msg.sender].verified, "TC: already verified");

        verificationRequests[msg.sender] = VerificationRequest({
            applicant:   msg.sender,
            legalName:   legalName,
            accountType: accountType,
            requestedAt: uint32(block.timestamp),
            status:      0
        });
        pendingVerification[msg.sender] = true;
        emit VerificationRequested(msg.sender);
    }

    function approveVerification(address user) external onlyOwner {
        require(pendingVerification[user], "TC: no pending request");
        profiles[user].verified              = true;
        verificationRequests[user].status    = 1;
        pendingVerification[user]            = false;
        emit VerificationApproved(user);
    }

    function denyVerification(address user) external onlyOwner {
        require(pendingVerification[user], "TC: no pending request");
        verificationRequests[user].status = 2;
        pendingVerification[user]         = false;
        emit VerificationDenied(user);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function setPlatformFee(uint256 feePercent) external onlyOwner {
        require(feePercent <= 30, "TC: max 30%");
        platformFeePercent = feePercent;
    }

    function withdrawPlatformRevenue() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "TC: no balance");
        payable(owner()).transfer(balance);
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Internal helpers
    // ─────────────────────────────────────────────────────────────────────

    function _dmThreadId(address a, address b) internal pure returns (bytes32) {
        return a < b
            ? keccak256(abi.encodePacked(a, b))
            : keccak256(abi.encodePacked(b, a));
    }

    function _hasConversation(address[] storage list, address target) internal view returns (bool) {
        for (uint256 i; i < list.length; ++i) {
            if (list[i] == target) return true;
        }
        return false;
    }

    function _removeFromArray(address[] storage arr, address target) internal {
        for (uint256 i; i < arr.length; ++i) {
            if (arr[i] == target) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                return;
            }
        }
    }

    receive() external payable {}
}
