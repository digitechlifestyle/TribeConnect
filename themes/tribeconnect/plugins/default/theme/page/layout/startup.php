<?php
/**
 * TribeConnect – Startup / Landing / Login page layout
 */
?>
<div class="tc-startup-page">
    <div class="tc-startup-card">
        <div class="tc-startup-logo">
            <div class="tc-startup-logo-icon">T</div>
            <h1><?php echo ossn_site_settings('site_name'); ?></h1>
            <p><?php echo ossn_site_settings('site_description'); ?></p>
        </div>

        <?php echo $params['contents'] ?? ''; ?>

        <div style="text-align:center; margin-top:24px;">
            <?php if (!ossn_isLoggedin()): ?>
            <p style="font-size:14px; color:var(--tc-text-muted);">
                <?php echo ossn_print('no:account'); ?>
                <a href="<?php echo ossn_site_url('register'); ?>"><?php echo ossn_print('register'); ?></a>
            </p>
            <?php endif; ?>
        </div>
    </div>

    <p style="color:rgba(255,255,255,.6); font-size:13px; margin-top:24px;">
        &copy; <?php echo date('Y'); ?> <?php echo ossn_site_settings('site_name'); ?> &mdash;
        <a href="<?php echo ossn_site_url('pages/privacy'); ?>" style="color:rgba(255,255,255,.7)"><?php echo ossn_print('privacy'); ?></a>
    </p>
</div>
