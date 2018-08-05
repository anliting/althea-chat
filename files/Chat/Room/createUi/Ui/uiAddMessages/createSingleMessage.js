import compile from '../compile.js'
import{doe}from '/lib/core.static.js'
function createSingleMessageNode(ui,message){
    let
        n=doe.p(),
        p=(async()=>{
            let a=await(ui.users[message.fromUser]).finalA
            let span=await createSpan(message)
            doe(n,a,': ',span.span)
            ui.syncInnerMessageDivScroll()
            await span.promise
            ui.syncInnerMessageDivScroll()
        })()
    return{n,p}
}
async function createSpan(message){
    let span=doe.span(
        {title:(new Date(message.timestamp)).toLocaleString()},
        ...await compile(message.message)
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
