import{Site,dom,general}from '/lib/core.static.js'
import ChatPage from './main/ChatPage.js'
general()
let chatPage=new ChatPage(new Site)
dom.head(
    dom.link({rel:'icon',href:'plugins/chat/icon.png'})
)
arg.userId==undefined?
    chatPage.goConversationList()
:
    chatPage.goChatRoom(arg.userId)
