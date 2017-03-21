;(async()=>{
    ;(await module.importByPath('lib/general.js',{mode:1}))(module)
    localStorage.hacker&&module.repository.althea.hacker
    module.repository.Chat=module.shareImport('Chat.js')
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
