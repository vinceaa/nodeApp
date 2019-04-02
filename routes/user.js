// const express = require('express')
// const multer = require('multer')
//
// const main = express.Router()
// const {
//     log,
//     encryption,
//     salt,
//     file_path,
//     remove_repeat,
//     current_time,
// } = require('../utils')
//
// const {current_user} = require('./index')
//
// const {User} = require('../model/user')
// const {Reply} = require('../model/reply')
// const {Topic} = require('../model/topic')
//
// const upload = multer({
//     dest: file_path,
// })
//
//
// main.get('/', (request, response) => {
//     const user = current_user(request)
//     const ins = User.find_by('username', user)
//     const args = {
//         user: ins
//     }
//     response.render('user/index.html', args)
// })
//
// main.post('/register', (request, response) => {
//     const form = request.body
//     const checked = User.register_check(form)
//     const args = {}
//     if (checked === true) {
//         form.password = encryption(salt, form.password)
//         User.new(form)
//         args.infor = '注册成功'
//     } else {
//         args.infor = '用户名或者密码长度必须大于 2 !'
//     }
//     response.render('user/index.html', args)
// })
//
// main.get('/login', (request, response) => {
//     response.render('user/login.html')
//
// })
//
// main.post('/login', (request, response) => {
//     const form = request.body
//     const checked = User.login_check(form)
//     const args = {}
//     if (checked === true) {
//         request.session.username = form.username
//         // log('request.session:', request.session)
//         response.redirect('/')
//     } else {
//         args.infor = '用户名或者密码错误!'
//         response.render('user/login.html', args)
//     }
//
// })
//
//
// main.get('/logout', (request, response) => {
//     // log('logout:', request.session)
//     request.session = null
//     // log('logout 后:', request.session)
//     response.redirect('/')
// })
//
//
// main.get('/profile', (request, response) => {
//     const user = current_user(request)
//     const ins = User.find_by('username', user)
//     const args = {
//         user: ins
//     }
//     response.render('user/profile.html', args)
// })
//
//
// main.post('/upload', upload.single('file'), (request, response) => {
//     // log('require.file:', request.file.filename)
//     const user = current_user(request)
//     const ins = User.find_by('username', user)
//     ins.path = request.file.filename
//     ins.save()
//     const args = {
//         user: ins,
//     }
//     response.render('user/profile.html', args)
// })
//
//
// main.get('/avatar/:path', (request, response) => {
//     const path = request.params.path || 'nothing'
//     const paths = require('path')
//     const p = file_path + path
//     const absolutePath = paths.resolve(p)
//     // const absolutePath = paths.join(__dirname, '..', p)
//     response.sendFile(absolutePath)
// })
//
//
// main.get('/:user_id', (request, response) => {
//     const user_id = Number(request.params.user_id)
//     const user = User.find_by_id(user_id)
//     const creat_topic = Topic.find_all('author_id', user_id)
//     const join_topic = Reply.find_all('replyer_id', user_id)
//     const c_time = current_time()
//     // log('join_topic:', join_topic)
//     const join_pos_list = remove_repeat(join_topic)
//     // log('join_pos_list:', join_pos_list)
//     const joins = []
//     join_pos_list.forEach((e) => {
//         return joins.push(Topic.find_by_id(e))
//     })
//     const args = {
//         creat_topic: creat_topic,
//         join_topic: joins,
//         user: user,
//         current_time: c_time,
//     }
//     response.render('user/profile_look.html', args)
//
// })
//
//
//
//
// module.exports = {
//     user: main,
// }



// 下面是 mongoose 的配置
const express = require('express')
const multer = require('multer')

const main = express.Router()
const {
    log,
    encryption,
    salt,
    file_path,
    remove_repeat,
    current_time,
    make_set_reply,
    make_set,
} = require('../utils')

const {
    current_user,
    user_check,
} = require('./index')

const {User} = require('../model/user')
const {Reply} = require('../model/reply')
const {Topic} = require('../model/topic')

const upload = multer({
    dest: file_path,
})


main.get('/', async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const args = {
        user: ins
    }
    // response.render('user/index.html', args)
    // response.render(JSON.stringify(args))
    response.send(JSON.stringify(args))
    // response.send(args)
})

main.post('/register', async (request, response) => {
    const form = request.body
    const checked = await User.register_check(form)
    const args = {}
    // log('checked:', checked)
    // log('register 正在进行！', form)
    if (checked === true) {
        form.password = encryption(salt, form.password)
        await User.new(form)
        args.infor = '注册成功'
    } else {
        args.infor = '用户名或者密码长度必须大于 2 !'
    }
    // response.render('user/index.html', args)
    response.send(args)
})

main.post('/register/ifRename', async (request, response) => {
    const form = request.body
    const checked = await User.register_rename(form)
    const args = {
        ifRename: checked,
    }
    response.send(args)
})

main.get('/login', (request, response) => {
    response.render('user/login.html')

})

main.post('/login', async (request, response) => {
    const form = request.body
    const checked = await User.login_check(form)
    var args = {}
    const next_url =  form.next_url || ''
    if (checked === true) {
        request.session.username = form.username
        // log('request.session:', request.session)
        // log('form:', form)
        // log('next_url:', next_url)
        // response.redirect(`/${next_url}`)
        // log('api login 进行 session username 是：', request.session.username )

        args = {
            redirect: true,
            infor: '登录成功！',
            next_url: `/${next_url}`,
            username: request.session.username,
        }
        response.send(args)
    } else {
        // args.infor = '用户名或者密码错误!'
        // response.render('user/login.html', args)
        args = {
            redirect: false,
            infor: '用户名或者密码错误!'
        }
        response.send(args)

    }

})


main.get('/logout', (request, response) => {
    log('logout:', request.session)
    request.session = null
    // log('logout 后:', request.session)
    const args = {
        reirect: '/'
    }
    response.send(args)
})


main.get('/profile', user_check, async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const args = {
        user: ins
    }
    response.render('user/profile.html', args)
})


main.post('/upload', upload.single('file'), async (request, response) => {
    // log('require.file:', request.file.filename)
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    ins.path = request.file.filename
    await ins.save()
    const args = {
        user: ins,
    }
    // response.render('user/profile.html', args)
    response.send(args)
})


main.get('/avatar/:path', (request, response) => {
    const path = request.params.path || 'nothing'
    const paths = require('path')
    const p = file_path + path
    const absolutePath = paths.resolve(p)
    // log('absolutePath:', paths.resolve('../../' + p))
    // log('absolutePath:', absolutePath)
    // const absolutePath = paths.join(__dirname, '..', p)
    response.sendFile(absolutePath)
})


main.get('/:user_id', async (request, response) => {
    log('用户详情页请求')
    const user_id = request.params.user_id
    const user = await User.find_by_id(user_id)
    const creat_topic = await Topic.find_all('author_id', user_id)
    const creat_topic_set = await make_set(creat_topic)

    const join_topic = await Reply.find_all('replyer_id', user_id)
    const c_time = current_time()
    const join_pos_list = remove_repeat(join_topic)
    const joins = []
    for (let id of join_pos_list) {
        const finda = await Topic.find_by_id(id)
        joins.push(finda)
    }

    // 下面这种方式不能添加 异步的元素 到 lista 中， 所以必须用上面的
    // await join_pos_list.forEach(async (e) => {
    //     const finda = await Topic.find_by_id(e)
    //     // log('e:', e)
    //     // log('Topic.find_by_id(e):', await Topic.find_by_id(e))
    //     return await joins.push(finda)
    // })
    const joins_set = await make_set(joins)

    const args = {
        // creat_topic: creat_topic,
        creat_topic: creat_topic_set,
        // join_topic: joins,
        join_topic: joins_set,
        user: user,
        current_time: c_time,
    }
    // response.render('user/profile_look.html', args)
    response.send(args)

})

//E:\Gua-node\code\practice\practice3-bootstrap\hotspot_path\c883835e35d78e401029c78c987215bb
//E:\Gua-node\code\practice\practice3-bootstrap\upload_path\50bddf07948af3b6877661197e9cd27b



module.exports = {
    user: main,
}

