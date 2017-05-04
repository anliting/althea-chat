(async()=>{
    let Ui=await module.shareImport('Ui.js')
    return{get(){
        if(this._ui)
            return this._ui
        let ui=new Ui(
            this._currentUser,
            this._target
        )
        ui.queryOlder=()=>this._getMessages('before')
        ui.sendMessage=m=>this._sendMessage(m)
        ui.getSetting=this.getSetting
        ui.setSetting=(k,v)=>{
            this.setSetting(k,v)
            if(k=='colorScheme')
                ui.changeStyle(v)
        }
        ui.playNotificationSound=this.playNotificationSound
        ui.imageUploader=this._imageUploader
        ui.connectionStatus=this._connectionStatus
        if(this.getSetting('colorScheme')==undefined)
            this.setSetting('colorScheme','default')
        ui.changeStyle(this.getSetting('colorScheme'))
        return this._ui=ui
    }}
})()
