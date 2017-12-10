import Ui from './Ui.js'
let pull=[
    'colorScheme',
    'notificationSound',
    'pressEnterToSend',
    'showSendButton',
    'showTexButton',
]
export default function(){
    let ui=new Ui
    Object.assign(ui,this.settings)
    ui.set=k=>{
        if(pull.includes(k)){
            this.settings[k]=ui[k]
            this.set('settings')
        }
    }
    ui.queryOlder=()=>this._getMessages('before')
    ui.sendMessage=m=>this._sendMessage(m)
    ui.playNotificationSound=this.playNotificationSound
    ui.imageUploader=this._imageUploader
    ui.connectionStatus=this._connectionStatus
    ui.goConversations=()=>{
        this.emit('goConversations')
    }
    ;(async()=>{
        let user=await this._currentUser
        await user.load('nickname')
        ui.currentUserNickname=user.nickname
    })()
    return ui
}
