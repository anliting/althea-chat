;(async function createChatRoom(target,site){
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
    chatRoom.getSetting=k=>this.settings[k]
    chatRoom.setSetting=(k,v)=>this.settings[k]=v
    chatRoom.playNotificationSound=()=>this.playSound()
    ;(async site=>{
        site=await site
        chatRoom.connectionStatus=site.status
        site.on('statusChange',_=>
            chatRoom.connectionStatus=site.status
        )
    })(site)
    return chatRoom
})
