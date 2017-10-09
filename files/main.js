import core from '/lib/core.static.js'
import chatPage from './main/chatPage.js'
let {dom,general}=core
dom.head(
    dom.link({rel:'icon',href:'plugins/althea-chat/icon.png'})
)
general()
arg.userId==undefined?
    chatPage.showConversationList()
:
    chatPage.showChatRoom(arg.userId)
