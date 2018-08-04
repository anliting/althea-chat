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
import{doe,uri}from '/lib/core.static.js'
import loadKatex from './compile/loadKatex.js'
let whitelist={
    a:[
        {
            href:/^img\//,
        },
        {
            href:/^https?:\/\//,
        },
    ],
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
    script:{
        type:/^tex$/,
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
            if(n.nodeName.toLowerCase()=='script'&&n.type=='tex'){
                await loadKatex()
                let o=document.createElement('span')
                try{
                    katex.render(n.textContent,o)
                }catch(e){
                    o.style.fontFamily='monospace'
                    o.title=e
                    o.textContent=n.textContent
                }
                m.replaceChild(o,n)
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
        return nodeTest instanceof Array?nodeTest.some(test):test(nodeTest)
        function test(nodeTest){
            return[...n.attributes].every(a=>{
                if(!(a.name in nodeTest))
                    return 
                let attrTest=nodeTest[a.name]
                return attrTest==0||attrTest.test(a.value)
            })
        }
    }else if(n.nodeType==3)
        return 1
}
function*renderUrl(s){
    for(let m;m=uri.matchAbsoluteUri(s);){
        yield document.createTextNode(s.substring(0,m.index))
        yield /^https?/.test(m[0])?
            doe.a(decodeURI(m[0]),{href:m[0]})
        :
            document.createTextNode(m[0])
        s=s.substring(m.index+m[0].length)
    }
    yield document.createTextNode(s)
}
export default compile
