// const fs = require('fs')
// const path = require('path')
//
// const {
//     log,
//     current_time,
//     time_pass,
// } = require('../utils')
//
// const load = (path) => {
//     const options = {
//         encoding: 'utf8',
//     }
//     const data = fs.readFileSync(path, options)
//     return JSON.parse(data)
// }
//
//
// const save = (path, data) => {
//     const new_form = JSON.stringify(data, null, 2)
//     fs.writeFileSync(path, new_form)
// }
//
//
// class Model {
//
//     static all_data() {
//         const cls = this
//         const paths = cls.data_path()
//         const data = load(paths)
//         return data
//     }
//
//     // 生成 data
//     static new(form) {
//         const cls = this
//         const ins = new cls(form)
//         ins.save()
//         return ins
//     }
//
//     static data_path() {
//         const paths = `data/${this.name}.txt`
//         // 套路写法
//         const p = path.join(__dirname, '..', paths)
//         // log('p:', p)
//         return p
//     }
//
//
//     // 载入所有 data 实例
//     static all() {
//         const data = this.all_data()
//         const all_ins = data.map((e) => {
//             return new this(e)
//         })
//         return all_ins
//     }
//
//     save() {
//         const self = this
//         const cls = this.constructor
//         const paths = cls.data_path()
//         const all_ins = cls.all()
//
//         if (self.id === -1) {
//             if (all_ins.length === 0) {
//                 self.id = 1
//             } else {
//                 self.id = all_ins.slice(-1)[0].id + 1
//             }
//             all_ins.push(self)
//             save(paths, all_ins)
//         } else {
//             const new_ins = all_ins.map((e) => {
//                 if (e.id == self.id) {
//                     return self
//                 } else {
//                     return e
//                 }
//             })
//             save(paths, new_ins)
//         }
//     }
//
//
//     // 查询
//     static find_by(key, value) {
//         const cls = this
//         const all_ins = cls.all()
//         // log('value:', this.name, '-->', value)
//         const finda = all_ins.filter((e) => {
//             // log('e e[key] value', e, e[key], value)
//             // log('tf:', e[key] == value)
//             return e[key] == value
//         })
//         return finda[0]
//     }
//
//     static find_by_id(id) {
//         const cls = this
//         return cls.find_by('id', id)
//     }
//
//
//     static find_all(key, value) {
//         const cls = this
//         const all_ins = cls.all()
//         const finda = all_ins.filter((e) => {
//             return e[key] === value
//         })
//         return finda
//     }
//
//     // 更新 data, 也可以通过 ins.save() 来更新
//     static update_by_id(id, key, value) {
//         const cls = this
//         const ins = cls.find_by_id(id)
//         // log('ins:', ins)
//         if (ins !== undefined) {
//             // log('ins[key]:', ins[key])
//             ins[key] = value
//             ins.save()
//         }
//     }
//
//     // petrichor
//     // 删除 data
//     static delete_by_id(id) {
//         // log('删除进行')
//         const cls = this
//         const all_ins = cls.all()
//         const paths = cls.data_path()
//         const new_ins = all_ins.filter((ins) => {
//             if (ins.id != id) {
//                 // log('ins /ins.id /id:', ins, ins.id, id)
//                 // log('tf:', ins.id != id)
//                 return ins
//             }
//         })
//         // log('new_ins:', new_ins)
//         save(paths, new_ins)
//     }
//
//     pass_time(start, end) {
//         return time_pass(start, end)
//     }
// }
//
// module.exports = {
//     Model: Model
// }


// 下面是 mongoose 的配置

const fs = require('fs')
const path = require('path')

const {
    log,
    current_time,
    time_pass,
} = require('../utils')

const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/node14'

// mongoose 内置的 promise 废弃了, 要这样单独设置
mongoose.Promise = global.Promise

mongoose.connect(url, {
    // useMongoClient: true,
})

class Model extends mongoose.Model {
    static async all() {
        return super.find()
    }

    static async all_concat(other) {
        log('all_concat', other)
        super.find().populate(other).exec(function(err, doc){
            console.log(err, doc);
        })
    }




    static async find_by_id(id, callback) {
        // const m = await super.findById(id)
        // return m
        return super.findById(id, callback)
    }



    static async find_by(key, value) {
        // es6 的语法, 与下面的代码作用一致
        // const query = {}
        // query[key] = value
        const query = {
            [key]: value,
        }
        // findOne 返回的是一个 query, 用 exec 执行这个 query
        return super.findOne(query).exec()
    }

    static async find_all(key, value) {
        const query = {
            [key]: value,
        }
        return super.find(query).exec()
    }

    static async find_all_search(key, value) {
        let reg_lista = []
        log('正在切搜索字段 value:', value)
        const key_list = value.split(' ')

        for (let e of key_list) {
            if (e != '') {
                let reg = new RegExp(e, 'i')
                reg_lista.push({
                    [key]: {$regex : reg}
                })
            }
        }
        const query = {
            $or : reg_lista
        }
        return super.find(query).exec()
    }






    static async new(form, kwargs={}) {
        // mongoose 的 create 相当于 new + save 这两个操作
        const m = await super.create(form)
        Object.keys(kwargs).forEach(k => m[k] = kwargs[k])
        m.save()
        return m
    }


    static async update_by_id(id, key, value) {
        const query = {
            [key]: value,
        }
        return super.findByIdAndUpdate(id, query)

        //
        //
        // const cls = this
        // const ins = await cls.find_by_id(id)
        // if (ins !== undefined) {
        //     ins[key] = value
        //     ins.save()
        // }
    }


    static async delete_by_id(id) {
        const query = {
            _id: id,
        }
        return super.deleteOne(query)
    }





    pass_time(start, end) {
        return time_pass(start, end)
    }
}

module.exports = {
    mongoose: mongoose,
    Model: Model,
}

