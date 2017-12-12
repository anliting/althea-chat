let
    edges=              require('./server/edges'),
    addQueryFunctions=  require('./server/addQueryFunctions')
module.exports=async function(althea){
    addQueryFunctions(althea)
    await althea.updateDatabase(edges)
    althea.addPagemodule(env=>{
        let path=env.analyze.request.parsedUrl.pathname.split('/')
        return path[1]=='chat'
    },pagemodule)
}
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
        global pollution: altheaDontGarbageCollect katex
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
<script type=module>
let a=[
    '/lib/core.static.js',
    'https://gitcdn.link/cdn/anliting/simple.js/55124630741399dd0fcbee2f0396642a428cdd24/src/simple.static.js',
]
window.altheaDontGarbageCollect=Promise.all(a.map(v=>import(v)))
</script>
`
    }
}
