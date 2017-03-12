(async()=>{
    let
        compile=await module.shareImport('createMessageDiv/compile.js')
    return createMessageDiv
    function createMessageDiv(chatView){
        let div=document.createElement('div')
        div.className='message'
        div.appendChild(createInnerMessageDiv(chatView))
        return div
    }
    function createInnerMessageDiv(chatView){
        let chat=chatView._chat
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
        chat.on('append',async messages=>{
            let[userA,userB]=await chat.readyToRenderMessages
            messages.map(message=>
                div.appendChild(createSingleMessageDiv(
                    userA,
                    userB,
                    message
                ))
            )
            syncDivScroll()
        })
        return div
        function createSingleMessageDiv(userA,userB,message){
            let div=document.createElement('div')
            ;(async()=>{
                let a=await(message.fromUser==userA.id?userA:userB).finalA
                let span=createSpan(message)
                div.appendChild(a)
                div.appendChild(document.createTextNode(': '))
                div.appendChild(span.span)
                syncDivScroll()
                await span.promise
                syncDivScroll()
            })()
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
})()
