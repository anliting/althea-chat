export default`
.chat{
    display:flex;
    flex-direction:column;
}
.chat>.message{
    margin-bottom:8px;
    flex:1;
}
.chat>.message{
    padding-right:8px;
    overflow-y:scroll;
    overflow-wrap:break-word;
/*
    In Chrome 57, 'word-break:break-all' is causing
    'overflow-wrap:break-word' not to break 'a lot of continuous "！"'. I
    considered it as a browser bug.

    It also results in horizontal scroll.
*/
    /*word-break:break-all;*/
    /*text-align:justify;*/
}
.chat>.message a.user{
    color:black;
    text-decoration:none;
}
.chat>.message img{
    max-width:100%;
    max-height:16em;
}
.chat>.message>.top{
    text-align:center;
}
.chat>.bottom>textarea{
    width:calc(100% - 6px);
    resize:none;
}
/* start fullscreen */
/*body:-webkit-full-screen{
    margin:0;
    width:100%;
    height:100%;
    background-color:white;
}
body:-webkit-full-screen>.chat{
    padding:8px;
    width:calc(100% - 16px);
    height:calc(100% - 16px);
    background-color:white;
}*/
/* end fullscreen */
`
