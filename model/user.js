// const fs = require('fs')
// const {Model} = require('./main')
// const path = require('path')
// const {
//     log,
//     encryption,
//     salt,
// } = require('../utils')
//
// class User extends Model {
//     constructor(form) {
//         super()
//         this.id = form.id || -1
//         this.username = form.username || ''
//         this.password = form.password || ''
//         this.path = form.path || '/'
//     }
//
//     static register_check(form) {
//         const cls = this
//         const finda = cls.find_by('username', form.username)
//         return finda === undefined && form.username.length > 2 && form.password.length > 2
//     }
//
//
//     static login_check(form) {
//         const cls = this
//         const finda = cls.find_by('username', form.username)
//         if (finda == undefined) {
//             return false
//         } else {
//             return finda.password == encryption(salt, form.password)
//         }
//     }
//
// }
//
//
// module.exports = {
//     User: User,
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


const Schema = mongoose.Schema

const userSchema = new Schema({
    username: String,
    password: String,
    path: {
        type: String,
        default: 'u1.png',
    },
})

class UserStore extends Model {
    static async register_check(form) {
        const cls = this
        const finda = await cls.find_by('username', form.username)
        // log('finda:', finda)
        // log('username and length:', form.username,form.username.length)
        return finda == null && form.username.length > 2 && form.password.length > 2
    }

    static async register_rename(form) {
        const cls = this
        const finda = await cls.find_by('username', form.username)
        return finda === null
    }


    static async login_check(form) {
        const cls = this
        const finda = await cls.find_by('username', form.username)
        if (finda == undefined) {
            return false
        } else {
            return finda.password == encryption(salt, form.password)
        }
    }



    static guest() {
        // 这样设置 _id 生成的实例就不会带有 _id 了
        const o = {
            _id: 0,
            role: -1,
            username: '游客',
        }
        const u = new User(o)
        return u
    }
}

// mongoose 里面使用 class 形式的 model 的套路
userSchema.loadClass(UserStore)
const User = mongoose.model('User', userSchema)

module.exports = {
    User: User,
}


