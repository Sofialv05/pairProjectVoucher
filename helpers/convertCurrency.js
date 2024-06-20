function formatCurrency(value) {
    const idr = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    });

    return idr.format(value)
}

module.exports = formatCurrency