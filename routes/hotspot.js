
const express = require('express')
const multer = require('multer')



const {
    log,
    current_time_specific,
    file_path_hotspot,
    grouping,
    list_n,
    group_wrap,

} = require('../utils')

const {User} = require('../model/user')
const {Hotspot} = require('../model/hotspot')

const upload = multer({
    dest: file_path_hotspot,
})



const main = express.Router()


const {
    current_user,
    user_check,
} = require('./index')


main.get('/', async (request, response) => {
    const group_id = Number(request.query.group_id) || 0
    log('group_id:', group_id)

    const username = current_user(request)
    const hotspots = await Hotspot.all()
    const hotspots_reverse = hotspots.reverse()

    const hotspots_hot = await Hotspot.find_all('hotspot_type', 1)
    const hotspots_hot_reverse = hotspots_hot.reverse()

    const p_number = 10

    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, hotspots_reverse, p_number)


    const args = {
        hotspots: lista_set,
        hotspots_hot: hotspots_hot_reverse,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
        username,
    }


    // response.render('hotspot/hotspots.html', args)
    // response.render('hotspot/hotspot.html', args)
    // response.render('hotspot/hotspots1.html', args)
    response.send(args)
})


main.get('/detail/:hotspot_id', async (request, response) => {
    const username = current_user(request)
    const hotspot_id = request.params.hotspot_id || ''
    const hotspot = await Hotspot.find_by_id(hotspot_id)
    const args = {
        hotspot: hotspot,
    }
    // response.render('hotspot/detail.html', args)
    response.send(args)
})

main.get('/admin', user_check, async (request, response) => {
    const username = current_user(request)
    const all = await Hotspot.all()
    const normal = await Hotspot.find_all('hotspot_type', 0)
    const hot = await Hotspot.find_all('hotspot_type', 1)



    const hotspot_type = request.query.tab || 'all'
    var type = {
        all,
        normal,
        hot,
    }
    const hotspots = type[hotspot_type]


    const hotspots_reverse = hotspots.reverse()

    const group_id = Number(request.query.group_id) || 0
    const p_number = 10
    const [
        lista_set,
        page_number,
        pre_id,
        next_id,
    ] = group_wrap(group_id, hotspots_reverse, p_number)

    const args = {
        hotspots: lista_set,
        group_id: group_id,
        page_number: page_number,
        pre_id: pre_id,
        next_id: next_id,
        current_type: hotspot_type,

    }

    // response.render('hotspot/admin_markdown.html', args)
    response.send(args)
})

//
// main.get('/:hotspot_path', user_check, (request, response) => {
//     const username = current_user(request)
//     const args = {
//         username: username,
//     }
//     response.render('hotspot/admin.html', args)
// })


main.post('/upload', upload.single('file'), async (request, response) => {
    const user = current_user(request)
    const hotspot_id = request.body.hotspot_id
    const hotspot = await Hotspot.find_by_id(hotspot_id)
    // log('request.file.filename', request.file.filename)
    hotspot.path = request.file.filename
    hotspot.save()

    response.redirect(`/hotspot/edit?hotspot_id=${hotspot_id}`)
})


// 单图片上传
main.post('/api/upload', upload.single('file'), async (request, response) => {
    const user = current_user(request)
    const hotspot_id = request.body.hotspot_id
    // log('hotspot_id：', hotspot_id)

    // log('request.filexxx.filename', request.file.filename)
    const hotspot = await Hotspot.find_by_id(hotspot_id)
    hotspot.path = request.file.filename
    hotspot.save()
    const hotspot_path = {
        path: hotspot.path,
    }

    response.send(JSON.stringify(hotspot_path))
})




// 多图片上传 demo
// main.post('/api/upload', upload.array('file', 3), async (request, response) => {
//     const user = current_user(request)
//     const hotspot_id = request.body.hotspot_id
//     const multi_files = request.files
//     multi_files.forEach((e) => {
//         log('filename:', e.filename)
//     })
//     log('request.files', request.files)
//     const hotspot = await Hotspot.find_by_id(hotspot_id)
//     // hotspot.path = request.file.filename
//     // hotspot.save()
//     // const hotspot_path = {
//     //     path: hotspot.path,
//     // }
//     //
//     // response.send(JSON.stringify(hotspot_path))
// })


// 在内容中插入图片

main.post('/api/addpic', upload.single('file'), async (request, response) => {
    const user = current_user(request)
    const filename = request.file.filename
    log('api addpic ! ', filename)
    const hotspot_path = {
        path: filename,
    }

    response.send(JSON.stringify(hotspot_path))
})

//cover

main.get('/cover/:path', (request, response) => {
    const user = current_user(request)

    const hotspot_path = request.params.path || '/'

    const paths = require('path')
    const p = file_path_hotspot + hotspot_path
    const absolutePath = paths.resolve(p)
    // log('absolutePath:', absolutePath)
    response.sendFile(absolutePath)
})



main.post('/add', user_check, async (request, response) => {
    const username = current_user(request)
    const form = request.body
    const hotspot_title = form.hotspot_title || ''
    const hotspot_content = form.hotspot_content || ''
    const hotspot_type = Number(form.hotspot_type) || 0
    form.spt_time = current_time_specific()
    Hotspot.new(form)
    const args = {
        username: username,
    }
    response.redirect('/hotspot/admin')
})


main.post('/api/add', user_check, async (request, response) => {
    // log('api hotspot add!')
    const username = current_user(request)
    const form = request.body
    // log('form:', form)

    // 多余的部分
    // const hotspot_title = form.hotspot_title || ''
    // const hotspot_content = form.hotspot_content || ''
    // const markdown_content = form.markdown_content || ''
    // const hotspot_type = Number(form.hotspot_type) || 0


    form.spt_time = current_time_specific()
    const hotspot = await Hotspot.new(form)
    // response.redirect('/hotspot/admin')
    response.send(JSON.stringify(hotspot))
})


main.post('/api/addpics', upload.array('file', 3), async (request, response) => {
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
})


main.get('/edit', user_check, async (request, response) => {
    const username = current_user(request)
    const hotspot_id = request.query.hotspot_id
    const hotspot = await Hotspot.find_by_id(hotspot_id)
    const args = {
        hotspot: hotspot,
    }
    // response.render('hotspot/edit.html', args)
    response.send(args)
})


// main.post('/update', user_check, async (request, response) => {
//     const username = current_user(request)
//     const form = request.body
//     const hotspot_title = form.hotspot_title || ''
//     const hotspot_content = form.hotspot_content || ''
//     const hotspot_id = form.hotspot_id || -1
//     const hotspot_type = form.hotspot_type || 0
//     // log('被修改的：', hotspot_title, hotspot_content)
//     const hotspot = await Hotspot.find_by_id(form.hotspot_id)
//     hotspot.hotspot_title = hotspot_title
//     hotspot.hotspot_content = hotspot_content
//     hotspot.hotspot_type = hotspot_type
//     hotspot.save()
//     response.redirect('/hotspot/admin')
// })


main.post('/api/update', user_check, async (request, response) => {
    const username = current_user(request)
    const form = request.body
    const hotspot_title = form.hotspot_title || ''
    const hotspot_content = form.hotspot_content || ''
    const markdown_content = form.markdown_content || ''
    const hotspot_id = form.hotspot_id || -1
    const hotspot_type = form.hotspot_type || 0
    // log('被修改的：', hotspot_title, hotspot_content)
    const hotspot = await Hotspot.find_by_id(form.hotspot_id)
    hotspot.hotspot_title = hotspot_title
    hotspot.hotspot_content = hotspot_content
    hotspot.markdown_content = markdown_content
    hotspot.hotspot_type = hotspot_type
    hotspot.save()
    // response.redirect('/hotspot/admin')
    response.send(JSON.stringify(hotspot))
})



// main.get('/delete', user_check, async (request, response) => {
//     const username = current_user(request)
//     const hotspot_id = request.query.hotspot_id
//     Hotspot.delete_by_id(hotspot_id)
//     response.redirect('/hotspot/admin')
//
// })


main.get('/api/delete', user_check, async (request, response) => {
    const username = current_user(request)
    const hotspot_id = request.query.hotspot_id
    const hotspot = Hotspot.delete_by_id(hotspot_id)
    const hotspots = Hotspot.all()
    response.send(hotspots)

})


module.exports = {
    hotspot: main,
    current_user,
    user_check,
}
