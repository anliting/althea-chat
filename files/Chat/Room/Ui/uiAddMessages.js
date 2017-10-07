import createSingleMessage from './uiAddMessages/createSingleMessage.js'
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
export default uiAddMessages
