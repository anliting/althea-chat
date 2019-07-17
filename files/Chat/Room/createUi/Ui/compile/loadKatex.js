import{doe}from'/lib/core.static.js'
let loadPromise
async function load(){
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3',
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`
    doe.head(
        doe.link({
            rel:'stylesheet',
            href:styleSheetUrl,
        })
    )
    await new Promise(rs=>
        doe.body(
            doe.script({
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
