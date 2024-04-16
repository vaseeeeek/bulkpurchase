<?php

class shopBulkpurchaseListsModel extends waModel
{
    protected $table = 'shop_bulkpurchase_lists';

    public function ensureListForUser($userId)
    {
        // Проверяем наличие списка у пользователя
        $list = $this->select('*')->where('user_id = i:userId', ['userId' => $userId])->fetch();
        if (!$list) {
            // Список отсутствует, создаём новый
            $listId = $this->insert([
                'user_id' => $userId,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
            return $listId;
        } else {
            // Список существует, возвращаем его ID
            return $list['list_id'];
        }
    }
}
