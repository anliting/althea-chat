function pushMessages(){
    this._listen.forEach(async a=>{
        if(a.getting)
            return
        a.getting=1
        await Promise.all(a.range.map(async(_,i)=>{
            let res=await this.getMessages(
                a.conversation,
                a.range[i],
                Infinity
            )
            if(!res.length)
                return
            a.range[i]=Math.max(...res.map(row=>row.id))+1
            a.send(res)
        }))
        a.getting=0
    })
}
function ChatServer(db){
    this._db=db
    this._cache={
        twoMen:{}
    }
    this._listen=new Set
    this._listenBySession=new Map
    this._intervalId=setInterval(pushMessages.bind(this),200)
}
ChatServer.prototype.addListenRange=function(session,after){
    this._listenBySession.get(session).range.push(after)
}
ChatServer.prototype.clearListenMessages=function(a){
    this._listen.delete(a)
    this._listenBySession.delete(a.session)
}
ChatServer.prototype.listenMessages=function(session,conversation,send){
    let a={
        session,
        conversation,
        range:[],
        send,
    }
    this._listen.add(a)
    this._listenBySession.set(session,a)
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
