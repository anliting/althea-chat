let
    mainStyle=module.get('main.css'),
    style=document.createElement('style'),
    settings={
        notificationSound:0,
    }
document.head.append(style)
;(async()=>{
    (await module.importByPath('lib/general.js',{mode:1}))(module)
    module.repository.Chat=module.shareImport('Chat.js')
    let createChatRoom=await module.shareImport('main/createChatRoom.js')
    if(module.arguments.userId==undefined){
        document.title='Althea Chat'
    }else{
        let
            target=getUser(module.arguments.userId),
            chatRoom=createChatRoom(
                target,
                module.repository.althea.site,
                settings
            )
        notification(chatRoom,target)
        content(chatRoom)
    }
})()
async function getUser(id){
    let site=await module.repository.althea.site
    return site.getUser(id)
}
async function notification(chat,target){
    await Promise.all([
        (async()=>{
            chat=await chat
        })(),
        (async()=>{
            target=await target
            await target.load('nickname')
        })(),
    ])
    let
        tabIsFocused=true,
        notification=0,
        unread=0
    updateTitle()
    setInterval(updateTitle,1000)
    chat.on('append',()=>{
        if(tabIsFocused)
            return
        if(unread==0)
            notification=1
        unread++
        playSound()
    })
    addEventListener('focusin',e=>{
        tabIsFocused=true
        unread=0
    })
    addEventListener('focusout',e=>{
        tabIsFocused=false
    })
    function updateTitle(){
        let notiPart=unread==0?'':`${'◯⬤'[notification]} (${unread}) `
        document.title=`${notiPart}↔ ${target.nickname}`
        notification=1-notification
    }
}
async function content(chat){
    chat=await chat
    let ui=chat.ui,node=ui.node
    style.appendChild(document.createTextNode(await mainStyle))
    style.appendChild(document.createTextNode(await chat.style))
    document.body.appendChild(node)
    ui.focus()
    ui.beAppended()
}
