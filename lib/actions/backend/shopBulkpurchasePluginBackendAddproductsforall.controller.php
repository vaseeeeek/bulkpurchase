<?php
class shopBulkpurchasePluginBackendAddproductsforallController extends waJsonController
{
    public function execute()
    {
        try {
            // Получаем список ID товаров из запроса
            $productIds = waRequest::post('product_ids', array(), waRequest::TYPE_ARRAY_INT);

            // Проверяем, что были переданы ID товаров
            if (empty($productIds)) {
                throw new waException('Необходимы ID товаров.');
            }

            // Получаем список всех покупателей
            $customersModel = new waContactModel();
            $customers = $customersModel->select('id')->fetchAll(); // Выбираем всех пользователей системы

            if (empty($customers)) {
                throw new waException('Не найдено покупателей.');
            }

            // Инициализируем модель для добавления товаров к спискам
            $userProductsModel = new shopBulkpurchaseUserProductsModel();

            // Проходим по каждому покупателю и добавляем товары
            foreach ($customers as $customer) {
                foreach ($productIds as $productId) {
                    // Добавляем товар для каждого покупателя
                    $userProductsModel->addProductToList($customer['id'], $productId);
                }
            }

            // Возвращаем успешный ответ
            $this->response = ['status' => 'ok', 'message' => 'Товары успешно добавлены ко всем покупателям.'];

        } catch (waException $e) {
            // Обработка ошибок и возврат сообщения
            $this->response = ['status' => 'fail', 'message' => $e->getMessage()];
        }
    }
}
