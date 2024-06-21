const { Category, Order, Product, User, UserProfile } = require('../models')
const { Op } = require('sequelize')
const convertCurrency = require('../helpers/convertCurrency')



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

    static async orderProducts(req, res) { //done
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
            await Order.bulkOrders(req.body, userId)

            res.redirect('/gshop/orders/')
        } catch (err) {
            res.send(err);
        }
    }

    static async userProfile(req, res) {//done
        const { userId } = req.session
        try {
            const user = await User.findByPk(userId, {
                include: UserProfile,
                attributes: ['username', 'role']
            })

            if (!user) throw new Error("user not found")
            res.render('UserProfile', { user })
        } catch (err) {
            console.log(err)
            res.send(err)
        }
    }

    static async updateProfile(req, res) { //done
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
            res.render('EditProfile', { userProfile })
        } catch (err) {
            res.send(err)
        }
    }

    static async postUpdateProfile(req, res) { //done
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

    static async showOrders(req, res) { //done
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

            let empty;
            if (!orders || orders.length < 1) {
                empty = "Tidak ada order, order dulu ngab!"
            }

            const subtotal = await Order.sum('totalPrice', {
                where: {
                    UserId: userId,
                    status: false
                }
            })

            res.render('Orders', { empty, orders, subtotal, convertCurrency })
        } catch (err) {
            res.send(err)
        }
    }

    static async destroyProduct(req, res) { //done
        const { categoryId, productId } = req.params
        try {
            const product = await Product.findByPk(productId)
            console.log("deleted")
            await product.destroy()
            res.redirect(`/gshop/category/${categoryId}`)
        } catch (err) {
            res.send(err)
        }
    }
}

module.exports = Controller