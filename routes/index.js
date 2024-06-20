const Controller = require('../controllers/controller')
const SendMail = require('../controllers/emailController')

const router = require('express').Router()

router.get('/', (req, res) => {
    res.redirect('/gshop')
})

//landing page:categories
router.get('/gshop', Controller.landingPage) //done

//menu login
router.get('/gshop/sign-in', Controller.signIn) //done
//post login
router.post('/gshop/sign-in', Controller.postSignIn) //done
//menu daftar
router.get('/gshop/sign-up', Controller.signUp)//done
//daftar post
router.post('/gshop/sign-up', Controller.postSignUp)//done




const login = (req, res, next) => {
    // console.log("test")
    if (!req.session.userId) {
        const error = `Please login to proceed`
        res.redirect(`/gshop/sign-in?error=${error}`)
    } else {
        next()
    }
}


//sign out
router.get('/gshop/sign-out', login, Controller.signOut) //done

//check profile
router.get('/gshop/user-profile/', login, Controller.userProfile)

//edit user profile
router.get('/gshop/user-profile/edit', login, Controller.updateProfile)

// //post edit user profile
router.post('/gshop/user-profile/edit', login, Controller.postUpdateProfile)

// //tampilin user orders
router.get('/gshop/orders/', login, Controller.showOrders)

// //nodmailes
// // router.get('/gshop/orders/:userId/:orderId/pay', SendMail)

// //destroy user order
// router.get('/gshop/orders/:userId/:orderId/cancel', login, Controller.cancelOrder)



// //menu product dari kategorinya
router.get('/gshop/category/:categoryId', Controller.getProductsByCategory) //done

// //post buat transaksi
// router.post('/gshop/category/:categoryId', Controller.createOrder)





module.exports = router
