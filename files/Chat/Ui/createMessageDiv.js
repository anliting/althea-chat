(async()=>{
    return createMessageDiv
    function createMessageDiv(ui){
        let div=document.createElement('div')
        div.className='message'
        div.appendChild(ui._innerMessageDiv=createInnerMessageDiv(ui))
        return div
    }
    function createInnerMessageDiv(ui){
        let chat=ui._chat
        let div=document.createElement('div')
        div.className='innerMessage'
        div.appendChild(ui._topDiv=createTopDiv(ui))
        ui.atBottom=Math.abs(
            div.scrollTop+div.clientHeight-div.scrollHeight
        )<=1
        div.addEventListener('scroll',()=>{
            ui.atBottom=Math.abs(
                div.scrollTop+div.clientHeight-div.scrollHeight
            )<=1
        })
        ui.syncInnerMessageDivScroll=syncDivScroll
        return div
        function syncDivScroll(){
            if(ui.atBottom)
                div.scrollTop=div.scrollHeight
        }
    }
    function createTopDiv(ui){
        let n=document.createElement('div')
        n.style.textAlign='center'
        n.appendChild(createShowOlderMessagesButton(ui))
        return n
    }
    function createShowOlderMessagesButton(ui){
        let n=document.createElement('button')
        n.textContent='Show Older Messages'
        n.onclick=e=>{
            e.stopPropagation()
            ui._queryOlder()
        }
        return n
    }
})()
