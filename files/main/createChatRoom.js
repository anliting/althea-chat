async function getTwoMenConversation(s,target){
    let site=await s
    let id=await site.send({
        function:'getTwoMenConversation',
        target:(await target).id,
    })
    return id
}
;(async function createChatRoom(target,site){
    let[
        Chat,
        ImageUploader,
    ]=await Promise.all([
        module.repository.Chat,
        module.repository.althea.ImageUploader,
    ])
    site=await site
    let chatRoom=new Chat.Room(
        async d=>site.send(d),
        ()=>site.createSession(),
        async i=>site.getUser(i),
        new ImageUploader(site),
        getTwoMenConversation(site,target),
        site.currentUser,
        target
    )
    chatRoom.getSetting=k=>this.settings[k]
    chatRoom.setSetting=(k,v)=>this.setSetting(k,v)
    chatRoom.playNotificationSound=()=>this.playSound()
    update()
    addEventListener('offline',update)
    addEventListener('online',update)
    return chatRoom
    function update(){
        chatRoom.connectionStatus=navigator.onLine?'online':'offline'
    }
})
