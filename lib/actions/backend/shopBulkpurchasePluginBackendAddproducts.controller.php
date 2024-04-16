<?php
class shopBulkpurchasePluginBackendAddproductsController extends waJsonController
{
    public function execute()
    {
        try {
            $customerId = waRequest::post('customer_id', null, waRequest::TYPE_INT);
            $productIds = waRequest::post('product_ids', array(), waRequest::TYPE_ARRAY_INT);

            if (!$customerId || empty($productIds)) {
                throw new waException('Необходимы ID покупателя и ID товаров.');
            }

            $userProductsModel = new shopBulkpurchaseUserProductsModel();
            foreach ($productIds as $productId) {
                $userProductsModel->addProductToList($customerId, $productId);
            }

            $this->response = ['status' => 'ok', 'message' => 'Товары успешно добавлены.'];
        } catch (waException $e) {
            $this->response = ['status' => 'fail', 'message' => $e->getMessage()];
        }
    }
}
