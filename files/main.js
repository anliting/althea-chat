import core from '/lib/core.static.js'
import ChatPage from './main/ChatPage.js'
let{Site,dom,general}=core
let chatPage=new ChatPage(new Site)
dom.head(
    dom.link({rel:'icon',href:'plugins/althea-chat/icon.png'})
)
general()
arg.userId==undefined?
    chatPage.showConversationList()
:
    chatPage.showChatRoom(arg.userId)
