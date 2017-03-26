;(async()=>{
    let[
        dom,
        setupSettingsButton,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.shareImport('setupSettingsButton.js'),
    ])
    function createTextarea(ui){
        let textarea=dom.textarea({
            rows:2,
            oninput(e){
                ui.updateTextareaHeight()
            }
        })
        textarea.onkeydown=e=>{
            // only enter
            if(!(!e.ctrlKey&&!e.shiftKey&&e.keyCode==13))
                return
            e.stopPropagation()
            e.preventDefault()
            ui._send()
        }
        ;(async()=>{
            let user=await ui._currentUser
            await user.load('nickname')
            textarea.placeholder=`${user.nickname}: `
        })()
        return textarea
    }
    function setupFileButton(ui){
        ui._fileButton=dom.createFileButton('Image')
        ui._fileButton.on('file',async a=>{
            ui._fileButton.n.disabled=true
            let imageIds=await ui.imageUploader.uploadImages(a)
            imageIds.map(id=>{
                ui.textarea.value+=
                    `<img src=img/${id}c800x600.jpg>\n`
            })
            ui.updateTextareaHeight()
            ui._fileButton.n.disabled=false
        })
    }
    function setupStatusNode(ui){
        ui._statusNode=dom.span()
    }
    function createSendButton(ui){
        return dom.button('Send',{onclick(){
            ui._send()
        }})
    }
    function createBottom(ui){
        setupFileButton(ui)
        setupSettingsButton(ui)
        setupStatusNode(ui)
        return dom.div(
            {className:'bottom'},
            ui.textarea=createTextarea(ui),
            ui._fileButton.n,' ',
            createSendButton(ui),' ',
            ui._settingsButton,' ',
            ui._statusNode
        )
    }
    return createBottom
})()
/*async function fullscreen(div){
    if((await module.repository.althea.browser).isMobile){
        div.appendChild(dom.tn(' '))
        div.appendChild(createFullscreenButton())
    }
    function createFullscreenButton(){
        let
            status=0,
            n=dom.button()
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
