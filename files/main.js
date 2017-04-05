;(async()=>{
    ;(await module.importByPath('lib/general.js',{mode:1}))(module)
    module.repository.Chat=module.shareImport('Chat.static.js')
    //module.repository.Chat=module.shareImport('Chat.js')
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
