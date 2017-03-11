let style=module.styleByPath('plugins/althea-chat/main.css')
module.importByPath('lib/general.js',{mode:1}).then(async general=>{
    general(module)
    let
        site=module.repository.althea.site,
        target=site.then(site=>
            site.getUser(module.arguments.userId)
        ),
        chat=loadChat(target)
    ;(async chat=>{
        chat=await chat
        target=await target
        await target.load('nickname')
        let notification
        updateTitle()
        setInterval(updateTitle,500)
        chat.on('append',mes=>{
            if(mes.length&&document.hidden)
                notification=0
        })
        document.addEventListener('visibilitychange',e=>{
            if(!document.hidden)
                notification=undefined
        })
        function updateTitle(){
            document.title=`${
                notification==undefined?'':` ${'◯⬤'[notification]} `
            }↔ ${target.nickname}`
            if(notification!=undefined)
                notification=1-notification
        }
    })(chat)
    ;(async chat=>{
        document.head.appendChild(await style)
        chat=await chat
        let ui=chat.ui
        document.body.appendChild(ui.node)
        ui.focus()
        ui.beAppended()
    })(chat)
})
async function loadChat(target){
    let site=module.repository.althea.site
    let Chat=await module.shareImport('Chat.js')
    return new Chat(site,target)
}
