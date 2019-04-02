const express = require('express')
const multer = require('multer')

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

const upload = multer({
    dest: file_path,
})


main.get('/', async (request, response) => {
    const user = current_user(request)
    const ins = await User.find_by('username', user)
    const boards = await Board.all()
    // log('boards:', boards)
    const args = {
        boards: boards,
    }
    // response.render('board/index.html', args)
    response.send(args)
})


// 正常的 form 表单提交数据
// main.post('/add', user_check, async (request, response) => {
//     const user = current_user(request)
//     const ins = await User.find_by('username', user)
//     const form = request.body
//     await Board.new(form)
//     const args = {
//         user: ins
//     }
//     response.redirect('/board')
// })



// ajax 提交
main.post('/api/add', user_check, async (request, response) => {
    const user = current_user(request)
    const form = request.body
    // log('ajax 给出的 form：', form)
    const board = await Board.new(form)
    // response.send(JSON.stringify(board))
    const boards = await Board.all()
    // response.send(JSON.stringify(board))
    response.send(boards)
})



// main.get('/delete', user_check, async (request, response) => {
//     const board_id = request.query.board_id || -1
//     await Board.delete_by_id(board_id)
//     response.redirect('/board')
// })



main.get('/api/delete', user_check, async (request, response) => {
    const board_id = request.query.board_id || -1
    // log('api delete:', board_id)
    const board = await Board.delete_by_id(board_id)
    const boards = await Board.all()
    // response.send(JSON.stringify(board))
    response.send(boards)
})


main.get('/edit', user_check, (request, response) => {
    const board_id = request.query.board_id || -1
    const args = {
        board_id: board_id,
    }
    // response.render('board/edit.html', args)
    response.send(args)
})


main.post('/update', user_check, async (request, response) => {
    const board_id = request.body.board_id || -1
    const form = request.body
    // 下面这个还需要考虑
    await Board.update_by_id(board_id, 'board_content', form.board_content)
    // response.redirect('/board')
    const boards = await Board.all()
    // response.send(JSON.stringify(board))
    response.send(boards)
})





module.exports = {
    board: main,
}
