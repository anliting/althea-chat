import{ImageUploader}from '/lib/core.static.js'
import Chat from '../../../Chat.js'
async function getTwoMenConversation(site,target){
    let id=await site.send({
        function:'getTwoMenConversation',
        target:(await target).id,
    })
    return id
}
export default async function(out,target){
    let site=this._site
    let chatRoom=new Chat.Room(
        async d=>site.send(d),
        ()=>site.createSession(),
        async i=>site.getUser(i),
        new ImageUploader(site),
        getTwoMenConversation(site,target),
        site.currentUser,
        target
    )
    chatRoom.getSetting=k=>this._settings[k]
    chatRoom.setSetting=(k,v)=>this._setSetting(k,v)
    chatRoom.playNotificationSound=()=>out.in({'type':'playSound'})
    chatRoom.on('goConversations',e=>{
        this.goConversationList()
    })
    update()
    addEventListener('offline',update)
    addEventListener('online',update)
    return chatRoom
    function update(){
        chatRoom.connectionStatus=navigator.onLine?'online':'offline'
    }
}
