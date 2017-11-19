import Ui from './Ui.js'
export default{get(){
    if(this._ui)
        return this._ui
    if(this.getSetting('colorScheme')==undefined)
        this.setSetting('colorScheme','default')
    if(this.getSetting('notificationSound')==undefined)
        this.setSetting('notificationSound',0)
    if(this.getSetting('pressEnterToSend')==undefined)
        this.setSetting('pressEnterToSend',false)
    if(this.getSetting('showTexButton')==undefined)
        this.setSetting('showTexButton',false)
    if(this.getSetting('showSendButton')==undefined)
        this.setSetting('showSendButton',true)
    let ui=new Ui(this._currentUser,this.getSetting,(k,v)=>{
        this.setSetting(k,v)
        if(k=='colorScheme')
            ui.changeStyle(v)
    })
    ui.queryOlder=()=>this._getMessages('before')
    ui.sendMessage=m=>this._sendMessage(m)
    ui.playNotificationSound=this.playNotificationSound
    ui.imageUploader=this._imageUploader
    ui.connectionStatus=this._connectionStatus
    ui.changeStyle(this.getSetting('colorScheme'))
    ui.goConversations=()=>{
        this.emit('goConversations')
    }
    return this._ui=ui
}}
