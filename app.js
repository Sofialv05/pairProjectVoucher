const express = require('express')
const app = express()
const session = require('express-session')
const port = 3000
const router = require('./routes')

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use('/css', express.static('dist'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'keyboard cat', //required
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: true //security dari csrf attack
    }
}))
app.use(router)



app.listen(port, () => {
    console.log(`Server started in 1...2...3... ${port}`)
})