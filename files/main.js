import{Site,doe,general}from '/lib/core.static.js'
import ChatPage from './main/ChatPage.js'
general()
let chatPage=new ChatPage(new Site)
doe.head(
    doe.link({rel:'icon',href:'plugins/chat/icon.png'})
)
arg.userId==undefined?
    chatPage.goConversationList()
:
    chatPage.goChatRoom(arg.userId)
