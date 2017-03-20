function playSound(settings){
    let n=document.createElement('audio')
    n.autoplay=true
    n.src='plugins/althea-chat/notification.mp3'
    n.onended=e=>document.body.removeChild(n)
    n.volume=settings.notificationSound
    document.body.appendChild(n)
}
;(async function createChatRoom(target,site,settings){
    let[
        Chat,
        ImageUploader,
    ]=await Promise.all([
        module.repository.Chat,
        module.repository.althea.ImageUploader,
    ])
    let chatRoom=new Chat.Room(
        new ImageUploader(site),
        (async()=>(await site).currentUser)(),
        target
    )
    chatRoom.send=async d=>(await site).send(d)
    chatRoom.getSetting=k=>settings[k]
    chatRoom.setSetting=(k,v)=>settings[k]=v
    chatRoom.playNotificationSound=()=>playSound(settings)
    ;(async site=>{
        site=await site
        chatRoom.connectionStatus=site.status
        site.on('statusChange',_=>
            chatRoom.connectionStatus=site.status
        )
    })(site)
    return chatRoom
})
