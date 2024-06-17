<?php

class shopBulkpurchasePluginBackendGetcustomermarkupController extends waJsonController
{
    public function execute()
    {
        try {
            $userId = waRequest::post('customer_id', null, waRequest::TYPE_INT);
            if (!$userId) {
                throw new waException('Не указан ID покупателя.');
            }

            // Используем модель для получения данных списка покупателя
            $listsModel = new shopBulkpurchaseListsModel();
            $listId = $listsModel->ensureListForUser($userId);
            if (!$listId) {
                throw new waException('Список для данного покупателя не найден.');
            }

            // Получаем процент надбавки
            $markupPercent = $listsModel->getMarkupPercent($listId);
            if ($markupPercent === null) {
                throw new waException('Надбавка для данного списка не установлена.');
            }

            // Успешный ответ с процентом надбавки
            $this->response = [
                'status' => 'ok',
                'markup_percent' => $markupPercent
            ];
        } catch (Exception $e) {
            $this->setError($e->getMessage());
        }
    }
}
