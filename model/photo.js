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
const {PBoard} = require('./pboard')

const path = require('path')

const Schema = mongoose.Schema

const photoSchema = new Schema({
    photo_title: {
        type: String,
        default: '',
    },
    photo_content: {
        type: String,
        default: '',
    },
    photo_info: {
        type: String,
        default: '',
    },
    type_id: {
        type: String,
    },
    cover_path: {
        type: String,
        default: '/',

    },
    pic_list: {
        type: Array,
        default: [],
    },
    spt_time: {
        type: String,
        default: '',
    },

})


class PhotoStore extends Model {
    async get_board() {
        const self = this
        const pboard_id = self.type_id
        const pboard = await PBoard.find_by_id(pboard_id)
        return pboard
    }
}



photoSchema.loadClass(PhotoStore)
const Photo = mongoose.model('Photo', photoSchema)

module.exports = {
    Photo: Photo,
}


