const Controller = require('../controllers/controller')
const Sign = require('../controllers/sign')
const GenerateInvoice = require('../controllers/generateInvoice')
const router = require('express').Router()


router.get('/', Controller.landingPage)

router.get('/sign-in', Sign.signIn)

router.post('/sign-in', Sign.postSignIn)

router.get('/sign-up', Sign.signUp)

router.post('/sign-up', Sign.postSignUp)


const login = (req, res, next) => {
    if (!req.session.userId) {
        const error = `Please login to proceed`
        res.redirect(`/gshop/sign-in?error=${error}`)
    } else {
        next()
    }
}


router.get('/sign-out', login, Sign.signOut)

router.get('/user-profile/', login, Controller.userProfile)

router.get('/user-profile/edit', login, Controller.updateProfile)

router.post('/user-profile/edit', login, Controller.postUpdateProfile)

router.get('/orders/', login, Controller.showOrders)

router.get('/orders/generateInvoice', login, GenerateInvoice.generateInvoice);

router.get('/delete/:categoryId/:productId', login, Controller.destroyProduct)

router.get('/category/:categoryId', login, Controller.orderProducts)

router.post('/category/:categoryId', login, Controller.postOrderProducts)


module.exports = router