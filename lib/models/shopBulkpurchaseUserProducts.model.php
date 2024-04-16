<?php

class shopBulkpurchaseUserProductsModel extends waModel
{

    protected $table = 'shop_bulkpurchase_list_items';

    public function addProductToList($userId, $productId)
    {
        // Инициализируем модель списка покупок
        $listsModel = new shopBulkpurchaseListsModel();

        // Получаем или создаем ID списка для пользователя
        $listId = $listsModel->ensureListForUser($userId);

        // Проверяем, существует ли уже продукт в списке
        $exists = $this->select('*')->where('list_id = i:listId AND product_id = i:productId', ['listId' => $listId, 'productId' => $productId])->fetch();
        if (!$exists) {
            // Продукт отсутствует, добавляем его в список
            $this->insert([
                'list_id' => $listId,
                'product_id' => $productId,
                'quantity' => 1, // Примерное значение, можно настроить
                'added_at' => date('Y-m-d H:i:s'),
            ]);
        } else {
            // Продукт уже есть в списке, можно обновить его количество или оставить как есть
        }
    }

    public function getProductsByListId($listId)
    {
        $products = $this->select('*')->where('list_id = i:listId', ['listId' => $listId])->fetchAll();
        return $products;
    }

}
