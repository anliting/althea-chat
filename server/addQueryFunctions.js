let
    ChatServer=         require('./addQueryFunctions/ChatServer'),
    queryFunctions=     require('./addQueryFunctions/queryFunctions')
function addQueryFunctions(althea){
    let sv=new ChatServer(althea.database)
    Object.entries(queryFunctions).map(([k,v])=>
        althea.addQueryFunction(k,(opt,env)=>
            v(sv,opt,env)
        )
    )
}
module.exports=addQueryFunctions
