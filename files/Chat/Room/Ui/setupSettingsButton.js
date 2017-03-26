;(async()=>{
    let[
        dom,
        colorScheme,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.shareImport('colorScheme.js'),
    ])
    function setupSettingsButton(ui){
        ui._settingsButton=dom.button('Settings',{onclick(e){
            let bF=dom.createBF()
            dom(ui.node,bF.node)
            bF.appendChild(createSettingsDiv(ui))
            bF.on('backClick',e=>{
                ui.node.removeChild(bF.node)
            })
        }})
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
        return dom.p(
            'Color Scheme: ',dom.br(),
            dom.select(
                ...Object.keys(colorScheme).map(i=>
                    dom.option(colorScheme[i].name,n=>{
                        n.value=i
                        if(s==i)
                            n.selected=true
                    })
                ),
                n=>{n.onchange=e=>
                    ui.setSetting('colorScheme',n.value)
                }
            )
        )
    }
    return setupSettingsButton
})()
