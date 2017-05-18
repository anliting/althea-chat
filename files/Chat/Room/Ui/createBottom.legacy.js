/*async function fullscreen(div){
    if((await module.repository.althea.browser).isMobile){
        dom(div,' ',createFullscreenButton())
    }
    function createFullscreenButton(){
        let
            status=0,
            n=dom('button')
        updateTextContent()
        n.onclick=e=>{
            status=1-status
            updateTextContent()
            if(status==0)
                document.webkitExitFullscreen()
            else
                document.body.webkitRequestFullscreen()
        }
        function updateTextContent(){
            n.textContent=['Fullscreen','Window'][status]
        }
        return n
    }
}*/
