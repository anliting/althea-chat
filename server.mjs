import edges from './server/edges'
import addQueryFunctions from './server/addQueryFunctions'
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
    env.headers['content-type']='text/html;charset=utf-8'
    return{
        status:200,
        headers:env.headers,
        content:`
<!doctype html>
<title>Loading ...</title>
<base href=${env.config.root}>
<meta name=viewport content='width=device-width,initial-scale=1'>
<link rel=modulepreload href="https://gitcdn.link/cdn/anliting/simple.js/d76165db0cfc5b4c71786bf5a5f2e51503943294/src/simple.static.js">
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
export default async function(althea){
    addQueryFunctions(althea)
    await althea.updateDatabase(edges)
    althea.addPagemodule(env=>{
        let path=env.analyze.request.parsedUrl.pathname.split('/')
        return path[1]=='chat'
    },pagemodule)
}
