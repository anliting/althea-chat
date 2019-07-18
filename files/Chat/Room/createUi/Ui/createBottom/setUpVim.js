import{doe}from'/lib/core.static.js'
let Vim
async function loadVim(){
    /*
        +'' to bypass rollup's bug.
        rollup tries to resolve dynamic import and fails to.
    */
    return(await import('../../../../lib/Vim.js'+'')).default
}
async function setUpVim(ui,textarea){
    textarea.disabled=true
    if(!Vim)
        Vim=await loadVim()
    let vim=new Vim(p=>{
        if(p=='~/.vimrc')
            return localStorage.webvimVimrc
    }),viewDiv=createViewDiv(vim)
    vim.text=textarea.value
    vim._cursor.moveTo(textarea.selectionStart)
    let
        headStyle={type:'head',node:vim.style},
        bodyUi={type:'body',node:viewDiv}
    ui.out.in(headStyle)
    ui.out.in(bodyUi)
    vim.polluteCopy
    vim.focus()
    vim.on('quit',e=>{
        ui.out.out(headStyle)
        ui.out.out(bodyUi)
        textarea.disabled=false
        textarea.focus()
    })
    vim.write=p=>{
        if(p==undefined){
            ui._changeTextareaValue(vim.text)
            textarea.selectionStart=textarea.selectionEnd=
                vim.cursor
        }else if(p=='~/.vimrc')
            localStorage.webvimVimrc=vim.text
    }
}
function createViewDiv(vim){
    vim.width=80
    vim.height=24
    return doe.div(
        vim.node,
        {onclick(){
            vim.focus()
        }},
        n=>{doe(n.style,{
            position:'fixed',
            left:'50%',
            top:'50%',
            transform:'translate(-50%,-50%)',
            width:'min-content',
            zIndex:'3'
        })}
    )
}
export default setUpVim
