import{dom,load}from '/lib/core.static.js'
let Vim
async function loadVim(){
    let module=await load.module()
    return module.moduleByPath(`${
        'https://gitcdn.link/cdn/anliting/webvim'
    }/${
        'b3e769a34f699755b7f7585231e11778390e5034'
    }/src/Vim.static.js`)
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
    return dom.div(
        vim.node,
        {onclick(){
            vim.focus()
        }},
        n=>{dom(n.style,{
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
