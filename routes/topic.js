const express = require('express')
const multer = require('multer')

const main = express.Router()
const {
    log,
    encryption,
    salt,
    file_path,
    current_time,
    current_time_specific,
    time_pass,
    make_set,
    make_set_reply,
    grouping,
    make_sets,
    list_n,
    group_wrap,
    group_update,
    file_path_topic,
    pre_lista,

} = require('../utils')

const {
    current_user,
    user_check,
} = require('./index')



const upload = multer({
    dest: file_path_topic,
})



const {User} = require('../model/user')
const {Board} = require('../model/board')
const {Topic} = require('../model/topic')
const {Reply} = require('../model/reply')

//
// main.get('/', async (request, response) => {
//     const user = current_user(request)
//     const ins = await User.find_by('username', user)
//     const boards = await Board.all()
//     const c_time = current_time()
//     const board_id = request.query.tab || -1
//     const group_id = request.query.group_id || 0
//     if (board_id == 0 || board_id == -1) {
//         var topic_all = await Topic.all()
//         var active_all = 'actives'
//
//     } else {
//         var topic_all = await Topic.find_all('board_id', board_id)
//         var active_all = ''
//     }
//
//     var topics = topic_all.reverse()
//     var topics = grouping(topics, 8)
//     // 只要涉及 await 操作， 就不能单纯的当作数组操作
//     var topics_set = await make_sets(topics)
//     var page_number = list_n(topics_set.length)
//     var topics_set = topics_set[group_id]
//     var pre_id = (group_id - 1 + topics.length) % topics.length
//     var next_id = (group_id + 1 + topics.length) % topics.length
//
//
//     var args = {
//         user: ins,
//         topics: topics_set,
//         current_time: c_time,
//         boards: boards,
//         board_id: board_id,
//         active_all: active_all,
//         group_id: group_id,
//         page_number: page_number,
//         pre_id: pre_id,
//         next_id: next_id,
//     }
//
//     response.render('topic/index.html', args)
//
// })




main.get('/', async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const boards = await Board.all()
    const c_time = current_time()
    const board_id = request.query.tab || -1

    log('request.query.tab:', request.query.tab)
    log('board_id:', board_id)

    const group_id = Number(request.query.group_id) || 0
    if (board_id == 0 || board_id == -1) {
        var topic_all = await Topic.all()
        var active_all = 'actives'

    } else {
        var topic_all = await Topic.find_all('board_id', board_id)
        var active_all = ''
    }

    var topics = topic_all.sort((a, b) => b.updated_time - a.updated_time)
    // var topics = topic_all.reverse()
    var topics = grouping(topics, 8)
    // 只要涉及 await 操作， 就不能单纯的当作数组操作
    var topics_set = await make_sets(topics)
    // var page_number = list_n(topics_set.length)
    var page_number = group_update(group_id + 1, topics_set.length)
    var topics_set = topics_set[group_id]
    var pre_id = (group_id - 1 + topics.length) % topics.length
    var next_id = (group_id + 1 + topics.length) % topics.length


    var args = {
        user: ins,
        topics: topics_set,
        current_time: c_time,
        boards: boards,
        board_id: board_id,
        active_all: active_all,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
    }

    // response.render('topic/index.html', args)
    response.send(args)
    // response.render('index2.html', args)

    // response.send(args)

})



main.get('/write', async (request, response) => {

    const user = current_user(request)
    const ins = await User.find_by('username', user)

    if (ins == undefined) {
        // log('没有登录就发表!')
        const args = {
            if_redirect: true,
            next_url: `/topic/write`,
        }
        response.send(args)
    } else {
        const boards = await Board.all()
        // log('board:', boards)
        const args = {
            boards: boards,
        }
        // response.render('topic/write.html', args)
        // response.render('topic/write_markdown.html', args)
        response.send(args)
    }



})



main.post('/add', user_check, async (request, response) => {
    // log('request:', request.body)
    log('request:', request.body)
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const form = request.body
    // log('forms:', form)
    form.author_id = ins.id
    form.created_time = current_time()
    form.spt_time = current_time_specific()
    await Topic.new(form)
    response.redirect('/topic')
})

main.post('/api/add', user_check, async (request, response) => {
    // log('request:', request.body)
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const form = request.body
    // log('forms:', form)
    form.author_id = ins.id
    form.created_time = current_time()
    form.updated_time = form.created_time
    form.spt_time = current_time_specific()
    const topic = await Topic.new(form)
    response.send(JSON.stringify(topic))
})






// ajax 上传
main.post('/api/addpics', upload.array('file', 100), user_check, async (request, response) => {
    // log('api/addpics！')
    const multi_files = request.files
    const lista = []
    multi_files.forEach((e) => {
        // log('filename:', e.filename)
        lista.push(e.filename)
    })
    const photo_path = {
        path_list: lista,
    }
    //
    response.send(JSON.stringify(photo_path))







    //
    //
    // const user = current_user(request)
    // const ins = await User.find_by('username', user)
    // const form = request.body
    // // log('forms:', form)
    // form.author_id = ins.id
    // form.created_time = current_time()
    // form.spt_time = current_time_specific()
    // await Topic.new(form)
    // response.redirect('/topic')
})



main.get('/api/test', async (request, response) => {
    log('api test 进行!')
    const multi_files = request.files
    const lista = []
    const photo_path = {
        test_value: 'hehehhe',
    }
    response.send(JSON.stringify(photo_path))
})


main.get('/cover/:path', (request, response) => {
    const user = current_user(request)

    const photo_path = request.params.path || '/'

    const paths = require('path')
    const p = file_path_topic + photo_path
    const absolutePath = paths.resolve(p)
    // log('absolutePath:', absolutePath)
    response.sendFile(absolutePath)
})



// main.get('/detail', async (request, response) => {
//     const user = current_user(request)
//     const userIns = await User.find_by('username', user)
//     // log('userIns', userIns)
//     const topic_id = request.query.topic_id
//     // const topic = await Topic.find_by_id(topic_id)
//     const topic = await Topic.find_all('_id', topic_id)
//     var topics_set = await make_set(topic)
//     topic[0].views += 1
//     topic[0].save()
//     const replys = await Reply.find_all('topic_id', topic_id)
//     var replys_set = await make_set_reply(replys)
//     const c_time = current_time()
//     // log('replys_set:', replys_set)
//     // log('time_pass', time_pass(replys[0].created_time, c_time))
//     const args = {
//         topic: topics_set[0],
//         replys: replys_set,
//         current_time: c_time,
//         userIns,
//     }
//     // response.render('topic/detail.html', args)
//     response.send(args)
// })


main.get('/detail', async (request, response) => {
    const user = current_user(request)
    const userIns = await User.find_by('username', user)
    const topic_id = request.query.topic_id

    const page_num = Number(request.query.page_num)
    // log('得到 page_num：', page_num)


    const topic = await Topic.find_all('_id', topic_id)
    var topics_set = await make_set(topic)
    topic[0].views += 1
    topic[0].save()
    const replys = await Reply.find_all('topic_id', topic_id)
    var replys_set = await make_set_reply(replys)

    const group_lista = grouping(replys_set, 10)
    var replys_set = pre_lista(group_lista, page_num)
    // log('group_lista:', group_lista)
    // log('replys_set:', replys_set)

    const page_len = group_lista.length
    const c_time = current_time()
    const args = {
        topic: topics_set[0],
        replys: replys_set,
        current_time: c_time,
        userIns,
        page_len,
    }
    response.send(args)
})


module.exports = {
    topic: main,
}
