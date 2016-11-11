Promise.all([
    module.repository.althea.html,
    module.repository.althea.url,
]).then(modules=>{
    let
        html=modules[0],
        url=modules[1]
    function compile(s){
        let res=''
        while(
            renderHtml()||
            renderUrl()
        );
        return res+html.encodeText(s)
        function renderHtml(){
            let whitelist={
                br:{},
                div:{
                    style:/.*/
                },
                img:{
                    src:/^img\//
                },
                p:{},
                span:{
                    style:/.*/
                },
            }
            let tag=matchTag(s)
            if(!tag)
                return
            if(!test(tag)){
                res+=
                    html.encodeText(s.substring(0,tag.index))+
                    html.encodeText(tag.tag)
                s=s.substring(tag.index+tag.tag.length)
                return true
            }
            res+=
                html.encodeText(s.substring(0,tag.index))+tag.tag
            s=s.substring(tag.index+tag.tag.length)
            return true
            function test(tag){
                if(!(tag.name in whitelist))
                    return
                for(let i in tag.attributes){
                    if(!(i in whitelist[tag.name]))
                        return
                    let
                        value=tag.attributes[i],
                        test=whitelist[tag.name][i]
                    if(test instanceof RegExp){
                        if(!test.test(value))
                            return
                        delete tag.attributes[i]
                    }
                }
                return true
            }
            function matchTag(s){
                let m=s.match(
                    /\<([a-z]+)((?: [a-z]+(?:=[0-9\:a-z\.\/]*)?)*)\>/
                )
                if(!m)
                    return
                m.tag=m[0]
                m.name=m[1]
                m.attributes=parseAttributes(m[2])
                return m
            }
            function parseAttributes(s){
                let res={}
                s.split(' ').slice(1).forEach(s=>{
                    let m=s.match(/([a-z]+)(?:=([0-9a-z\.\/]*))?/)
                    res[m[1]]=m[2]
                })
                return res
            }
        }
        function renderUrl(){
            let m=url.match(s)
            if(!(
                m&&(
                    m.scheme=='http'||
                    m.scheme=='https'
                )
            ))
                return
            res+=
                html.encodeText(s.substring(0,m.index))+
                `<a href=${html.encodeText(m[0])}>${
                    html.encodeText(decodeURI(m[0]))
                }</a>`
            s=s.substring(m.index+m[0].length)
            return true
        }
    }
    return compile
})
