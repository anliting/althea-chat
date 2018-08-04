import{doe}from                     '/lib/core.static.js'
import mainStyle from               './style.js'
import goChatRoom from              './ChatPage/goChatRoom.js'
import goConversationList from      './ChatPage/goConversationList.js'
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
    doe.head(
        this._style=         doe.style(mainStyle),
        this._themeColor=    doe.meta({name:'theme-color'}),
    )
}
ChatPage.prototype._playSound=function(){
    doe.body(doe.audio({
        autoplay:true,
        src:'plugins/chat/main/ChatPage/notification-a.mp3',
        onended(e){document.body.removeChild(this)},
        volume:this._settings.notificationSound,
    }))
}
ChatPage.prototype._setSetting=function(settings){
    this._settings=settings
    localStorage.altheaChatSettings=JSON.stringify(this._settings)
}
ChatPage.prototype._setMainOut=function(out){
    if(this._mainOut)
        this._mainOut.forEach=0
    out.forEach={
        in:doc=>{
            switch(doc.type){
                case'head':
                    document.head.appendChild(doc.node)
                break
                case'body':
                    document.body.appendChild(doc.node)
                break
                case'interval':
                    doc.id=setInterval(...doc.arguments)
                break
                case'style':
                    this._style.appendChild(doc.node)
                break
                case'themeColor':
                    this._themeColor.content=doc.color
                break
                case'playSound':
                    this._playSound()
                    out.out(doc)
                break
            }
        },
        out:doc=>{
            switch(doc.type){
                case'head':
                    document.head.removeChild(doc.node)
                break
                case'body':
                    document.body.removeChild(doc.node)
                break
                case'interval':
                    clearInterval(doc.id)
                break
                case'style':
                    this._style.removeChild(doc.node)
                break
                case'themeColor':
                    this._themeColor.content=''
                break
            }
        },
    }
    this._mainOut=out
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
