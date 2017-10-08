export default`
html{
    height:100%;
}
body{
    height:calc(100% - 16px);
}
a:active,a:link,a:hover,a:visited{
    color:blue;
}
.chat{
    height:100%;
    max-width:600px;
    margin:0 auto;
}
.conversationList{
    height:100%;
    max-width:600px;
    margin:0 auto;
}
/*
    I don't know why the KaTeX makes the scroll bar appear; but this fixes
    it on desktop version; and the mobile version does still.
*/
body{
    overflow-y:hidden;
}
`
