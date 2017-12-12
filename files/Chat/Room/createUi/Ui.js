import{dom,html}from        '/lib/core.static.js'
import compile from         './Ui/compile.js'
import createMessage from   './Ui/createMessage.js'
import createBottom from    './Ui/createBottom.js'
import StyleManager from    './Ui/StyleManager.js'
import colorScheme from     './Ui/colorScheme.js'
import uiAddMessages from   './Ui/uiAddMessages.js'
import loadInterface from   './Ui/loadInterface.js'
import{DecalarativeSet}from 'https://gitcdn.link/cdn/anliting/simple.js/55124630741399dd0fcbee2f0396642a428cdd24/src/simple.static.js'
function Ui(){
    this._styleManager=new StyleManager
    this._mode='plainText'
    this.users={}
    this.out=new DecalarativeSet
    this._changeStyle(this._colorScheme)
    this.node=dom.div(
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
    this._styleManager.forEach=s=>{
        let doc={
            type:'styleIdContent',
            id:s.id,
            content:s.content,
        }
        this.out.in(doc)
        return()=>{
            this.out.out(doc)
        }
    }
    this.out.in({
        type:'body',
        node:this.node,
    })
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
    dom(this._previewNode,
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
Ui.prototype._colorScheme='default'
Ui.prototype._changeStyle=function(id){
    if(this._style!=undefined)
        this._styleManager.remove(this._style)
    this._style=this._styleManager.insert({
        id,
        content:colorScheme[id].style,
    })
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
loadInterface(Ui.prototype)
export default Ui
