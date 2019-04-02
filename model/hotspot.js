// const fs = require('fs')
// const {Model} = require('./main')
// const path = require('path')
// const {
//     log,
//     encryption,
//     salt,
// } = require('../utils')
//
// class Board extends Model {
//     constructor(form) {
//         super()
//         this.id = form.id || -1
//         this.board_content = form.board_content || ''
//     }
//
//
// }
//
//
// module.exports = {
//     Board: Board,
// }

// module.exports = User

// 下面是 mongoose 的配置

const fs = require('fs')
const {mongoose, Model} = require('./main')
const path = require('path')

const Schema = mongoose.Schema

const hotspotSchema = new Schema({
    hotspot_type: {
        type: Number,
        default: 0,
    //    1 表示热门资讯
    },
    hotspot_title: {
        type: String,
        default: '',
    },
    hotspot_content: {
        type: String,
        default: '',
    },
    markdown_content: {
        type: String,
        default: '',
    },
    created_time: {
        type: Number,
        default: Date.now(),
    },
    updated_time: {
        type: Number,
        default: Date.now(),
    },
    spt_time: {
        type: String,
        default: '',
    },
    views: {
        type: Number,
        default: 0,
    },
    path: {
        type: String,
        default: '/',
    },
})


class HotspotStore extends Model {
}



hotspotSchema.loadClass(HotspotStore)
const Hotspot = mongoose.model('Hotspot', hotspotSchema)

module.exports = {
    Hotspot: Hotspot,
}


