(async()=>{
    let[
        compile,
        dom,
    ]=await Promise.all([
        module.shareImport('createSingleMessage/compile.js'),
        module.repository.althea.dom,
    ])
    return createSingleMessageNode
    function createSingleMessageNode(ui,userA,userB,message){
        return dom.p(async n=>{
            let a=await(message.fromUser==userA.id?userA:userB).finalA
            let span=createSpan(message)
            n.appendChild(a)
            n.appendChild(document.createTextNode(': '))
            n.appendChild(span.span)
            ui.syncInnerMessageDivScroll()
            await span.promise
            ui.syncInnerMessageDivScroll()
        })
    }
    function createSpan(message){
        let
            span=dom.span()
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
