(async()=>{
    let[
        EventEmmiter,
        ImageUploader,
        dom,
        createMessageDiv,
        createSingleMessageDiv,
    ]=await Promise.all([
        module.repository.althea.EventEmmiter,
        module.repository.althea.ImageUploader,
        module.repository.althea.dom,
        module.shareImport('Ui/createMessageDiv.js'),
        module.shareImport('Ui/createSingleMessageDiv.js'),
    ])
    function Ui(site,chat){
        this._site=site
        this._chat=chat
        this._imageUploader=new ImageUploader(this._site)
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
        let rows=Math.min(4,this.textarea.value.split('\n').length)
        this.textarea.rows=rows
        this.updateMessageDivHeight()
        this.syncInnerMessageDivScroll()
    }
    Ui.prototype.prepend=async function(messages){
        let ui=this,chat=this._chat
        let[userA,userB]=await chat._readyToRenderMessages
        messages=messages.slice()
        messages.reverse()
        messages.map(message=>
            this._topDiv.after(createSingleMessageDiv(
                ui,
                userA,
                userB,
                message
            ))
        )
        this.syncInnerMessageDivScroll()
    }
    Ui.prototype.append=async function(messages){
        let ui=this,chat=this._chat
        let[userA,userB]=await chat._readyToRenderMessages
        messages.map(message=>
            this._innerMessageDiv.appendChild(createSingleMessageDiv(
                ui,
                userA,
                userB,
                message
            ))
        )
        this.syncInnerMessageDivScroll()
    }
    Ui.prototype._queryOlder=function(){
        this.queryOlder()
    }
    function createDiv(ui){
        let chat=ui._chat
        let div=document.createElement('div')
        div.className='chat'
        div.appendChild(ui.messageDiv=
            createMessageDiv(ui)
        )
        div.appendChild(ui.sendDiv=createSendDiv(chat,ui))
        return div
    }
    function createSendDiv(chat,ui){
        let div=document.createElement('div')
        div.className='send'
        div.appendChild(ui.textarea=createTextarea())
        setupFileButton(ui)
        div.appendChild(ui._fileButton.n)
        return div
        function createTextarea(){
            let textarea=document.createElement('textarea')
            textarea.rows=1
            textarea.addEventListener('keydown',e=>{
                // if only enter
                if(!e.ctrlKey&&!e.shiftKey&&e.keyCode==13){
                    e.stopPropagation()
                    e.preventDefault()
                    if(textarea.value!=''){
                        ui.sendMessage(textarea.value)
                        textarea.value=''
                    }
                    return
                }
            })
            textarea.addEventListener('input',e=>{
                ui.updateTextareaHeight()
            })
            ;(async()=>{
                let user=await chat._currentUser
                await user.load('nickname')
                textarea.placeholder=`${user.nickname}: `
            })()
            return textarea
        }
        function setupFileButton(ui){
            ui._fileButton=dom.createFileButton('Image')
            ui._fileButton.on('file',async a=>{
                ui._fileButton.n.disabled=true
                let imageIds=await ui._imageUploader.uploadImages(a)
                imageIds.map(id=>{
                    ui.textarea.value+=
                        `<img src=img/${id}c800x600.jpg>\n`
                })
                ui.updateTextareaHeight()
                ui._fileButton.n.disabled=false
            })
        }
    }
    return Ui
})()
