const Controller = require('../controllers/controller')
const router = require('express').Router()
const gshopRouter = require('./gshopRouter')

router.get('/', (req, res) => {
    res.redirect('/gshop')
})

router.use('/gshop', gshopRouter)



module.exports = router
