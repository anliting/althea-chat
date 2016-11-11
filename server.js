let entities=require('entities')
module.exports=althea=>{
    althea.addPagemodule('chat',pagemodule)
}
function pagemodule(env){
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
<script src=${
    env.environmentvariables.moduleUrl
} data-main=plugins/althea-chat/main.js data-args=${entities.encodeHTML(JSON.stringify({
    userId:env.userId
}))} async></script>
`
    }
}
