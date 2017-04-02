let whitelist={
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
        uri,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.repository.althea.uri,
    ])
    function compile(s){
        let body=(new DOMParser).parseFromString(
            `<!docytpe html><title>0</title><body>${s}`,'text/html'
        ).body
        traverse(body)
        return[...body.childNodes]
    }
    function traverse(m){
        [...m.childNodes].map(n=>{
            if(!test(n))
                return m.removeChild(n)
            if(n.nodeType==1)
                traverse(n)
            else if(n.nodeType==3){
                for(let o of renderUrl(n.wholeText))
                    m.insertBefore(o,n)
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
                dom('a',m[0],{href:m[0]})
            :
                dom.tn(m[0])
            s=s.substring(m.index+m[0].length)
        }
        yield dom.tn(s)
    }
    return compile
})()
