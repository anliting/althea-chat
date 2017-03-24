let
    emptyRegex=/(?:)/,
    whitelist={
        a:{},
        br:{},
        code:{
            style:emptyRegex,
        },
        div:{
            style:emptyRegex,
        },
        iframe:{
            width:emptyRegex,
            height:emptyRegex,
            src:/^https:\/\/www\.youtube\.com\/embed\//,
            frameborder:emptyRegex,
            allowfullscreen:emptyRegex,
        },
        img:{
            src:/^img\//,
            style:emptyRegex,
        },
        p:{
            style:emptyRegex,
        },
        pre:{
            style:emptyRegex,
        },
        span:{
            style:emptyRegex,
        },
    }
;(async()=>{
    let[
        html,
        url,
    ]=await Promise.all([
        module.repository.althea.html,
        module.repository.althea.url,
    ])
    // the newer and safer compile
    function compile0(s){
/*
to-do: compile url to a
let m=url.match(s)
if(!(
    m&&(
        m.scheme=='http'||
        m.scheme=='https'
    )
))
    return
*/
        let body=(new DOMParser).parseFromString(
            `<!docytpe html><title>0</title><body>${s}`,'text/html'
        ).body
        traverse(body)
        return body
        function traverse(m){
            Array.from(m.childNodes).map(n=>{
                if(!test(n))
                    return m.removeChild(n)
                if(n.nodeType==1)
                    traverse(n)
            })
        }
        function test(n){
            if(n.nodeType==1){
                let name=n.nodeName.toLowerCase()
                if(!(name in whitelist))
                    return
                let nodeTest=whitelist[name]
                return Array.from(n.attributes).every(a=>{
                    if(!(a.name in nodeTest))
                        return 
                    let attrTest=nodeTest[a.name]
                    return attrTest.test(a.value)
                })
            }
            if(n.nodeType==3)
                return 1
        }
    }
    return compile0
})()
