;(async()=>{
    ;(async()=>{
        ;(await module.moduleByPath('/lib/general.mjs'))
    })()
    ;(async()=>{
        let {dom}=await module.moduleByPath('/lib/core.static.js')
        dom.head(
            dom.link({rel:'icon',href:'plugins/althea-chat/icon.png'})
        )
    })()
    let[
        chatPage,
    ]=await Promise.all([
        module.module('main/chatPage.static.js'),
    ])
    module.arguments.userId==undefined?
        chatPage.showConversationList()
    :
        chatPage.showChatRoom(module.arguments.userId)
})()
