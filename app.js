// Módulos
    const passport = require('passport')
    require('./models/Post')
    require('./models/Category')
    require('./config/auth')(passport)
    const express = require('express')
    const { engine } = require('express-handlebars')
    const session = require('express-session')
    const flash = require('connect-flash')
    const bodyParser = require('body-parser')
    const app = express()
    const mongoose = require('mongoose')
    const admin = require('./routes/admin')
    const user = require('./routes/user')
    const path = require('path')
    const PORT = 8081

    const Post = mongoose.model('postagens')
    const Category = mongoose.model('categorias')

// Configurações
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    })

    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(bodyParser.json())

    app.engine('handlebars', engine({
        defaultLayout: 'main',
        helpers: {
            ifCond: function(v1, v2, options) {
                if (String(v1) === String(v2)) {
                    return options.fn(this)
                } else {
                    return options.inverse(this)
                }
            }
        }
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
// Rotas´
    app.get('/', (req, res) => {
        Post.find()
            .populate('categoria')
            .sort({data: 'desc'})
            .lean()
            .then((postagens) => {
                res.render('index', {
                    posts: postagens
                })
            }).catch((err) => {
                req.flash('error_msg', 'Erro interno!')
                console.log('Erro ao listar Postagens em index', err)
                res.redirect('/404')
            })
    })

    app.get('/post/:slug', (req, res) => {
        Post.findOne({
            slug: req.params.slug
        })
            .populate('categoria')
            .lean()
            .then((postagem) => {
                if (postagem) {
                    res.render('post/index', {
                        post: postagem
                    })
                } else {
                    req.flash('error_msg', 'Postagem não encontrada!')
                    res.redirect('/')
                }
            })
            .catch((err) => {
                req.flash('error_msg', 'Postagem não encontrada!')
                console.log('Erro ao listar Postagem', err)
                res.redirect('/')
            })
    });

    app.get('/categories', (req, res) => {
        Category.find()
            .lean()
            .then((categorias) => {
                res.render('categories/index', {
                    categories: categorias
                })
            })
            .catch((err) => {
                req.flash('error_msg', 'Erro ao listar Categorias!')
                console.log('Erro ao listar Categories', err)
                res.redirect('/')
            })
    })

    app.get('/categories/:slug', (req, res) => {
        Category.findOne({
            slug: req.params.slug
        })
            .lean()
            .then((categoria) => {
                if (categoria) {
                    Post.find({
                        categoria: categoria._id
                    })
                        .sort({
                            data: 'desc'
                        })
                        .lean()
                        .then((postagens) => {
                            res.render('categories/posts', {
                                category: categoria,
                                posts: postagens
                            })
                        })
                        .catch((err) => {
                            req.flash('error_msg', 'Erro ao listar Postagens!')
                            console.log('Erro ao listar POSTAGENS', err)
                            res.redirect('/categories')
                        })
                } else {
                    req.flash('error_msg', 'Categoria não encontrada!')
                    res.redirect('/categories')
                }
            })
            .catch((err) => {
                req.flash('error_msg', 'Erro ao recuperar Categoria!')
                console.log('Erro ao recuperar Categoria', err)
                res.redirect('/categories')
            })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)
    app.use('/users', user)

// Outros
app.listen(PORT, () => {
    console.log('Servidor Rodando', PORT)
})