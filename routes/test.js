const express = require('express')
const {User} = require('../model/user')
const {log} = require('../utils')
const crypto = require('crypto')
// const User1 = require('../model/user')

const main = express.Router()

main.get('/', (request, response) => {
    User1.new({
        'username': 'gagaaasassssssssssssssd',
        'password': 'hahha',
    })
    const args = {
        user: 'index'
    }
    response.render('index.html', args)
})


main.get('/xxx', (request, response) => {
    console.log('jnxy2')
    console.log('id:', request.query)
    console.log('params:', request.params)
    const id = Number(request.query.id)
    console.log('id:', id)
    const args = {
        user: 'id'
    }
    response.render('index.html', args)
})

main.get('/:id', (request, response) => {
    // console.log('jnxy', request.query, id)
    console.log('id:', request.params)
    const id = Number(request.params.id)
    console.log('id:', id)
    const args = {
        user: 'id'
    }
    response.render('index.html', args)
})


main.get('/xxx/:id', (request, response) => {
    console.log('jnxy1')
    console.log('id:', request.params)
    const id = Number(request.params.id)
    console.log('id:', id)
    const args = {
        user: 'id'
    }
    response.render('index.html', args)
})


main.post('/add', (request, response) => {
    console.log('request.body', request.body)
    const args = {
        user: 'post'
    }
    response.render('index.html', args)
})



main.get('/hehe', (request, response) => {
    const args = {
        user: 'hehe'
    }
    response.render('index.html', args)
})

module.exports = {
    xxx: main,
}




const test = () => {
    const sha256 = crypto.createHash('sha256')
    sha256.update('121121')
    log(sha256.digest('hex'))
    // const hash = crypto.createHash('sha256')
    // hash.update(salted)
    // const h = hash.digest('hex')
}


const __main = () => {
    test()
}


__main()