import {dom,html}from       '/lib/core.static.js'
import compile from         './Ui/compile.js'
import createMessage from   './Ui/createMessage.js'
import createBottom from    './Ui/createBottom.js'
import StyleManager from    './Ui/StyleManager.js'
import colorScheme from     './Ui/colorScheme.js'
import loadSettings from    './Ui/loadSettings.js'
import uiAddMessages from   './Ui/uiAddMessages.js'
function Ui(currentUser,getSetting,setSetting){
    this._currentUser=currentUser
    this._styleManager=new StyleManager
    this._mode='plainText'
    this.getSetting=getSetting
    this.setSetting=setSetting
    this.users={}
    this.node=dom.div(
        {className:'chat'},
        this.messageDiv=createMessage(this),
        this.bottomDiv=createBottom(this)
    )
    loadSettings.call(this)
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
        this._mode=='html'&&this.getSetting('showTexButton')
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
Ui.prototype.focus=function(){
    this.textarea.focus()
}
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
Ui.prototype.changeStyle=function(id){
    if(this._style!=undefined)
        this._styleManager.remove(this._style)
    this._style=this._styleManager.insert({
        id,
        content:colorScheme[id].style,
    })
}
Object.defineProperty(Ui.prototype,'style',{set(val){
    this._styleManager.forEach=val
},get(){
    return this._styleManager.forEach
}})
Object.defineProperty(Ui.prototype,'connectionStatus',{set(val){
    this._connectionStatus=val
    this._statusNode.textContent=val=='online'?'':'offline'
}})
export default Ui
