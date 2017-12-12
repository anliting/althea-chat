import{dom}from'/lib/core.static.js'
import Ui from './createUi/Ui.js'
let pull=[
    'colorScheme',
    'notificationSound',
    'pressEnterToSend',
    'showSendButton',
    'showTexButton',
]
export default function(){
    let ui=Object.assign(new Ui,this.settings,{
        set:k=>{
            if(pull.includes(k)){
                this.settings[k]=ui[k]
                this.set('settings')
            }
        },
        queryOlder:          ()=>this._getMessages('before'),
        sendMessage:         m=>this._sendMessage(m),
        imageUploader:       this._imageUploader,
        connectionStatus:    this._connectionStatus,
        goConversations:()=>{
            this.emit('goConversations')
        },
    })
    ;(async()=>{
        let user=await this._currentUser
        await user.load('nickname')
        ui.currentUserNickname=user.nickname
    })()
    ui.out.in({type:'style',node:dom.tn(this.style)})
    return ui
}
