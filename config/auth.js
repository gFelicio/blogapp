const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('../models/User')

const User = mongoose.model('usuarios')

module.exports = function (passport) {
    passport.use(
        new localStrategy({
            usernameField: 'email',
            passwordField: 'senha'
        }, (email, senha, done) => {
            User.findOne({
                email: email
            })
            .lean()
            .then((usuario) => {
                if (!usuario) {
                    return done(null, false, {
                        message: "Conta não existe"
                    })
                }

                bcrypt.compare(senha, usuario.senha, (erro, match) => {
                    if (match) {
                        return done(null, usuario)
                    } else {
                        return done(null, false, {
                            message: "Senha incorreta"
                        })
                    }
                })
            })
            .catch((err) => {
                console.log('passport auth erro', err)
                return done(err)
            })
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id).then((user) => {
            done(null, user)
        }).catch((err) => {
            done(err)
        })
    })
}