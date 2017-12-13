function ChatServer(db){
    this._db=db
    this._cache={
        twoMen:{}
    }
    this._listen=new Set
    this._intervalId=setInterval(()=>{
        this._listen.forEach(async a=>{
            if(a.getting)
                return
            a.getting=true
            let res=await this.getMessages(
                a.conversation,
                a.after,
                Infinity
            )
            a.getting=false
            if(res.length){
                a.after=Math.max(...res.map(row=>row.id))+1
                a.send(res)
            }
        })
    },200)
}
ChatServer.prototype.clearListenMessages=function(a){
    this._listen.delete(a)
}
ChatServer.prototype.listenMessages=function(conversation,after,send){
    let a={
        conversation,
        after,
        send,
        getting:false
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
