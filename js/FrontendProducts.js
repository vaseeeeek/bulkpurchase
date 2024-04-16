/*
class BulkpurchaseProductTable {
    constructor(selector) {
        this.$table = $(selector);
        this.init();
    }

    init() {
        this.$table.on('input', '.js-product-qty-msk input, .js-product-qty-fr input', (event) => {
            const $input = $(event.target);
            const $row = $input.closest('tr');
            this.checkMaxQuantity($input);
            this.updateTotalForProduct($row);
        });
    }

    updateTotalForProduct($row) {
        const price = parseFloat($row.find('.js-product-price').data('price'));
        const qtyMsk = parseInt($row.find('.js-product-qty-msk input').val()) || 0;
        const qtyFr = parseInt($row.find('.js-product-qty-fr input').val()) || 0;

        const totalMsk = price * qtyMsk;
        const totalFr = price * qtyFr;

        $row.find('.js-product-total-msk').text(totalMsk ? `${totalMsk.toFixed(2)} ₽` : '—');
        $row.find('.js-product-total-fr').text(totalFr ? `${totalFr.toFixed(2)} ₽` : '—');
    }

    checkMaxQuantity($input) {
        const maxQty = parseInt($input.attr('max'));
        const currentQty = parseInt($input.val()) || 0;

        if (currentQty > maxQty) {
            $input.val(maxQty);
            alert('Количество не может превышать максимально доступное.');
        }
    }
}

class BulkpurchaseModal {
    constructor(modalSelector, tabButtonSelector, tabContentSelector) {
        this.$modal = $(modalSelector);
        this.$tabButtons = $(tabButtonSelector);
        this.$tabContents = $(tabContentSelector);
        this.init();
    }

    init() {
        this.handleOpenModal();
        this.handleCloseModal();
        this.handleSwitchTab();
        this.activateFirstTab();
    }

    handleOpenModal() {
        $('#bulkpurchase-open-order-modal').click(() => {
            this.populateOrderTabs();
            this.$modal.show();
        });
    }

    handleCloseModal() {
        $('.bulkpurchase-close-modal').click(() => {
            this.$modal.hide();
        });
    }

    handleSwitchTab() {
        this.$tabButtons.click((event) => {
            const $button = $(event.currentTarget);
            const tabId = $button.data('for-tab');

            this.$tabContents.hide();
            this.$tabButtons.removeClass('bulkpurchase-active');
            $button.addClass('bulkpurchase-active');

            $(`.bulkpurchase-tab-content[data-tab="${tabId}"]`).show();
        });
    }

    activateFirstTab() {
        const firstTabId = this.$tabButtons.first().data('for-tab');
        $(`.bulkpurchase-tab-content[data-tab="${firstTabId}"]`).show();
        this.$tabButtons.first().addClass('bulkpurchase-active');
    }

    populateOrderTabs() {
        // Очищаем предыдущее содержимое вкладок
        $('.bulkpurchase-tab-content').empty();

        let hasProductsForMsk = false;
        let hasProductsForFr = false;

        const $rows = $('.bulkpurchase-products-table tbody tr');

        for (let i = 0; i < $rows.length; i++) {
            const $row = $($rows[i]);
            const qtyMsk = parseInt($row.find('.js-product-qty-msk input').val(), 10) || 0;
            const qtyFr = parseInt($row.find('.js-product-qty-fr input').val(), 10) || 0;

            if (qtyMsk > 0) {
                hasProductsForMsk = true;
            }
            if (qtyFr > 0) {
                hasProductsForFr = true;
            }

            // Если оба флага стали true, прекращаем итерацию
            if (hasProductsForMsk && hasProductsForFr) {
                break;
            }
        }

        // Функция добавления таблицы в вкладку
        function addTable(tabId) {
            const tableStructure = `
                <table class="bulkpurchase-modal-table">
                    <thead>
                        <tr>
                            <th>Артикул</th>
                            <th>Наименование</th>
                            <th>Цена за штуку</th>
                            <th>Количество</th>
                            <th>Всего</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `;
            $(`.bulkpurchase-tab-content[data-tab="${tabId}"]`).append(tableStructure);
        }

        // Добавляем структуру таблицы или сообщение о пустом заказе
        if (hasProductsForMsk) {
            addTable("1");
        } else {
            $('.bulkpurchase-tab-content[data-tab="1"]').append('<div>Заказ пуст</div>');
        }

        if (hasProductsForFr) {
            addTable("2");
        } else {
            $('.bulkpurchase-tab-content[data-tab="2"]').append('<div>Заказ пуст</div>');
        }

        $('.bulkpurchase-products-table tbody tr').each((index, row) => {
            const $row = $(row);
            const productId = $row.data('product-id');
            const name = $row.find('.js-product-name').text();
            const sku = $row.find('.js-product-art').text();
            const price = $row.find('.js-product-price').data('price');
            const qtyMsk = $row.find('.js-product-qty-msk input').val();
            const qtyFr = $row.find('.js-product-qty-fr input').val();
            const totalPriceMsk = parseInt(qtyMsk) * parseFloat(price);
            const totalPriceFr = parseInt(qtyFr) * parseFloat(price);

            // Добавляем строки в таблицу Москва
            if (parseInt(qtyMsk) > 0) {
                $('.bulkpurchase-tab-content[data-tab="1"] .bulkpurchase-modal-table tbody').append(
                    `<tr data-product-id="${productId}">
                        <td>${sku}</td>
                        <td>${name}</td>
                        <td>${price} ₽</td>
                        <td>${qtyMsk}</td>
                        <td>${totalPriceMsk} ₽</td>
                    </tr>`
                );
            }

            // Добавляем строки в таблицу Франция
            if (parseInt(qtyFr) > 0) {
                $('.bulkpurchase-tab-content[data-tab="2"] .bulkpurchase-modal-table tbody').append(
                    `<tr data-product-id="${productId}">
                        <td>${sku}</td>
                        <td>${name}</td>
                        <td>${price} ₽</td>
                        <td>${qtyFr}</td>
                        <td>${totalPriceFr} ₽</td>
                    </tr>`
                );
            }
        });
    }
    // Метод для сбора данных о заказе и отправки на сервер
    sendOrder() {
        // Собираем данные заказов из Москвы и Франции
        const moscowOrder = this.collectOrderData('1');
        const franceOrder = this.collectOrderData('2');

        // Отправляем данные на сервер для создания заказа
        this.placeOrder(moscowOrder, () => {
            console.log("Заказ по Москве успешно создан");
        });

        this.placeOrder(franceOrder, () => {
            console.log("Заказ по Франции успешно создан");
        });
    }

    // Метод для сбора данных заказа из таблицы
    collectOrderData(tabId) {
        let orderItems = [];
        $(`.bulkpurchase-tab-content[data-tab="${tabId}"] .bulkpurchase-modal-table tbody tr`).each(function () {
            const $row = $(this);
            const productId = $row.data('product-id');
            const sku = $row.find('td').eq(0).text();
            const name = $row.find('td').eq(1).text();
            const qty = $row.find('td').eq(3).text();
            const price = $row.find('td').eq(2).text().replace(' ₽', '');

            orderItems.push({
                product_id: productId,
                sku_id: sku,
                name: name,
                quantity: qty,
                price: price,
                type: 'product',
            });
        });

        return {
            products: orderItems
        };
    }

    // Метод для отправки данных заказа на сервер
    placeOrder(orderData, callback) {
        $.ajax({
            url: '/bulkpurchase-createorder/',
            type: 'POST',
            dataType: 'json',
            data: orderData,
            success: function (response) {
                if (callback) callback(response);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при создании заказа: ", error);
            }
        });
    }
}

$(document).ready(function () {
    new BulkpurchaseProductTable('.bulkpurchase-products-table');
    const bulkpurchaseModal = new BulkpurchaseModal('#bulkpurchase-orderModal', '.bulkpurchase-tab-button', '.bulkpurchase-tab-content');
    
    $('#bulkpurchase-place-order').click(function() {
        bulkpurchaseModal.sendOrder();
    });
});
*/
/* 
v2


class BulkpurchaseModal {
    constructor(modalSelector, tabButtonSelector, tabContentSelector) {
        this.$modal = $(modalSelector);
        this.$tabButtons = $(tabButtonSelector);
        this.$tabContents = $(tabContentSelector);
        this.init();
    }

    init() {
        this.handleOpenModal();
        this.handleCloseModal();
        this.handleSwitchTab();
        this.activateFirstTab();
    }

    handleOpenModal() {
        $('#bulkpurchase-open-order-modal').click(() => {
            this.populateOrderTabs();
            this.$modal.show();
        });
    }

    handleCloseModal() {
        $('.bulkpurchase-close-modal').click(() => {
            this.$modal.hide();
        });
    }

    handleSwitchTab() {
        this.$tabButtons.click((event) => {
            const $button = $(event.currentTarget);
            const tabId = $button.data('for-tab');

            this.$tabContents.hide();
            this.$tabButtons.removeClass('bulkpurchase-active');
            $button.addClass('bulkpurchase-active');

            $(`.bulkpurchase-tab-content[data-tab="${tabId}"]`).show();
        });
    }

    activateFirstTab() {
        const firstTabId = this.$tabButtons.first().data('for-tab');
        $(`.bulkpurchase-tab-content[data-tab="${firstTabId}"]`).show();
        this.$tabButtons.first().addClass('bulkpurchase-active');
    }

    populateOrderTabs() {
        // Очищаем предыдущее содержимое вкладок
        $('.bulkpurchase-tab-content').empty();

        // Добавляем структуру таблицы для каждой вкладки
        const tableStructure = `
            <table class="bulkpurchase-modal-table">
                <thead>
                    <tr>
                        <th>Артикул</th>
                        <th>Наименование</th>
                        <th>Цена за штуку</th>
                        <th>Количество</th>
                        <th>Всего</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;

        $('.bulkpurchase-tab-content[data-tab="1"]').append(tableStructure);
        $('.bulkpurchase-tab-content[data-tab="2"]').append(tableStructure);

        // Проходим по всем строкам таблицы
        $('.bulkpurchase-products-table tbody tr').each((index, row) => {
            const $row = $(row);
            const productId = $row.data('product-id');
            const name = $row.find('.js-product-name').text();
            const sku = $row.find('.js-product-art').text();
            const price = $row.find('.js-product-price').data('price');
            const qtyMsk = $row.find('.js-product-qty-msk input').val();
            const qtyFr = $row.find('.js-product-qty-fr input').val();
            const totalPriceMsk = parseInt(qtyMsk) * parseFloat(price);
            const totalPriceFr = parseInt(qtyFr) * parseFloat(price);

            // Добавляем строки в таблицу Москва
            if (parseInt(qtyMsk) > 0) {
                $('.bulkpurchase-tab-content[data-tab="1"] .bulkpurchase-modal-table tbody').append(
                    `<tr data-product-id='${productId}'>
                        <td>${sku}</td>
                        <td>${name}</td>
                        <td>${price} ₽</td>
                        <td>${qtyMsk}</td>
                        <td>${totalPriceMsk} ₽</td>
                    </tr>`
                );
            }

            // Добавляем строки в таблицу Франция
            if (parseInt(qtyFr) > 0) {
                $('.bulkpurchase-tab-content[data-tab="2"] .bulkpurchase-modal-table tbody').append(
                    `<tr data-product-id='${productId}'>
                        <td>${sku}</td>
                        <td>${name}</td>
                        <td>${price} ₽</td>
                        <td>${qtyFr}</td>
                        <td>${totalPriceFr} ₽</td>
                    </tr>`
                );
            }
        });
    }

    // Новый метод для отправки данных о заказе
    sendOrder(tabId) {
        let orderItems = [];
        $(`.bulkpurchase-tab-content[data-tab="${tabId}"] .bulkpurchase-modal-table tbody tr`).each(function() {
            let $row = $(this);
            let productId = $row.data('product-id');
            let sku = $row.find('td').eq(0).text();
            let name = $row.find('td').eq(1).text();
            let qty = parseInt($row.find('td').eq(3).text());
            let price = parseFloat($row.find('td').eq(2).text().replace(' ₽', ''));
            
            orderItems.push({
                product_id: productId, // Включаем ID продукта в данные заказа
                sku_id: sku,
                name: name,
                quantity: qty,
                price: price,
                type: 'product',
            });
        });

        if (!orderItems.length) {
            console.log('Нет товаров для заказа.');
            return;
        }

        $.ajax({
            url: '/bulkpurchase-createorder/', // Убедитесь, что URL верный
            method: 'POST',
            dataType: 'json',
            data: {
                products: orderItems
            },
            success: function(response) {
                console.log('Ответ сервера: ', response);
                alert('Заказ успешно создан!');
            },
            error: function(xhr) {
                console.error('Ошибка при создании заказа: ', xhr.responseText);
                alert('Ошибка при создании заказа.');
            }
        });
    }
}

$(document).ready(function () {
    const modal = new BulkpurchaseModal('#bulkpurchase-orderModal', '.bulkpurchase-tab-button', '.bulkpurchase-tab-content');
    $('#bulkpurchase-place-order').click(function() {
        modal.sendOrder('1'); // Отправка данных о заказе для Москвы
        modal.sendOrder('2'); // Отправка данных о заказе для Франции
    });
});
*/

class BulkpurchaseModal {
    constructor(modalSelector, tabButtonSelector, tabContentSelector) {
        this.$modal = $(modalSelector);
        this.$tabButtons = $(tabButtonSelector);
        this.$tabContents = $(tabContentSelector);
        this.init();
    }

    init() {
        this.handleOpenModal();
        this.handleCloseModal();
        this.handleSwitchTab();
        this.activateFirstTab();
    }

    handleOpenModal() {
        $('#bulkpurchase-open-order-modal').click(() => {
            this.populateOrderTabs();
            this.$modal.show();
        });
    }

    handleCloseModal() {
        $('.bulkpurchase-close-modal').click(() => {
            this.$modal.hide();
        });
    }

    handleSwitchTab() {
        this.$tabButtons.click((event) => {
            const $button = $(event.currentTarget);
            const tabId = $button.data('for-tab');

            this.$tabContents.hide();
            this.$tabButtons.removeClass('bulkpurchase-active');
            $button.addClass('bulkpurchase-active');

            $(`.bulkpurchase-tab-content[data-tab="${tabId}"]`).show();
        });
    }

    activateFirstTab() {
        const firstTabId = this.$tabButtons.first().data('for-tab');
        $(`.bulkpurchase-tab-content[data-tab="${firstTabId}"]`).show();
        this.$tabButtons.first().addClass('bulkpurchase-active');
    }

    populateOrderTabs() {
        // Очищаем предыдущее содержимое вкладок
        $('.bulkpurchase-tab-content').empty();

        // Добавляем структуру таблицы для каждой вкладки
        const tableStructure = `
            <table class="bulkpurchase-modal-table">
                <thead>
                    <tr>
                        <th>Артикул</th>
                        <th>Наименование</th>
                        <th>Цена за штуку</th>
                        <th>Количество</th>
                        <th>Всего</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;

        $('.bulkpurchase-tab-content[data-tab="1"]').append(tableStructure);
        $('.bulkpurchase-tab-content[data-tab="2"]').append(tableStructure);

        // Проходим по всем строкам таблицы
        $('.bulkpurchase-products-table tbody tr').each((index, row) => {
            const $row = $(row);
            const productId = $row.data('product-id');
            const name = $row.find('.js-product-name').text();
            const sku = $row.find('.js-product-art').text();
            const price = $row.find('.js-product-price').data('price');
            const qtyMsk = $row.find('.js-product-qty-msk input').val();
            const qtyFr = $row.find('.js-product-qty-fr input').val();
            const totalPriceMsk = parseInt(qtyMsk) * parseFloat(price);
            const totalPriceFr = parseInt(qtyFr) * parseFloat(price);

            // Добавляем строки в таблицу Москва
            if (parseInt(qtyMsk) > 0) {
                $('.bulkpurchase-tab-content[data-tab="1"] .bulkpurchase-modal-table tbody').append(
                    `<tr data-product-id="${productId}">
                        <td>${sku}</td>
                        <td>${name}</td>
                        <td>${price} ₽</td>
                        <td>${qtyMsk}</td>
                        <td>${totalPriceMsk} ₽</td>
                    </tr>`
                );
            }

            // Добавляем строки в таблицу Франция
            if (parseInt(qtyFr) > 0) {
                $('.bulkpurchase-tab-content[data-tab="2"] .bulkpurchase-modal-table tbody').append(
                    `<tr data-product-id="${productId}">
                        <td>${sku}</td>
                        <td>${name}</td>
                        <td>${price} ₽</td>
                        <td>${qtyFr}</td>
                        <td>${totalPriceFr} ₽</td>
                    </tr>`
                );
            }
        });
    }

    sendOrder(tabId) {
        let orderItems = [];
        $(`.bulkpurchase-tab-content[data-tab="${tabId}"] .bulkpurchase-modal-table tbody tr`).each(function() {
            let $row = $(this);
            let productId = $row.data('product-id');
            let sku = $row.find('td').eq(0).text();
            let name = $row.find('td').eq(1).text();
            let qty = parseInt($row.find('td').eq(3).text());
            let price = parseFloat($row.find('td').eq(2).text().replace(' ₽', ''));
            
            orderItems.push({
                product_id: productId, // Включаем ID продукта в данные заказа
                sku_id: sku,
                name: name,
                quantity: qty,
                price: price,
                type: 'product',
            });
        });

        if (!orderItems.length) {
            console.log('Нет товаров для заказа.');
            return;
        }

        $.ajax({
            url: '/bulkpurchase-createorder/', // Убедитесь, что URL верный
            method: 'POST',
            dataType: 'json',
            data: {
                products: orderItems
            },
            success: function (response) {
                /*
                console.log('Ответ сервера: ', response);
                alert('Заказ успешно создан!');
                */
            },
            error: function (xhr) {
                /*
                console.error('Ошибка при создании заказа: ', xhr.responseText);
                alert('Ошибка при создании заказа.');
                */
            }
        });
    }
}
class BulkpurchaseProductTable {
    constructor(selector) {
        this.$table = $(selector);
        this.init();
    }

    init() {
        this.$table.on('input', '.js-product-qty-msk input, .js-product-qty-fr input', (event) => {
            const $input = $(event.target);
            const $row = $input.closest('tr');
            this.checkMaxQuantity($input);
            this.updateTotalForProduct($row);
        });
    }

    updateTotalForProduct($row) {
        const price = parseFloat($row.find('.js-product-price').data('price'));
        const qtyMsk = parseInt($row.find('.js-product-qty-msk input').val()) || 0;
        const qtyFr = parseInt($row.find('.js-product-qty-fr input').val()) || 0;

        const totalMsk = price * qtyMsk;
        const totalFr = price * qtyFr;

        $row.find('.js-product-total-msk').text(totalMsk ? `${totalMsk.toFixed(2)} ₽` : '—');
        $row.find('.js-product-total-fr').text(totalFr ? `${totalFr.toFixed(2)} ₽` : '—');
    }

    checkMaxQuantity($input) {
        const maxQty = parseInt($input.attr('max'));
        const currentQty = parseInt($input.val()) || 0;

        if (currentQty > maxQty) {
            $input.val(maxQty);
            alert('Количество не может превышать максимально доступное.');
        }
    }
}

$(document).ready(function () {
    new BulkpurchaseProductTable('.bulkpurchase-products-table');
    const modal = new BulkpurchaseModal('#bulkpurchase-orderModal', '.bulkpurchase-tab-button', '.bulkpurchase-tab-content');
    $('#bulkpurchase-place-order').click(function() {
        modal.sendOrder('1'); // Отправка данных о заказе для Москвы
        modal.sendOrder('2'); // Отправка данных о заказе для Франции
    });
});
