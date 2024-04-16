<?php

class shopBulkpurchasePluginBackendSearchproductAction extends waViewAction
{
    
    public function execute()
    {
        $searchTerm = waRequest::post('search_term', null, waRequest::TYPE_STRING_TRIM);

        // Initialize response array
        $response = ['products' => []];

        if (!empty($searchTerm)) {
            // Assuming you have a model that can search products by name or ID
            // $productModel = new shopProductModel(); // Adjust as necessary
            $products = $this->searchProducts($searchTerm);

            foreach ($products as $product) {
                $response['products'][] = [
                    'id' => $product['id'],
                    'name' => $product['name'],
                    // Add other relevant product details here
                ];
            }
        }

        echo json_encode($response);
        exit();
    }

    /**
     * Searches for products by name or ID.
     *
     * @param string $searchTerm The search term.
     * @return array An array of matching products.
    */
    public function searchProducts($searchTerm)
    {
        $model = new waModel();
        // Corrected SQL query syntax
        $sql = "SELECT * FROM shop_product WHERE id = i:searchTerm OR name LIKE s:searchName";
        return $model->query($sql, ['searchTerm' => $searchTerm, 'searchName' => '%' . $searchTerm . '%'])->fetchAll();
    }

}
