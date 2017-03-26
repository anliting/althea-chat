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
            dom(n,a,': ',span.span)
            ui.syncInnerMessageDivScroll()
            await span.promise
            ui.syncInnerMessageDivScroll()
        })
    }
    function createSpan(message){
        let span=dom.span(
            {title:message.timestamp},
            compile(message.message)
        )
        return{
            span,
            promise:Promise.all(
                Array.from(span.getElementsByTagName('img')).map(img=>
                    new Promise((rs,rj)=>{
                        img.addEventListener('load',rs)
                        img.addEventListener('error',rs)
                    })
                )
            )
        }
    }
})()
