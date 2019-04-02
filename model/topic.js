// const fs = require('fs')
// const {Model} = require('./main')
// const path = require('path')
// const {
//     log,
//     encryption,
//     salt,
// } = require('../utils')
//
// const {User} = require('./user')
// const {Reply} = require('./reply')
// const {Board} = require('./board')
//
// class Topic extends Model {
//     constructor(form) {
//         super()
//         this.id = form.id || -1
//         this.topic_content = form.topic_content || ''
//         this.topic_title = form.topic_title || ''
//         // this.board_content = form.board_content || ''
//         this.board_id = Number(form.board_id || '')
//         this.author_id = form.author_id || ''
//         this.created_time = form.created_time || ''
//         this.updated_time = this.created_time
//         this.spt_time = form.spt_time || ''
//         this.views = form.views || 0
//
//     }
//
//     get_author() {
//         const self = this
//         const cls = this.constructor
//         const author_id = self.author_id
//         const author = User.find_by_id(author_id)
//         return author
//     }
//
//     get_board() {
//         const cls = this.constructor
//         const self = this
//         const board_id = self.board_id
//         const board = Board.find_by_id(board_id)
//         return board
//
//     }
//
//     get_reply_number() {
//         const cls = this.constructor
//         const self = this
//         const topic_id = self.id
//         // log('topic_id:', Reply)
//         const replys_ins = Reply.find_all('topic_id', topic_id)
//         // log('replys_ins:', replys_ins)
//         if (replys_ins == undefined) {
//             return 0
//         } else {
//             return replys_ins.length
//         }
//     }
//
//
// }
//
//
// module.exports = {
//     Topic: Topic,
// }
//
// // module.exports = User


// 下面是 mongoose 的配置



const fs = require('fs')
const {mongoose, Model} = require('./main')
const path = require('path')
const {
    log,
    encryption,
    salt,
} = require('../utils')

const {User} = require('./user')
const {Reply} = require('./reply')
const {Board} = require('./board')


const Schema = mongoose.Schema


const topicSchema = new Schema({
    topic_content: {
        type: String,
        default: '',
    },
    topic_title: {
        type: String,
        default: '',
    },
    board_id: {
        type: String,
    },
    author_id: {
        type: String,
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
})


class TopicStore extends Model {

    async get_author() {
        const self = this
        const cls = this.constructor
        const author_id = self.author_id
        const author = await User.find_by_id(author_id)
        return author
    }

    async get_board() {
        const cls = this.constructor
        const self = this
        const board_id = self.board_id
        const board = await Board.find_by_id(board_id)
        return board

    }

    async get_reply_number() {
        const cls = this.constructor
        const self = this
        const topic_id = self.id
        // log('topic_id:', Reply)
        const replys_ins = await Reply.find_all('topic_id', topic_id)
        // log('replys_ins:', replys_ins)
        if (replys_ins == undefined) {
            return 0
        } else {
            return replys_ins.length
        }
    }

}



topicSchema.loadClass(TopicStore)
const Topic = mongoose.model('Topic', topicSchema)


module.exports = {
    Topic: Topic,
}