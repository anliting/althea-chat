(async()=>{
    let[
        dom,
    ]=await Promise.all([
        module.repository.althea.dom,
    ])
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1'
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`
// pollution
    dom(document.head,
        dom('link',{rel:'stylesheet',href:styleSheetUrl})
    )
    let o={}
    await module.share({window:o}).importByPath(scriptUrl,{mode:1})
    return o.katex
})()
