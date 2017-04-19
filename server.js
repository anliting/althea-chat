let
    getMessages=        require('./server/getMessages'),
    sendMessage=        require('./server/sendMessage'),
    getConversations=   require('./server/getConversations'),
    edges={
        0:async db=>{
            await db.query(`
                create table message (
                    id int not null auto_increment,
                    timestamp timestamp not null default current_timestamp,
                    fromUser int not null,
                    toUser int not null,
                    message text not null,
                    primary key (id)
                )
            `)
            return 1
        },
        10:async db=>{
            await db.query(`
                rename table message to chat_message
            `)
            await db.query(`
                create table chat_conversation (
                    id int not null auto_increment,
                    primary key (id)
                )
            `)
            return 2
        },
    }
let loadChatProperties=require('./server/loadChatProperties')
module.exports=async function(althea){
    {
        let ver=await getDbVer(althea)
        while(ver in edges)
            ver=await edges[ver](althea.database)
        setDbVer(althea,ver)
    }
    function Database(){
    }
    Database.prototype=althea.database
    loadChatProperties(Database.prototype)
    let db=new Database
    althea.addQueryFunction('getMessages',(opt,env)=>
        getMessages(db,opt,env)
    )
    althea.addQueryFunction('sendMessage',(opt,env)=>
        sendMessage(db,opt,env)
    )
    althea.addQueryFunction('getConversations',(opt,env)=>
        getConversations(db,opt,env)
    )
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
async function setDbVer(althea,ver){
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
