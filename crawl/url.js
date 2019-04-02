var request = require('sync-request')
var cheerio = require('cheerio')
const fs = require('fs')
const paths = require('path')


// const log = console.log.bind()

const {
    crawl_path,
    log,
} = require('../utils')

class Movie {
    constructor(form={}) {
        this.num = form.num || ''
        this.name = form.name || ''
        this.quote = form.quote || ''
        this.cover = form.cover || ''
        this.point = form.point || ''
        this.people = form.people || ''
    }
}

// http://x.yupoo.com/photos/aj-dongli/collections/717394
//http://x.yupoo.com/photos/aj-dongli/albums?tab=gallery&page=2

const if_cache = (url) => {
    let file_name = ''
    if (url.includes('collections')) {
        file_name = url.split('/').slice(-1)[0]
    } else {
        file_name = url.split('=').slice(-1)[0]
    }
    // const path = `./crawl/cache_html_url/${file_name}.html`
    const p = `${crawl_path}` + `cache_html_url/${file_name}.html`
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
    const path = `./movie.txt`
    const data = JSON.stringify(lista, null, 2)
    fs.writeFileSync(path, data)
}


const get_data = (ceils) => {
    const lista = []
    for (let i = 0; i < ceils.length; i++) {
        const e = cheerio.load(ceils[i])
        const href = `http://x.yupoo.com/` + e('.album__main').attr('href').slice(1)
        lista.push(href)
    }
    return lista
}


const get_dom = (url) => {
    const html = get_html(url)
    const e = cheerio.load(html)
    const list = e('.showindex__parent')
    const ceils = list.find('.showindex__children')
    const lista = get_data(ceils)
    return lista
}





const get_urls  = (status, n=1) => {
    let lista = []
    let url = ''

    if (status == 0) {
        // log(`读前 ${n} 页`)
        for (let i = 1; i < n + 1; i++) {
            const url = `http://x.yupoo.com/photos/aj-dongli/albums?tab=gallery&page=${i}`
            const ceil = get_dom(url)
            lista = [...lista, ...ceil]
        }
    } else if (status == 1) {
        // log(`读第 ${n} 页`)
        const url = `http://x.yupoo.com/photos/aj-dongli/albums?tab=gallery&page=${n}`
        const ceil = get_dom(url)
        lista = [...lista, ...ceil]
    } else if (status == 3) {
        // http://x.yupoo.com/photos/aj-dongli/collections/717394
        // log(`读第指定分类链接`)
        const url = n
        const ceil = get_dom(url)
        lista = [...lista, ...ceil]
    } else {
        lista = [n]
    }

    return lista
}

module.exports = {
    get_urls,
}