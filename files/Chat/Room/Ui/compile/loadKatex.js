import core from '/lib/core.static.js'
let{dom}=core
let loadPromise
async function load(){
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3',
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`
    dom.head(
        dom.link({
            rel:'stylesheet',
            href:styleSheetUrl,
        })
    )
    await new Promise(rs=>
        dom.body(
            dom.script({
                src:scriptUrl,
                onload(){
                    document.body.removeChild(this)
                    rs()
                },
            })
        )
    )
}
export default()=>{
    if(!loadPromise)
        loadPromise=load()
    return loadPromise
}
