import{ImageUploader}from '/lib/core.static.js'
import Chat from '../../../Chat.js'
async function getTwoMenConversation(site,target){
    return site.send({
        function:'chat_getTwoMenConversation',
        target:(await target).id,
    })
}
export default function(target){
    let chatRoom=new Chat.Room(
        d=>this._site.send(d),
        ()=>this._site.createSession(),
        i=>this._site.getUser(i),
        new ImageUploader({
            post:a=>this._site.post(a),
            send:a=>this._site.send(a),
        }),
        getTwoMenConversation(this._site,target),
        this._site.currentUser
    )
    chatRoom.settings=JSON.parse(JSON.stringify(this._settings))
    chatRoom.set=k=>{
        if(k=='settings')
            this._setSetting(chatRoom.settings)
    }
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
