import rollup from 'rollup'
let
    skip=[
        '/lib/core.static.js',
        'https://gitcdn.link/cdn/anliting/simple.js/55124630741399dd0fcbee2f0396642a428cdd24/src/simple.static.js',
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
