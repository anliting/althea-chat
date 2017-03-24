;(async()=>{
    let[
        dom,
        colorScheme,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.shareImport('colorScheme.js'),
    ])
    function createTextarea(ui){
        let textarea=dom.textarea()
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
        textarea.addEventListener('input',e=>
            ui.updateTextareaHeight()
        )
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
    function setupSettingsButton(ui){
        ui._settingsButton=dom.button(n=>{
            n.onclick=e=>{
                let bF=dom.createBF()
                ui.node.appendChild(bF.node)
                bF.appendChild(createSettingsDiv(ui))
                bF.on('backClick',e=>{
                    ui.node.removeChild(bF.node)
                })
            }
            return'Settings'
        })
    }
    function createSettingsDiv(ui){
        return dom.div(n=>{
            n.style.margin='32px 48px'
            n.style.width='240px'
            let scroll=dom.createScroll(200)
            scroll.value=ui.getSetting('notificationSound')
            scroll.on('change',e=>{
                ui.setSetting('notificationSound',scroll.value)
                ui.playNotificationSound()
            })
            return[
                dom.p(
                    'Notification Sound: ',dom.br(),
                    scroll.node
                ),
                colorSchemeP(ui),
            ]
        })
    }
    function colorSchemeP(ui){
        let s=ui.getSetting('colorScheme')
        s=s?s.id:'default'
        return dom.p(
            'Color Scheme: ',dom.br(),
            dom.select(
                ...colorScheme.map((cs,i)=>
                    dom.option(cs.name,n=>{
                        n.value=i
                        if(s==cs.id)
                            n.selected=true
                    })
                ),
                n=>{n.onchange=e=>{
                    ui.setSetting(
                        'colorScheme',
                        colorScheme[n.value]
                    )
                }}
            )
        )
    }
    function setupStatusNode(ui){
        ui._statusNode=dom.span()
    }
    function createBottom(ui){
        ui.textarea=createTextarea(ui)
        setupFileButton(ui)
        setupSettingsButton(ui)
        setupStatusNode(ui)
        return dom.div(
            n=>{n.className='bottom'},
            ui.textarea,
            ui._fileButton.n,' ',
            ui._settingsButton,' ',
            ui._statusNode
        )
    }
    return createBottom
})()
/*async function fullscreen(div){
    if((await module.repository.althea.browser).isMobile){
        div.appendChild(document.createTextNode(' '))
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
