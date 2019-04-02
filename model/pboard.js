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

const pboardSchema = new Schema({
    board_content: {
        type: String,
        default: '',
        required: true,

    },
})


class PBoardStore extends Model {
}



pboardSchema.loadClass(PBoardStore)
const PBoard = mongoose.model('PBoard', pboardSchema)

module.exports = {
    PBoard: PBoard,
}


