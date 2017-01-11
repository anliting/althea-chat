module.styleByPath('plugins/althea-chat/main.css').then(main=>
    document.head.appendChild(main)
)
module.importByPath('lib/general.js',{mode:1}).then(general=>{
    general(module)
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
