let
    rollup=require('rollup'),
    skip=[
        'https://gitcdn.link/cdn/anliting/simple.js/99b7ab1b872bc2da746dd648dd0c078b3bc6961e/src/simple/EventEmmiter.js',
        '/lib/tools/dom.js',
        '/lib/tools/uri.js',
        '/lib/arg.js',
        '/lib/tools/browser.js',
        '/lib/core.static.js',
        '/lib/site.js',
    ]
link('files/Chat.js','files/Chat.static.js')
link('files/main/chatPage.js','files/main/chatPage.static.js')
async function link(input,file){
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
