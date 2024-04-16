<?php

class shopBulkpurchasePluginBackendGetcustomerproductsController extends waJsonController
{
    public function execute()
    {   
        $userId = waRequest::request('customer_id', null, waRequest::TYPE_INT);
        
        // Проверяем, получен ли ID пользователя
        if (!$userId) {
            $this->response = [
                'status' => 'error',
                'message' => 'Не указан ID пользователя.'
            ];
            return;
        }

        // Инициализируем модель списка покупок
        $listsModel = new shopBulkpurchaseListsModel();
        
        // Получаем ID списка покупок для пользователя
        $listId = $listsModel->ensureListForUser($userId);

        // Если список существует, получаем товары этого списка
        if ($listId) {
            $userProductsModel = new shopBulkpurchaseUserProductsModel();
            $products = $userProductsModel->getProductsByListId($listId);

            if (empty($products)) {
                $this->response = [
                    'status' => 'error',
                    'message' => 'Товары для данного пользователя не найдены.'
                ];
            } else {
                $formattedProducts = [];
                foreach ($products as $product) {
                    $productModel = new shopProductModel();
                    $detailedProduct = $productModel->getById($product['product_id']);
                    if ($detailedProduct) {
                        $formattedProducts[] = [
                            'id' => $detailedProduct['id'],
                            'name' => $detailedProduct['name'],
                            'price' => $detailedProduct['price'],
                            // Добавьте другие поля по необходимости
                        ];
                    }
                }

                $this->response = [
                    'status' => 'success',
                    'products' => $formattedProducts
                ];
            }
        } else {
            $this->response = [
                'status' => 'error',
                'message' => 'Не удалось создать или найти список покупок для данного пользователя.'
            ];
        }
    }
}

