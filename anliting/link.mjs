import rollup from 'rollup'
let
    skip=[
        '/lib/core.static.js',
        'https://gitcdn.link/cdn/anliting/simple.js/d76165db0cfc5b4c71786bf5a5f2e51503943294/src/simple.static.js',
    ]
;(async()=>{
    await link('files/main.js','files/main.static.js',skip)
})()
async function link(input,file,skip=[]){
    let bundle=await rollup.rollup({
        input,
        external:s=>skip.includes(s),
    })
    await bundle.write({
        file,
        format:'es',
        paths:s=>skip.includes(s)&&s,
    })
}
