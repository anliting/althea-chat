function pushMessages(){
    this._listen.forEach(async a=>{
        if(a.getting)
            return
        a.getting=1
        let res=await this.getMessages(
            a.conversation,
            a.after,
            Infinity
        )
        a.getting=0
        if(!res.length)
            return
        a.after=Math.max(...res.map(row=>row.id))+1
        a.send(res)
    })
}
function ChatServer(db){
    this._db=db
    this._cache={
        twoMen:{}
    }
    this._listen=new Set
    this._intervalId=setInterval(pushMessages.bind(this),200)
}
ChatServer.prototype.clearListenMessages=function(a){
    this._listen.delete(a)
}
ChatServer.prototype.listenMessages=function(
    session,
    conversation,
    after,
    send,
){
    let a={
        session,
        conversation,
        after,
        send,
    }
    this._listen.add(a)
    return a
}
Object.assign(ChatServer.prototype,{
    getConversations:require('./ChatServer/getConversations'),
    getTwoMenConversation:require('./ChatServer/getTwoMenConversation'),
    getMessages:require('./ChatServer/getMessages'),
    newMessage:require('./ChatServer/newMessage'),
    userOwnConversation:require('./ChatServer/userOwnConversation'),
})
module.exports=ChatServer
