import compile from '../compile.js'
import{dom}from '/lib/core.static.js'
function createSingleMessageNode(ui,message){
    let
        n=dom.p(),
        p=(async()=>{
            let a=await(ui.users[message.fromUser]).finalA
            let span=await createSpan(message)
            dom(n,a,': ',span.span)
            ui.syncInnerMessageDivScroll()
            await span.promise
            ui.syncInnerMessageDivScroll()
        })()
    return{n,p}
}
async function createSpan(message){
    let span=dom.span(
        {title:(new Date(message.timestamp)).toLocaleString()},
        await compile(message.message)
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
export default createSingleMessageNode
