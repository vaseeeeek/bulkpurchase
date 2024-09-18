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
    public function frontendHook()
    {
        $view = wa()->getView();
        $user = wa()->getUser();

        if (!$user->isAuth()) {
            $helper = $view->getHelper();
            $error = null;
            return '<div class="Login">
                        <div class="Login__Box">
                            <h1 class="Title__Main -With-Border -Centered">Вход</h1>'
                . $helper->loginForm($error, [
                    'show_title' => false,
                    'show_sub_title' => true,
                    'show_oauth_adapters' => true
                ]) .
                '</div>
                    </div>';
        }

        $userId = $user->getId();
        $userProductsModel = new shopBulkpurchaseUserProductsModel();
        $listsModel = new shopBulkpurchaseListsModel();
        $listId = $listsModel->ensureListForUser($userId);
        $markupPercent = $listsModel->getMarkupPercent($listId) / 100.0 + 1;
        $products = $userProductsModel->getProductsByListId($listId);
        $formattedProducts = [];
        foreach ($products as $product) {
            $detailedProduct = (new shopBulkpurchasePluginFrontendProductsAction())->getProduct($product['product_id']);

            if ($detailedProduct) {
                $features = $detailedProduct->features;
                if ($features['weight']) {
                    $features['weight'] = $features['weight']->shopDimensionValuevalue;
                }
                if ($features['obem']) {
                    /*$features['obem'] = preg_replace('/\D/', '', $features['obem']);*/
                    $features['obem'] = preg_replace('/[^0-9.]/', '', $features['obem']);
                }
                $detailedProduct['features'] = $features;
                $formattedProducts[] = $detailedProduct;
            }
        }

        $categories = (new shopBulkpurchasePluginFrontendProductsAction())->getCategoryTree();
        $categoriesWithProducts = (new shopBulkpurchasePluginFrontendProductsAction())->getCategoryTreeWithProducts($categories, $formattedProducts);

        // Применяем сортировку
        self::sortProductsAlphabetically($categoriesWithProducts);
        $view->assign('categoriesWithProducts', $categoriesWithProducts);

        $view->assign('markupPercent', $markupPercent);
        $view->assign('products', $products);
        $view->assign('plugin_url', wa()->getAppStaticUrl('shop') . "plugins/bulkpurchase");

        $templatePath = wa()->getAppPath('plugins/bulkpurchase/templates/actions/frontend/FrontendProducts.html', 'shop');
        $html = $view->fetch($templatePath);

        return $html;
    }

    // Функция для сортировки товаров по алфавиту внутри категорий
    public static function sortProductsAlphabetically(&$categories)
    {
        foreach ($categories as &$category) {
            if (isset($category['products']) && is_array($category['products'])) {
                usort($category['products'], function ($a, $b) {
                    return strnatcasecmp($a->data['name'], $b->data['name']);
                });
            }
            if (isset($category['children']) && is_array($category['children'])) {
                self::sortProductsAlphabetically($category['children']);
            }
        }
    }
}
