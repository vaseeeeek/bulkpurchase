<?php
return array(
    'shop_bulkpurchase_lists' => array(
        'list_id' => array('int', 11, 'unsigned' => 1, 'null' => 0, 'autoincrement' => 1),
        'user_id' => array('int', 11, 'unsigned' => 1, 'null' => 0),
        'created_at' => array('datetime', 'null' => 0),
        'updated_at' => array('datetime', 'null' => 0),
        'markup_percent' => array('decimal', '10,2', 'null' => 0, 'default' => '0.00'),
        ':keys' => array(
            'PRIMARY' => 'list_id',
            'user_id' => 'user_id',
        ),
    ),
    'shop_bulkpurchase_list_items' => array(
        'item_id' => array('int', 11, 'unsigned' => 1, 'null' => 0, 'autoincrement' => 1),
        'list_id' => array('int', 11, 'unsigned' => 1, 'null' => 0),
        'product_id' => array('int', 11, 'unsigned' => 1, 'null' => 0),
        'quantity' => array('int', 11, 'null' => 0),
        'added_at' => array('datetime', 'null' => 0),
        ':keys' => array(
            'PRIMARY' => 'item_id',
            'list_id' => 'list_id',
            'product_id' => 'product_id',
        ),
    ),
);
