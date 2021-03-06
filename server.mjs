import edges from './server/edges.mjs'
import addQueryFunctions from './server/addQueryFunctions.mjs'
async function pagemodule(env){
    let path=env.analyze.request.parsedUrl.pathname.split('/')
    if(3<path.length)
        return env.httpServer.pagemodules.s400(env)
    if(path.length==3)
        try{
            let id=await env.database.getUserIdByUsername(path[2])
            env.userId=id
        }catch(e){
            return env.httpServer.pagemodules.s400(env)
        }
    if(!env.althea.allowOrigin(env.envVars,env.request.headers.origin))
        return 403
    if(env.request.method=='GET')
        return get(env)
    env.headers.allow='GET'
    return{
        status:405,
        headers:env.headers,
    }
}
function get(env){
    /*
        global pollution:
            altheaDontGarbageCollect
            katex
    */
    let ua=env.library.userAgent
    if(!ua.leOr(
        ua.version.esModuleBase,
        ua.parse(env.request.headers['user-agent'])
    ))
        return ua.notSupport(ua.version.esModuleBase)
    env.headers['content-type']='text/html;charset=utf-8'
    return{
        status:200,
        headers:env.headers,
        content:`
<!doctype html>
<title>Loading ...</title>
<base href=${env.config.root}>
<meta name=viewport content='width=device-width,initial-scale=1'>
<link rel=modulepreload href='plugins/chat/main.static.js'>
<link rel=modulepreload href="/lib/core.static.js">
<body>
${env.althea.loadModule(
    //'plugins/chat/main.js',
    'plugins/chat/main.static.js',
    {
        userId:env.userId
    },
    {
        sharedWorker:1,
    },
)}
`
    }
}
function Plugin(althea){
    ;(async()=>{
        addQueryFunctions(althea)
        await althea.updateDatabase(edges)
        althea.addPagemodule(env=>{
            let path=env.analyze.request.parsedUrl.pathname.split('/')
            return path[1]=='chat'
        },pagemodule)
    })()
}
Plugin.prototype.end=function(){
}
Plugin.prototype.shutdownEnd=function(){
}
export default Plugin
