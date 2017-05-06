;(async()=>{
    let[
        compile,
        dom,
    ]=await Promise.all([
        module.repository.compile,
        module.repository.althea.dom,
    ])
    return createSingleMessageNode
    function createSingleMessageNode(ui,userA,userB,message){
        let
            n=dom('p'),
            p=(async()=>{
                let a=await(message.fromUser==userA.id?userA:userB).finalA
                let span=createSpan(message)
                dom(n,a,': ',span.span)
                ui.syncInnerMessageDivScroll()
                await span.promise
                ui.syncInnerMessageDivScroll()
            })()
        return{n,p}
    }
    function createSpan(message){
        let span=dom('span',
            {title:(new Date(message.timestamp)).toLocaleString()},
            compile(message.message)
        )
        return{
            span,
            promise:Promise.all(
                [...span.getElementsByTagName('img')].map(img=>
                    new Promise((rs,rj)=>{
                        img.addEventListener('load',rs)
                        img.addEventListener('error',rs)
                    })
                )
            )
        }
    }
})()
