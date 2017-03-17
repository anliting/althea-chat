(async()=>{
    let[
        dom,
    ]=await Promise.all([
        module.repository.althea.dom,
    ])
    function createSendDiv(chat,ui){
        let div=document.createElement('div')
        div.className='send'
        div.appendChild(ui.textarea=createTextarea())
        setupFileButton(ui)
        div.appendChild(ui._fileButton.n)
        div.appendChild(document.createTextNode(' '))
        setupSettingsButton(ui)
        div.appendChild(ui._settingsButton)
        //fullscreen()
        return div
        /*async function fullscreen(){
            if((await module.repository.althea.browser).isMobile){
                div.appendChild(document.createTextNode(' '))
                div.appendChild(createFullscreenButton())
            }
            function createFullscreenButton(){
                let
                    status=0,
                    n=document.createElement('button')
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
        function createTextarea(){
            let textarea=document.createElement('textarea')
            textarea.rows=2
            textarea.addEventListener('keydown',e=>{
                // if only enter
                if(!e.ctrlKey&&!e.shiftKey&&e.keyCode==13){
                    e.stopPropagation()
                    e.preventDefault()
                    if(textarea.value!=''){
                        ui.sendMessage(textarea.value)
                        textarea.value=''
                    }
                    return
                }
            })
            textarea.addEventListener('input',e=>{
                ui.updateTextareaHeight()
            })
            ;(async()=>{
                let user=await chat._currentUser
                await user.load('nickname')
                textarea.placeholder=`${user.nickname}: `
            })()
            return textarea
        }
        function setupFileButton(ui){
            ui._fileButton=dom.createFileButton('Image')
            ui._fileButton.on('file',async a=>{
                ui._fileButton.n.disabled=true
                let imageIds=await ui._imageUploader.uploadImages(a)
                imageIds.map(id=>{
                    ui.textarea.value+=
                        `<img src=img/${id}c800x600.jpg>\n`
                })
                ui.updateTextareaHeight()
                ui._fileButton.n.disabled=false
            })
        }
        function setupSettingsButton(ui){
            let n=document.createElement('button')
            n.textContent='Settings'
            n.onclick=e=>{
                let bF=dom.createBF()
                ui.node.appendChild(bF.node)
                bF.appendChild(createSettingsDiv(ui))
                bF.on('backClick',e=>{
                    ui.node.removeChild(bF.node)
                })
            }
            ui._settingsButton=n
        }
        function createSettingsDiv(ui){
            let n=document.createElement('div')
            n.style.margin='32px 48px'
            n.style.width='300px'
            n.appendChild(document.createTextNode('Notification Sound: '))
            let scroll=dom.createScroll(128)
            scroll.value=ui.getSetting('notificationSound')
            scroll.on('change',e=>{
                ui.setSetting('notificationSound',scroll.value)
                ui.playNotificationSound()
            })
            n.appendChild(scroll.node)
            return n
        }
    }
    return createSendDiv
})()
