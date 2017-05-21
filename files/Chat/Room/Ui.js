module.repository.compile=module.shareImport('Ui/compile.js')
;(async()=>{
    let[
        dom,
        compile,
        createMessage,
        createSingleMessage,
        createBottom,
        StyleManager,
        colorScheme,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.repository.compile,
        module.shareImport('Ui/createMessage.js'),
        module.shareImport('Ui/createSingleMessage.js'),
        module.shareImport('Ui/createBottom.js'),
        module.shareImport('Ui/StyleManager.js'),
        module.shareImport('Ui/colorScheme.js'),
    ])
    function Ui(currentUser,getSetting,setSetting){
        this._currentUser=currentUser
        this._styleManager=new StyleManager
        this.getSetting=getSetting
        this.setSetting=setSetting
        this.users={}
        this.node=dom('div',
            {className:'chat'},
            this.messageDiv=createMessage(this),
            this.bottomDiv=createBottom(this)
        )
        this._changeButtonDisplay(
            '_bottomTexButton',
            this.getSetting('showTexButton')
        )
        this._changeButtonDisplay(
            '_bottomSendButton',
            this.getSetting('showSendButton')
        )
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
            await compile(this.textarea.value)
        )
        this.syncInnerMessageDivScroll()
    }
    Ui.prototype._send=function(){
        if(this.textarea.value=='')
            return
        this.sendMessage(this.textarea.value)
        this.textarea.value=''
        this._updatePreview()
    }
    Ui.prototype.beAppended=function(){
        this.updateMessageDivHeight()
    }
    Ui.prototype.focus=function(){
        this.textarea.focus()
    }
    Ui.prototype.updateMessageDivHeight=function(){
        this.messageDiv.style.height=`calc(100% - 8px - ${
            this.bottomDiv.clientHeight+2
        }px)`
    }
    Ui.prototype.updateTextareaHeight=function(){
        let rows=Math.max(2,Math.min(4,
            this.textarea.value.split('\n').length
        ))
        this.textarea.rows=rows
        this.updateMessageDivHeight()
        this.syncInnerMessageDivScroll()
    }
    Ui.prototype.prepend=async function(messages){
        return uiAddMessages.call(this,messages,'prepend')
    }
    Ui.prototype.append=async function(messages){
        return uiAddMessages.call(this,messages,'append')
    }
    Ui.prototype._queryOlder=function(){
        this.queryOlder()
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
    async function uiAddMessages(messages,mode){
        let insert
        if(mode=='prepend'){
            messages=messages.slice()
            messages.reverse()
            insert=div=>this._topDiv.after(div)
        }else if(mode=='append'){
            insert=div=>this._previewNode.before(div)
        }
        messages.map(message=>
            insert(createSingleMessage(this,message).n)
        )
        this.syncInnerMessageDivScroll()
    }
    return Ui
})()
