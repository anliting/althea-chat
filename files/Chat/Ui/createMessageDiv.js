Promise.all([
    module.shareImport('compile.js')
]).then(modules=>{
let
    compile=modules[0]
return createMessageDiv
function createMessageDiv(chat,chatView){
    let div=document.createElement('div')
    div.className='message'
    div.appendChild(createInnerMessageDiv())
    return div
    function createInnerMessageDiv(){
        let div=document.createElement('div')
        div.className='innerMessage'
        chatView.atBottom=Math.abs(
            div.scrollTop+div.clientHeight-div.scrollHeight
        )<=1
        div.addEventListener('scroll',()=>{
            chatView.atBottom=Math.abs(
                div.scrollTop+div.clientHeight-div.scrollHeight
            )<=1
        })
        chatView.syncInnerMessageDivScroll=syncDivScroll
        chat.on('append',messages=>{
            chat.readyToRenderMessages.then(vals=>{
                messages.forEach(message=>{
                    div.appendChild(createSingleMessageDiv(
                        vals[0],
                        vals[1],
                        message
                    ))
                })
                syncDivScroll()
            })
        })
        return div
        function createSingleMessageDiv(userA,userB,message){
            let div=document.createElement('div')
            ;(message.fromUser==userA.id?userA:userB).finalA.then(a=>{
                let span=createSpan(message)
                div.appendChild(a)
                div.appendChild(document.createTextNode(': '))
                div.appendChild(span.span)
                span.promise.then(()=>{
                    syncDivScroll()
                })
                syncDivScroll()
            })
            return div
            function createSpan(message){
                let
                    span=document.createElement('span'),
                    promises=[]
                span.title=message.timestamp
                span.innerHTML=compile(message.message)
                let collection=span.getElementsByTagName('img')
                for(let i=0;i<collection.length;i++){
                    let img=collection[i]
                    promises.push(new Promise((rs,rj)=>{
                        img.addEventListener('load',rs)
                        img.addEventListener('error',rs)
                    }))
                }
                return{
                    span,
                    promise:Promise.all(promises)
                }
            }
        }
        function syncDivScroll(){
            if(chatView.atBottom)
                div.scrollTop=div.scrollHeight
        }
    }
}
})
