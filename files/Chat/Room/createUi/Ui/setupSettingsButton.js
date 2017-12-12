import{dom}from '/lib/core.static.js'
import colorScheme from './colorScheme.js'
function setupSettingsButton(ui){
    ui._settingsButton=dom.button('Settings',{onclick(e){
        ui._push()
        let bF=dom.createBF()
        bF.appendChild(createSettingsDiv(ui))
        dom(ui.node,bF.node)
        bF.on('backClick',e=>{
            ui.node.removeChild(bF.node)
            ui._pop()
        })
    }})
}
function createSettingsDiv(ui){
    return dom.div(
        n=>{
            dom(n.style,{
                margin:'16px 24px',
                width:'280px',
            })
        },
        notificationSound(ui),
        colorSchemeP(ui),
        pressEnterToSendP(ui),
        showTexButton(ui),
        showSendButton(ui),
    )
}
function notificationSound(ui){
    return dom.p(
        'Notification Sound: ',
        dom.input({
            type:'range',
            max:1,
            step:0.01,
            value:ui.notificationSound,
            onchange(e){
                ui.notificationSound=this.value
                ui.set('notificationSound')
                ui._playNotificationSound()
            }
        })
    )
}
function colorSchemeP(ui){
    let s=ui._colorScheme
    return dom.p(
        'Color Scheme: ',
        dom.select(
            ...Object.keys(colorScheme).map(i=>
                dom.option({value:i},colorScheme[i].name,n=>{
                    if(s==i)
                        n.selected=true
                })
            ),
            {onchange(e){
                ui.colorScheme=this.value
                ui.set('colorScheme')
            }}
        )
    )
}
function pressEnterToSendP(ui){
    return dom.p(
        dom.label(
            dom.input({
                type:'checkbox',
                checked:ui.pressEnterToSend,
                onchange(e){
                    ui.pressEnterToSend=this.checked
                    ui.set('pressEnterToSend')
                },
            }),' Press Enter to send.')
    )
}
function showTexButton(ui){
    return dom.p(
        dom.label(
            dom.input(
                {
                    type:'checkbox',
                    checked:ui._showTexButton,
                    onchange(e){
                        ui.showTexButton=this.checked
                        ui.set('showTexButton')
                    }
                }),
                ' Show `',
                dom.span(
                    n=>{n.style.fontFamily='serif'},
                    'T',
                    dom.span(n=>{n.style.verticalAlign='sub'},'E'),
                    'X'
                ),
                '\' button in HTML mode.',
            )
    )
}
function showSendButton(ui){
    return dom.p(
        dom.label(
            dom.input({
                type:'checkbox',
                checked:ui._showSendButton,
                onchange(e){
                    ui.showSendButton=this.checked
                    ui.set('showSendButton')
                }
            }),' Show `Send\' button.')
    )
}
export default setupSettingsButton
