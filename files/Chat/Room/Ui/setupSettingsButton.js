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
        return dom('div',
            n=>{
                n.style.margin='16px 24px'
                n.style.width='280px'
            },
            notificationSound(ui),
            colorSchemeP(ui),
            dom('p',
                dom('label',
                    dom('input',{
                        type:'checkbox',
                        checked:ui.getSetting('pressEnterToSend'),
                        onchange(e){
                            ui.setSetting('pressEnterToSend',this.checked)
                        }
                    }),' Press Enter to send.')
            )
        )
    }
    function notificationSound(ui){
        return dom('p',
            'Notification Sound: ',
            dom('input',{
                type:'range',
                max:1,
                step:0.01,
                value:ui.getSetting('notificationSound'),
                onchange(e){
                    ui.setSetting('notificationSound',this.value)
                    ui.playNotificationSound()
                }
            })
        )
    }
    function colorSchemeP(ui){
        let s=ui.getSetting('colorScheme')
        return dom('p',
            'Color Scheme: ',
            dom('select',
                ...Object.keys(colorScheme).map(i=>
                    dom('option',{value:i},colorScheme[i].name,n=>{
                        if(s==i)
                            n.selected=true
                    })
                ),
                {onchange(e){
                    ui.setSetting('colorScheme',this.value)
                }}
            )
        )
    }
    return setupSettingsButton
})()
