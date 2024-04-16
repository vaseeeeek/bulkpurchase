<?php

class shopBulkpurchasePluginSettingsAction extends waViewAction
{
    public function execute()
    {
        $plugin = wa('shop')->getPlugin('bulkpurchase');
        // Get all the plugin settings to pass to the template
        $settings = $plugin->getSettings(); 
        $this->view->assign('settings', $settings);
    }
}
