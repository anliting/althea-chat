import{ImageUploader}from '/lib/core.static.js'
import Chat from '../../../Chat.js'
async function getTwoMenConversation(site,target){
    return site.send({
        function:'getTwoMenConversation',
        target:(await target).id,
    })
}
export default function(out,target){
    let chatRoom=new Chat.Room(
        async d=>this._site.send(d),
        ()=>this._site.createSession(),
        async i=>this._site.getUser(i),
        new ImageUploader({
            post:a=>this._site.post(a),
            send:a=>this._site.send(a),
        }),
        getTwoMenConversation(this._site,target),
        this._site.currentUser,
        target
    )
    chatRoom.settings=JSON.parse(JSON.stringify(this._settings))
    chatRoom.set=k=>{
        if(k=='settings'){
            for(let k in chatRoom.settings)
                this._setSetting(k,chatRoom.settings[k])
        }
    }
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
