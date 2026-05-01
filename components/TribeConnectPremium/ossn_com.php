<?php
/**
 * TribeConnect Premium Component
 * 3-tier membership: Free / Pro / Creator
 */

// Register pages
ossn_register_page('premium',  'tribeconnect_premium_page');
ossn_register_page('subscribe','tribeconnect_subscribe_page');

// Register admin pages
ossn_register_page('administrator/premium', 'tribeconnect_admin_premium_page');

// Hook: add premium badge to user profiles
ossn_add_hook('profile', 'header', 'tribeconnect_premium_profile_badge');

// Hook: restrict ads for premium users
ossn_add_hook('ads', 'display', 'tribeconnect_premium_filter_ads');

// Hook: add premium menu item
ossn_add_hook('menus', 'topbar_dropdown', 'tribeconnect_premium_topbar_menu');

/**
 * Premium plans definition
 */
function tribeconnect_premium_plans() {
    return [
        'free' => [
            'name'      => 'Free',
            'price'     => 0,
            'interval'  => null,
            'features'  => [
                'Basic profile',
                'Post & comment',
                'Join groups',
                'Standard support',
            ],
            'disabled'  => ['Ad-free experience', 'Creator tools', 'Priority support', 'Custom badges'],
        ],
        'pro' => [
            'name'      => 'Pro',
            'price'     => 9.99,
            'interval'  => 'month',
            'features'  => [
                'Ad-free experience',
                'Verified Pro badge',
                'Priority support',
                'Extended post history',
                'Custom profile themes',
            ],
            'disabled'  => ['Creator monetisation', 'Affiliate section', 'Analytics dashboard'],
        ],
        'creator' => [
            'name'      => 'Creator',
            'price'     => 24.99,
            'interval'  => 'month',
            'features'  => [
                'Everything in Pro',
                'Creator monetisation',
                'Subscriber management',
                'Affiliate product section',
                'Full analytics dashboard',
                'Priority verification',
                'Custom Creator badge',
            ],
            'disabled'  => [],
        ],
    ];
}

/**
 * Premium pricing page
 */
function tribeconnect_premium_page($pages) {
    $plans    = tribeconnect_premium_plans();
    $user     = ossn_loggedin_user();
    $contents = ossn_plugin_view('premium/page/pricing', [
        'plans' => $plans,
        'user'  => $user,
    ]);
    $params = ['title' => ossn_print('premium:upgrade'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

/**
 * Subscription handler (POST)
 */
function tribeconnect_subscribe_page($pages) {
    if (!ossn_isLoggedin()) {
        ossn_redirect(ossn_site_url('login'));
        return;
    }
    $plan = isset($pages[1]) ? $pages[1] : 'pro';
    $plans = tribeconnect_premium_plans();

    if (!isset($plans[$plan]) || $plan === 'free') {
        ossn_redirect(ossn_site_url('premium'));
        return;
    }

    $contents = ossn_plugin_view('premium/page/checkout', [
        'plan'  => $plan,
        'plans' => $plans,
    ]);
    $params = ['title' => ossn_print('premium:checkout'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

/**
 * Admin premium management
 */
function tribeconnect_admin_premium_page($pages) {
    $contents = ossn_plugin_view('premium/admin/overview');
    $params = ['title' => ossn_print('admin:premium'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

/**
 * Profile badge hook
 */
function tribeconnect_premium_profile_badge($hook, $type, $params, $return) {
    $user = ossn_get_user_by_guid(ossn_page_owner_guid());
    if (!$user) return $return;
    if (!empty($user->premium_plan) && $user->premium_plan !== 'free') {
        $return .= ossn_plugin_view('premium/widgets/badge', ['plan' => $user->premium_plan]);
    }
    return $return;
}

/**
 * Filter ads for premium users
 */
function tribeconnect_premium_filter_ads($hook, $type, $params, $return) {
    $user = ossn_loggedin_user();
    if ($user && !empty($user->premium_plan) && in_array($user->premium_plan, ['pro', 'creator'])) {
        return ''; // Ad-free for premium
    }
    return $return;
}

/**
 * Topbar dropdown menu item
 */
function tribeconnect_premium_topbar_menu($hook, $type, $params, $return) {
    $user = ossn_loggedin_user();
    if ($user && empty($user->premium_plan)) {
        ossn_register_menu_item('topbar_dropdown', [
            'name' => 'premium',
            'text' => '<i class="fa fa-crown"></i> ' . ossn_print('premium:upgrade'),
            'href' => ossn_site_url('premium'),
        ]);
    }
    return $return;
}
