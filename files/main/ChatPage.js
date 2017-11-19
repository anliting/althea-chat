import{dom}from                     '/lib/core.static.js'
import mainStyle from               './style.js'
import showChatRoom from            './ChatPage/showChatRoom.js'
import showConversationList from    './ChatPage/showConversationList.js'
function ChatPage(site){
    this._site=site
    this._settings=localStorage.altheaChatSettings?
        JSON.parse(localStorage.altheaChatSettings)
    :
        {notificationSound:0}
    dom.head(
        this.style=dom.style(mainStyle),
        this.themeColor=dom.meta({name:'theme-color'})
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
ChatPage.prototype.showChatRoom=showChatRoom
ChatPage.prototype.showConversationList=showConversationList
export default ChatPage
