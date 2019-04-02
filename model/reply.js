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
const {SubReply} = require('../model/subReply')

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
    reply_to_list: {
        type: Array,
        default: [],
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

// const make_set_sublist = async (sublist) => {
//     const new_dicta = await sublist.map(async (e) => {
//         var dicta = {}
//         dicta.sublist = e
//         dicta.reply_content = e.reply_content
//         var replyer = await User.find_by_id(e.replyer_id)
//         dicta.replyerName = replyer.username
//         dicta.replyerPath = replyer.path
//         // log('dicta:', dicta)
//         return dicta
//     })
//     return new_dicta
//
// }

const make_set_sublist = async (sublist) => {
    // const new_dicta = await sublist.map(async (e) => {
    //     var dicta = {}
    //     dicta.sublist = e
    //     dicta.reply_content = e.reply_content
    //     var replyer = await User.find_by_id(e.replyer_id)
    //     dicta.replyerName = replyer.username
    //     dicta.replyerPath = replyer.path
    //     // log('dicta:', dicta)
    //     return dicta
    // })
    // return new_dicta

    const lista = []
    for (var i = 0; i < sublist.length; i++) {
        var e = sublist[i]
        var dicta = {}
        dicta.sublist = e
        dicta.reply_content = e.reply_content
        dicta.reply_id = e._id
        var replyer = await User.find_by_id(e.replyer_id)
        dicta.replyerName = replyer.username
        dicta.replyerId = replyer._id
        dicta.replyerPath = replyer.path
        dicta.like_list = e.like_list
        dicta.dislike_list = e.dislike_list
        dicta.pass_time = replyer.pass_time(e.created_time, current_time())

        lista.push(dicta)

    }
    return lista


}

class ReplyStore extends Model {
    async get_replyer() {
        const self = this
        const cls = this.constructor
        const replyer_id = self.replyer_id
        const replyer = await User.find_by_id(replyer_id)
        return replyer
    }

    async get_sub_list() {
        const self = this
        const cls = this.constructor
        const reply_id = self._id
        const sublist = await SubReply.find_all('reply_id', reply_id)
        const sublist_dicta = await make_set_sublist(sublist)
        // log('sublist_dicta:', sublist_dicta)
        return sublist_dicta
    }



    //  这里用 save 方式竟然会有延迟， 不知道为什么
    // static async update_iflike(topic_id, reply_id, status, user_id) {
    //     const get_reply = await Reply.find_by_id(reply_id)
    //     // log('save 之前 get_reply:', get_reply)
    //     const test = add_like(get_reply, status, user_id)
    //     get_reply.like_list = test[0]
    //     get_reply.dislike_list = test[1]
    //     get_reply.save()
    //     // log('save 之后 get_reply:', get_reply)
    //
    //     const replys = await Reply.find_all('topic_id', topic_id)
    //     log('update 里面的 replys ', replys)
    //     return replys
    //
    // }


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


    static async update_iflike_sub(topic_id, reply_id, status, user_id) {
        const get_reply = await SubReply.find_by_id(reply_id)
        const test = add_like(get_reply, status, user_id)
        get_reply.like_list = test[0]
        get_reply.dislike_list = test[1]
        const u1 = await SubReply.update_by_id(reply_id, 'like_list', test[0])
        const u2= await SubReply.update_by_id(reply_id, 'dislike_list', test[1])
        const replys = await Reply.find_all('topic_id', topic_id)
        return replys

    }
}


replySchema.loadClass(ReplyStore)
const Reply = mongoose.model('Reply', replySchema)


module.exports = {
    Reply: Reply,
}