const { Category, Order, Product, User, UserProfile } = require('../models')
const { Op } = require('sequelize')
const EasyInvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');
const convertCurrency = require('../helpers/convertCurrency')
// const bcrypt = require('bcryptjs')


class Controller {
    static async landingPage(req, res) { //done
        const { keyword } = req.query
        let options = {}

        if (keyword) options.where = {
            name: {
                [Op.iLike]: `%${keyword}%`
            }
        }
        try {
            const categories = await Category.findAll(options);

            res.render('Home', { categories })
        } catch (err) {
            res.send(err)
        }
    }

    static async orderProducts(req, res) { //ini role
        const { userId } = req.session
        try {

            const { categoryId } = req.params;
            const category = await Category.findByPk(categoryId, {
                include: {
                    model: Product
                }
            })
            const role = await User.findOne({
                where: { id: userId },
                attributes: ['role']
            })

            const products = await Product.findAll({ where: { CategoryId: categoryId } });

            res.render('OrderByCategory', { category, products, role, convertCurrency });
        } catch (err) {
            res.send(err);
        }
    }

    static async postOrderProducts(req, res) {
        const { userId } = req.session
        try {
            // res.send(req.body)
            const data = req.body

            const products = [];

            for (let i = 0; i < data.ProductId.length; i++) {

                if (data.quantity[i] == 0) continue

                const product = {
                    ProductId: data.ProductId[i],
                    productName: data.productName[i],
                    totalPrice: (+data.price[i]) * (+data.quantity[i]),
                    quantity: +data.quantity[i],
                };
                products.push(product);
            }
            // res.send(products)
            for (let i = 0; i < products.length; i++) {
                const { ProductId, productName, totalPrice, quantity } = products[i];

                await Order.create({
                    UserId: userId,
                    ProductId,
                    productName,
                    totalPrice,
                    quantity,
                    gameUid: req.body.gameUid
                });
            }
            // await Order.create
            // const products = await Product.findAll({ where: { CategoryId: categoryId } });
            res.redirect('/gshop/orders/')
            // res.render('OrderByCategory', { data, products });
        } catch (err) {
            res.send(err.message);
        }
    }

    static async generateInvoice(req, res) {
        const { userId } = req.session
        try {
            // console.log("test")
            await Order.update({
                status: true,
                where: {
                    UserId: userId
                }
            })

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
                    id: userId,
                    status: false
                }
            })

            const products = []
            for (let i = 0; i < user.Orders.length; i++) {
                const { productName } = user.Orders[i].Product
                const { totalPrice, quantity } = user.Orders[i]

                const product = {
                    productName, quantity, totalPrice
                }
                products.push(product)
            }

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
                bottomNotice: 'Kindly pay your invoice within 15 days.',
            };

            const pdfBuffer = await EasyInvoice.createInvoice(invoiceData);


            res.contentType('application/pdf');
            res.setHeader(`Content-Disposition`, `attachment; filename="${user.username}.pdf"`);
            res.send(pdfBuffer);
            res.redirect('/')
        } catch (err) {
            console.error('Error generating invoice:', err);
            res.status(500).send('Error generating invoice');
        }
    }



    static async signUp(req, res) { //done
        const { errors } = req.query
        try {
            res.render('SignUp', { errors })
        } catch (err) {
            res.send(err)
        }
    }

    static async postSignUp(req, res) { //done
        const { username, password, role } = req.body
        try {
            // buat user baru
            const newUser = await User.create({ username, password, role });

            // buat userprofile berdasarkan id
            await UserProfile.create({ UserId: newUser.id });
            const success = "User registered successfully"
            res.redirect(`/gshop/sign-in?success=${success}`)
        } catch (err) {
            if (err.name) {
                let errors = [];
                if (err.name == "SequelizeValidationError") {
                    errors = err.errors.map(e => e.message)
                } else if (err.name == "SequelizeUniqueConstraintError") {
                    errors.push('Username already exists')
                }
                res.redirect(`/gshop/sign-up?errors=${errors}`)
            } else {
                res.send(err)

            }
        }
    }

    static async signIn(req, res) { //done
        const { error, success } = req.query
        try {
            res.render('SignIn', { error, success })
        } catch (err) {
            res.send(err)
        }
    }

    static async postSignIn(req, res) { //done
        const { username, password } = req.body
        try {
            const validationError = await User.validateUsernamePassword(username, password);

            if (validationError) {
                res.redirect(`/gshop/sign-in?error=${validationError}`);
            } else {
                const user = await User.findOne({
                    where: {
                        username: username
                    }
                })
                req.session.userId = user.id
                res.redirect('/');
            }
        } catch (err) {
            res.send(err)
        }
    }

    static async signOut(req, res) { //done
        try {
            req.session.destroy()
            res.redirect('/gshop/sign-in')
        } catch (err) {
            res.send(err)
        }
    }

    static async userProfile(req, res) {//done
        const { userId } = req.session
        try {
            console.log("test")
            const user = await User.findByPk(userId, {
                include: UserProfile,
                attributes: ['username']
            })

            if (!user) throw new Error("user not found")
            res.render('UserProfile', { user })
        } catch (err) {
            console.log(err)
            res.send(err)
        }
    }

    static async updateProfile(req, res) {
        const { userId } = req.session
        try {
            const userProfile = await UserProfile.findOne({
                include: {
                    model: User,
                    attributes: ['username']
                },
                where: {
                    UserId: userId
                }
            });
            // res.send(userProfile)
            res.render('EditProfile', { userProfile })
        } catch (err) {
            res.send(err)
        }
    }

    static async postUpdateProfile(req, res) {
        const { userId } = req.session
        try {

            const { fullName, phoneNumber } = req.body
            await UserProfile.update({ fullName, phoneNumber }, {
                where: {
                    UserId: userId
                }
            })
            res.redirect(`/gshop/user-profile/`)
        } catch (err) {
            res.send(err)
        }
    }

    static async showOrders(req, res) {
        const { userId } = req.session
        try {

            const orders = await User.findOne({
                where: { id: userId },
                attributes: ['username'],
                include: [
                    {
                        model: Order,
                        where: { status: false },
                        include: [
                            {
                                model: Product,
                                attributes: ['productName']
                            }
                        ]
                    }
                ]
            });

            // console.log(orders,`<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)
            // res.send(orders)
            // if (orders.length < 0) {
            //     const empty = "Tidak ada order, order dulu ngab!"
            //     res.render('Orders', { empty })
            // }
            // res.send(orders)

            const subtotal = await Order.sum('totalPrice', {
                where: {
                    UserId: userId,
                    status: false
                }
            })
            console.log(subtotal)

            res.render('Orders', { orders, subtotal, convertCurrency })
        } catch (err) {
            res.send(err)
        }
    }

    static async cancelOrder(req, res) {
        const { userId } = req.params
        try {
            const order = await UserProfile.update(userId, {
                include: UserProfile
            })
            //await order.destroy()
            res.redirect(`/gshop/orders/${userId}`)
        } catch (err) {
            res.send(err)
        }
    }

    static async order(req, res) {
        try {
            const { id } = req.params
            const data = await Product.findByPk(id)

            res.send()
            // res.render('OrderByCategory', { data: [dataArr] })
        } catch (err) {
            console.log(err)
            res.send(err.message)
        }
    }
}

module.exports = Controller