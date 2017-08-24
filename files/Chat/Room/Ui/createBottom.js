;(async()=>{
    let[
        arg,
        dom,
        setupSettingsButton,
        setUpVim,
    ]=await Promise.all([
        module.repository.althea.arg,
        module.repository.althea.dom,
        module.shareImport('setupSettingsButton.js'),
        module.shareImport('createBottom/setUpVim.js'),
    ])
    function createTextarea(ui){
        let textarea=dom.textarea({
            rows:2,
            title:'Alt+V: Open the Web Vim editor.',
            oninput(e){
                ui.updateTextareaHeight()
                ui._updatePreview()
            }
        })
        textarea.onkeydown=e=>{
            let pdsp=_=>{e.stopPropagation(),e.preventDefault()}
            if(
                ui.getSetting('pressEnterToSend')&&
                !e.ctrlKey&&!e.shiftKey&&e.key=='Enter'
            ){
                pdsp()
                return ui._send()
            }
            if(e.altKey&&e.key.toLowerCase()=='v'){
                pdsp()
                return setUpVim(ui,textarea)
            }
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
            ui.textarea.value+=imageIds.map(id=>
                `<img src=img/${id}c800x600.jpg>\n`
            ).join('')
            ui._updatePreview()
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
        setupFindButton(ui)
        setupStatusNode(ui)
        return dom.div(
            {className:'bottom'},
            ui.textarea=createTextarea(ui),
            arg.h&&[ui._findButton,' '],
            ui._bottomTexButton=createTexButton(ui),' ',
            ui._fileButton.n,' ',
            ui._bottomSendButton=createSendButton(ui),' ',
            ui._settingsButton,' ',
            ui._statusNode
        )
    }
    function createTexButton(ui){
        return dom.button('TeX',{
            title:`
When you click this button, it places \`<span class=tex>' and \`</span>' around your selection in the input.
`,
            onclick(e){
                let
                    s=ui.textarea.value,
                    a=ui.textarea.selectionStart,
                    b=ui.textarea.selectionEnd,
                    stepForward='<span class=tex>'.length
                ui.textarea.value=`${s.substring(0,a)}<span class=tex>${
                    s.substring(a,b)
                }</span>${s.substring(b)}`
                ui.textarea.selectionStart=a+stepForward
                ui.textarea.selectionEnd=b+stepForward
                ui.textarea.focus()
                ui._updatePreview()
            }
        })
    }
    function setupFindButton(ui){
        ui._findButton=dom.button('Find')
    }
    return createBottom
})()
