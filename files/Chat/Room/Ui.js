(async()=>{
    let[
        createMessage,
        createSingleMessage,
        createBottom,
        dom,
    ]=await Promise.all([
        module.shareImport('Ui/createMessage.js'),
        module.shareImport('Ui/createSingleMessage.js'),
        module.shareImport('Ui/createBottom.js'),
        module.repository.althea.dom,
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
    Object.defineProperty(Ui.prototype,'connectionStatus',{set(val){
        this._connectionStatus=val
        if(localStorage.hacker)
            this._statusNode.textContent=val=='online'?'':'offline'
    }})
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
            insert(createSingleMessage(this,userA,userB,message))
        )
        this.syncInnerMessageDivScroll()
    }
    function createDiv(ui){
        return dom.div(n=>{
            n.className='chat'
            n.appendChild(ui.messageDiv=
                createMessage(ui)
            )
            n.appendChild(ui.bottomDiv=createBottom(ui))
        })
    }
    return Ui
})()
