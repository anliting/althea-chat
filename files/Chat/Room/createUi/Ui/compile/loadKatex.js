import{doe}from'https://gitcdn.link/cdn/anliting/simple.js/d76165db0cfc5b4c71786bf5a5f2e51503943294/src/simple.static.js'
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
