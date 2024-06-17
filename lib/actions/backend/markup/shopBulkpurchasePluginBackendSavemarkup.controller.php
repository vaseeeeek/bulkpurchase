<?php

class shopBulkpurchasePluginBackendSavemarkupController extends waJsonController
{
    public function execute()
    {
        try {
            $userId = waRequest::post('customer_id', null, waRequest::TYPE_INT);
            $markupPercent = waRequest::post('markup_percent', 0.0); // Получаем значение с приведением к float

            // Приведение к float, если прямое приведение необходимо
            $markupPercent = floatval($markupPercent);

            if (!$userId) {
                throw new waException('Не указан ID клиента.');
            }
            $listsModel = new shopBulkpurchaseListsModel();
            $listId = $listsModel->ensureListForUser($userId);
            
            if (!$listId) {
                throw new waException('Не удалось создать или найти список для пользователя.');
            }

            // Обновление процента надбавки
            $listUpdated = $listsModel->updateMarkupPercent($listId, $markupPercent);
            
            if (!$listUpdated) {
                throw new waException('Не удалось обновить процент надбавки.');
            }

            $this->response['message'] = 'Процент надбавки успешно обновлён.';

        } catch (Exception $e) {
            $this->setError($e->getMessage());
        }
    }
}
