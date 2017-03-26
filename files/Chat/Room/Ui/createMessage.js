(async()=>{
    let[
        dom,
    ]=await Promise.all([
        module.repository.althea.dom,
    ])
    return createMessageDiv
    function createMessageDiv(ui){
        let div=dom.div(
            ui._innerMessageDiv=createInnerMessageDiv(ui)
        )
        div.className='message'
        return div
    }
    function createInnerMessageDiv(ui){
        let div=dom.div(ui._topDiv=createTopDiv(ui))
        div.className='innerMessage'
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
        return div
        function syncDivScroll(){
            if(ui.atBottom)
                div.scrollTop=div.scrollHeight
        }
    }
    function createTopDiv(ui){
        let n=dom.div()
        n.style.textAlign='center'
        n.appendChild(createShowOlderMessagesButton(ui))
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
