let
    mainStyle=module.get('main.css'),
    settings={
        notificationSound:0,
    },
    style=document.createElement('style')
document.head.append(style)
;(async()=>{
    (await module.importByPath('lib/general.js',{mode:1}))(module)
    let
        target=getUser(module.arguments.userId),
        chat=createChat(target)
    notification(chat,target)
    content(chat)
})()
async function getUser(id){
    let site=await module.repository.althea.site
    return site.getUser(id)
}
async function createChat(target){
    let site=module.repository.althea.site
    let[
        Chat,
        ImageUploader,
    ]=await Promise.all([
        module.shareImport('Chat.js'),
        module.repository.althea.ImageUploader,
    ])
    let chat=new Chat(
        new ImageUploader(site),
        (async()=>(await site).currentUser)(),
        target
    )
    chat.send=async d=>(await site).send(d)
    chat.getSetting=k=>settings[k]
    chat.setSetting=(k,v)=>settings[k]=v
    chat.playNotificationSound=playSound
    ;(async site=>{
        site=await site
        chat.connectionStatus=site.status
        site.on('statusChange',_=>
            chat.connectionStatus=site.status
        )
    })(site)
    return chat
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
function playSound(){
    let n=document.createElement('audio')
    n.autoplay=true
    n.src='plugins/althea-chat/notification.mp3'
    n.onended=e=>document.body.removeChild(n)
    n.volume=settings.notificationSound
    document.body.appendChild(n)
}
