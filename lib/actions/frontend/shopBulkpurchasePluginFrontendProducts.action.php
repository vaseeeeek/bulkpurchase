<?php

// lib/actions/frontend/shopBulkpurchasePluginFrontendProducts.action.php

class shopBulkpurchasePluginFrontendProductsAction extends waViewAction
{
    public function execute()
    {

        $user = wa()->getUser();

        // Проверяем, авторизирован ли пользователь
        if ($user->isAuth()) {
            $userId = $user->getId();

            // Получаем список товаров для пользователя
            $userProductsModel = new shopBulkpurchaseUserProductsModel();
            $listsModel = new shopBulkpurchaseListsModel();
            $listId = $listsModel->ensureListForUser($userId);
            $products = $userProductsModel->getProductsByListId($listId);
            $formattedProducts = [];
            foreach ($products as $product) {
                // $productModel = new shopProductModel();
                // $detailedProduct = $productModel->getById($product['product_id']);
                $detailedProduct = $this->getProduct($product['product_id']);
                
                if ($detailedProduct) {
                    $formattedProducts[] = $detailedProduct;
                }
            }

            // Подготавливаем данные для шаблона
            $this->view->assign('products', $formattedProducts);
        } else {
            // Если пользователь не авторизирован, перенаправляем на страницу авторизации
            $this->redirect(wa()->getRouteUrl('/frontend/my/login'));
        }

        
        $this->view->assign('plugin_url', wa()->getAppStaticUrl('shop') . "plugins/bulkpurchase");
        $this->setLayout(new shopFrontendLayout());
    }

    public function getProduct($id)
    {
        $product = new shopProduct($id, true);
        $skus = $product->skus;
        foreach ($skus as &$sku) {
            $sku['price_html'] = shop_currency_html($sku['price'], $product['currency']);
            $sku['orig_available'] = $sku['available'];
            $sku['available'] = $this->isProductSkuAvailable($product, $sku);
        }
        unset($sku);
        $product->skus = $skus;
        return $product;
    }


    private function isProductSkuAvailable($product, $sku)
    {
        return $product->status && $sku['available'] && $sku['status'] &&
            ($sku['count'] === null || $sku['count'] > 0);
    }
}
