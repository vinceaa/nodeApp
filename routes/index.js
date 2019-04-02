const express = require('express')
const {
    log,
    file_path1,
} = require('../utils')
const {User} = require('../model/user')

const main = express.Router()


const current_user = (request) => {
    // log('current_user:', request.session)
    const username = request.session.username || '游客'
    return username
}


const user_check = async (request, response, next) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    if (ins == undefined) {
        response.redirect('/user/login')
    } else {
        next()
    }
}



const admin_check = async (request, response, next) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    if (ins == null || ins.username != 'vin') {
        const args = {
            error: '1',
        }
        // response.redirect('/user/login')

        response.send(args)
    } else {
        next()
    }
}

// const admin_check = async (request, response, next) => {
//     const user = current_user(request)
//     const ins = await User.find_by('username', user)
//     if (ins == null) {
//         const args = {
//             error: '1',
//         }
//         // response.redirect('/user/login')
//
//         response.send(args)
//     } else if(ins.username != 'vin') {
//         const args = {
//             error: '1',
//         }
//         // response.redirect('/user/login')
//
//         response.send(args)
//
//     }else {
//         next()
//     }
// }


main.get('/', (request, response, next) => {
    const username = current_user(request)
    log('index / 进行！username 是:', username)
    // log('首页 username:', username)
    const args = {
        username: username,
    }

    response.render('index.html')

})

main.get('/index', (request, response) => {
    const username = current_user(request)
    const args = {
        username: username,
    }
    response.render('index1.html', args)
})


main.get('/markdown', (request, response) => {
    const args = {
        text: '<p>hehhe</p>',
    }
    response.render('markdown/index.html', args)
})




//
// main.get('/:path', (request, response) => {
//     log('static 进行')
//     const path = request.params.path || 'nothing'
//     const paths = require('path')
//     const p = file_path1 + path
//     const absolutePath = paths.resolve(p)
//     // const absolutePath = paths.join(__dirname, '..', p)
//     response.sendFile(absolutePath)
// })

module.exports = {
    index: main,
    current_user,
    user_check,
    admin_check,
}
