import core from '/lib/core.static.js'
let {browser}=core
import EventEmmiter from 'https://gitcdn.link/cdn/anliting/simple.js/99b7ab1b872bc2da746dd648dd0c078b3bc6961e/src/simple/EventEmmiter.js'
import ui from './Room/prototype.ui.js'
import style from './Room/style.js'
import mobileStyle from './Room/style.mobile.js'
import desktopStyle from './Room/style.desktop.js'
let
    deviceSpecificStyle=browser.isMobile?mobileStyle:desktopStyle,
    blockSize=16
function Room(
    send,
    createSession,
    getUser,
    imageUploader,
    conversationId,
    currentUser,
    target
){
    EventEmmiter.call(this)
    this._sendFunction=send
    this._createSession=createSession
    this._getUser=getUser
    this._imageUploader=imageUploader
    this._conversationId=conversationId
    this._currentUser=currentUser
    this._messages=[]
    ;(async()=>{
        await this._getMessages('before')
        let session=this._createSession()
        session.send({
            function:       'listenMessages',
            conversation:   (await this._conversationId),
            after:          roomCalcAfter.call(this),
        })
        session.onMessage=doc=>{
            let res=doc.value
            if(this._ui)
                roomAddMessagesToUi.call(this,'append',res)
            this._messages=this._messages.concat(res)
            if(res.length)
                this.emit('append')
        }
    })()
}
Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype)
Room.prototype._getMessagesData=async function(){
    let
        chat=this
    let doc={
        function:       'getMessages',
        conversation:   (await this._conversationId),
    }
    doc.after=0
    doc.before=calcBefore()
    doc.last=blockSize
    return this._send(doc)
    function calcBefore(){
        return chat._messages.length==0?
            0
        :
            chat._messages[0].id
    }
}
function roomCalcAfter(){
    return this._messages.length==0?
        0
    :
        this._messages[this._messages.length-1].id+1
}
Room.prototype._getMessages=async function(){
    if(this._getMessagesPromise)
        return
    this._getMessagesPromise=this._getMessagesData()
    try{
        let res=await this._getMessagesPromise
        if(res.length){
            res.sort((a,b)=>a.id-b.id)
            if(this._ui)
                roomAddMessagesToUi.call(this,'prepend',res)
            this._messages=res.concat(this._messages)
        }
    }catch(e){}
    delete this._getMessagesPromise
}
Room.prototype._sendMessage=async function(message){
    return this._send({
        function:       'sendMessage',
        conversation:   (await this._conversationId),
        message,
    })
}
Room.prototype._send=async function(doc){
    return this._sendFunction(doc)
}
Object.defineProperty(Room.prototype,'connectionStatus',{set(val){
    this._connectionStatus=val
    if(this._ui)
        this._ui.connectionStatus=val
}})
Room.prototype.style=style+deviceSpecificStyle
Object.defineProperty(Room.prototype,'ui',ui)
async function roomAddMessagesToUi(mode,messages){
    await Promise.all(messages.map(async row=>{
        this._ui.users[row.fromUser]=await this._getUser(row.fromUser)
    }))
    this._ui[mode](messages)
}
export default Room
