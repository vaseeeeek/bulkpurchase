<?php

class shopBulkpurchasePlugin extends shopPlugin
{
    public function backendMenu()
    {
        return array(
            'core_li' => '<li class="no-tab"><a href="?plugin=bulkpurchase&action=userlistmanage">' . _wp('Покупки в опт') . '</a></li>',
        );
    }
    public function backendProducts()
    {
      $view = wa()->getView();
      return [
        'toolbar_section' => $view->fetch($this->path . '/templates/actions/backend/BackendToolbar.html'),
      ];
    }
}
