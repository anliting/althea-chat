import getConversations from'./ChatServer/getConversations.mjs'
import getTwoMenConversation from'./ChatServer/getTwoMenConversation.mjs'
import getMessages from'./ChatServer/getMessages.mjs'
import newMessage from'./ChatServer/newMessage.mjs'
import userOwnConversation from'./ChatServer/userOwnConversation.mjs'
async function checkRange(a,r){
    if('first' in r){
        // to be completed
        return
    }
    if('last' in r){
        a.send(await this.getMessages(
            a.conversation,
            r.start,
            r.end,
            r.last
        ))
        return
    }
    let res=await this.getMessages(
        a.conversation,
        r.start,
        r.end
    )
    if(!res.length)
        return r
    r.start=Math.max(...res.map(row=>row.id))+1
    a.send(res)
    return r
}
function pushMessages(){
    this._listen.forEach(async a=>{
        if(a.getting)
            return
        a.getting=1
        let newRanges=a.range.map(r=>
            checkRange.call(this,a,r)
        )
        a.range=[]
        a.range.push(...(await Promise.all(newRanges)).filter(a=>a))
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
ChatServer.prototype.addListenRange=function(session,range){
    let listen=this._listenBySession.get(session)
    if('first' in range||'last' in range)
        return checkRange.call(this,listen,range)
    listen.range.push(range)
}
ChatServer.prototype.clearListenMessages=function(a){
    this._listen.delete(a)
    this._listenBySession.delete(a.session)
}
ChatServer.prototype.hasListenOn=function(session){
    return this._listenBySession.has(session)
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
    getConversations,
    getTwoMenConversation,
    getMessages,
    newMessage,
    userOwnConversation,
})
export default ChatServer
