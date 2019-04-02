// const fs = require('fs')
// const {Model} = require('./main')
// const path = require('path')
// const {
//     log,
//     encryption,
//     salt,
//     time_pass,
//     current_time,
// } = require('../utils')
//
// const {User} = require('./user')
//
// class Reply extends Model {
//     constructor(form) {
//         super()
//         this.id = form.id || -1
//         this.reply_content = form.reply_content || ''
//         this.author_id = Number(form.author_id || -1)
//         this.topic_id = Number(form.topic_id || -1)
//         this.replyer_id = Number(form.replyer_id || -1)
//         this.created_time = form.created_time || ''
//         this.updated_time = this.created_time
//     }
//
//     get_replyer() {
//         const self = this
//         const cls = this.constructor
//         const replyer_id = self.replyer_id
//         const replyer = User.find_by_id(replyer_id)
//         return replyer
//     }
// }
//
//
// module.exports = {
//     Reply: Reply,
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
    time_pass,
    current_time,
    add_like,
} = require('../utils')

const {User} = require('./user')

const Schema = mongoose.Schema



const replySchema = new Schema({
    reply_content: {
        type: String,
        default: '',
    },
    author_id: {
        type: String,
    },
    topic_id: {
        type: String,
    },
    reply_id: {
        type: String,
    },
    replyer_id: {
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
    like_list: {
        type: Array,
        default: [],
    },
    dislike_list: {
        type: Array,
        default: [],
    },

})


class SubReplyStore extends Model {
    async get_replyer() {
        const self = this
        const cls = this.constructor
        const replyer_id = self.replyer_id
        const replyer = await User.find_by_id(replyer_id)
        return replyer
    }

    static async update_iflike(topic_id, reply_id, status, user_id) {
        const get_reply = await Reply.find_by_id(reply_id)
        const test = add_like(get_reply, status, user_id)
        get_reply.like_list = test[0]
        get_reply.dislike_list = test[1]
        const u1 = await Reply.update_by_id(reply_id, 'like_list', test[0])
        const u2= await Reply.update_by_id(reply_id, 'dislike_list', test[1])
        const replys = await Reply.find_all('topic_id', topic_id)
        return replys

    }
}


replySchema.loadClass(SubReplyStore)
const SubReply = mongoose.model('SubReply', replySchema)


module.exports = {
    SubReply: SubReply,
}