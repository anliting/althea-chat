(async()=>{
    let[
        EventEmmiter,
        createMessageDiv,
        createSingleMessageDiv,
        createSendDiv,
    ]=await Promise.all([
        module.repository.althea.EventEmmiter,
        module.shareImport('Ui/createMessageDiv.js'),
        module.shareImport('Ui/createSingleMessageNode.js'),
        module.shareImport('Ui/createSendDiv.js'),
    ])
    function Ui(currentUser,target){
        this._currentUser=currentUser
        this._target=target
        this.node=createDiv(this)
    }
    Object.setPrototypeOf(Ui.prototype,EventEmmiter.prototype)
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
    async function uiAddMessages(messages,mode){
        let[userA,userB]=await Promise.all([
            this._currentUser,
            this._target,
        ])
        await Promise.all([userA,userB].map(u=>u.load('nickname')))
        if(mode=='prepend'){
            messages=messages.slice()
            messages.reverse()
            messages.map(message=>
                this._topDiv.after(createSingleMessageDiv(
                    this,
                    userA,
                    userB,
                    message
                ))
            )
        }else if(mode=='append')
            messages.map(message=>
                this._innerMessageDiv.appendChild(createSingleMessageDiv(
                    this,
                    userA,
                    userB,
                    message
                ))
            )
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
    function createDiv(ui){
        let div=document.createElement('div')
        div.className='chat'
        div.appendChild(ui.messageDiv=
            createMessageDiv(ui)
        )
        div.appendChild(ui.sendDiv=createSendDiv(ui))
        return div
    }
    return Ui
})()
