$(document).ready(function () {
    // Поиск покупателя
    $('#customer_search').on('input', function () {
        var searchTerm = $(this).val();
        if (searchTerm.length < 1) {
            $('#customer_search_results').empty();
            updateSearchResultsVisibility();
            return; // Искать если символов больше...
        }

        $.ajax({
            url: '?plugin=bulkpurchase&action=searchcustomer&search_term=' + encodeURIComponent(searchTerm),
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var resultsDiv = $('#customer_search_results');
                resultsDiv.empty(); // Clear previous results

                $.each(data.customers, function (i, customer) {
                    if (!customer.name.trim()) {
                        customer.name = 'Не определено'; // Замена имени если его нет
                    }
                    $('<div>').text(`[ID:${customer.id}] ${customer.name}`)
                        .on('click', function () { selectCustomer(customer.id, customer.name); })
                        .appendTo(resultsDiv);
                });
                updateSearchResultsVisibility();
            },
            error: function (error) {
                console.error('Error:', error);
            }
        }).always(function () {
            // Гарантируем, что функция вызывается даже если AJAX запрос завершился ошибкой
            updateSearchResultsVisibility();
        });
    });

    // Фанкщин выбора покупателя
    function selectCustomer(customerId, customerName) {
        $('#selected_customer_display').text(`Выбранный покупатель: ${customerName} (ID: ${customerId})`);
        $('#selected_customer_id').val(customerId);
        // Показываем блок с выбранным покупателем
        $('#selected_customer_display').show();
        $('#customer_search_results').empty(); // Очистка поиска

        // Загрузка товаров
        loadCustomerMarkup(customerId);
        loadCustomerProducts(customerId);
        updateSearchResultsVisibility();
        updateMarkupVisibility();
    }



    // Загрузка товаров выбранного покупателя
    function loadCustomerProducts(customerId) {
        $.ajax({
            url: '?plugin=bulkpurchase&action=getcustomerproducts',
            type: 'POST', // Изменили метод на POST
            dataType: 'json',
            data: { // Передаем данные через объект data
                customer_id: customerId
            },
            success: function (response) {
                var productsList = $('#customer_products_list');
                productsList.empty(); // Очищаем предыдущий список товаров

                // Убедимся, что путь к продуктам корректный
                if (response.data && response.data.products && response.data.products.length > 0) {
                    // Если список продуктов не пуст, отображаем продукты
                    $.each(response.data.products, function (i, product) {
                        $('<div>').html(`<strong>ID:</strong> ${product.id}, <strong>Название:</strong> ${product.name}, <strong>Цена:</strong> ${product.price}`).appendTo(productsList);
                    });
                } else {
                    // Если список продуктов пуст, отображаем сообщение об этом
                    $('<div>').text('Список товаров пуст для данного клиента.').appendTo(productsList);
                }
            },

            error: function (error) {
                console.error('Error:', error);
            }
        });
    }

    // Функция для поиска продукта по ID или названию
    $('#product_search').on('input', function () {
        var searchTerm = $(this).val();
        // Если введено менее двух символов, предотвращаем слишком обширный поиск
        if (searchTerm.length < 2) {
            $('#product_search_results').empty(); // Очищаем результаты предыдущего поиска
            updateProductSearchResultsVisibility();
            return;
        }

        // Отправляем запрос на сервер для поиска продуктов
        $.ajax({
            url: '?plugin=bulkpurchase&action=searchproduct',
            type: 'POST',
            dataType: 'json',
            data: {
                search_term: searchTerm
            },
            success: function (data) {
                var resultsDiv = $('#product_search_results');
                resultsDiv.empty();

                // Для каждого найденного продукта создаем элемент div и добавляем в контейнер результатов
                $.each(data.products, function (i, product) {
                    $('<div>').text(`[ID:${product.id}] ${product.name}`)
                        .click(function () { // При клике на продукт вызываем функцию выбора продукта
                            selectProduct(product.id, product.name);
                        })
                        .appendTo(resultsDiv);
                });
                updateProductSearchResultsVisibility();
            },
            error: function () {
                console.error('Ошибка поиска продуктов');
            }
        }).always(function () {
            // Гарантируем, что функция вызывается даже если AJAX запрос завершился ошибкой
            updateProductSearchResultsVisibility();
        });
    });

    // Функция для обработки выбора продукта
    function selectProduct(productId, productName) {
        var customerId = $('#selected_customer_id').val(); // Получаем ID выбранного покупателя

        // Проверяем, выбран ли покупатель
        if (!customerId) {
            alert('Пожалуйста, выберите покупателя перед добавлением продукта.');
            return;
        }

        $.ajax({
            url: '?plugin=bulkpurchase&action=addproduct', // URL и action могут отличаться в зависимости от вашей реализации
            type: 'POST',
            data: {
                customer_id: customerId,
                product_id: productId
            },
            success: function (response) {
                // Ответ сервера об успешном добавлении продукта
                if (response.status === 'ok') {
                    // Можно добавить продукт в список на фронтенде или перезагрузить список продуктов
                    $('#customer_products_list').append(`<div><strong>ID:</strong> ${productId}, <strong>Название:</strong> ${productName}</div>`);
                    $('#selected_product_display').text(''); // Очищаем отображение выбранного продукта
                } else {
                    // Обработка ошибки добавления продукта
                    alert('Ошибка добавления продукта: ' + response.message);
                }
            },
            error: function () {
                alert('Ошибка выполнения запроса к серверу.');
            }
        });

        $('#product_search_results').empty(); // Очищаем результаты поиска после добавления продукта
    }


    // AJAX запрос для добавления одного продукта покупателю
    function addProductToCustomer(productId, customerId) {
        $.ajax({
            url: '?plugin=bulkpurchase&action=addProduct',
            type: 'POST',
            data: { product_id: productId, customer_id: customerId },
            success: function (response) {
                alert('Продукт успешно добавлен!');
                $('#product_search').val('');
            },
            error: function () {
                alert('Не удалось добавить продукт. Попробуйте еще раз.');
            }
        });
    }

    // AJAX запрос для добавления всех продуктов из категории покупателю
    function addProductsByCategoryToCustomer(categoryId, customerId) {
        $.ajax({
            url: '?plugin=bulkpurchase&action=addProductsByCategory',
            type: 'POST',
            data: { category_id: categoryId, customer_id: customerId },
            success: function (response) {
                alert('Все продукты из категории успешно добавлены!');
            },
            error: function () {
                alert('Не удалось добавить продукты из категории. Попробуйте еще раз.');
            }
        });
    }

    function updateSearchResultsVisibility() {
        var $searchResults = $('#customer_search_results');
        if ($searchResults.html().trim() === '') {
            // Если результаты поиска пусты, скрываем блок
            $searchResults.hide();
        } else {
            // Если в блоке есть контент, отображаем его
            $searchResults.show();
        }
    }

    function updateMarkupVisibility() {
        if ($('#selected_customer_display').html().trim() === '') {
            $('.markup-field').hide();
        } else {
            $('.markup-field').show();
        }
    }

    // Функция для обновления видимости блока результатов поиска продуктов
    function updateProductSearchResultsVisibility() {
        var $searchResults = $('#product_search_results');
        if ($searchResults.children().length === 0) {
            // Если результаты поиска пусты, скрываем блок
            $searchResults.hide();
        } else {
            // Если в блоке есть контент, отображаем его
            $searchResults.show();
        }
    }


    // Слушатель для автоматического сохранения изменений процентной надбавки
    $('#markup_percent').on('input', function () {
        var customerId = $('#selected_customer_id').val();
        var markupPercent = $(this).val();
        if (markupPercent !== '') {
            saveCustomerMarkup(customerId, markupPercent);
        }
    });

    // Функция для сохранения новой процентной надбавки
    function saveCustomerMarkup(customerId, markupPercent) {
        $.ajax({
            url: '?plugin=bulkpurchase&action=savemarkup',
            type: 'POST',
            data: {
                customer_id: customerId,
                markup_percent: markupPercent
            },
            success: function (response) {
                if (response.status !== 'ok') {
                    alert('Ошибка при сохранении надбавки: ' + response.message);
                }
            },
            error: function () {
                alert('Ошибка при отправке запроса.');
            }
        });
    }

    // Функция для загрузки процентной надбавки выбранного покупателя
    function loadCustomerMarkup(customerId) {
        $.ajax({
            url: '?plugin=bulkpurchase&action=getcustomermarkup',
            type: 'POST',
            dataType: 'json',
            data: { customer_id: customerId },
            success: function (response) {
                if (response.status === 'ok') {
                    // Если запрос успешен, обновляем UI с процентом надбавки
                    $('#markup_percent').val(response.data.markup_percent);
                } else {
                    // Если сервер вернул ошибку, показываем сообщение
                    alert('Не удалось получить процент надбавки: ' + response.message);
                }
            },
            error: function () {
                alert('Ошибка выполнения запроса к серверу.');
            }
        });
    }
});