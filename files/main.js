;(async()=>{
    ;(await module.importByPath('lib/general.static.js',{mode:1}))(module)
    module.repository.Chat=module.shareImport('Chat.js')
    ;(async()=>{
        let dom=await module.repository.althea.dom
        dom.head(
            dom.link({rel:'icon',href:'plugins/althea-chat/icon.png'})
        )
    })()
    let[
        chatPage,
    ]=await Promise.all([
        module.shareImport('main/chatPage.js'),
    ])
    module.arguments.userId==undefined?
        chatPage.showConversationList()
    :
        chatPage.showChatRoom(module.arguments.userId)
})()
