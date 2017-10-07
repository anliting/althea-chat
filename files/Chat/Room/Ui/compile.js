/*
    To support the math typesetting function, one may
        . implement it from scratch,
        . use the KaTeX library, or
        . use the MathJax library.
    2017-05-05:
        I chosed the KaTeX approach, because I don't want to implement it
        myself, and with KaTeX, I know how to solve the problem in a much
        proper way by the comparison of MathJax.
*/
import dom from '/lib/tools/dom.js'
import uri from '/lib/tools/uri.js'
import loadKatex from './compile/loadKatex.js'
let whitelist={
    a:{
        href:/^https?:\/\//,
    },
    blockquote:{
        style:0,
    },
    br:{},
    code:{
        style:0,
    },
    div:{
        style:0,
    },
    iframe:{
        width:0,
        height:0,
        src:/^https:\/\/www\.youtube\.com\/embed\//,
        frameborder:0,
        allowfullscreen:0,
    },
    img:{
        src:/^img\//,
        style:0,
    },
    p:{
        style:0,
    },
    pre:{
        style:0,
    },
    q:{
        style:0,
    },
    span:{
        class:0,
        style:0,
    },
}
async function compile(s){
    let body=(new DOMParser).parseFromString(
        `<!docytpe html><title>0</title><body>${s}`,'text/html'
    ).body
    await traverse(body)
    return[...body.childNodes]
}
async function traverse(m){
    await Promise.all([...m.childNodes].map(async n=>{
        if(!test(n))
            return m.removeChild(n)
        if(n.nodeType==1){
            if(n.className=='tex'){
                let s=n.textContent
                n.textContent=''
                await loadKatex()
                try{
                    katex.render(s,n)
                }catch(e){
                    n.textContent=s
                }
            }else
                traverse(n)
        }else if(n.nodeType==3){
            for(let o of renderUrl(n.wholeText))
                m.insertBefore(o,n)
            m.removeChild(n)
        }
    }))
}
function test(n){
    if(n.nodeType==1){
        let name=n.nodeName.toLowerCase()
        if(!(name in whitelist))
            return
        let nodeTest=whitelist[name]
        return[...n.attributes].every(a=>{
            if(!(a.name in nodeTest))
                return 
            let attrTest=nodeTest[a.name]
            if(attrTest==0)
                return true
            return attrTest.test(a.value)
        })
    }else if(n.nodeType==3)
        return 1
}
function*renderUrl(s){
    for(let m;m=uri.matchAbsoluteUri(s);){
        yield dom.tn(s.substring(0,m.index))
        yield /^https?/.test(m[0])?
            dom.a(decodeURI(m[0]),{href:m[0]})
        :
            dom.tn(m[0])
        s=s.substring(m.index+m[0].length)
    }
    yield dom.tn(s)
}
export default compile
