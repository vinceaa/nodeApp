var request = require('sync-request')
var cheerio = require('cheerio')
const fs = require('fs')
const paths = require('path')

//
// const {
//     urls
// } = require('./url')

// const log = console.log.bind()

const {
    crawl_path,
    file_path_shoes,
    log,
} = require('../utils')

class Photo {
    constructor(form={}) {
        this.pic_url_list = form.pic_url_list || []
        this.pic_list = form.pic_list || []
        this.photo_title = form.photo_title || ''
        this.photo_info = form.photo_info || ''
        this.cover_path = form.cover_path || ''
        this.cover_path_parse = form.cover_path_parse || ''
        this.spt_time = form.spt_time || ''


    }
}


const if_cache = (url) => {
    const file_name = url.split('/').slice(-1)[0].split('?')[0]
    const p = `${crawl_path}` + `cache_html/${file_name}.html`
    const path = paths.resolve(p)
    const exist = fs.existsSync(path)
    return [exist, path]
}


const get_html = (url) => {
    const [exist, path] = if_cache(url)
    if (exist == true) {
        log('已经存在, 直接读')
        html = fs.readFileSync(path)


    } else {
        log('还不存在, 先写入在读')
        const r = request('GET', url)
        html = r.getBody('utf-8')
        fs.writeFileSync(path, html)
    }

    return html
}


const save_json = (lista) => {
    const p = `${crawl_path}` + `./photo.txt`
    const path = paths.resolve(p)
    const data = JSON.stringify(lista, null, 2)
    fs.writeFileSync(path, data)
}


const get_pic_list = (ceils) => {
    const pic_list = []
    for (let i = 0; i < ceils.length; i++) {
        const e = cheerio.load(ceils[i])
        const img_path = `http://` + e('.image__imagewrap').find('img').attr('data-src').slice(2)
        pic_list.push(img_path)
    }
    return pic_list

}

const get_time = (ceils) => {
    const e = cheerio.load(ceils[0])
    const time =  e('.image__decwrap').find('time').text()
    return time
}





const make_pic_list = (e) => {
    const list = e('.showalbum__parent')
    const ceils = list.find('.image__main')
    const lista = get_pic_list(ceils)
    const time = get_time(ceils)
    return [lista, time]
}


const make_pic_info = (e) => {
    const list = e('.showalbumheader__gallerydec')
    const title = list.find('h2').find('.showalbumheader__gallerytitle').text()
    const info = list.find('.htmlwrap__main').text()
    // log('cover src', `http://` + e('.showalbumheader__gallerycover').find('img').attr('src'))
    const cover = `http://` + e('.showalbumheader__gallerycover').find('img').attr('src').slice(2)


    // const lista = get_pic_list(ceils)
    // return lista
    return [title, info, cover]
}


const parse_pic = (lista) => {
    const new_lista = lista.map(e => {
        return e.split('/').slice(-2, -1)[0] + '.jpg'
    })

    return new_lista
}



const get_dom = (url) => {
    const lista = []
    const html = get_html(url)
    const e = cheerio.load(html)
    const [new_pic_list, time] = make_pic_list(e)
    const [title, info, cover] = make_pic_info(e)

    const dicta = {
        pic_url_list: new_pic_list,
        pic_list: parse_pic(new_pic_list),
        photo_title: title,
        photo_info: info,
        cover_path: cover,
        cover_path_parse: parse_pic([cover]),
        spt_time: time,

    }
    const ins = new Photo(dicta)
    lista.push(ins)
    return lista
}



const download_pic_assist = (pic_list) => {
    for (let e of pic_list) {
        const file_name = e.split('/').slice(-2, -1)[0]
        // var path = './photos/' + file_name + '.jpg'
        const p = `${file_path_shoes}` + file_name + '.jpg'
        const path = paths.resolve(p)
        //
        var request = require('request')
        request(e).pipe(fs.createWriteStream(path))
    }
}


const download_pic = (lista) => {
    for (let e of lista) {
        const pic_list = e.pic_url_list
        download_pic_assist(pic_list)
        download_pic_assist([e.cover_path])
    }
}



const save_crawl  = (urls) => {
    let lista = []
    let url = ''
    // url = `http://x.yupoo.com/photos/aj-dongli/albums/15378421?uid=1&tab=max`
    for (let url of urls) {
        const ceil = get_dom(url)
        lista = [...lista, ...ceil]
    }
    save_json(lista)
    download_pic(lista)
}





module.exports = {
    save_crawl,
}