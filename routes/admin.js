const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Category')
const Category = mongoose.model('categorias')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('Página de Posts')
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

module.exports = router;