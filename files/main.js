let style=module.styleByPath('plugins/althea-chat/main.css')
module.importByPath('lib/general.js',{mode:1}).then(general=>{
    general(module)
    let
        site=module.repository.althea.site,
        target=site.then(site=>
            site.getUser(module.arguments.userId)
        ),
        chat=loadChat(target)
    title(chat,target)
    body(chat)
})
async function loadChat(target){
    let site=module.repository.althea.site
    let Chat=await module.shareImport('Chat.js')
    return new Chat(site,target)
}
async function title(chat,target){
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
        notification
    updateTitle()
    setInterval(updateTitle,1000)
    chat.on('append',()=>{
        if(!tabIsFocused){
            notification=0
            console.log('play disjoint sound')
        }
    })
    addEventListener('focusin',e=>{
        tabIsFocused=true
        notification=undefined
    })
    addEventListener('focusout',e=>{
        tabIsFocused=false
    })
    function updateTitle(){
        let notiPart=notification==undefined?'':`${'◯⬤'[notification]} `
        document.title=`${notiPart}↔ ${target.nickname}`
        if(notification!=undefined)
            notification=1-notification
    }
}
async function body(chat){
    chat=await chat
    let ui=chat.ui,node=ui.node
    document.head.appendChild(await style)
    document.body.appendChild(node)
    ui.focus()
    ui.beAppended()
}
