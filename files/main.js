let
    mainStyle=module.get('main.css'),
    style=document.createElement('style'),
    settings={
        notificationSound:0,
    }
document.head.append(style)
;(async()=>{
    ;(await module.importByPath('lib/general.js',{mode:1}))(module)
    module.repository.Chat=module.shareImport('Chat.js')
    let chatPage=await module.shareImport('chatPage.js')
    if(module.arguments.userId==undefined){
        document.title='Althea Chat'
    }else{
        chatPage.showChatRoom(
            module.arguments.userId,
            settings,
            style,
            mainStyle
        )
    }
})()
