import{doe,html}from        '/lib/core.static.js'
import compile from         './Ui/compile.js'
import createMessage from   './Ui/createMessage.js'
import createBottom from    './Ui/createBottom.js'
import colorScheme from     './Ui/colorScheme.js'
import uiAddMessages from   './Ui/uiAddMessages.js'
import loadInterface from   './Ui/loadInterface.js'
import{DecalarativeSet}from 'https://gitcdn.link/cdn/anliting/simple.js/09b9cd311f438c07fd1ac0ead044aed97158faf3/src/simple.static.js'
function Ui(){
    this._mode='plainText'
    this.users={}
    this.out=new DecalarativeSet
    this.node=doe.div(
        {className:'chat'},
        this.messageDiv=createMessage(this),
        this.bottomDiv=createBottom(this),
        ()=>{
            this._changeButtonDisplay(
                '_bottomTexButton',
                this._mode=='html'&&this._showTexButton
            )
            this._changeButtonDisplay(
                '_bottomSendButton',
                this._showSendButton
            )
        },
    )
    this.out.in({
        type:'body',
        node:this.node,
    })
    this.colorScheme='default'
}
Ui.prototype._push=function(){
    this._settingsButton.disabled=true
}
Ui.prototype._pop=function(){
    this._settingsButton.disabled=false
}
Ui.prototype._setMode=function(mode){
    this._mode=mode
    this._updatePreview()
    this._changeButtonDisplay(
        '_bottomTexButton',
        this._mode=='html'&&this._showTexButton
    )
    this._fileButton.n.style.display=this._mode=='html'?'':'none'
}
Ui.prototype._changeButtonDisplay=function(button,display){
    this[button].style.display=display?'':'none'
}
Ui.prototype._changeTextareaValue=function(v){
    this.textarea.value=v
    this._updatePreview()
    this.updateTextareaHeight()
}
Ui.prototype._updatePreview=async function(){
    doe(this._previewNode,
        {innerHTML:''},
        await compile(this._mode=='html'?
            this.textarea.value
        :
            html.encodeText(this.textarea.value)
        )
    )
    this.syncInnerMessageDivScroll()
}
Ui.prototype._send=function(){
    if(this.textarea.value=='')
        return
    this.sendMessage(this._mode=='html'?
        this.textarea.value
    :
        html.encodeText(this.textarea.value)
    )
    this.textarea.value=''
    this._updatePreview()
}
Ui.prototype._queryOlder=function(){
    this.queryOlder()
}
Ui.prototype._goConversations=function(){
    if(this.goConversations)
        this.goConversations()
}
Ui.prototype._changeStyle=function(id){
}
Ui.prototype._showSendButton=true
Ui.prototype._showTexButton=false
Ui.prototype._playNotificationSound=function(){
    this.out.in({'type':'playSound'})
}
Ui.prototype.notificationSound=0
Ui.prototype.pressEnterToSend=false
Ui.prototype.updateTextareaHeight=function(){
    let rows=Math.max(2,Math.min(4,
        this.textarea.value.split('\n').length
    ))
    this.textarea.rows=rows
    this.syncInnerMessageDivScroll()
}
Ui.prototype.prepend=async function(messages){
    return uiAddMessages.call(this,messages,'prepend')
}
Ui.prototype.append=async function(messages){
    return uiAddMessages.call(this,messages,'append')
}
Object.defineProperty(Ui.prototype,'colorScheme',{set(id){
    this._style&&this.out.out(this._style)
    this.out.in(this._style={
        type:'styleIdContent',
        id,
        content:colorScheme[id].style,
    })
    this._colorScheme=id
},get(){
    return this._colorScheme
}})
loadInterface(Ui.prototype)
export default Ui
