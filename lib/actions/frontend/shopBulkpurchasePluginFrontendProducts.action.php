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
            $markupPercent = $listsModel->getMarkupPercent($listId) / 100.0 + 1;
            $products = $userProductsModel->getProductsByListId($listId);
            $formattedProducts = [];
            foreach ($products as $product) {
                $detailedProduct = $this->getProduct($product['product_id']);

                if ($detailedProduct) {
                    $features = $detailedProduct->features;
                    if ($features['weight']) {
                        $features['weight'] = $features['weight']->shopDimensionValuevalue;
                    }
                    if ($features['obem']) {
                        $features['obem'] = preg_replace('/\D/', '', $features['obem']);
                    }
                    $detailedProduct['features'] = $features;
                    $formattedProducts[] = $detailedProduct;
                }
            }
            $categories = $this->getCategoryTree();
            $categoriesWithProducts = $this->getCategoryTreeWithProducts($categories, $formattedProducts);
            
            $this->view->assign('categoriesWithProducts', $categoriesWithProducts);
            $this->view->assign('markupPercent', $markupPercent);
            $this->view->assign('products', $formattedProducts);
        } else {
            // Если пользователь не авторизирован, перенаправляем на страницу авторизации
            $this->redirect(wa()->getRouteUrl('/frontend/my/login'));
        }

        $this->view->assign('plugin_url', wa()->getAppStaticUrl('shop') . "plugins/bulkpurchase");
        $this->setLayout(new shopFrontendLayout());
    }
    public function getCategoryTreeWithProducts($categories, $products)
    {
        // Helper function to recursively assign products to categories
        function assignProductsToCategories(&$categories, $products)
        {
            foreach ($categories as &$category) {
                // Filter products that belong to the current category
                $category['products'] = array_filter($products, function ($product) use ($category) {
                    return $product['category_id'] == $category['id'];
                });

                // If there are child categories, recurse into them
                if (!empty($category['children'])) {
                    assignProductsToCategories($category['children'], $products);
                }
            }
        }

        // Assign products to categories recursively
        assignProductsToCategories($categories, $products);

        return $categories;
    }


    // Вспомогательный метод для построения дерева категорий
    public function getCategoryTree()
    {
        $categoryModel = new shopCategoryModel();
        $categories = $categoryModel->getAll();
    
        // Сортировка категорий по полю left_key
        usort($categories, function($a, $b) {
            return $a['left_key'] <=> $b['left_key'];
        });
        
        return $this->buildCategoryTree($categories);
    }

    // Метод построения дерева категорий
    private function buildCategoryTree($categories, $parentId = 0)
    {
        $branch = array();
        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $children = $this->buildCategoryTree($categories, $category['id']);
                if ($children) {
                    $category['children'] = $children;
                }
                $branch[] = $category;
            }
        }
        return $branch;
    }

    public function getProduct($id)
    {
        $product = new shopProduct($id, true);
        $skus = $product->skus;
        foreach ($skus as &$sku) {
            $sku['price_html'] = shop_currency_html($sku['price'], $product['currency']);
            /*$sku['orig_available'] = $sku['available'];
            $sku['available'] = $this->isProductSkuAvailable($product, $sku);*/
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
