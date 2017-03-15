let style=module.styleByPath('plugins/althea-chat/main.css')
module.importByPath('lib/general.js',{mode:1}).then(general=>{
    general(module)
    let
        site=module.repository.althea.site,
        target=site.then(site=>
            site.getUser(module.arguments.userId)
        ),
        chat=loadChat(target)
    notification(chat,target)
    content(chat)
})
async function loadChat(target){
    let site=module.repository.althea.site
    let Chat=await module.shareImport('Chat.js')
    return new Chat(site,target)
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
        console.log('play disjoint complete sound')
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
    document.head.appendChild(await style)
    document.body.appendChild(node)
    ui.focus()
    ui.beAppended()
}
