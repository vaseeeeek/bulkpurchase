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

    // Получение процентной надбавки для списка пользователя
    public function getMarkupPercent($listId) {
        $markup = $this->select('markup_percent')->where('list_id = i:listId', ['listId' => $listId])->fetchField();
        return $markup ? $markup : 0; // Возвращаем 0, если надбавка не установлена
    }

    // Обновление процентной надбавки для списка пользователя
    public function updateMarkupPercent($listId, $markupPercent) {
        return $this->updateByField('list_id', $listId, ['markup_percent' => $markupPercent]);
    }
}
