<?php
/**
 * TribeConnect Creator Subscriptions
 * Tiers, subscriber management, exclusive content, affiliate products
 */

// Pages
ossn_register_page('creators',           'tc_creators_directory_page');
ossn_register_page('creator/subscribe',  'tc_creator_subscribe_page');
ossn_register_page('creator/manage',     'tc_creator_manage_page');
ossn_register_page('creator/tiers',      'tc_creator_tiers_page');
ossn_register_page('creator/affiliates', 'tc_creator_affiliates_page');

// Profile hooks
ossn_add_hook('profile', 'header', 'tc_creator_profile_section');

// ── Helpers ────────────────────────────────────────────────

function tc_creator_is_subscribed($creator_guid, $subscriber_guid) {
    $db = ossn_database();
    return (bool) $db->getValue(
        "SELECT COUNT(*) FROM tc_creator_subscriptions
         WHERE creator_guid = ? AND subscriber_guid = ? AND status = 'active'",
        [$creator_guid, $subscriber_guid]
    );
}

function tc_creator_get_tiers($creator_guid) {
    $db = ossn_database();
    return $db->getResults(
        "SELECT * FROM tc_creator_tiers WHERE creator_guid = ? AND is_active = 1 ORDER BY price ASC",
        [$creator_guid]
    );
}

function tc_creator_get_subscribers($creator_guid) {
    $db = ossn_database();
    return $db->getResults(
        "SELECT cs.*, u.username, u.name FROM tc_creator_subscriptions cs
         LEFT JOIN ossn_users u ON cs.subscriber_guid = u.guid
         WHERE cs.creator_guid = ? AND cs.status = 'active'
         ORDER BY cs.started_at DESC",
        [$creator_guid]
    );
}

function tc_creator_subscriber_count($creator_guid) {
    $db = ossn_database();
    return (int) $db->getValue(
        "SELECT COUNT(*) FROM tc_creator_subscriptions WHERE creator_guid = ? AND status = 'active'",
        [$creator_guid]
    );
}

function tc_creator_monthly_revenue($creator_guid) {
    $db = ossn_database();
    return (float) $db->getValue(
        "SELECT COALESCE(SUM(amount), 0) FROM tc_payments
         WHERE user_guid = ? AND type = 'creator_sub' AND status = 'completed'
         AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())",
        [$creator_guid]
    );
}

// ── Page handlers ──────────────────────────────────────────

function tc_creators_directory_page($pages) {
    $db       = ossn_database();
    $creators = $db->getResults(
        "SELECT u.* FROM ossn_users u
         INNER JOIN tc_creator_tiers t ON t.creator_guid = u.guid
         WHERE u.premium_plan = 'creator' AND t.is_active = 1
         GROUP BY u.guid ORDER BY u.name ASC"
    );
    $contents = ossn_plugin_view('creator/page/directory', ['creators' => $creators]);
    $params   = ['title' => 'Creators', 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tc_creator_subscribe_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }

    $creator_username = $pages[1] ?? '';
    $tier_id          = (int)($pages[2] ?? 0);

    if (!$creator_username || !$tier_id) { ossn_redirect(ossn_site_url('creators')); return; }

    $creator = ossn_get_user_by_username($creator_username);
    if (!$creator) { ossn_redirect(ossn_site_url('creators')); return; }

    $db   = ossn_database();
    $tier = $db->getRow("SELECT * FROM tc_creator_tiers WHERE id = ? AND creator_guid = ? AND is_active = 1", [$tier_id, $creator->guid]);
    if (!$tier) { ossn_redirect(ossn_site_url('u/' . $creator_username)); return; }

    // Check already subscribed
    $subscriber = ossn_loggedin_user();
    if (tc_creator_is_subscribed($creator->guid, $subscriber->guid)) {
        ossn_error_message('You are already subscribed to this creator.');
        ossn_redirect(ossn_site_url('u/' . $creator_username));
        return;
    }

    $contents = ossn_plugin_view('creator/page/checkout', ['creator' => $creator, 'tier' => $tier]);
    $params   = ['title' => 'Subscribe to ' . $creator->fullname, 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tc_creator_manage_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }
    $user = ossn_loggedin_user();
    if ($user->premium_plan !== 'creator') {
        ossn_redirect(ossn_site_url('premium'));
        return;
    }

    $subscribers = tc_creator_get_subscribers($user->guid);
    $tiers       = tc_creator_get_tiers($user->guid);
    $revenue     = tc_creator_monthly_revenue($user->guid);

    $contents = ossn_plugin_view('creator/page/manage', [
        'user'        => $user,
        'subscribers' => $subscribers,
        'tiers'       => $tiers,
        'revenue'     => $revenue,
    ]);
    $params = ['title' => 'Creator Dashboard', 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tc_creator_tiers_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }
    $user = ossn_loggedin_user();
    if ($user->premium_plan !== 'creator') { ossn_redirect(ossn_site_url('premium')); return; }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $db   = ossn_database();
        $name = ossn_sanitize($_POST['tier_name'] ?? '');
        $desc = ossn_sanitize($_POST['tier_description'] ?? '');
        $price = (float)($_POST['price'] ?? 0);
        $perks = json_encode(explode("\n", $_POST['perks'] ?? ''));

        if ($name && $price > 0) {
            $db->query(
                "INSERT INTO tc_creator_tiers (creator_guid, name, description, price, perks, is_active)
                 VALUES (?, ?, ?, ?, ?, 1)",
                [$user->guid, $name, $desc, $price, $perks]
            );
            ossn_system_message('Tier created successfully.');
        }
        ossn_redirect(ossn_site_url('creator/tiers'));
        return;
    }

    $tiers    = tc_creator_get_tiers($user->guid);
    $contents = ossn_plugin_view('creator/page/tiers', ['tiers' => $tiers]);
    $params   = ['title' => 'Manage Subscription Tiers', 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tc_creator_affiliates_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }
    $user = ossn_loggedin_user();
    if ($user->premium_plan !== 'creator') { ossn_redirect(ossn_site_url('premium')); return; }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $db    = ossn_database();
        $name  = ossn_sanitize($_POST['product_name'] ?? '');
        $desc  = ossn_sanitize($_POST['description'] ?? '');
        $url   = filter_var($_POST['affiliate_url'] ?? '', FILTER_SANITIZE_URL);
        $price = ossn_sanitize($_POST['price_display'] ?? '');
        $comm  = (float)($_POST['commission'] ?? 0);

        if ($name && $url) {
            $db->query(
                "INSERT INTO tc_affiliate_products (user_guid, name, description, affiliate_url, price_display, commission, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, 1)",
                [$user->guid, $name, $desc, $url, $price, $comm]
            );
            ossn_system_message('Affiliate product added.');
        }
        ossn_redirect(ossn_site_url('creator/affiliates'));
        return;
    }

    $db       = ossn_database();
    $products = $db->getResults("SELECT * FROM tc_affiliate_products WHERE user_guid = ? AND is_active = 1 ORDER BY created_at DESC", [$user->guid]);
    $contents = ossn_plugin_view('creator/page/affiliates', ['products' => $products]);
    $params   = ['title' => 'Affiliate Products', 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

/**
 * Profile hook: show subscription tiers on creator profiles
 */
function tc_creator_profile_section($hook, $type, $params, $return) {
    $profile_user = ossn_get_user_by_guid(ossn_page_owner_guid());
    if (!$profile_user || $profile_user->premium_plan !== 'creator') return $return;

    $tiers = tc_creator_get_tiers($profile_user->guid);
    if (!$tiers) return $return;

    $return .= ossn_plugin_view('creator/widgets/tiers_section', [
        'creator' => $profile_user,
        'tiers'   => $tiers,
    ]);
    return $return;
}
