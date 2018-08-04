import{arg,doe,dom}from'/lib/core.static.js'
import setupSettingsButton from './setupSettingsButton.js'
import setUpVim from './createBottom/setUpVim.js'
function createTextarea(ui){
    return doe.textarea({
        rows:2,
        title:'Alt+V: Open the Web Vim editor.',
        oninput(e){
            ui.updateTextareaHeight()
            ui._updatePreview()
        },
        onkeydown(e){
            let pdsp=_=>{e.stopPropagation(),e.preventDefault()}
            if(
                ui.pressEnterToSend&&
                !e.ctrlKey&&!e.shiftKey&&e.key=='Enter'
            ){
                pdsp()
                return ui._send()
            }
            if(e.altKey&&e.key.toLowerCase()=='v'){
                pdsp()
                return setUpVim(ui,this)
            }
        },
    })
}
function setupFileButton(ui){
    ui._fileButton=dom.createFileButton('Image')
    ui._fileButton.on('file',async a=>{
        ui._fileButton.n.disabled=true
        let imageIds=await ui.imageUploader.uploadImages(a)
        ui.textarea.value+=imageIds.map(id=>
            `<a href=img/${id}.jpg><img src=img/${id}c800x600.jpg></a>`
        ).join('')
        ui._updatePreview()
        ui.updateTextareaHeight()
        ui._fileButton.n.disabled=false
    })
    ui._fileButton.n.style.display='none'
}
function setupStatusNode(ui){
    ui._statusNode=doe.span()
}
function createSendButton(ui){
    return doe.button('Send',{onclick(){
        ui._send()
    }})
}
function createBottom(ui){
    setupFileButton(ui)
    setupSettingsButton(ui)
    setupFindButton(ui)
    setupStatusNode(ui)
    return doe.div(
        {className:'bottom'},
        ui.textarea=createTextarea(ui),
        doe.a({
            href:'/chat',
            onclick(e){
                if(!(
                    !e.altKey&&
                    !e.ctrlKey&&
                    !e.metaKey&&
                    !e.shiftKey&&
                    e.button==0
                ))
                    return
                e.preventDefault()
                e.stopPropagation()
                ui._goConversations()
            },
        },'Conversations'),' ',
        ...(arg.h?[ui._findButton,' ']:[]),
        ui._modeSelect=createModeSelect(ui),' ',
        ui._bottomTexButton=createTexButton(ui),' ',
        ui._fileButton.n,' ',
        ui._bottomSendButton=createSendButton(ui),' ',
        ui._settingsButton,' ',
        ui._statusNode,
    )
}
function createModeSelect(ui){
    return doe.select(
        {
            onchange(){
                ui._setMode(this.value)
            },
        },
        doe.option({value:'plainText'},'Plain Text'),
        doe.option({value:'html'},'HTML'),
    )
}
function createTexButton(ui){
    return doe.button(
        {
            title:`
    When you click this button, it places \`<script type=tex>' and \`</script>' around your selection in the input.
    `,
            onclick(e){
                let
                    s=ui.textarea.value,
                    a=ui.textarea.selectionStart,
                    b=ui.textarea.selectionEnd,
                    stepForward='<script type=tex>'.length
                ui.textarea.value=`${s.substring(0,a)}<script type=tex>${
                    s.substring(a,b)
                }</script>${s.substring(b)}`
                ui.textarea.selectionStart=a+stepForward
                ui.textarea.selectionEnd=b+stepForward
                ui.textarea.focus()
                ui._updatePreview()
            }
        },
        doe.span(
            n=>{n.style.fontFamily='serif'},
            'T',
            doe.span(n=>{n.style.verticalAlign='sub'},'E'),
            'X'
        )
    )
}
function setupFindButton(ui){
    ui._findButton=doe.button('Find')
}
export default createBottom
