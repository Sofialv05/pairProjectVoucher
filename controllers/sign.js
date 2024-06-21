const { Category, Order, Product, User, UserProfile } = require('../models')

class Sign {
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
            const newUser = await User.create({ username, password, role });

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
}

module.exports = Sign