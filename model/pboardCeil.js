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

const {PBoard} = require('./pboard')


const Schema = mongoose.Schema

const pboard_ceil_Schema = new Schema({
    pboard_ceil_content: {
        required: true,
        type: String,
        default: '',
    },
    pboard_id: {
        required: true,
        type: String,
    },
    pboard: {
        // type: Schema.ObjectId,
        type: Schema.Types.ObjectId,
        ref: 'PBoard',
    }
})


class Pboard_ceil_Store extends Model {
}



pboard_ceil_Schema.loadClass(Pboard_ceil_Store)
const PBoardCeil = mongoose.model('PBoardCeil', pboard_ceil_Schema)

module.exports = {
    PBoardCeil: PBoardCeil,
}


