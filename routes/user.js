require('../models/User')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = mongoose.model('usuarios')

router.get('/registro', (req, res) => {
    res.render('users/registro')
})

router.post('/registro', (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido!"})
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "E-mail inválido!"})
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha inválido!"})
    }

    if (req.body.senha.length < 4) {
        erros.push({texto: "Senha muito curta!"})
    }

    if (!req.body.confirmar_senha || typeof req.body.confirmar_senha == undefined || req.body.confirmar_senha == null) {
        erros.push({texto: "Confirmação de Senha não pode ser vazia!"})
    }

    if (req.body.senha != req.body.confirmar_senha) {
        erros.push({texto: "As senhas são diferentes, tente novamente!"})
    }

    if (erros.length  > 0) {
        res.render('users/registro', {
            erros: erros
        })
    } else {
        User.findOne({
            email: req.body.email
        })
        .lean()
        .then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'E-mail já cadastrado.')
                res.redirect('/users/registro')
            } else {
                const newUser = new User({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Erro durante o salvamento do Usuário')
                            console.log('erro ao salvar usuário', erro)
                            res.redirect('/registro')
                        }

                        newUser.senha = hash

                        newUser.save()
                            .then(() => {
                                req.flash('success_msg', 'Usuário criado com sucesso!')
                                res.redirect('/')
                            })
                            .catch((err) => {
                                req.flash('error_msg', 'Erro ao criar Usuário!')
                                console.log('Erro ao CRIAR usuário', err)
                                res.redirect('/users/registro')
                            })
                    })
                })
            }
        })
        .catch((err) => {
            req.flash('error_msg', 'Erro interno!')
            console.log('Erro ao registrar usuário', err)
            res.redirect('/users/registro')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash('success_msg', 'Usuário deslogado')
        res.redirect('/')
    })
})

module.exports = router