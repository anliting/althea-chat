;(async()=>{
    ;(await module.importByPath('lib/general.js',{mode:1}))(module)
    ;(async()=>{
        let {dom}=await module.moduleByPath('/lib/core.static.js')
        dom.head(
            dom.link({rel:'icon',href:'plugins/althea-chat/icon.png'})
        )
    })()
    let[
        chatPage,
    ]=await Promise.all([
        module.module('main/chatPage.js'),
    ])
    module.arguments.userId==undefined?
        chatPage.showConversationList()
    :
        chatPage.showChatRoom(module.arguments.userId)
})()
