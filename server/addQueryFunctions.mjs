import ChatServer from './addQueryFunctions/ChatServer'
import queryFunctions from './addQueryFunctions/queryFunctions'
function addQueryFunctions(althea){
    let sv=new ChatServer(althea.database)
    Object.entries(queryFunctions).map(([k,v])=>
        althea.addQueryFunction(`chat_${k}`,(opt,env)=>
            v(sv,opt,env)
        )
    )
}
export default addQueryFunctions
