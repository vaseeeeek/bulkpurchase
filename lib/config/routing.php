<?php
return array (
  'bulkpurchase/*' => 'frontend/',
  'my/products/' => array(
    'plugin' => 'bulkpurchase', 
    'module' => 'frontend',
    'action' => 'products', 
  ),
  'bulkpurchase-createorder/' => array(
    'plugin' => 'bulkpurchase', 
    'module' => 'frontend',
    'action' => 'createorder', 
  ),
  'bulkpurchase/addproductsforall/' => array(
      'plugin' => 'bulkpurchase',
      'module' => 'backend',
      'action' => 'addproductstoall', 
  ),
);
