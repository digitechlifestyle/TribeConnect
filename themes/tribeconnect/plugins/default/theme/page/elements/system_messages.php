<?php
/**
 * TribeConnect – System Messages (toast-style)
 */
$messages = ossn_get_messages();
if (!$messages) return;
?>
<div class="tc-system-messages" id="tc-system-messages" role="alert" aria-live="assertive">
<?php foreach ($messages as $type => $msgs): ?>
    <?php foreach ($msgs as $msg): ?>
    <div class="tc-toast tc-toast-<?php echo htmlspecialchars($type); ?>">
        <span class="tc-toast-icon">
            <?php if ($type === 'success'): ?><i class="fa fa-circle-check"></i>
            <?php elseif ($type === 'error'): ?><i class="fa fa-circle-xmark"></i>
            <?php else: ?><i class="fa fa-circle-info"></i>
            <?php endif; ?>
        </span>
        <span class="tc-toast-msg"><?php echo htmlspecialchars($msg); ?></span>
        <button class="tc-toast-close" aria-label="Close">&times;</button>
    </div>
    <?php endforeach; ?>
<?php endforeach; ?>
</div>
