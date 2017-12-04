function loadSettings(){
    this._changeButtonDisplay(
        '_bottomTexButton',
        this._mode=='html'&&this._showTexButton
    )
    this._changeButtonDisplay(
        '_bottomSendButton',
        this._showSendButton
    )
}
export default loadSettings
