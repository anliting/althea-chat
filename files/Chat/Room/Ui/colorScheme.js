import core from '/lib/core.static.js'
let{browser}=core
let colorScheme={
    'default':{
        name:'Default',
        style:`
            div.chat>div.message>div.preview{
                color:gray;
            }
            ${!browser.isMobile?`
            div.chat>div.message::-webkit-scrollbar{
                width:12px;
            }
            div.chat>div.message::-webkit-scrollbar-track{
                border-radius:6px;
                background:#DDD;
            }
            div.chat>div.message::-webkit-scrollbar-thumb{
                border-radius:6px;
                background:#BBB;
            }
            `:''}
        `,
    },
    'gnulinux':{
        name:'GNU/Linux',
        style:`
            div.chat>div.message>div.preview{
                color:dimgray;
            }
            div.chat a:active,
            div.chat a:link,
            div.chat a:hover,
            div.chat a:visited
            {
                color:lightblue;
            }
            div.chat>.message>.top>button,
            div.chat>.bottom>button,
            div.chat>.bottom>select
            {
                background-color:black;
                color:lightgray;
            }
            div.chat>div.message{
                background-color:black;
                color:lightgray;
            }
            div.chat>div.message a.user{
                color:lightgray;
            }
            div.chat>div.bottom textarea{
                background-color:black;
                color:lightgray;
            }
            ${!browser.isMobile?`
            div.chat>div.message::-webkit-scrollbar{
                width:12px;
            }
            div.chat>div.message::-webkit-scrollbar-track{
                border-radius:6px;
                background:#222;
            }
            div.chat>div.message::-webkit-scrollbar-thumb{
                border-radius:6px;
                background:#444;
            }
            `:''}
        `,
    }
}
export default colorScheme
