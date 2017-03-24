let
    whitelist={
        a:{
            href:/^https?:\/\//,
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
        span:{
            style:0,
        },
    }
;(async()=>{
    let[
        dom,
        html,
        url,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.repository.althea.html,
        module.repository.althea.url,
    ])
    function compile(s){
        let body=(new DOMParser).parseFromString(
            `<!docytpe html><title>0</title><body>${s}`,'text/html'
        ).body
        traverse(body)
        return body
    }
    function traverse(m){
        Array.from(m.childNodes).map(n=>{
            if(!test(n))
                return m.removeChild(n)
            if(n.nodeType==1)
                traverse(n)
            else if(n.nodeType==3){
                Array.from(renderUrl(n.wholeText)).map(o=>
                    m.insertBefore(o,n)
                )
                m.removeChild(n)
            }
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
                if(attrTest==0)
                    return true
                return attrTest.test(a.value)
            })
        }
        if(n.nodeType==3)
            return 1
    }
    function*renderUrl(s){
        for(let match;match=url.match(s);){
            yield insertText(s.substring(0,match.index))
            if(/^https?$/.test(match.scheme))
                yield dom.a(match[0],a=>{
                    a.href=match.url
                })
            else
                yield insertText(s.substring(
                    match.index,match.index+match[0].length
                ))
            s=s.substring(match.index+match[0].length)
        }
        yield insertText(s)
        function insertText(s){
            return document.createTextNode(s)
        }
    }
    return compile
})()
