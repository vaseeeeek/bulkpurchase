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
            this.updateAggregateValues();
            this.toggleNotNullClass($row);
            saveOrderDataToCookies();
        });
        loadOrderDataFromCookies();
        this.formatPrices(); // Форматируем цены при загрузке

        $('#bulkpurchase-open-order-modal').click(() => this.sendOrder());
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    formatPrices() {
        this.$table.find('.js-product-price').each((index, element) => {
            const $element = $(element);
            const price = parseFloat($element.data('price')).toFixed(2);
            $element.text(`${this.formatNumber(price)} ₽`);
        });
    }

    updateTotalForProduct($row) {
        const price = parseFloat($row.find('.js-product-price').data('price'));
        const qtyMsk = parseInt($row.find('.js-product-qty-msk input').val()) || 0;
        const qtyFr = parseInt($row.find('.js-product-qty-fr input').val()) || 0;

        const totalMsk = price * qtyMsk;
        const totalFr = price * qtyFr;

        $row.find('.js-product-total-msk').text(totalMsk ? `${this.formatNumber(totalMsk.toFixed(2))} ₽` : '—');
        $row.find('.js-product-total-fr').text(totalFr ? `${this.formatNumber(totalFr.toFixed(2))} ₽` : '—');
    }

    updateAggregateValues() {
        let totalWeightMsk = 0;
        let totalVolumeMsk = 0;
        let totalMoneyMsk = 0;
        let totalMoneyFr = 0;

        this.$table.find('tbody tr').each(function () {
            const $row = $(this);

            const qtyMsk = parseInt($row.find('.js-product-qty-msk input').val()) || 0;
            const qtyFr = parseInt($row.find('.js-product-qty-fr input').val()) || 0;
            const weightPerUnit = parseFloat($row.data('feat-weight')) || 0;
            const volumePerUnit = parseFloat($row.data('feat-obem')) || 0;
            const pricePerUnit = parseFloat($row.find('.js-product-price').data('price')) || 0;

            totalWeightMsk += weightPerUnit * qtyMsk;
            totalVolumeMsk += volumePerUnit * qtyMsk;
            if (pricePerUnit && pricePerUnit > 0) {
                totalMoneyMsk += pricePerUnit * qtyMsk;
            }
            totalMoneyFr += pricePerUnit * qtyFr;
        });

        $('.js-th-weight-msk').text(totalWeightMsk ? `${totalWeightMsk.toFixed(2)} кг` : '—');
        $('.js-th-obem-msk').text(totalVolumeMsk ? `${totalVolumeMsk.toFixed(2)} л` : '—');
        $('.js-th-total-msk').text(totalMoneyMsk ? `${this.formatNumber(totalMoneyMsk.toFixed(2))} ₽` : '—');
        $('.js-th-total-fr').text(totalMoneyFr ? `${this.formatNumber(totalMoneyFr.toFixed(2))} ₽` : '—');
    }

    checkMaxQuantity($input) {
        const maxQty = parseInt($input.attr('max'));
        const currentQty = parseInt($input.val()) || 0;

        if (currentQty > maxQty) {
            $input.val(maxQty);
        }
    }

    toggleNotNullClass($row) {
        const qtyMsk = parseInt($row.find('.js-product-qty-msk input').val()) || 0;
        const qtyFr = parseInt($row.find('.js-product-qty-fr input').val()) || 0;

        if (qtyMsk > 0 || qtyFr > 0) {
            $row.addClass('not-null');
        } else {
            $row.removeClass('not-null');
        }
    }

    sendOrder() {
        let orderItemsMsk = [];
        let orderItemsFr = [];
        const comment = $('#order-comment').val(); // Получаем значение комментария

        this.$table.find('tbody tr').each(function () {
            let $row = $(this);
            let productId = $row.data('product-id');
            let skuId = $row.find('.js-product-art').data('sku-id');
            let name = $row.find('.js-product-name').text();
            let qtyMsk = parseInt($row.find('.js-product-qty-msk input').val()) || 0;
            let qtyFr = parseInt($row.find('.js-product-qty-fr input').val()) || 0;
            let price = parseFloat($row.find('.js-product-price').data('price'));

            if (qtyMsk > 0) {
                orderItemsMsk.push({
                    product_id: productId,
                    sku_id: skuId,
                    name: name,
                    quantity: qtyMsk,
                    price: price,
                    type: 'product'
                });
            }

            if (qtyFr > 0) {
                orderItemsFr.push({
                    product_id: productId,
                    sku_id: skuId,
                    name: name,
                    quantity: qtyFr,
                    price: price,
                    type: 'product'
                });
            }
        });

        if (!orderItemsMsk.length && !orderItemsFr.length) {
            console.log('Нет товаров для заказа.');
            return;
        }
        console.log(orderItemsMsk);
        // Создание заказа для московского склада
        if (orderItemsMsk.length) {
            $.ajax({
                url: '/bulkpurchase-createorder/', // Убедитесь, что URL верный для московского склада
                method: 'POST',
                dataType: 'json',
                data: {
                    products: orderItemsMsk,
                    comment: comment // Отправляем комментарий на сервер
                },
                success: function (response) {
                    console.log('Заказ для московского склада успешно создан: ', response);
                },
                error: function (xhr) {
                    console.error('Ошибка при создании заказа для московского склада: ', xhr.responseText);
                    alert('Ошибка при создании заказа для московского склада.');
                }
            });
        }
        
        // Создание заказа для французского склада
        if (orderItemsFr.length) {
            $.ajax({
                url: '/bulkpurchase-createorder/', // Убедитесь, что URL верный для французского склада
                method: 'POST',
                dataType: 'json',
                data: {
                    products: orderItemsFr,
                    comment: comment 
                },
                success: function (response) {
                    console.log('Заказ для французского склада успешно создан: ', response);
                },
                error: function (xhr) {
                    console.error('Ошибка при создании заказа для французского склада: ', xhr.responseText);
                    alert('Ошибка при создании заказа для французского склада.');
                }
            });
        }

        // Сброс таблицы заказов после отправки
        this.resetOrderTable();
    }

    resetOrderTable() {
        // Обнуляем значения в таблице
        $('.js-product-qty-msk input, .js-product-qty-fr input').val(0);
        $('.js-product-qty-msk input, .js-product-qty-fr input').last().trigger('input');

        $('.js-product-total-fr').each(function () {
            $(this).html('—');
        })
        $('.js-product-total-msk').each(function () {
            $(this).html('—');
        })

        // Отображаем сообщение об успешном заказе
        this.openConfirmationModal();
    }

    openConfirmationModal() {
        $('#order-confirmation-modal').show();
    }

    closeConfirmationModal() {
        $('#order-confirmation-modal').hide();
    }

}

// При загрузке страницы восстановить данные по количеству
function loadOrderDataFromCookies() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('orderData='))
        ?.split('=')[1];

    if (cookieValue) {
        const orderData = JSON.parse(decodeURIComponent(cookieValue));
        orderData.forEach(item => {
            const $row = $(`.js-product-art:contains('${item.sku}')`).closest('tr');
            $row.find('.js-product-qty-msk input').val(item.qtyMsk);
            $row.find('.js-product-qty-fr input').val(item.qtyFr);

            $row.find('.js-product-qty-msk input').trigger('input');
            $row.find('.js-product-qty-fr input').trigger('input');
        });
    }
}

$(document).ready(function () {
    const bulkPurchaseTable = new BulkpurchaseProductTable('.bulkpurchase-products-table');

    $('#close-confirmation-modal, .bulkpurchase-close-modal').click(function () {
        bulkPurchaseTable.closeConfirmationModal();
    });
});

$(document).ready(function () {
    // Обработчик клика на кнопки категорий
    $('.cat-nav__item .button').click(function () {
        var catId = $(this).data('cat-id');
        var $target = $('.bulkpurchase-products-table tr span[data-cat-id="' + catId + '"]');

        if ($target.length) {

            $('html, body').animate({
                scrollTop: $target.offset().top - 400
            }, 1000);
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    function showModalSuccess() {
        const modal = document.getElementById('modal-success');
        modal.style.display = 'block';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000); // Скрыть через 3 секунды
    }

    document.getElementById('upload-button').addEventListener('click', function () {
        var fileInput = document.getElementById('file-input');
        var file = fileInput.files[0];

        if (!file) {
            alert('Пожалуйста, выберите файл перед загрузкой.');
            return;
        }
        showLoading();

        var reader = new FileReader();

        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            var json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (json.length === 0) {
                alert('Файл пуст.');
                hideLoading();
                return;
            }

            var columnCount = json[0].length;
            if (columnCount > 3) {
                var dataJson = XLSX.utils.sheet_to_json(worksheet);
                updateTable(dataJson);
            } else if (columnCount === 3) {
                updateSpecialFormatTable(json);
            } else {
                alert('Неверный формат файла.');
            }

            fileInput.value = '';
            hideLoading();
            showModalSuccess();
        };

        reader.onerror = function (e) {
            console.error('Ошибка при чтении файла:', e);
            alert('Произошла ошибка при чтении файла.');
            hideLoading(); // Скрыть анимацию загрузки
        };

        reader.readAsArrayBuffer(file);
    });

    function updateTable(data) {
        // Сначала собираем все строки, которые нужно обновить
        const rowsToUpdate = [];
        let lastRow;

        data.forEach(function (row) {
            var skuName = row['Артикул'];
            var qtyMoscow = row['Заказ Москва, шт.'];
            var qtyFrance = row['Заказ на поступление, шт.'];
            var $row = $('tr .js-product-art[data-sku-name="' + skuName + '"]').closest('tr');

            if ($row.length > 0) {
                if (qtyMoscow !== undefined) {
                    $row.find('.js-product-qty-msk input').val(qtyMoscow);
                }
                if (qtyFrance !== undefined) {
                    $row.find('.js-product-qty-fr input').val(qtyFrance);
                }
                rowsToUpdate.push($row);
                lastRow = $row;
            }
        });

        if (rowsToUpdate.length > 0) {
            lastRow.find('.js-product-qty-msk input').trigger('input');
            lastRow.find('.js-product-qty-fr input').trigger('input');
        }
    }


    function updateSpecialFormatTable(data) {
        const rowsToUpdate = [];

        data.forEach(function (row, index) {
            if (index === 0) return;
            var sku = row[0];
            var name = row[1];
            var qtyMoscow = row[2];

            var $row = $('tr .js-product-art[data-sku-name="' + sku + '"]').closest('tr');
            if ($row.length > 0) {
                $row.find('.js-product-qty-msk input').val(qtyMoscow);
                rowsToUpdate.push($row);
            } else {
                console.warn(`Продукт с артикулом ${sku} не найден.`);
            }
        });

        if (rowsToUpdate.length > 0) {
            rowsToUpdate.forEach(function ($row) {
                $row.find('.js-product-qty-msk input').trigger('input');
            });
        }

        setTimeout(saveOrderDataToCookies, 100);
    }
});

function saveOrderDataToCookies() {
    const orderData = [];
    $('.bulkpurchase-products-table tbody tr').each(function () {
        const $row = $(this);
        const skuNameElement = $row.find('.js-product-art').data('sku-name');

        if (skuNameElement) {
            const sku = skuNameElement;
            const qtyMsk = $row.find('.js-product-qty-msk input').val();
            const qtyFr = $row.find('.js-product-qty-fr input').val();
            if (sku && (qtyMsk > 0 || qtyFr > 0)) {
                orderData.push({
                    sku: sku,
                    qtyMsk: qtyMsk,
                    qtyFr: qtyFr
                });
            }
        } else {
            // console.log($row);
            // console.error('Элемент .js-product-art не содержит data-sku-name');
        }
    });

    const jsonOrderData = JSON.stringify(orderData);
    document.cookie = `orderData=${encodeURIComponent(jsonOrderData)};path=/;max-age=${60 * 60 * 24 * 30}`; // Куки будут храниться 30 дней
}


$(document).ready(function () {
    $('#export-to-excel').on('click', function () {
        // Создаем новую таблицу для экспорта
        var $table = $("<table>");

        // Добавляем строки для экспорта
        $('tr.js-export').each(function () {
            var $clonedRow = $(this).clone();
            $clonedRow.find('.download-row').remove();

            // Обновляем ячейку цены, удаляя текст и конвертируя запятые в точки
            var $priceCell = $clonedRow.find('.js-product-price');
            var priceText = $priceCell.text().replace(' руб.', '').replace('.', ',');
            $priceCell.text(priceText);

            // Обновляем ячейки с количеством товаров, заменяя input на их значения
            $clonedRow.find('.js-product-qty-msk input').each(function () {
                var qtyMsk = $(this).val();
                $(this).parent().text(qtyMsk); // Заменяем input на текст
            });
            $clonedRow.find('.js-product-qty-fr input').each(function () {
                var qtyFr = $(this).val();
                $(this).parent().text(qtyFr); // Заменяем input на текст
            });

            // Добавляем клонированную строку в новую таблицу
            $table.append($clonedRow);
        });

        // Генерируем лист из новой таблицы
        var ws = XLSX.utils.table_to_sheet($table[0], { raw: true });

        // Применяем формулы к каждой строке данных, исключая строку с заголовками
        $table.find('tr.js-export-total').each(function (index) {
            var rowIndex = index + 2; // Номер строки в Excel начинается с 1, и мы добавляем 1, чтобы пропустить заголовки
            const qtyMskCellRef = `E${rowIndex}`;
            const priceCellRef = `C${rowIndex}`;
            const qtyFrCellRef = `H${rowIndex}`;
            const totalMskCellRef = `F${rowIndex}`;
            const totalFrCellRef = `I${rowIndex}`;

            ws[totalMskCellRef] = { f: `${qtyMskCellRef}*${priceCellRef}` };
            ws[totalFrCellRef] = { f: `${qtyFrCellRef}*${priceCellRef}` };
        });

        // Устанавливаем ссылку на диапазон, включая только строки для экспорта
        ws['!ref'] = XLSX.utils.encode_range({
            s: { c: 0, r: 0 }, // Начинаем с A1
            e: {
                c: $table.find('tr:last td').length - 1, // Конец столбца
                r: $table.find('tr').length - 1  // Конец строки
            }
        });

        // Создаем новую книгу и добавляем лист
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OrderDetails");

        // Сохраняем книгу
        XLSX.writeFile(wb, 'OrderDetails.xlsx');
    });
});

$(document).ready(function () {
    var isMoscowHidden = false;
    var isFranceHidden = false;

    $('#hide-zero-stock-msk').click(function () {
        $('.js-product-stock-msk').each(function () {
            var stock = parseInt($(this).text());
            if (stock === 0) {
                if (!isMoscowHidden) {
                    $(this).closest('tr').hide();
                } else {
                    $(this).closest('tr').show();
                }
            }
        });
        isMoscowHidden = !isMoscowHidden;
        $(this).toggleClass('active-filter');
    });

    $('#hide-zero-stock-fr').click(function () {
        $('.js-product-stock-fr').each(function () {
            var stock = parseInt($(this).text());
            if (stock === 0) {
                if (!isFranceHidden) {
                    $(this).closest('tr').hide();
                } else {
                    $(this).closest('tr').show();
                }
            }
        });
        isFranceHidden = !isFranceHidden;
        $(this).toggleClass('active-filter');
    });
});

$(document).ready(function () {
    $('#search-input').on('input', function () {
        var searchText = $(this).val().toLowerCase();

        $('.bulkpurchase-products-table tbody tr').each(function () {
            var $row = $(this);
            var sku = $row.find('.js-product-art').data('sku-name');
            if (sku) {
                sku = String(sku).toLowerCase(); // Изменение здесь
                var name = $row.find('.js-product-name').text().toLowerCase();

                if (sku.includes(searchText) || name.includes(searchText)) {
                    $row.show(); // Показываем строку, если она соответствует запросу
                } else {
                    $row.hide(); // Скрываем строку, если она не соответствует запросу
                }
            }
        });
    });
});

$(document).ready(function () {
    var isFilterActive = false;

    $('#show-ordered').click(function () {
        isFilterActive = !isFilterActive;
        $(this).toggleClass('active-filter', isFilterActive);

        if (isFilterActive) {
            // Применить фильтр
            $('.bulkpurchase-products-table tbody tr').each(function () {
                var qtyMsk = parseInt($(this).find('.js-product-qty-msk input').val()) || 0;
                var qtyFr = parseInt($(this).find('.js-product-qty-fr input').val()) || 0;

                if (qtyMsk === 0 && qtyFr === 0) {
                    $(this).hide();
                }
            });
        } else {
            // Снять фильтр
            $('.bulkpurchase-products-table tbody tr').show();
        }
    });
});