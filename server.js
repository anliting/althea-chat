let
    getMessages=require('./server/getMessages'),
    sendMessage=require('./server/sendMessage'),
    getConversations=require('./server/getConversations'),
    edges={
        //0:()=>1
    }
module.exports=async function(althea){
    {
        let ver=await getDbVer(althea)
        while(ver in edges)
            ver=edges[ver](althea)
        setDbVer(althea,ver)
    }
    althea.addQueryFunction('getMessages',getMessages)
    althea.addQueryFunction('sendMessage',sendMessage)
    althea.addQueryFunction('getConversations',getConversations)
    althea.addPagemodule(env=>{
        let path=env.analyze.request.parsedUrl.pathname.split('/')
        return path[1]=='chat'
    },pagemodule)
}
async function getData(althea){
    let data=await althea.getData()
    return data?JSON.parse(data):{}
}
async function getDbVer(althea){
    return(await getData(althea)).databaseVersion||0
}
async function setDbVer(althea){
    let data=await getData(althea)
    data.databaseVersion=ver
    await althea.setData(data)
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
    return f(env)
}
function f(env){
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
    env.envVars,
    '../plugins/althea-chat/main.static.js',
    {
        userId:env.userId
    }
)}
`
    }
}
