const express = require('express')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const session = require('cookie-session')
const path = require('path')
const cors = require('cors')






const log = console.log.bind(console)

const { secretKey } = require('./config')


// const {xxx} = require('./routes/test')
const {index} = require('./routes/index')
const {user} = require('./routes/user')
const {topic} = require('./routes/topic')
const {board} = require('./routes/board')
const {reply} = require('./routes/reply')
const {hotspot} = require('./routes/hotspot')
const {ajax_demo} = require('./routes/ajax_demo')
const {photo} = require('./routes/photo')


const app = express()
const env = nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    noCache: true,
})


app.use(session({
    //这里的 key 必须是 secret
    secret: secretKey,
}))


// 这里用来解析正常的 form 表单
app.use(bodyParser.urlencoded({
    extended: true

}))


app.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://127.0.0.1:4000'],
    methods: ['GET', 'POST'],
    //vue 让后台保持 session 状态
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization']
}))




// 这里用来解析 ajax 提交的 form 表单
app.use(bodyParser.json());



app.use('/', index)
app.use('/user', user)
app.use('/topic', topic)
app.use('/board', board)
app.use('/reply', reply)
app.use('/hotspot', hotspot)
app.use('/ajax', ajax_demo)
app.use('/photo', photo)

const static_path = path.join(__dirname, '.', 'static/')
// log('static_path:', static_path)

var history = require('connect-history-api-fallback');
app.use(history({
        index: 'http://127.0.0.1:4000/static/index.html'
    }
))

history({
    rewrites: [
        { from: /\/index1/, to: '/index.html'}
    ]
});

app.use(history(
    {
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
    }
));



app.use('/static', express.static(static_path))



// app.use(history({
//     rewrites: [
//         { from: /^\/abc$/, to: '/' }
//     ]
// }))

const test_path = path.join(__dirname, '.', 'upload_path/')
// log('test_path:', test_path)
app.use('/user/avatar', express.static(test_path))

const run = (port=3000, host='') => {
    const server = app.listen(port, host, () => {
        const address = server.address()
        log(`listening server at http://${address.address}:${address.port}`)
    })
}

const __main = () => {
    const host = '0.0.0.0'
    const port = 4000
    run(port, host)

}


__main()