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
})()
