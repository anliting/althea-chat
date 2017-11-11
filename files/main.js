import {Site,dom,general}from '/lib/core.static.js'
import ChatPage from './main/ChatPage.js'
let chatPage=new ChatPage(new Site)
dom.head(
    dom.link({rel:'icon',href:'plugins/chat/icon.png'})
)
general()
arg.userId==undefined?
    chatPage.showConversationList()
:
    chatPage.showChatRoom(arg.userId)
