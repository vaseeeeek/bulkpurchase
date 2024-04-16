<?php
return array (
  'bulkpurchase/*' => 'frontend/',
  'my/products/' => array(
    'plugin' => 'bulkpurchase', // Укажите идентификатор вашего плагина
    'module' => 'frontend',
    'action' => 'products', // Укажите действие, которое должно обрабатываться
  ),
  'bulkpurchase-createorder/' => array(
    'plugin' => 'bulkpurchase', // Укажите идентификатор вашего плагина
    'module' => 'frontend',
    'action' => 'createorder', // Укажите действие, которое должно обрабатываться
  ),
);
