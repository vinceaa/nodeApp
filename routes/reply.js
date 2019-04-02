const express = require('express')
const multer = require('multer')

const main = express.Router()
const {
    log,
    encryption,
    salt,
    file_path,
    current_time,
    make_set_reply,
    current_time_specific,



} = require('../utils')

const {
    current_user,
    user_check,
} = require('./index')

const {User} = require('../model/user')
const {Board} = require('../model/board')
const {Topic} = require('../model/topic')
const {Reply} = require('../model/reply')
const {SubReply} = require('../model/subReply')


// main.post('/', user_check, async (request, response) => {
//     const form = request.body
//     const topic_id = form.topic_id
//     const user = current_user(request)
//     const ins = await User.find_by('username', user)
//     form.replyer_id = ins.id
//     form.created_time = current_time()
//     await Reply.new(form)
//     response.redirect(`/topic/detail/?topic_id=${topic_id}`)
// })

main.post('/', async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const form = request.body
    const topic_id = form.topic_id

    if (ins == undefined) {
        // log('没有登录就回复!')
        const args = {
            next_url: `topic/detail/?topic_id=${topic_id}`,
        }
        response.render('user/login.html', args)
    } else {
        // const user = current_user(request)
        // const ins = await User.find_by('username', user)
        form.replyer_id = ins.id
        form.created_time = current_time()
        await Reply.new(form)
        response.redirect(`/topic/detail/?topic_id=${topic_id}`)
    }

})


main.post('/api', async (request, response) => {
    // log('reply api 进行!')
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const form = request.body
    // log('form:', form)
    const topic_id = form.topic_id

    const topic = await Topic.find_by_id(topic_id)
    topic.updated_time = current_time()
    topic.save()

    if (ins == undefined) {
        // log('没有登录就回复!')
        const args = {
            if_redirect: true,
            next_url: `/topic/detail?topic_id=${topic_id}`,
        }
        response.send(args)
    } else {
        form.replyer_id = ins.id
        form.created_time = current_time()
        const new_reply = await Reply.new(form)
        // 把所有的回复作为 dicta，这样可以取出方法
        // 但是这里只是动态的载入一条回复，所以直接取 [0]
        var replys_set = await make_set_reply([new_reply])
        // response.redirect(`/topic/detail/?topic_id=${topic_id}`)
        // response.send(JSON.stringify(replys_set[0]))






        const replys = await Reply.find_all('topic_id', topic_id)
        var replys_set = await make_set_reply(replys)
        const args = {
            if_redirect: false,
            replys: replys_set,
        }
        response.send(args)
    }

})


// main.post('/api/replyto', user_check, async (request, response) => {
//     // log('request:', request.body)
//     log('api reply to !')
//     const user = current_user(request)
//     const ins = await User.find_by('username', user)
//     const form = request.body
//     const reply_id = form.reply_id || ''
//     form.replyer = ins.username
//     form.created_time = current_time()
//     form.spt_time = current_time_specific()
//     // log('form:', form)
//     const reply = await Reply.find_by_id(reply_id)
//     // log('之前的 reply 实例:', reply)
//     const reply_to_list = reply.reply_to_list
//     reply_to_list.push(form)
//
//     const reply_to = await Reply.update_by_id(reply_id, 'reply_to_list', reply_to_list)
//
//     const topic_id = form.topic_id || ''
//     log('topic_id', topic_id)
//
//     const replys = await Reply.find_all('topic_id', topic_id)
//     var replys_set = await make_set_reply(replys)
//     const args = {
//         replys: replys_set,
//     }
//     response.send(args)
// })

// 新的数据库设计
main.post('/api/replyto', async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const form = request.body
    const topic_id = form.topic_id

    if (ins == undefined) {
        // log('没有登录就回复!')
        const args = {
            if_redirect: true,
            next_url: `/topic/detail?topic_id=${topic_id}`,
        }
        response.send(args)
    } else {

        const reply_id = form.reply_id || ''
        const topic_id = form.topic_id || ''

        form.reply_content = form.reply_to_content || ''
        form.replyer_id = ins._id
        form.created_time = current_time()
        form.updated_time = current_time()
        const new_reply = await SubReply.new(form)
        const replys = await Reply.find_all('topic_id', topic_id)
        var replys_set = await make_set_reply(replys)

        const args = {
            replys: replys_set,
        }
        response.send(args)
    }



})


main.post('/api/iflike', async (request, response) => {
    log('iflike 进行')
    const form = request.body
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const topic_id = form.topic_id || ''
    if (ins == undefined) {
        // log('没有登录就点赞!')
        const args = {
            if_redirect: true,
            next_url: `/topic/detail?topic_id=${topic_id}`,
        }
        response.send(args)
    } else {
        const reply_id = form.reply_id || ''
        const iflike_status = form.status
        const user_id = ins._id
        const reply = await Reply.update_iflike(topic_id, reply_id, iflike_status, user_id)
        var replys_set = await make_set_reply(reply)
        const args = {
            replys: replys_set,
        }
        response.send(args)

    }




})


main.post('/api/iflike/sub', async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const form = request.body
    const topic_id = form.topic_id || ''


    if (ins == undefined) {
        // log('没有登录就点赞!')
        const args = {
            if_redirect: true,
            next_url: `/topic/detail?topic_id=${topic_id}`,
        }
        response.send(args)
    } else {
        const reply_id = form.reply_id || ''
        const iflike_status = form.status
        const user_id = ins._id
        const reply = await Reply.update_iflike_sub(topic_id, reply_id, iflike_status, user_id)
        var replys_set = await make_set_reply(reply)
        const args = {
            replys: replys_set,
        }
        response.send(args)
    }


})



main.post('/api/sublist', async (request, response) => {
    const form = request.body
    const reply_id = form.reply_id || ''
    // log('reply_id', reply_id)
    const reply = await Reply.find_by_id(reply_id)
    const sublist = await reply.get_sub_list()
    // log('sublist :', sublist)
    const args = {
        sublist,
    }
    response.send(args)



})









module.exports = {
    reply: main,
}
