(async()=>{
    let[
        compile,
    ]=await Promise.all([
        module.shareImport('createSingleMessageDiv/compile.js'),
    ])
    return createSingleMessageDiv
    function createSingleMessageDiv(ui,userA,userB,message){
        let div=document.createElement('div')
        ;(async()=>{
            let a=await(message.fromUser==userA.id?userA:userB).finalA
            let span=createSpan(message)
            div.appendChild(a)
            div.appendChild(document.createTextNode(': '))
            div.appendChild(span.span)
            ui.syncInnerMessageDivScroll()
            await span.promise
            ui.syncInnerMessageDivScroll()
        })()
        return div
    }
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
})()
