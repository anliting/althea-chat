import core from '/lib/core.static.js'
let {dom}=core
let
    loadVim=()=>anlitingModule.importByPath(`${
        'https://gitcdn.link/cdn/anliting/webvim'
    }/${
        '585df5a6d6daa30dc78af958804f658c163dfe59'
    }/src/Vim.static.js`,{mode:1})
async function load(ui,textarea){
    if(typeof loadVim=='function')
        loadVim=loadVim()
    textarea.disabled=true
    let Vim=await loadVim
    let vim=new Vim(p=>{
        if(p=='~/.vimrc')
            return localStorage.webvimVimrc
    }),viewDiv=createViewDiv(vim)
    vim.text=textarea.value
    vim._cursor.moveTo(textarea.selectionStart)
    dom.head(vim.style)
    dom.body(viewDiv)
    vim.polluteCopy
    vim.focus()
    vim.on('quit',e=>{
        document.head.removeChild(vim.style)
        document.body.removeChild(viewDiv)
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
export default load
