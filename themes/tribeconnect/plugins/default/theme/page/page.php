<?php
/**
 * TribeConnect – Main Page Shell
 */
$sitename     = ossn_site_settings('site_name');
$sitelanguage = ossn_site_settings('language');
$title        = isset($params['title']) ? $params['title'] . ' · ' . $sitename : $sitename;
$contents     = isset($params['contents']) ? $params['contents'] : '';
?>
<!DOCTYPE html>
<html lang="<?php echo $sitelanguage; ?>" data-theme="light">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="#6C63FF"/>
    <title><?php echo htmlspecialchars($title); ?></title>

    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>

    <?php echo ossn_fetch_extend_views('ossn/endpoint'); ?>
    <?php echo ossn_fetch_extend_views('ossn/site/head'); ?>
    <script>
        // Restore saved theme preference before render to avoid flash
        (function(){
            var t = localStorage.getItem('tc-theme') || 'light';
            document.documentElement.setAttribute('data-theme', t);
        })();
        <?php echo ossn_fetch_extend_views('ossn/js/head'); ?>
    </script>
</head>

<body class="tc-body">
    <!-- Page loading bar -->
    <div id="tc-loading-bar"></div>

    <!-- Toast notifications -->
    <div id="tc-toast-container" aria-live="polite"></div>

    <!-- System messages -->
    <?php echo ossn_plugin_view('theme/page/elements/system_messages'); ?>

    <!-- Overlay for mobile nav -->
    <div class="tc-overlay" id="tc-overlay"></div>

    <!-- Main layout wrapper -->
    <div class="tc-layout <?php echo ossn_isLoggedin() ? 'is-loggedin' : 'is-guest'; ?>">

        <?php if (ossn_isLoggedin()): ?>
            <!-- Left sidebar -->
            <?php echo ossn_plugin_view('theme/page/elements/sidebar'); ?>
        <?php endif; ?>

        <!-- Main content column -->
        <div class="tc-main" id="tc-main">
            <!-- Top navigation bar -->
            <?php echo ossn_plugin_view('theme/page/elements/topbar'); ?>

            <!-- Inner page content -->
            <div class="tc-inner-page">
                <?php echo $contents; ?>
            </div>

            <!-- Footer -->
            <?php echo ossn_plugin_view('theme/page/elements/footer'); ?>
        </div>

    </div><!-- /.tc-layout -->

    <!-- OSSN viewer / lightbox -->
    <div class="ossn-viewer" style="display:none"></div>

    <?php echo ossn_fetch_extend_views('ossn/page/footer'); ?>
</body>
</html>
