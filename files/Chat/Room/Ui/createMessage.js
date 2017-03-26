(async()=>{
    let[
        dom,
    ]=await Promise.all([
        module.repository.althea.dom,
    ])
    return createMessageDiv
    function createMessageDiv(ui){
        function syncDivScroll(){
            if(ui.atBottom)
                div.scrollTop=div.scrollHeight
        }
        let div=dom.div(ui._topDiv=createTopDiv(ui))
        div.className='message'
        ui.atBottom=Math.abs(
            div.scrollTop+div.clientHeight-div.scrollHeight
        )<=1
        div.addEventListener('scroll',()=>{
            ui.atBottom=Math.abs(
                div.scrollTop+div.clientHeight-div.scrollHeight
            )<=1
        })
        div.onclick=e=>getSelection().isCollapsed&&ui.textarea.focus()
        ui.syncInnerMessageDivScroll=syncDivScroll
        return ui._innerMessageDiv=div
    }
    function createTopDiv(ui){
        let n=dom.div(createShowOlderMessagesButton(ui))
        n.className='top'
        return n
    }
    function createShowOlderMessagesButton(ui){
        return dom.button(n=>{
            n.onclick=e=>{
                e.stopPropagation()
                ui._queryOlder()
            }
            return'Show Older Messages'
        })
    }
})()
