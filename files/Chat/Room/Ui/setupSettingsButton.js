;(async()=>{
    let[
        dom,
        arg,
        colorScheme,
    ]=await Promise.all([
        module.repository.althea.dom,
        module.repository.althea.arg,
        module.shareImport('colorScheme.js'),
    ])
    function setupSettingsButton(ui){
        ui._settingsButton=dom('button','Settings',{onclick(e){
            let bF=dom.createBF()
            dom(ui.node,bF.node)
            bF.appendChild(createSettingsDiv(ui))
            bF.on('backClick',e=>{
                ui.node.removeChild(bF.node)
            })
        }})
    }
    function createSettingsDiv(ui){
        let scroll=dom.createScroll(200)
        scroll.value=ui.getSetting('notificationSound')
        scroll.on('change',e=>{
            ui.setSetting('notificationSound',scroll.value)
            ui.playNotificationSound()
        })
        return dom('div',
            n=>{
                n.style.margin='32px 48px'
                n.style.width='240px'
            },
            dom('p',
                'Notification Sound: ',dom('br'),
                scroll.node
            ),
            colorSchemeP(ui),
            dom('p',
                dom('input',{
                    type:'checkbox',
                    checked:ui.getSetting('pressEnterToSend'),
                    onchange(e){
                        ui.setSetting('pressEnterToSend',this.checked)
                    }
                }),
                ' Press Enter to send.'
            )
        )
    }
    function colorSchemeP(ui){
        let s=ui.getSetting('colorScheme')
        return dom('p',
            'Color Scheme: ',dom('br'),
            dom('select',
                ...Object.keys(colorScheme).map(i=>
                    dom('option',{value:i},colorScheme[i].name,n=>{
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
