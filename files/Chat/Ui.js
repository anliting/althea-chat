(async()=>{
    let[
        createMessage,
        createSingleMessageDiv,
        createBottom,
    ]=await Promise.all([
        module.shareImport('Ui/createMessage.js'),
        module.shareImport('Ui/createSingleMessageNode.js'),
        module.shareImport('Ui/createBottom.js'),
    ])
    function Ui(currentUser,target){
        this._currentUser=currentUser
        this._target=target
        this.node=createDiv(this)
    }
    Ui.prototype.beAppended=function(){
        this.updateMessageDivHeight()
    }
    Ui.prototype.focus=function(){
        this.textarea.focus()
    }
    Ui.prototype.updateMessageDivHeight=function(){
        this.messageDiv.style.height=`calc(100% - 8px - ${
            this.sendDiv.clientHeight+2
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
    async function uiAddMessages(messages,mode){
        let[userA,userB]=await Promise.all([
            this._currentUser,
            this._target,
        ])
        await Promise.all([userA,userB].map(u=>u.load('nickname')))
        let insert
        if(mode=='prepend'){
            messages=messages.slice()
            messages.reverse()
            insert=div=>this._topDiv.after(div)
        }else if(mode=='append'){
            insert=div=>this._innerMessageDiv.appendChild(div)
        }
        messages.map(message=>
            insert(createSingleMessageDiv(this,userA,userB,message))
        )
        this.syncInnerMessageDivScroll()
    }
    function createDiv(ui){
        let div=document.createElement('div')
        div.className='chat'
        div.appendChild(ui.messageDiv=
            createMessage(ui)
        )
        div.appendChild(ui.sendDiv=createBottom(ui))
        return div
    }
    return Ui
})()
