<?php

class shopBulkpurchasePluginBackendUserlistmanageAction extends waViewAction
{
    public function execute()
    {
        $this->setLayout(new shopBackendLayout());
        $this->layout->assign('no_level2', true);

        $listsModel = new shopBulkpurchaseListsModel(); // Изменено на соответствующую модель

        $markupPercent = null; // Переменная для хранения процентной надбавки
        
        $userId = waRequest::post('user_id', null, waRequest::TYPE_INT);
        $model = new shopBulkpurchaseUserProductsModel();

        // If a user (buyer) is selected
        if ($userId) {
            
            $listId = $listsModel->ensureListForUser($userId); // Убедитесь, что существует список покупок для пользователя и получите его ID
            $markupPercent = $listsModel->getMarkupPercent($listId); // Загружаем процент надбавки

            // Ensure a bulk purchase list exists for the buyer and get its ID
            $listId = $model->ensureListForUser($userId);

            if (waRequest::post('add_product')) {
                // Add product to the buyer's bulk purchase list
                $productId = waRequest::post('product_id', null, waRequest::TYPE_INT);
                $model->addProductToList($listId, $productId);
            } elseif (waRequest::post('remove_product')) {
                // Remove product from the buyer's bulk purchase list
                $productId = waRequest::post('product_id', null, waRequest::TYPE_INT);
                $model->removeProductFromList($listId, $productId);
            }

            // Fetch updated list of products for this buyer
            $products = $model->getProductsByUser($userId);
        } else {
            $products = [];
        }

        // Fetch all users (buyers) for the dropdown - Simplified example, consider implementing proper buyer retrieval
        $usersModel = new waUserModel();
        $buyers = $usersModel->getAll();

        $this->view->assign('buyers', $buyers);
        $this->view->assign('markupPercent', $markupPercent);
        $this->view->assign('selectedUserId', $userId);
        $this->view->assign('products', $products);
        $this->view->assign('plugin_url', wa()->getAppStaticUrl('shop') . "plugins/bulkpurchase");
    }
}
