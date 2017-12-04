import {dom}from '/lib/core.static.js'
import colorScheme from './colorScheme.js'
function setupSettingsButton(ui){
    ui._settingsButton=dom.button('Settings',{onclick(e){
        ui._push()
        let bF=dom.createBF()
        dom(ui.node,bF.node)
        bF.appendChild(createSettingsDiv(ui))
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
                ui.set('notificationSound',this.value)
                ui.playNotificationSound()
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
                ui.set('colorScheme',this.value)
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
                    ui.set('pressEnterToSend',this.checked)
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
                        ui.set('showTexButton',this.checked)
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
                    ui.set('showSendButton',this.checked)
                }
            }),' Show `Send\' button.')
    )
}
export default setupSettingsButton
