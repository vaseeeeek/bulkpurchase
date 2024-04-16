<?php

class shopBulkpurchasePluginBackendAddproductController extends waJsonController
{
    public function execute()
    {
        try {
            $customerId = waRequest::post('customer_id', null, waRequest::TYPE_INT);
            $productId = waRequest::post('product_id', null, waRequest::TYPE_INT);

            // Проверяем, что ID покупателя и продукта были переданы
            if (!$customerId || !$productId) {
                throw new waException('Необходимы ID покупателя и продукта.');
            }

            // Здесь ваша логика по добавлению продукта в список покупателя
            // Для примера, пусть будет метод addProductToList в модели
            $userProductsModel = new shopBulkpurchaseUserProductsModel();
            $userProductsModel->addProductToList($customerId, $productId);

            // Возврат успешного ответа
            $this->response = ['status' => 'success', 'message' => 'Продукт успешно добавлен в список покупателя.'];
        } catch (waException $e) {
            // Обработка исключений и возврат ошибки
            $this->response = ['status' => 'fail', 'message' => $e->getMessage()];
        }
    }
}
