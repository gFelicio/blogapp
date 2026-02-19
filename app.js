// Módulos
    const express = require('express')
    const { engine } = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const mongoose = require('mongoose')
    const admin = require('./routes/admin')
    const path = require('path')
    const PORT = 8081

// Configurações
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
// Rotas
    app.use('/admin', admin)

// Outros
app.listen(PORT, () => {
    console.log('Servidor Rodando', PORT)
})