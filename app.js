// Módulos
    const express = require('express')
    const { engine } = require('express-handlebars')
    const session = require('express-session')
    const flash = require('connect-flash')
    const bodyParser = require('body-parser')
    const app = express()
    const mongoose = require('mongoose')
    const admin = require('./routes/admin')
    const path = require('path')
    const PORT = 8081

// Configurações
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))

    app.use(flash())

    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')

        next()
    })

    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(bodyParser.json())

    app.engine('handlebars', engine({
        defaultLayout: 'main'
    }))
    app.set('view engine', 'handlebars')

    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/blogapp').then(() => {
        console.log('Conectado ao MongoDB')
    }).catch((err) => {
        console.log('EErro ao tentar conexão com MongoDB!', err)
    });

    app.use(express.static(path.join(__dirname, 'public')))

    // app.use((req, res, next) => {
    //     console.log('Middleware!');
    //     next()
    // })
// Rotas
    app.use('/admin', admin)

// Outros
app.listen(PORT, () => {
    console.log('Servidor Rodando', PORT)
})