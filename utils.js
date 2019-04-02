const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const salt = '2018vinheheh'

const get_time = () => {
    const d = new Date()
    return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}


// const log = (...args) => {
//     const content = args
//     const paths = path.join(__dirname, '.', 'vin.log.txt')
//     content.forEach((e) => {
//         fs.appendFile(paths, `${JSON.stringify(e)}`, (infor) => {})
//     })
// }

const log = console.log.bind(console)

// const log = (...args) => {
//     const log_path = path.resolve('./vin.log.txt')
//     const options = {
//         flags: 'a',
//     }
//     const r = fs.createWriteStream(log_path, options)
//     const ins =  new console.Console(r)
//     const t = get_time()
//     ins.log(t, ...args)
// }


const encryption = (salt, password) => {
    const sha256 = crypto.createHash('sha256')
    sha256.update(salt + password)
    const new_password = sha256.digest('hex')
    return new_password
}


const current_time = () => {
    return Math.round(new Date().getTime()/1000)
}

const current_time_specific = () => {
    const d = new Date()
    return d.toLocaleString()
}

const time_pass = (start, end) => {
    const flow = end - start
    const t = 60
    if (flow < t && flow >= 0) {
        return `${Math.floor(flow)}秒前`
    } else if (flow < t * 60) {
        return `${Math.floor(flow/60)}分钟前`
    } else if (flow < t * 60 * 24) {
        return `${Math.floor(flow/60/60)}小时前`
    } else if (flow < t * 60 * 60 * 24) {
        return `${Math.floor(flow/60/60/24)}天前`
    } else {
        return `${Math.floor(flow/60/60/24/365)}年前`
    }
}


const remove_repeat = (lista) => {
    const set_lista = []
    lista.forEach((e) => {
        if (set_lista.includes(e.topic_id) == false) {
            return set_lista.push(e.topic_id)
        }
    })
    return set_lista
}

const file_path = './path_list/upload_path/'
const file_path_hotspot = './path_list/hotspot_path/'
const file_path_photo = './path_list/photo_path/'
const file_path_topic = './path_list/topic_path/'
const file_path_shoes = './path_list/shoes_path/'
const crawl_path = './crawl/'

// [{topic+method}, {topic+method}, {topic+method}]
// 一组 topic 实例
const make_set = async (topics) => {
    const dict_lista = []
    for (let topic of topics) {
        const dicta = {}
        dicta.get_author = await topic.get_author()
        dicta.get_board = await topic.get_board()
        dicta.get_reply_number = await topic.get_reply_number()
        dicta.topic = topic
        dicta.pass_time = topic.pass_time(topic.updated_time, current_time())
        dict_lista.push(dicta)
    }
    return dict_lista
}


const make_set_photo = async (photos) => {
    const dict_lista = []
    for (let photo of photos) {
        const dicta = {}
        dicta.get_board = await photo.get_board()
        dicta.photo = photo
        dict_lista.push(dicta)
    }
    return dict_lista
}



// [{topic+method}, {topic+method}, {topic+method}] * n
// 包含多个 ‘一组 topic 实例’ 的数组
const make_sets = async (topic_list) => {
    const dict_lista = []
    for (let topics of topic_list) {
        const e = await make_set(topics)
        dict_lista.push(e)
    }
    return dict_lista

}



const make_set_reply = async (replys) => {
    const dict_lista = []
    for (let reply of replys) {
        const dicta = {}
        // log('reply:', reply)
        dicta.get_replyer = await reply.get_replyer()
        dicta.reply = reply
        dicta.pass_time = reply.pass_time(reply.created_time, current_time())

        dicta.get_sub_list = await reply.get_sub_list()

        dict_lista.push(dicta)
    }
    return dict_lista
}


const make_set_sublist = (sublist) => {
    // log('make_set_sublist', make_set_sublist)
    sublist.map((e) => {
        var dicta = {}
        dicta.sublist = e
        dicta.reply_content
    })

}

const list_n = (n) => {
    const lista = []
    for (var i = 0; i < n; i++) {
        lista.push(0)
    }
    return lista
}


const grouping = (lista, n) => {
    const pages = []
    const l = lista.length
    const page_number = Math.ceil(l / n)
    var p = 0
    for (var i = 0; i < page_number; i++) {
        const g_lista = lista.slice(p, p + n)
        pages.push(g_lista)
        p += n
    }
    return pages
}




// log('grouping:', grouping([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], 15))
//
// 6 pages -->

// 0           5    1, 2, 3, 4, 5,
// 1           5    1, 2, 3, 4, 5
// 2           5    1, 2, 3, 4, 5
// 3           5    1, 2, 3, 4, 5
// 4           5    2, 3, 4, 5, 6
// 5           5    3, 4, 5, 6, 7
// 6           5    4, 5, 6, 7, 8

const group_update = (group_id, page_number) => {
    const init_lista = [1, 2, 3, 4, 5]
    if (page_number <= 5) {
        var new_lista = init_lista.slice(0, page_number)
    } else {
        if (group_id < 3) {
            return init_lista
        } else {
            var new_lista = init_lista.map(e => e + group_id - 3)
            var last_element = new_lista.slice(-1)[0]
            if (page_number < last_element) {
                var pos = new_lista.indexOf(page_number)
                new_lista = new_lista.slice(0, pos + 1)
            }
        }

    }
    return new_lista
}


// const group_wrap = (query_id, lista, n) => {
//     var groups = grouping(lista, n)
//     var l = groups.length
//     var page_number = list_n(l)
//     var lista_set = groups[query_id]
//     var pre_id = (query_id - 1 + l) % l
//     var next_id = (query_id + 1 + l) % l
//     return [lista_set, page_number, pre_id, next_id]
// }


const group_wrap = (query_id, lista, n) => {
    var groups = grouping(lista, n)
    var l = groups.length
    // var page_number = list_n(l)
    var page_number = group_update(query_id + 1, l)
    var lista_set = groups[query_id]
    var pre_id = (query_id - 1 + l) % l
    var next_id = (query_id + 1 + l) % l
    return [lista_set, page_number, pre_id, next_id]
}


const add_like_assist = (lista1, lista2, user_id) => {
    const pos = lista1.indexOf(user_id)
    if (pos != -1) {
        lista1.splice(pos, 1)
    }
    // 这里会重复添加， 很奇怪
    // if (lista2.includes(user_id) === false) {
    //     lista2.push(user_id)
    // }
    const pos1 = lista2.indexOf(user_id)

    if (lista2.indexOf(user_id) == -1) {
        lista2.push(user_id)
    } else {
        lista2.splice(pos1, 1)
    }

}


const add_like = (get_reply, status, user_id) => {
    var [like_list, dislike_list] = [get_reply.like_list, get_reply.dislike_list]
    if (status == 1) {
        add_like_assist(dislike_list, like_list, user_id)
    } else {
        add_like_assist(like_list, dislike_list, user_id)

    }
    return [like_list, dislike_list]
}


const pre_lista = (lista, n) => {
    if (lista.length == 0) {
        log('lista 为空:', lista)
        return []
    } else {
        var total = []
        for (var i = 0; i < n + 1; i++) {
            total = total.concat(lista[i])
        }
        return total
    }
}



const table_concat = async (table, table_other, key) => {
    var status = 0
    if (Array.isArray(table) == false) {
        var table = [table]
        status = 1
    }
    const other_lista = []
    for (let e of table) {
        var new_dicta = {}
        const table_dicta = e._doc
        const other_finda = await table_other.find_by_id(e[key])
        // log('other_finda', other_finda)
        if (other_finda != null) {
            var other_dicta = other_finda._doc
        } else {
            var other_dicta = {}
        }
        new_dicta = Object.assign(new_dicta, other_dicta)
        new_dicta = Object.assign(new_dicta, table_dicta)
        other_lista.push(new_dicta)
    }

    if (status == 1) {
        return other_lista[0]
    } else {
        return other_lista
    }
}




module.exports = {
    log: log,
    encryption: encryption,
    salt,
    file_path,
    current_time,
    current_time_specific,
    time_pass,
    remove_repeat,
    make_set,
    make_set_reply,
    grouping,
    make_sets,
    list_n,
    file_path_hotspot,
    group_wrap,
    group_update,
    file_path_photo,
    make_set_photo,
    file_path_topic,
    file_path_shoes,
    crawl_path,
    add_like,
    make_set_sublist,
    pre_lista,
    table_concat,
}
