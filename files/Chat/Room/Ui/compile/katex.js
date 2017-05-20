(async()=>{
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1'
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`
    let o={}
    await module.share({window:o}).importByPath(scriptUrl,{mode:1})
    return{
        styleSheet:styleSheetUrl,
        katex:o.katex,
    }
})()
