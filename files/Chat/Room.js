import{browser}from'/lib/core.static.js'
import{EventEmmiter}from'https://gitcdn.link/cdn/anliting/simple.js/55124630741399dd0fcbee2f0396642a428cdd24/src/simple.static.js'
import createUi from'./Room/createUi.js'
import style from'./Room/style.js'
import mobileStyle from'./Room/style.mobile.js'
import desktopStyle from'./Room/style.desktop.js'
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
    ;(async()=>{
        await this._getMessages('before')
        let startListen
        this._listenStart=new Promise(rs=>startListen=rs)
        this._session=this._createSession()
        ;(async()=>{
            await this._listenStart
            this._session.send({
                function:       'chat_listenMessages_addRange',
                start:          ''+roomCalcAfter.call(this),
                end:            ''+Infinity,
            })
        })()
        this._session.send({
            function:       'chat_listenMessages',
            conversation:   (await this._conversationId),
        })
        this._session.onMessage=doc=>{
            if(doc.error)
                return console.error(doc.error)
            let res=doc.value
            switch(res.function){
                case'pushMessages':
                    if(!res.value.length)
                        break
                    res.value.sort((a,b)=>a.id-b.id)
                    if(
                        !this._messages.length||
                        res.value[0].id<this._messages[0].id
                    ){
                        roomAddMessagesToUi.call(this,'prepend',res.value)
                        this._messages=res.value.concat(this._messages)
                        this._gettingMessages=0
                    }else{
                        roomAddMessagesToUi.call(this,'append',res.value)
                        this._messages=this._messages.concat(res.value)
                        this.emit('append')
                    }
                break
                case'listenStarted':
                    startListen()
                break
            }
        }
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
            start:          '0',
            end:            ''+this._messages[0].id,
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
async function roomAddMessagesToUi(mode,messages){
    await Promise.all(messages.map(async row=>{
        this.ui.users[row.fromUser]=await this._getUser(row.fromUser)
    }))
    this.ui[mode](messages)
}
export default Room
