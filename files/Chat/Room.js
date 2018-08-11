import{browser}from'/lib/core.static.js'
import{EventEmmiter}from'https://gitcdn.link/cdn/anliting/simple.js/09b9cd311f438c07fd1ac0ead044aed97158faf3/src/simple.static.js'
import createUi from'./Room/createUi.js'
import style from'./Room/style.js'
import mobileStyle from'./Room/style.mobile.js'
import desktopStyle from'./Room/style.desktop.js'
import startListen from'./Room/startListen.js'
import roomAddMessagesToUi from'./Room/roomAddMessagesToUi.js'
let
    deviceSpecificStyle=browser.isMobile?mobileStyle:desktopStyle,
    blockSize=16
function Room(
    send,
    createSession,
    getUser,
    imageUploader,
    conversationId,
    currentUser
){
    EventEmmiter.call(this)
    this._sendFunction=send
    this._createSession=createSession
    this._getUser=getUser
    this._imageUploader=imageUploader
    this._conversationId=conversationId
    this._currentUser=currentUser
    this._messages=[]
    this.ui=createUi.call(this)
    this._listenStart=new Promise(rs=>
        this._startListen=rs
    )
    ;(async()=>{
        await this._getMessages('before')
        this._startListen(startListen.call(this))
        await this._listenStart
        this._session.send({
            function:       'chat_listenMessages_addRange',
            start:          roomCalcAfter.call(this),
        })
    })()
}
Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype)
Room.prototype._getMessagesData=async function(){
    return this._send({
        function:       'chat_getMessages',
        conversation:   (await this._conversationId),
        after:0,
        before:this._messages.length==0?0:this._messages[0].id,
        last:blockSize,
    })
}
function roomCalcAfter(){
    return this._messages.length==0?
        0
    :
        this._messages[this._messages.length-1].id+1
}
Room.prototype._getMessages=async function(){
    if(this._gettingMessages)
        return
    this._gettingMessages=1
    if(this._messages.length==0){
        let res=await this._getMessagesData()
        if(res.length){
            res.sort((a,b)=>a.id-b.id)
            roomAddMessagesToUi.call(this,'prepend',res)
            this._messages=res.concat(this._messages)
        }
        this._gettingMessages=0
    }else{
        await this._listenStart
        this._session.send({
            function:       'chat_listenMessages_addRange',
            start:          0,
            end:            this._messages[0].id,
            last:           blockSize,
        })
    }
}
Room.prototype._sendMessage=async function(message){
    return this._send({
        function:       'chat_sendMessage',
        conversation:   (await this._conversationId),
        message,
    })
}
Room.prototype._send=async function(doc){
    return this._sendFunction(doc)
}
Room.prototype._settings={}
Object.defineProperty(Room.prototype,'connectionStatus',{set(val){
    this._connectionStatus=val
    this.ui.connectionStatus=val
}})
Object.defineProperty(Room.prototype,'settings',{set(val){
    this._settings=val
    Object.assign(this.ui,val)
},get(){
    return this._settings
}})
Room.prototype.style=style+deviceSpecificStyle
export default Room
