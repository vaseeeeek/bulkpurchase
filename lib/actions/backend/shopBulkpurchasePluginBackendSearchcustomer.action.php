<?php

class shopBulkpurchasePluginBackendSearchcustomerAction extends waViewAction
{
    public function execute()
    {
        $searchTerm = waRequest::request('search_term', null, waRequest::TYPE_STRING_TRIM);

        // Prepare the response array
        $response = ['customers' => []];

        if (!empty($searchTerm)) {
            // Utilize waContactModel to search for customers
            $contactModel = new waContactModel();
            // Implement a basic search by name or ID; adjust according to your needs
            // Note: You might need to implement a more specific search method based on your requirements
            $customers = $contactModel->query("SELECT id, CONCAT(firstname, ' ', lastname) as name FROM {$contactModel->getTableName()} WHERE id LIKE CONCAT('%', s:search, '%') OR firstname LIKE CONCAT('%', s:search, '%') OR lastname LIKE CONCAT('%', s:search, '%') LIMIT 10", ['search' => $searchTerm])->fetchAll();

            foreach ($customers as $customer) {
                $response['customers'][] = [
                    'id' => $customer['id'],
                    'name' => $customer['name']
                ];
            }
        }

        echo json_encode($response);
        exit();
    }
}
