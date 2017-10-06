function loadSettings(){
    this._changeButtonDisplay(
        '_bottomTexButton',
        this.getSetting('showTexButton')
    )
    this._changeButtonDisplay(
        '_bottomSendButton',
        this.getSetting('showSendButton')
    )
}
export default loadSettings
