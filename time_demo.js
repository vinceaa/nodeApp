const {log} = require('./utils')

//Math.round(new Date().getTime()/1000)
const test = (start, end) => {
    const flow = end - start
    const t = 60
    if (flow < t && flow > 0) {
         return `${Math.floor(flow)}秒前`
    } else if (flow < t * 60) {
        return `${Math.floor(flow/60)}分钟前`
    } else if (flow < t * 60 * 24) {
        return `${Math.floor(flow/60/60)}小时前`
    } else if (flow < t * 60 * 60 * 24) {
        return `${Math.floor(flow/60/60/24)}天前`
    } else {
        return `${Math.floor(flow/60/60/24/365)}年前`
    }
}

const __main = () => {
    log('经过:', test(1457433009, 1521818962))
}

__main()
