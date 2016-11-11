Promise.all([
    module.shareImport('ChatView/createMessageDiv.js'),
    module.repository.althea.ImageUploader,
]).then(modules=>{
let
    createMessageDiv=   modules[0],
    ImageUploader=      modules[1]
function ChatView(site,chat){
    this._site=site
    this.chat=chat
    this._imageUploader=new ImageUploader(this._site)
    this.domElement=createDiv(chat,this)
    this._imageUploader.on('upload',promise=>{
        promise.then(imageIds=>{
            imageIds.forEach(id=>{
                this.textarea.value+=
                    `<img src=img/${id}c800x600.jpg>\n`
            })
            this.updateTextareaHeight()
        })
    })
}
ChatView.prototype.beAppended=function(){
    this.updateMessageDivHeight()
}
ChatView.prototype.focus=function(){
    this.textarea.focus()
}
ChatView.prototype.updateMessageDivHeight=function(){
    this.messageDiv.style.height=`calc(100% - 8px - ${
        this.sendDiv.clientHeight+2
    }px)`
}
ChatView.prototype.updateTextareaHeight=function(){
    let rows=Math.min(4,this.textarea.value.split('\n').length)
    this.textarea.rows=rows
    this.updateMessageDivHeight()
    this.syncInnerMessageDivScroll()
}
function createDiv(chat,chatView){
    let div=document.createElement('div')
    div.className='chat'
    div.appendChild(chatView.messageDiv=createMessageDiv(chat,chatView))
    div.appendChild(chatView.sendDiv=createSendDiv(chat,chatView))
    return div
}
function createSendDiv(chat,chatView){
    let div=document.createElement('div')
    div.className='send'
    div.appendChild(chatView.textarea=createTextarea())
    div.appendChild(chatView._imageUploader.view)
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
                    chat.sendMessage(textarea.value)
                    textarea.value=''
                }
                return
            }
        })
        textarea.addEventListener('input',e=>{
            chatView.updateTextareaHeight()
        })
        chat.currentUser.then(user=>
            user.load('nickname')
        ).then(user=>{
            textarea.placeholder=`${user.nickname}: `
        })
        return textarea
    }
}
return ChatView
})
