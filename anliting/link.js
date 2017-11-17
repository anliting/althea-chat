let
    rollup=require('rollup'),
    skip=[
        '/lib/core.static.js',
        'https://gitcdn.link/cdn/anliting/simple.js/eae977ecf2a856ecb072259aa63b003d186ba618/src/simple/EventEmmiter.js',
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
