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
        let div=dom.div(
            {
                className:'message',
                onscroll:updateAtBottom,
                onclick(e){
                    getSelection().isCollapsed&&ui.textarea.focus()
                },
            },
            ui._topDiv=createTopDiv(ui)
        )
        updateAtBottom()
        ui.syncInnerMessageDivScroll=syncDivScroll
        return ui._innerMessageDiv=div
        function updateAtBottom(){
            ui.atBottom=Math.abs(
                div.scrollTop+div.clientHeight-div.scrollHeight
            )<=1
        }
    }
    function createTopDiv(ui){
        return dom.div(
            {className:'top'},
            createShowOlderMessagesButton(ui)
        )
    }
    function createShowOlderMessagesButton(ui){
        return dom.button({onclick(e){
            e.stopPropagation()
            ui._queryOlder()
        }},'Show Older Messages')
    }
})()
