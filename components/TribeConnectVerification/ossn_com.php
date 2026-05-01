<?php
/**
 * TribeConnect Verification Component
 * Profile verification badge system
 */

ossn_register_page('verification/apply',             'tc_verification_apply_page');
ossn_register_page('administrator/verification',      'tc_verification_admin_page');
ossn_register_page('administrator/verification/approve', 'tc_verification_approve_page');
ossn_register_page('administrator/verification/deny',    'tc_verification_deny_page');

ossn_add_hook('menus', 'admin_sidemenu', 'tc_verification_admin_menu');

// ── Page handlers ──────────────────────────────────────────

function tc_verification_apply_page($pages) {
    if (!ossn_isLoggedin()) { ossn_redirect(ossn_site_url('login')); return; }
    $user = ossn_loggedin_user();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $db   = ossn_database();
        $name = ossn_sanitize($_POST['legal_name'] ?? '');
        $type = ossn_sanitize($_POST['account_type'] ?? 'individual');
        $docs = $_POST['supporting_info'] ?? '';

        // Check existing application
        $existing = $db->getValue("SELECT id FROM tc_verifications WHERE user_guid = ? AND status = 'pending'", [$user->guid]);
        if ($existing) {
            ossn_error_message(ossn_print('verification:already:pending'));
        } else {
            $db->query(
                "INSERT INTO tc_verifications (user_guid, legal_name, account_type, supporting_info, status, created_at)
                 VALUES (?, ?, ?, ?, 'pending', NOW())",
                [$user->guid, $name, $type, $docs]
            );
            ossn_system_message(ossn_print('verification:applied'));
        }
        ossn_redirect(ossn_site_url('u/' . $user->username));
        return;
    }

    $db     = ossn_database();
    $status = $db->getValue("SELECT status FROM tc_verifications WHERE user_guid = ? ORDER BY created_at DESC LIMIT 1", [$user->guid]);
    $contents = ossn_plugin_view('verification/page/apply', ['user' => $user, 'status' => $status]);
    $params   = ['title' => ossn_print('verification:apply'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/page', $params);
}

function tc_verification_admin_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }
    $db       = ossn_database();
    $requests = $db->getResults(
        "SELECT v.*, u.username, u.name FROM tc_verifications v
         LEFT JOIN ossn_users u ON v.user_guid = u.guid
         WHERE v.status = 'pending' ORDER BY v.created_at ASC"
    );
    $contents = ossn_plugin_view('verification/admin/queue', ['requests' => $requests]);
    $params   = ['title' => ossn_print('admin:verification:queue'), 'contents' => $contents];
    echo ossn_plugin_view('theme/page/layout/administrator/administrator', $params);
}

function tc_verification_approve_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }
    $id = (int)($pages[2] ?? 0);
    if (!$id) { ossn_redirect(ossn_site_url('administrator/verification')); return; }

    $db  = ossn_database();
    $req = $db->getRow("SELECT * FROM tc_verifications WHERE id = ?", [$id]);
    if ($req) {
        $db->query("UPDATE tc_verifications SET status = 'approved', resolved_at = NOW() WHERE id = ?", [$id]);
        // Set verified flag on user entity
        $db->query("UPDATE ossn_users SET verified = 1 WHERE guid = ?", [$req->user_guid]);
        ossn_system_message(ossn_print('verification:approved'));
    }
    ossn_redirect(ossn_site_url('administrator/verification'));
}

function tc_verification_deny_page($pages) {
    if (!ossn_isAdminLoggedin()) { ossn_redirect(ossn_site_url('administrator')); return; }
    $id = (int)($pages[2] ?? 0);
    if (!$id) { ossn_redirect(ossn_site_url('administrator/verification')); return; }

    $db = ossn_database();
    $db->query("UPDATE tc_verifications SET status = 'denied', resolved_at = NOW() WHERE id = ?", [$id]);
    ossn_system_message(ossn_print('verification:denied'));
    ossn_redirect(ossn_site_url('administrator/verification'));
}

function tc_verification_admin_menu($hook, $type, $params, $return) {
    ossn_register_menu_item('admin_sidemenu', [
        'name' => 'tc-verification',
        'text' => '<i class="fa fa-circle-check"></i> ' . ossn_print('verification:queue'),
        'href' => ossn_site_url('administrator/verification'),
    ]);
    return $return;
}
