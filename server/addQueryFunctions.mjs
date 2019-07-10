import ChatServer from './addQueryFunctions/ChatServer.mjs'
import queryFunctions from './addQueryFunctions/queryFunctions.mjs'
function addQueryFunctions(althea){
    let sv=new ChatServer(althea.database)
    Object.entries(queryFunctions).map(([k,v])=>
        althea.addQueryFunction(`chat_${k}`,(opt,env)=>
            v(sv,opt,env)
        )
    )
}
export default addQueryFunctions
