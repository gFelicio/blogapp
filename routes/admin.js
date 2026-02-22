const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Category')
const Category = mongoose.model('categorias')
require('../models/Post')
const Post = mongoose.model('postagens')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/categories', (req, res) => {
    Category.find().sort({
        date: 'desc'
    }).lean().then((categorias) => {
        console.log('Categorias', categorias)
        res.render('admin/categories', {
            categories: categorias
        })
    }).catch((err) => {
        req.flash('error_msg', "Erro ao listar Categorias!")
        console.log('Erro ao listar categorias', err)
        res.redirect('/admin')
    })
})

router.get('/categories/add', (req, res) => {
    res.render('admin/addcategories')
})

router.post('/categories/new', (req, res) => {
    var erros = []

    if (!req.body.nome && typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido!"})
    }

    if (!req.body.slug && typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug inválido!"})
    }

    if (req.body.nome.length < 2) {
        erros.push({texto: "Nome da Categoria é muito pequeno!"})
    }

    if (erros.length > 0) {
        console.log('ERROS ARR', erros)
        res.render('admin/addcategories', {
            erros: erros
        })
    } else {
        const newCategory = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Category(newCategory).save().then(() => {
            console.log('Categoria salva')

            req.flash("success_msg", "Categoria criada com sucesso!")

            res.redirect('/admin/categories')
        }).catch((err) => {
            console.log('ERRO ao salvar categoria ', err)
            req.flash("error_msg", "Erro ao salvar Categoria!")
            res.redirect('/admin')
        })

    }

});

router.get('/categories/edit/:id', (req, res) => {
    Category.findOne({
        _id: req.params.id
    }).lean().then((categoria) => {
        res.render('admin/editcategory', {
            category: categoria
        })
    }).catch((err) => {
        console.log('Erro ao editar categoria', err)
        req.flash('erro_msg', 'Categoria não encontrada!')
        res.redirect('/admin/categories')
    })
})

router.post('/categories/edit', (req, res) => {
    var erros = []

    if (!req.body.nome && typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido!"})
    }

    if (!req.body.slug && typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug inválido!"})
    }

    if (req.body.nome.length < 2) {
        erros.push({texto: "Nome da Categoria é muito pequeno!"})
    }

    if (erros.length > 0) {
        console.log('ERROS ARR', erros)
        res.render('admin/addcategories', {
            erros: erros
        })
    } else {
        Category.findOne({
            _id: req.body.id
        }).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria atualizada com sucesso!')
                res.redirect('/admin/categories')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao atualizar categoria!')
                console.log('Erro ao atualizar categoria', err)
                res.redirect('/admin/categories')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Erro ao atualizar categoria!')
            res.redirect('/admin/categories')
        })
    }
})

router.post('/categories/delete', (req, res) => {
    Category.findByIdAndDelete({
        _id: req.body.id
    }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categories')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar Categoria!')
        console.log('Erro ao deletar categoria', err)
        res.redirect('/admin/categories')
    })
})

router.get('/posts', (req, res) => {
    Post.find()
        .populate('categoria')
        .sort({data: "desc"})
        .lean()
        .then((postagens) => {
            res.render('admin/posts', {
                posts: postagens
            })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao listar Postagens')
            console.log('erro post list', err)
            res.redirect('/admin')
        })
});

router.get('/posts/add', (req, res) => {
    Category.find().lean().then((categorias) => {
        res.render('admin/addposts', {
            categories: categorias
        })
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulário!')
        console.log('Erro ao carregar formulário de postagens', err)
        res.redirect('/admin/posts')
    })
})

router.post('/posts/new', (req, res) => {
    var erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length < 2) {
        erros.push({texto: 'Título inválido!'})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: 'Slug inválido!'})
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({texto: 'Descrição inválida!'})
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({texto: 'Conteúdo inválido!'})
    }

    if (req.body.categoria == '0' || req.body.categoria == undefined || req.body.categoria == null) {
        erros.push({texto: "Categoria inválida! Registre uma Categoria!"})
    }

    if (erros.length > 0) {
        console.log('Erros ao validar formulario posts', erros)
        Category.find().lean().then((categorias) => {
            res.render('admin/addposts', {
                erros: erros,
                with: req.body,
                categories: categorias
            })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao carregar categorias!')
            console.log('Erro ao carregar categorias', err)
            res.redirect('/admin/posts')
        })
    } else {
        const newPost = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Post(newPost).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/posts')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao criar postagem!')
            console.log('Erro ao criar postagem', err)
            Category.find().lean().then((categorias) => {
                res.render('admin/addposts', {
                    erros: [{texto: 'Erro ao criar postagem'}],
                    with: newPost,
                    categories: categorias
                })
            }).catch((errCat) => {
                console.log('Erro ao carregar categorias', errCat)
                res.redirect('/admin/posts')
            })
        })
    }
})

router.get('/posts/edit/:id', (req, res) => {
    Post.findOne({
        _id: req.params.id
    }).populate('categoria')
    .lean()
    .then((postagem) => {
        Category.find().lean().then((categorias) => {
            res.render('admin/editpost', {
                post: postagem,
                categories: categorias
            })
        }).catch((errCat) => {
            req.flash('error_msg', 'Erro ao carregar categorias!')
            console.log('erro ao carregar categorias edit post', err)
            res.redirect('/admin/posts')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Postagem não encontrada!')
        console.log('erro em edit post', err)
        res.redirect('/admin/posts')
    })
})

router.post('/posts/edit', (req, res) => {
    var erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length < 2) {
        erros.push({texto: 'Título inválido!'})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: 'Slug inválido!'})
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({texto: 'Descrição inválida!'})
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({texto: 'Conteúdo inválido!'})
    }

    if (req.body.categoria == '0' || req.body.categoria == undefined || req.body.categoria == null) {
        erros.push({texto: "Categoria inválida! Registre uma Categoria!"})
    }

    if (erros.length > 0) {
        console.log('Erros ao validar formulario posts', erros)
        Category.find().lean().then((categorias) => {
            res.render('admin/addposts', {
                erros: erros,
                with: req.body,
                categories: categorias
            })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao carregar categorias!')
            console.log('Erro ao carregar categorias', err)
            res.redirect('/admin/posts')
        })
    } else {
        Post.findOne({
            _id: req.body.id
        }).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem atualizada com sucesso!')
                res.redirect('/admin/posts')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao atualizar postagem!')
                console.log('Erro update post', err)
                res.redirect('/admin/posts')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao encontrar Postagem!')
            console.log('Erro ao encontrar postagem para editar', err)
            res.redirect('/admin/posts')
        })
    }
})

router.get('/posts/delete/:id', (req, res) => {
    Post.findOneAndDelete({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/posts')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar Postagem!')
        console.log('Erro ao delete post', err)
        res.redirect('/admin/posts')
    })
})

module.exports = router;