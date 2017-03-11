module.styleByPath('plugins/althea-chat/main.css').then(main=>
    document.head.appendChild(main)
)
module.importByPath('lib/general.js',{mode:1}).then(async general=>{
    general(module)
    let
        site=module.repository.althea.site,
        target=site.then(site=>
            site.getUser(module.arguments.userId)
        ),
        chat=await loadChat(target)
    let ui=chat.ui
    document.body.appendChild(ui.node)
    ui.focus()
    ui.beAppended()
    let vals=await Promise.all([
        site.then(site=>site.currentUser).then(u=>u.load('nickname')),
        target.then(u=>u.load('nickname')),
    ])
    let notification
    updateTitle()
    setInterval(()=>{
        updateTitle()
        if(notification!=undefined)
            notification=1-notification
    },500)
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
        }${vals[0].nickname} ↔ ${vals[1].nickname}`
    }
})
async function loadChat(target){
    let site=module.repository.althea.site
    let Chat=await module.shareImport('Chat.js')
    return new Chat(site,target)
}
