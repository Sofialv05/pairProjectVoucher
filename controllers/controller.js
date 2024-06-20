const { Category, Order, Product, User, UserProfile } = require('../models')
const { Op } = require('sequelize')
const nodemailer = require('nodemailer');
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

    static async getProductsByCategory(req, res) { //done
        try {
            const { categoryId } = req.params
            const category = await Category.findOne({
                include: Product,
                where: {
                    id: categoryId
                }
            })
            // res.send(category)
            res.render('Products', { category })
        } catch (err) {
            res.send(err)
        }
    }

    static async createOrder(req, res) {//!-----
        try {

            res.render('Products', {})
        } catch (err) {
            res.send(err)
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
            console.log("test2")
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
            const orders = await Order.findAll({
                where: {
                    UserId: userId
                }
            })
            if (!orders) {
                const empty = "Tidak ada order, order dulu ngab!"
                res.render('Orders', { empty })
            }
            res.render('Orders', { orders })
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
}

module.exports = Controller