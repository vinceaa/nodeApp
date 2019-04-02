const express = require('express')
const multer = require('multer')

const fs = require('fs')
const path = require('path')

const main = express.Router()
const {
    log,
    current_time_specific,
    grouping,
    list_n,
    group_wrap,
    file_path_photo,
    file_path_shoes,
    crawl_path,
    make_set_photo,
    table_concat,
} = require('../utils')


const {
    get_urls,
} = require('../crawl/url')

const {
    save_crawl,
} = require('../crawl/demo')



const {Hotspot} = require('../model/hotspot')

const upload = multer({
    dest: file_path_photo,
})

const {
    current_user,
    user_check,
    admin_check,
} = require('./index')

const {User} = require('../model/user')
const {PBoard} = require('../model/pboard')
const {PBoardCeil} = require('../model/pboardCeil')
const {Photo} = require('../model/photo')
const {Topic} = require('../model/topic')


main.get('/', async (request, response) => {
    const pboards = await PBoard.all()
    const pboards_ceil = await PBoardCeil.all()

    const pboard_type = request.query.tab || 'all'

    const username = current_user(request)

    if (pboard_type == 'all') {
        log('pboard_type 为 0')
        var photos = await Photo.all()
        var actives = 'actives'
    } else {
        // var board =  await PBoard.find_by('board_content', pboard_type)
        // var type_id = board._id
        var photos = await Photo.find_all('type_id', pboard_type)
        var actives = ''

    }
    var photos_reverse_set = await make_set_photo(photos.reverse())




    const group_id = Number(request.query.group_id) || 0
    const p_number = 10


    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, photos_reverse_set, p_number)

    const new_lista = grouping(photos_reverse_set, p_number)
    // log('lista_set ', lista_set)
    // log('new_lista ', new_lista)
    // log('new_lista.length ', new_lista.length, group_id)

    const args = {
        // photos: lista_set,
        photos: new_lista,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
        pboards,
        pboards_ceil,
        actives,
        pboard_type,
        username,
    }
    // response.render('photo/index.html', args)
    response.send(args)
})

main.get('/test', async (request, response) => {
    const args = {
        msg: '这是 mongo test 页面'
    }
    response.render('photo/index.html', args)
})

main.get('/ceil/board', async (request, response) => {
    const group_id = Number(request.query.group_id) || 0
    const board_id = request.query.board_id || -1
    let photos = ''
    // log('board_id:', board_id)
    let pboards_ceil = ''
    if (board_id == 0) {
        pboards_ceil = await PBoardCeil.all()
        var first_id = pboards_ceil[0]._id || ''
        photos = await Photo.find_all('type_id', first_id)

    } else {
        pboards_ceil = await PBoardCeil.find_all('pboard_id', board_id)
        // log('pboards_ceil:', pboards_ceil)
        if (pboards_ceil.length == 0) {
            // log('子列表为空')
            photos = []
        } else {
            // log('子列表不为空')
            var first_id = pboards_ceil[0]._id || ''
            // log('first_id:', first_id)
            photos = await Photo.find_all('type_id', first_id)
        }

    }


    var photos_reverse_set = await make_set_photo(photos.reverse())

    const p_number = 10


    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, photos_reverse_set, p_number)
    // log('page_number:', page_number)

    const new_lista = grouping(photos_reverse_set, p_number)


    const args = {
        pboards_ceil,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
    }
    response.send(args)
})

main.get('/get/ceil/board', async (request, response) => {
    const type = request.query.type || ''
    const ceil_boards = await PBoardCeil.find_all('pboard_id', type)
    const args = {
        ceil_boards,
    }
    response.send(args)
})

main.get('/get/photos', async (request, response) => {
    const main_boards = await PBoard.all()
    // const ceil_boards = await PBoardCeil.all()
    let ceil_boards = ''

    const ceil_id = request.query.ceil_id || -1
    let photos = ''
    var status = request.query.status


    if (status == 1) {
        // log('点击的是子版块')
        photos = await Photo.find_all('type_id', ceil_id)
    } else {
        // log('点击的是父版块')
        if (ceil_id == 0) {
            // log('点击的是全部')
            var pboards = await PBoardCeil.all()
            // log('点击的是全部')
            var first_id = pboards[0]._id || ''
            photos = await Photo.find_all('type_id', first_id)

        } else {
            var pboards = await PBoardCeil.find_all('pboard_id', ceil_id)
            // log('点击的是其他', pboards)
            if (pboards.length == 0) {
                // log('字列表为空')
                photos = []
            } else {
                // log('字列表不为空')
                var first_id = pboards[0]._id || ''
                photos = await Photo.find_all('type_id', first_id)
            }

        }

    }

    var photos_reverse_set = await make_set_photo(photos.reverse())

    const group_id = Number(request.query.group_id) || 0
    const p_number = 10


    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, photos_reverse_set, p_number)

    const new_lista = grouping(photos_reverse_set, p_number)

    const args = {
        page_number,
        photos: new_lista,
        main_boards,
        ceil_boards,
    }
    response.send(args)
})

const search_method = async (Photo, search_key) => {
    const photos = await Photo.find_all_search('photo_title', search_key)
    return photos

}


main.get('/get/init', async (request, response) => {
    const username = current_user(request)

    const board_id = request.query.board_id
    const ceil_id = request.query.ceil_id
    const group_id = Number(request.query.group_id) || 0

    let main_boards = await PBoard.all()
    let ceil_boards = await PBoardCeil.all()

    // let ceil_boards = ''
    let photos = ''
    if (main_boards.length == 0 || ceil_boards.length == 0) {
        photos = []
        log('没有数据')
    } else {
        if (board_id == 0 && ceil_id == 0) {
            ceil_boards = await PBoardCeil.all()
            var first_id = ceil_boards[0]._id || ''
            log('2')
            photos = await Photo.find_all('type_id', first_id)
            ceil_boards = await PBoardCeil.all()
        } else if (board_id == 0 && ceil_id != 0) {
            ceil_boards = await PBoardCeil.all()
        }

        if (board_id == 0) {
            ceil_boards = await PBoardCeil.all()
            if (ceil_id == 0) {
                log('3')
                var first_id = ceil_boards[0]._id || ''
                log('4')

                photos = await Photo.find_all('type_id', first_id)

            } else {
                photos = await Photo.find_all('type_id', ceil_id)
            }


        } else if (board_id == 'search') {
            log('正在搜索')
            const search_key = request.query.key
            photos = await search_method(Photo, search_key)
            log('photos')

        }else {
            ceil_boards = await PBoardCeil.find_all('pboard_id', board_id)
            if (ceil_id == 0) {
                var first_id = ceil_boards[0]._id || ''
                photos = await Photo.find_all('type_id', first_id)

            } else {
                photos = await Photo.find_all('type_id', ceil_id)
            }

        }

    }
    var photos_reverse_set = await make_set_photo(photos.reverse())

    const p_number = 10


    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, photos_reverse_set, p_number)
    // log('next_id:', next_id)

    const new_lista = grouping(photos_reverse_set, p_number)

    const args = {
        main_boards,
        ceil_boards,
        photos: new_lista,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
        username,
    }
    response.send(args)
})






main.get('/type', async (request, response) => {
    const boards = await PBoard.all()
    let boards_ceils = ''
    let hotspot_type = ''

    const ceil_id = request.query.ceil_id || -1
    // log('request.query', request.query)

    if (ceil_id == -1) {
        boards_ceils = await PBoardCeil.all()
        // log('-1', boards_ceils)
        // hotspot_type = boards_ceils[0]._id
        hotspot_type = ''
        // log('ceil_id 为 -1', boards_ceils)
    } else {
        boards_ceils = await PBoardCeil.find_all('pboard_id', ceil_id)

        // log('ceil_id', ceil_id)
        // log('不为 -1', boards_ceils)
        hotspot_type = ceil_id
        // log('ceil_id 不为 -1', boards_ceils)
    }
    const boards_ceil_concat = await table_concat(boards_ceils, PBoard, 'pboard_id')

    const group_id = Number(request.query.group_id) || 0

    const p_number = 10

    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, boards_ceil_concat, p_number)



    const args = {
        boards,
        // boards_ceil: boards_ceil_concat,
        boards_ceil: lista_set,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
        current_ceil_id: hotspot_type,

    }
    // response.render('photo/type.html', args)
    response.send(args)
})



main.post('/type/api/add', admin_check, async (request, response) => {
    const form = request.body
    const board = await PBoard.new(form)
    const boards = await PBoard.all()
    response.send(boards)
})

main.post('/type/ceil/api/add', admin_check, async (request, response) => {
    const form = request.body
    const board = await PBoardCeil.new(form)
    const boards = await PBoardCeil.all()
    const boards_ceil_concat = await table_concat(boards, PBoard, 'pboard_id')

    response.send(boards_ceil_concat)
})



main.get('/type/api/delete', admin_check, async (request, response) => {
    const board_id = request.query.board_id || -1
    // log('api delete:', board_id)
    const board = await PBoard.delete_by_id(board_id)
    const pboards = await PBoardCeil.all()

    pboards.forEach(async (e) => {
        if (e.pboard_id == board_id) {
            // log('找到, 应该删除', e.pboard_ceil_content)
            await PBoardCeil.delete_by_id(e._id)
        }
    })




    const boards = await PBoard.all()
    response.send(boards)
})

main.get('/type/ceil/api/delete', admin_check, async (request, response) => {
    const ceil_id = request.query.ceil_id || -1
    // log('request.query:', request.query)
    const board = await PBoardCeil.delete_by_id(ceil_id)
    response.send({
        ok: 1
    })

})


main.get('/type/edit', admin_check, (request, response) => {
    const board_id = request.query.board_id || -1
    const args = {
        board_id: board_id,
    }
    // response.render('photo/edit.html', args)
    response.render(args)
})


main.post('/type/update', admin_check, async (request, response) => {
    const board_id = request.body.board_id || -1
    const form = request.body
    // 下面这个还需要考虑
    await PBoard.update_by_id(board_id, 'board_content', form.board_content)
    response.redirect('/photo/type')
})

main.post('/type/ceil/api/update', admin_check, async (request, response) => {
    const ceil_id = request.body.ceil_id || -1
    const form = request.body
    await PBoardCeil.update_by_id(ceil_id, 'pboard_ceil_content', form.pboard_ceil_content)
    response.send({
        ok: 1
    })
})





// admin route
main.get('/admin', user_check, async (request, response) => {
    const pboards_main = await PBoard.all()
    const pboards = await PBoardCeil.all()



    const pboard_type = request.query.tab || 'all'
    if (pboard_type == 'all') {
        var photos = await Photo.all()
        var actives = 'actives'
    } else {
        var board =  await PBoard.find_by('board_content', pboard_type)
        var type_id = board._id
        var photos = await Photo.find_all('type_id', type_id)
        var actives = ''

    }
    // var photos_reverse = photos.reverse()
    var photos_reverse_set = await make_set_photo(photos.reverse())




    const group_id = Number(request.query.group_id) || 0
    const p_number = 10


    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, photos_reverse_set, p_number)

    const args = {
        photos: lista_set,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,


        pboards,
        pboards_main,
        actives,
        pboard_type,
        // photos,
    }
    // response.render('photo/admin_markdown.html', args)
    response.send(args)
})



// 单图片上传
main.post('/api/upload', upload.single('file'), async (request, response) => {
    const user = current_user(request)
    const type_id = request.body.type_id

    // log('request.filexxx.filename', request.file.filename)
    const photo = await Photo.find_by_id(type_id)
    photo.cover_path = request.file.filename
    photo.save()
    const photo_path = {
        path: photo.cover_path,
    }

    response.send(JSON.stringify(photo_path))
})




// 多图片上传 demo
main.post('/api/addpics', upload.array('file', 100), async (request, response) => {
    const multi_files = request.files
    const lista = []
    multi_files.forEach((e) => {
        // log('filename:', e.filename)
        lista.push(e.filename)
    })



    // const photo_id = request.body.photo_id
    // const photo = await Photo.find_by_id(photo_id)
    // photo.pic_list = photo.pic_list.concat(lista)
    // photo.save()
    const photo_path = {
        path_list: lista,
    }
    //
    response.send(JSON.stringify(photo_path))
})


// 编辑中新增图片
main.post('/api/addpics/add', upload.array('file', 100), async (request, response) => {
    const multi_files = request.files
    const lista = []
    multi_files.forEach((e) => {
        // log('filename:', e.filename)
        lista.push(e.filename)
    })



    const photo_id = request.body.photo_id
    const photo = await Photo.find_by_id(photo_id)
    photo.pic_list = photo.pic_list.concat(lista)
    photo.save()
    const photo_path = {
        path_list: lista,
    }
    //
    response.send(JSON.stringify(photo_path))
})


// 在内容中插入图片 单张
//
// main.post('/api/addpic', upload.single('file'), async (request, response) => {
//     const user = current_user(request)
//     const filename = request.file.filename
//     // log('api addpic ! ', filename)
//     const photo_path = {
//         path: filename,
//     }
//
//     response.send(JSON.stringify(photo_path))
// })

//cover

main.get('/cover/:path', (request, response) => {
    const user = current_user(request)

    const photo_path = request.params.path || '/'

    const paths = require('path')
    // const p = file_path_photo + photo_path
    const p = file_path_shoes + photo_path

    const absolutePath = paths.resolve(p)

    // log('absolutePath:', absolutePath)
    response.sendFile(absolutePath)
})

main.get('/shoes/:path', (request, response) => {
    const user = current_user(request)

    const photo_path = request.params.path || '/'

    const paths = require('path')
    const p = file_path_shoes + photo_path
    const absolutePath = paths.resolve(p)
    // log('absolutePath:', absolutePath)
    response.sendFile(absolutePath)
})

const new_crawl = async (lista, type='') => {
    let board = ''
    if (type == '') {
        const pboards_ceil = await PBoardCeil.all()
        board = pboards_ceil[0]._id || ''
    } else {
        board = type
    }
    for (let e of lista) {
        const photo = {
            photo_title: e.photo_title,
            photo_info: e.photo_info,
            cover_path: e.cover_path_parse[0],
            // cover_path: e.pic_list.slice(-1)[0],
            pic_list: e.pic_list,
            type_id: board,
            spt_time: e.spt_time,

        }
        await Photo.new(photo)
    }
}


const get_url = (status, url) => {
    const urls = get_urls(status, url)
    return urls
}

main.get('/crawl', (request, response) => {
    const status = request.query.status
    const url = request.query.url
    const type = request.query.photo_type || ''

    const crawl_url = get_url(status, url)
    save_crawl(crawl_url)


    const p = crawl_path + `photo.txt`
    const paths = path.resolve(p)
    const datas = fs.readFileSync(paths)
    const photos = JSON.parse(datas)
    new_crawl(photos, type)
    log('爬取信息成功')
    const args = {
        ok: 1
    }
    response.send(args)

})

// const paths = `${crawl_path}crawl.txt`
// log('paths:', paths)
//
//
//
// const absolutePath = path.resolve(p)



main.get('/detail/:photo_id', async (request, response) => {
    const photo_id = request.params.photo_id || ''
    const photo = await Photo.find_by_id(photo_id)
    const args = {
        photo: photo,
    }
    // response.render('photo/detail.html', args)
    // response.render('photo/detail_new.html', args)
    response.send(args)
})



main.post('/api/add', user_check, async (request, response) => {
    const form = request.body
    const d = new Date()
    const c_time = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    form.spt_time = c_time
    const photo = await Photo.new(form)
    response.send(JSON.stringify(photo))
})



main.get('/edit', user_check, async (request, response) => {
    const username = current_user(request)
    const hotspot_id = request.query.hotspot_id
    const photo = await Photo.find_by_id(hotspot_id)
    const pboards = await PBoardCeil.all()
    const args = {
        photo,
        pboards,
    }

    // response.render('photo/edit_photo.html', args)
    response.send(args)

})


main.post('/update', user_check, async (request, response) => {
    const form = request.body
    const photo_title = form.photo_title || ''
    const photo_content = form.photo_content || ''
    const type_id = form.type_id || -1
    const type_new_id = form.type_new || -1

    // log('被修改的：', hotspot_title, hotspot_content)
    const photo = await Photo.find_by_id(form.type_id)
    photo.photo_title = photo_title
    photo.photo_content = photo_content
    photo.type_id = type_new_id
    photo.save()
    response.send(JSON.stringify(photo))
})


main.post('/api/update', user_check, async (request, response) => {
    const form = request.body
    const photo_title = form.photo_title || ''
    const photo_content = form.photo_content || ''
    const photo_info = form.photo_info || ''
    const type_id = form.type_id || -1
    const type_new_id = form.type_new || -1
    // log('api update !', photo_title, photo_content, type_id, type_new_id)

    // log('被修改的：', hotspot_title, hotspot_content)
    const photo = await Photo.find_by_id(form.type_id)
    photo.photo_title = photo_title
    photo.photo_content = photo_content
    photo.type_id = type_new_id
    photo.photo_info = photo_info
    photo.save()
    const args = {
        photo,
    }
    // response.redirect('/photo/admin')
    response.send(args)

})

main.get('/api/delete', admin_check, async (request, response) => {
    const photo_id = request.query.photo_id
    const photo = Photo.delete_by_id(photo_id)
    response.send(JSON.stringify(photo))

})

main.get('/api/photo/delete', admin_check, async (request, response) => {
    const photo_id = request.query.photo_id
    const delete_index = request.query.delete_index
    const photo = await Photo.find_by_id(photo_id)
    photo.pic_list.splice(delete_index, 1)
    photo.save()
    response.send(JSON.stringify(photo))

})

main.post('/api/photo/add', admin_check, async (request, response) => {
    const photo_id = request.body.photo_id
    const add_list = request.body.add_list
    const photo = await Photo.find_by_id(photo_id)
    photo.pic_list = photo.pic_list.concat(add_list)
    photo.save()
    response.send(JSON.stringify(photo))

})

module.exports = {
    photo: main,
}
