import{dom}from                     '/lib/core.static.js'
import mainStyle from               './style.js'
import goChatRoom from              './ChatPage/goChatRoom.js'
import goConversationList from      './ChatPage/goConversationList.js'
import ChatPageOut from             './ChatPage/ChatPageOut.js'
function ChatPage(site){
/*
    properties:
        _mainOut
        _status
*/
    this._site=site
    this._settings=localStorage.altheaChatSettings?
        JSON.parse(localStorage.altheaChatSettings)
    :
        {notificationSound:0}
    onpopstate=e=>{
        this._go(e.state)
    }
    dom.head(
        this._style=         dom.style(mainStyle),
        this._themeColor=    dom.meta({name:'theme-color'}),
    )
}
ChatPage.prototype._playSound=function(){
    dom.body(dom.audio({
        autoplay:true,
        src:'plugins/chat/main/ChatPage/notification-a.mp3',
        onended(e){document.body.removeChild(this)},
        volume:this._settings.notificationSound,
    }))
}
ChatPage.prototype._setSetting=function(k,v){
    this._settings[k]=v
    localStorage.altheaChatSettings=JSON.stringify(this._settings)
}
ChatPage.prototype._setMainOut=function(node){
    if(this._mainOut)
        this._mainOut.end()
    let out=new ChatPageOut(this)
    out.in({type:'body',node})
    this._mainOut=out
    return out
}
ChatPage.prototype._go=async function(status,internal=1){
    let setState=url=>{
        if(internal)
            return
        history[this._status?'pushState':'replaceState'](
            status,
            '',
            url
        )
    }
    if(status.name=='chatRoom'){
        let u=await this._site.getUser(status.id)
        await u.load('username')
        setState(`/chat/${encodeURIComponent(u.username)}`)
        goChatRoom.call(this,status.id)
    }else if(status.name='conversationList'){
        setState(`/chat`)
        goConversationList.call(this)
    }
    this._status=status
}
ChatPage.prototype.go=async function(status){
    this._go(status,0)
}
ChatPage.prototype.goChatRoom=function(id){
    return this.go({
        name:'chatRoom',
        id,
    })
}
ChatPage.prototype.goConversationList=function(){
    return this.go({
        name:'conversationList',
    })
}
export default ChatPage
