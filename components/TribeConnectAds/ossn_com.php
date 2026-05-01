<?php
/**
 * TribeConnect Ads Manager Component
 * Self-serve advertising platform with CPM/CPC billing
 */

// Pages
ossn_register_page('advertise',        'tribeconnect_advertise_page');
ossn_register_page('advertise/create', 'tribeconnect_ad_create_page');
ossn_register_page('advertise/manage', 'tribeconnect_ad_manage_page');
ossn_register_page('administrator/ads','tribeconnect_admin_ads_page');

// Hooks
ossn_add_hook('wall', 'post:after', 'tribeconnect_ads_inject_sponsored');
ossn_extend_view('tribeconnect_ads/sidebar', 'TribeConnectAds/sidebar');
ossn_extend_view('tribeconnect_ads/feed',    'TribeConnectAds/feed');

// ── Ad display functions ───────────────────────────────────

/**
 * Retrieve active ads for a given placement
 */
function tribeconnect_ads_get_active($placement = 'sidebar', $limit = 3) {
    $db  = ossn_database();
    $now = date('Y-m-d H:i:s');
    $sql = "SELECT * FROM tc_ads
            WHERE placement = ? AND status = 'active'
            AND start_date <= ? AND end_date >= ?
            ORDER BY bid DESC LIMIT ?";
    return $db->getResults($sql, [$placement, $now, $now, $limit]);
}

/**
 * Record an ad impression
 */
function tribeconnect_ads_record_impression($ad_id, $user_guid = 0) {
    $db  = ossn_database();
    $ip  = $_SERVER['REMOTE_ADDR'] ?? '';
    $sql = "INSERT INTO tc_ad_impressions (ad_id, user_guid, ip, created_at)
            VALUES (?, ?, ?, NOW())";
    $db->query($sql, [$ad_id, $user_guid, $ip]);
    $db->query("UPDATE tc_ads SET impressions = impressions + 1 WHERE id = ?", [$ad_id]);
}

/**
 * Record an ad click
 */
function tribeconnect_ads_record_click($ad_id, $user_guid = 0) {
    $db  = ossn_database();
    $ip  = $_SERVER['REMOTE_ADDR'] ?? '';
    $sql = "INSERT INTO tc_ad_clicks (ad_id, user_guid, ip, created_at)
            VALUES (?, ?, ?, NOW())";
    $db->query($sql, [$ad_id, $user_guid, $ip]);
    $db->query("UPDATE tc_ads SET clicks = clicks + 1 WHERE id = ?", [$ad_id]);
}

// ── Page handlers ──────────────────────────────────────────

function tribeconnect_advertise_page($pages) {
    $contents = ossn_plugin_view('ads/page/advertise_home');
    $params   = ['title' => ossn_print('advertise'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tribeconnect_ad_create_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }
    $contents = ossn_plugin_view('ads/page/create');
    $params   = ['title' => ossn_print('ads:create:campaign'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tribeconnect_ad_manage_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }
    $user = ossn_loggedin_user();
    $db   = ossn_database();
    $ads  = $db->getResults("SELECT * FROM tc_ads WHERE advertiser_guid = ? ORDER BY created_at DESC", [$user->guid]);
    $contents = ossn_plugin_view('ads/page/manage', ['ads' => $ads]);
    $params   = ['title' => ossn_print('ads:my:campaigns'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tribeconnect_admin_ads_page($pages) {
    $db       = ossn_database();
    $ads      = $db->getResults("SELECT a.*, u.username FROM tc_ads a LEFT JOIN ossn_users u ON a.advertiser_guid = u.guid ORDER BY a.created_at DESC LIMIT 100");
    $contents = ossn_plugin_view('ads/admin/overview', ['ads' => $ads]);
    $params   = ['title' => ossn_print('admin:ads:manager'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

/**
 * Inject sponsored post every N posts in newsfeed
 */
function tribeconnect_ads_inject_sponsored($hook, $type, $params, $return) {
    static $post_count = 0;
    $post_count++;

    // Show sponsored post every 5 regular posts
    if ($post_count % 5 === 0) {
        $user    = ossn_loggedin_user();
        // Skip for premium users
        if ($user && !empty($user->premium_plan) && in_array($user->premium_plan, ['pro', 'creator'])) {
            return $return;
        }
        $ads = tribeconnect_ads_get_active('feed', 1);
        if ($ads) {
            $return .= ossn_plugin_view('ads/widgets/sponsored_post', ['ad' => $ads[0]]);
        }
    }
    return $return;
}
