function loadInterface(o){
    Object.defineProperty(o,'connectionStatus',{set(val){
        this._connectionStatus=val
        this._statusNode.textContent=val=='online'?'':'offline'
    }})
    Object.defineProperty(o,'currentUserNickname',{set(val){
        this.textarea.placeholder=`${val}: `
    }})
    o.focus=function(){
        this.textarea.focus()
    }
    Object.defineProperty(o,'showSendButton',{set(val){
        this._changeButtonDisplay(
            '_bottomSendButton',
            val
        )
        this._showSendButton=val
    },get(){
        return this._showSendButton
    }})
    Object.defineProperty(o,'showTexButton',{set(val){
        this._changeButtonDisplay(
            '_bottomTexButton',
            this._mode=='html'&&val
        )
        this._showTexButton=val
    },get(){
        return this._showTexButton
    }})
}
export default loadInterface
