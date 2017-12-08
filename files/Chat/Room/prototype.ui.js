import Ui from './Ui.js'
let bind=[
    'colorScheme',
    'notificationSound',
    'pressEnterToSend',
    'showSendButton',
    'showTexButton',
]
export default{get(){
    if(this._ui)
        return this._ui
    if(this.getSetting('colorScheme')==undefined)
        this.setSetting('colorScheme','default')
    let ui=new Ui
    ui.queryOlder=()=>this._getMessages('before')
    ui.sendMessage=m=>this._sendMessage(m)
    ui.playNotificationSound=this.playNotificationSound
    ui.imageUploader=this._imageUploader
    ui.connectionStatus=this._connectionStatus
    ui.goConversations=()=>{
        this.emit('goConversations')
    }
    bind.forEach(k=>{
        let v=this.getSetting(k)
        if(v!==undefined)
            ui[k]=v
    })
    ui.set=k=>bind.includes(k)&&this.setSetting(k,ui[k])
    ;(async()=>{
        let user=await this._currentUser
        await user.load('nickname')
        ui.currentUserNickname=user.nickname
    })()
    return this._ui=ui
}}
