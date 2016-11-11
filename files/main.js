module.styleByPath('plugins/althea-chat/main.css')
module.importByPath('lib/general.js',{mode:1}).then(repository=>{
    module.repository=repository
    let
        chat=loadChat(),
        site=module.repository.althea.site
    chat.then(chat=>{
        let chatView=chat.view
        document.body.appendChild(chatView.domElement)
        chatView.focus()
        chatView.beAppended()
    })
    Promise.all([
        site.then(site=>site.currentUser).then(u=>u.load('nickname')),
        chat.then(chat=>chat.target).then(u=>u.load('nickname')),
    ]).then(vals=>{
        document.title=`${vals[0].nickname} ↔ ${vals[1].nickname}`
    })
})
function loadChat(){
    let site=module.repository.althea.site
    return module.shareImport('Chat.js').then(Chat=>
        new Chat(
            site,
            site.then(site=>
                site.getUserById(module.arguments.userId)
            )
        )
    )
}
