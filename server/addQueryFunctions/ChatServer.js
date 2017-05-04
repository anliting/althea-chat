let loadChatProperties=require('./ChatServer/loadChatProperties')
function ChatServer(db){
    this._db=db
    this._cache={
        twoMen:{}
    }
}
loadChatProperties(ChatServer.prototype)
module.exports=ChatServer
