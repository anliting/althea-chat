import{browser}from'/lib/core.static.js'
let colorScheme={
    'default':{
        name:'Default',
        style:`
            .chat>.message>.preview{
                color:gray;
            }
            ${!browser.isMobile?`
            .chat>.message::-webkit-scrollbar{
                width:12px;
            }
            .chat>.message::-webkit-scrollbar-track{
                border-radius:6px;
                background:#DDD;
            }
            .chat>.message::-webkit-scrollbar-thumb{
                border-radius:6px;
                background:#BBB;
            }
            `:''}
        `,
    },
    'gnulinux':{
        name:'GNU/Linux',
        style:`
            .chat>.message>.preview{
                color:dimgray;
            }
            .chat a:active,
            .chat a:link,
            .chat a:hover,
            .chat a:visited
            {
                color:lightblue;
            }
            .chat>.message>.top>button,
            .chat>.bottom>button,
            .chat>.bottom>select
            {
                background-color:black;
                color:lightgray;
            }
            .chat>.message{
                background-color:black;
                color:lightgray;
            }
            .chat>.message a.user{
                color:lightgray;
            }
            .chat>.bottom textarea{
                background-color:black;
                color:lightgray;
            }
            ${!browser.isMobile?`
            .chat>.message::-webkit-scrollbar{
                width:12px;
            }
            .chat>.message::-webkit-scrollbar-track{
                border-radius:6px;
                background:#222;
            }
            .chat>.message::-webkit-scrollbar-thumb{
                border-radius:6px;
                background:#444;
            }
            `:''}
        `,
    }
}
export default colorScheme
