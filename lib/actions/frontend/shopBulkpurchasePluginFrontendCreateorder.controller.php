<?php

class shopBulkpurchasePluginFrontendCreateorderController extends waJsonController
{
    public function execute()
    {
        $contact_id = $this->getUserId();
        $products = waRequest::post('products');
        $comment = waRequest::post('comment') ? waRequest::post('comment') : '';

        $contact = new waContact($contact_id);

        $orderData = [
            'contact' => $contact,
            'items' => $products,
            'currency' => 'RUB',
            'discount' => 0,
            'params' => [],
            'shipping' => NULL,
            'comment' => $comment,
        ];

        try {
            $workflow = new shopWorkflow();
            $order = $workflow->getActionById('create')->run($orderData);
            // Успешное создание заказа
            $this->response = [
                'status' => 'ok',
                'data' => ['order_id' => $order['id']],
                'message' => "Заказ успешно создан. ID заказа: {$order['id']}"
            ];
        } catch (Exception $e) {
            $this->response = [
                'status' => 'fail',
                'message' => "Ошибка при создании заказа: " . $e->getMessage()
            ];
        }
    }
}

