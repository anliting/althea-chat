;(async()=>{
    ;(await module.importByPath('lib/general.js',{mode:1}))(module)
    module.repository.Chat=module.shareImport('Chat.js')
    let chatPage=await module.shareImport('main/chatPage.js')
    module.arguments.userId==undefined?
        chatPage.showContacts()
    :
        chatPage.showChatRoom(module.arguments.userId)
})()
