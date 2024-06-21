const EasyInvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');
const { Category, Order, Product, User, UserProfile } = require('../models')

class GenerateInvoice {
    static async generateInvoice(req, res) {
        const { userId } = req.session;
        try {
            const user = await User.findOne({
                where: { id: userId },
                attributes: ['username'],
                include: [
                    {
                        model: Order,
                        where: { status: false },
                        include: Product
                    }
                ]
            });

            const subtotal = await Order.sum('totalPrice', {
                where: {
                    UserId: userId,
                    status: false
                }
            });

            const products = user.Orders.map(order => ({
                productName: order.Product.productName,
                quantity: order.quantity,
                totalPrice: order.totalPrice
            }));

            await Order.update(
                { status: true },
                {
                    where: {
                        UserId: userId,
                        status: false
                    }
                }
            );

            const invoiceData = {
                documentTitle: 'Invoice',
                currency: 'IDR',
                taxNotation: 'vat',
                marginTop: 25,
                marginBottom: 25,
                logo: 'https://www.easyinvoice.cloud/img/logo.png',
                sender: {
                    company: 'Your Company Name',
                    address: 'Your Company Address',
                    zip: '12345',
                    city: 'Your City',
                    country: 'Your Country'
                },
                client: {
                    company: user.username,
                    address: 'Client Address',
                    zip: '67890',
                    city: 'Client City',
                    country: 'Client Country'
                },
                invoiceNumber: '2024001',
                invoiceDate: new Date().toISOString(),
                products: products,
                subtotal: subtotal,
                bottomNotice: 'Kindly pay your invoice within 24 hours.',
            };

            const pdfBuffer = await EasyInvoice.createInvoice(invoiceData);

            res.contentType('application/pdf');
            res.setHeader(`Content-Disposition`, `attachment; filename="${user.username}.pdf"`);
            res.send(pdfBuffer);
        } catch (err) {
            res.send(err)
            console.error('Error generating invoice:', err);
        }
    }


}

module.exports = GenerateInvoice