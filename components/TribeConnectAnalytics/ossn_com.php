<?php
/**
 * TribeConnect Analytics Component
 * Admin-facing analytics, moderation, and reporting dashboard
 */

// Admin pages
ossn_register_page('administrator/analytics',  'tribeconnect_analytics_page');
ossn_register_page('administrator/moderation', 'tribeconnect_moderation_page');
ossn_register_page('administrator/reports',    'tribeconnect_reports_page');
ossn_register_page('administrator/revenue',    'tribeconnect_revenue_page');

// Add admin menu items
ossn_add_hook('menus', 'admin_sidemenu', 'tribeconnect_analytics_admin_menu');

// ── Data fetchers ──────────────────────────────────────────

function tc_analytics_get_stats() {
    $db = ossn_database();
    return [
        'total_users'     => $db->getValue("SELECT COUNT(*) FROM ossn_users"),
        'new_users_today' => $db->getValue("SELECT COUNT(*) FROM ossn_users WHERE DATE(created_at) = CURDATE()"),
        'total_posts'     => $db->getValue("SELECT COUNT(*) FROM ossn_objects WHERE subtype = 'wall'"),
        'posts_today'     => $db->getValue("SELECT COUNT(*) FROM ossn_objects WHERE subtype = 'wall' AND DATE(created_at) = CURDATE()"),
        'total_reports'   => $db->getValue("SELECT COUNT(*) FROM tc_reports WHERE status = 'pending'"),
        'revenue_month'   => $db->getValue("SELECT COALESCE(SUM(amount), 0) FROM tc_payments WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) AND status = 'completed'"),
        'premium_users'   => $db->getValue("SELECT COUNT(*) FROM tc_premium_memberships WHERE status = 'active'"),
        'active_ads'      => $db->getValue("SELECT COUNT(*) FROM tc_ads WHERE status = 'active'"),
    ];
}

function tc_analytics_user_growth($days = 30) {
    $db  = ossn_database();
    $sql = "SELECT DATE(created_at) as date, COUNT(*) as count
            FROM ossn_users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC";
    return $db->getResults($sql, [$days]);
}

function tc_analytics_get_reports($status = 'pending', $limit = 50) {
    $db  = ossn_database();
    $sql = "SELECT r.*, u.username as reporter_username, u.name as reporter_name
            FROM tc_reports r
            LEFT JOIN ossn_users u ON r.reporter_guid = u.guid
            WHERE r.status = ?
            ORDER BY r.created_at DESC
            LIMIT ?";
    return $db->getResults($sql, [$status, $limit]);
}

// ── Page handlers ──────────────────────────────────────────

function tribeconnect_analytics_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }
    $stats  = tc_analytics_get_stats();
    $growth = tc_analytics_user_growth(30);
    $contents = ossn_plugin_view('analytics/admin/dashboard', [
        'stats'  => $stats,
        'growth' => $growth,
    ]);
    $params = ['title' => ossn_print('admin:analytics'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

function tribeconnect_moderation_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }
    $action = isset($pages[1]) ? $pages[1] : '';

    // Handle ban/suspend actions
    if ($action === 'ban' && isset($pages[2])) {
        $user_guid = (int)$pages[2];
        ossn_user_ban($user_guid);
        ossn_system_message(ossn_print('user:banned'));
        ossn_redirect(ossn_site_url('administrator/moderation'));
        return;
    }
    if ($action === 'unban' && isset($pages[2])) {
        $user_guid = (int)$pages[2];
        ossn_user_unban($user_guid);
        ossn_system_message(ossn_print('user:unbanned'));
        ossn_redirect(ossn_site_url('administrator/moderation'));
        return;
    }

    $db    = ossn_database();
    $users = $db->getResults("SELECT * FROM ossn_users ORDER BY created_at DESC LIMIT 100");
    $contents = ossn_plugin_view('analytics/admin/moderation', ['users' => $users]);
    $params   = ['title' => ossn_print('admin:moderation'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

function tribeconnect_reports_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }

    // Handle report resolution
    if (isset($_POST['resolve_report'])) {
        $report_id = (int)$_POST['report_id'];
        $action    = $_POST['action'];
        $db        = ossn_database();
        $db->query("UPDATE tc_reports SET status = ?, resolved_at = NOW() WHERE id = ?", [$action, $report_id]);
        ossn_system_message(ossn_print('report:resolved'));
        ossn_redirect(ossn_site_url('administrator/reports'));
        return;
    }

    $reports  = tc_analytics_get_reports('pending');
    $contents = ossn_plugin_view('analytics/admin/reports', ['reports' => $reports]);
    $params   = ['title' => ossn_print('admin:reports'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

function tribeconnect_revenue_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }
    $db       = ossn_database();
    $payments = $db->getResults(
        "SELECT p.*, u.username FROM tc_payments p LEFT JOIN ossn_users u ON p.user_guid = u.guid ORDER BY p.created_at DESC LIMIT 200"
    );
    $contents = ossn_plugin_view('analytics/admin/revenue', ['payments' => $payments]);
    $params   = ['title' => ossn_print('admin:revenue'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

/**
 * Add menu items to admin sidebar
 */
function tribeconnect_analytics_admin_menu($hook, $type, $params, $return) {
    $items = [
        ['name' => 'tc-analytics',  'text' => '<i class="fa fa-chart-line"></i> ' . ossn_print('analytics'),  'href' => ossn_site_url('administrator/analytics')],
        ['name' => 'tc-moderation', 'text' => '<i class="fa fa-shield-halved"></i> ' . ossn_print('moderation'), 'href' => ossn_site_url('administrator/moderation')],
        ['name' => 'tc-reports',    'text' => '<i class="fa fa-flag"></i> ' . ossn_print('reports'),           'href' => ossn_site_url('administrator/reports')],
        ['name' => 'tc-revenue',    'text' => '<i class="fa fa-dollar-sign"></i> ' . ossn_print('revenue'),    'href' => ossn_site_url('administrator/revenue')],
    ];
    foreach ($items as $item) {
        ossn_register_menu_item('admin_sidemenu', $item);
    }
    return $return;
}
