const express = require('express')


const main = express.Router()
const {
    log,
    encryption,
    salt,
    file_path,
} = require('../utils')

const {
    current_user,
    user_check,
} = require('./index')

const {User} = require('../model/user')
const {Board} = require('../model/board')



main.get('/', async (request, response) => {
    const user = current_user(request)
    const args = {
    }
    response.render('ajax_demo/demo.html', args)
})


main.post('/add', async (request, response) => {
    const user = current_user(request)
    const ajax_data = request.body
    // const id = request.query.id
    // log('request', request)
    log('ajax_data:', ajax_data)
    // response.render('ajax_demo/demo.html')
    const a = {
        username: 'haha'
    }
    response.send(JSON.stringify(a))
})







module.exports = {
    ajax_demo: main,
}
