let
    rollup=require('rollup'),
    skip=[
        'https://gitcdn.link/cdn/anliting/simple.js/99b7ab1b872bc2da746dd648dd0c078b3bc6961e/src/simple/EventEmmiter.js',
        '/lib/tools/dom.js',
        '/lib/tools/uri.js',
        '/lib/arg.js',
        '/lib/tools/browser.js',
    ],
    skipMap=Object.assign({},...skip.map(s=>{
        let o={}
        o[s]=s
        return o
    }))
;(async()=>{
    let bundle=await rollup.rollup({
        input:'files/Chat.js',
        external:skip,
    })
    await bundle.write({
        file:'files/Chat.static.js',
        format:'es',
        paths:skipMap,
    })
})()
