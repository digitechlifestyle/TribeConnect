<?php
/**
 * TribeConnect – Admin Panel Layout
 */
?>
<div class="tc-admin-layout">

    <!-- Admin sidebar -->
    <aside class="tc-admin-sidebar">
        <div class="tc-admin-header">
            <a href="<?php echo ossn_site_url('administrator'); ?>" style="color:inherit; text-decoration:none;">
                <i class="fa fa-shield-halved" style="color:var(--tc-purple)"></i>
                <?php echo ossn_print('admin:panel'); ?>
            </a>
        </div>
        <?php echo ossn_view_menu('admin_sidemenu'); ?>
        <div style="padding:16px; margin-top:auto;">
            <a href="<?php echo ossn_site_url(); ?>" class="tc-btn tc-btn-ghost tc-btn-sm tc-btn-full">
                <i class="fa fa-arrow-left"></i> <?php echo ossn_print('back:to:site'); ?>
            </a>
        </div>
    </aside>

    <!-- Admin main content -->
    <main class="tc-admin-content">
        <?php echo ossn_plugin_view('theme/page/elements/system_messages'); ?>
        <?php echo $params['contents'] ?? ''; ?>
    </main>

</div>
