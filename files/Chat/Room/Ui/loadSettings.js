function loadSettings(){
    this._changeButtonDisplay(
        '_bottomTexButton',
        this._mode=='html'&&this.getSetting('showTexButton')
    )
    this._changeButtonDisplay(
        '_bottomSendButton',
        this.getSetting('showSendButton')
    )
}
export default loadSettings
