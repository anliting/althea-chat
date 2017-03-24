;(async()=>{
    let[
        dom,
        colorScheme,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.shareImport('colorScheme.js'),
    ])
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
    return setupSettingsButton
})()
