//routerLoader.js
const router = require('koa-router');
const fs = require('fs');
const Router = new router();
const services = require('./controllerLoader').loadService(); // 引入service

/**
 * 添加router
 */
const addRouters = (router) => {
    Object.keys(router).forEach((key) => {
        const route = key.split(' ');
        // console.log(`正在映射地址:${route[1]}--->HTTP Method:${route[0].toLocaleUpperCase()}--->路由方法:${router[key].name}`)
        console.log('router>>>>>>>>>>', route[0], route[1], router[key]);
        Router[route[0]](route[1], router[key])
    })
}

/**
 * router自动扫描
 */
const scan = () => {
    const url = `${__dirname}/routes`;
    const dir = fs.readdirSync(url) // 同步读取route下所有路由

    dir.forEach((filename) => {
        const routerModel = require(url + '/' + filename);
        addRouters(routerModel);
    })
}

/**
 * 返回router中间件
 */
// const setRouters = () => {
//     // addRouters(Index);
//     // addRouters(User);
//     scan();
//     return Router.routes()
// }

// 重写setRouters
const setRouters = (app) => {
    const routers = require(`./router`)(app);//在这里使用app
    const serviceList = {};
    services.forEach((item) => {
        serviceList[item.name] = item.module;
    });
    Object.keys(routers).forEach((key) => {
        const [method, path] = key.split(' ');
        // 不传入service
        // Router[method](path, routers[key]);

        // 将service作为参数传入，但是使用这种方式以后没有办法在controller进行render   page
        Router[method](path, (ctx) => {
            const handler = routers[key];
            handler(ctx, serviceList);
        });
    });
    return Router.routes()
}


module.exports = setRouters;