let loadPromise
async function load(){
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3',
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`
    document.head.appendChild(
        Object.assign(document.createElement('link'),{
            rel:'stylesheet',
            href:styleSheetUrl,
        })
    )
    await new Promise(onload=>{
        document.body.appendChild(
            Object.assign(document.createElement('script'),{
                src:scriptUrl,
                onload,
            })
        )
    })
}
export default()=>{
    if(!loadPromise)
        loadPromise=load()
    return loadPromise
}
