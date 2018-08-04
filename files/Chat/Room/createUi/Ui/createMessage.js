import{doe}from '/lib/core.static.js'
function createMessageDiv(ui){
    function syncDivScroll(){
        if(ui.atBottom)
            div.scrollTop=div.scrollHeight
    }
    function updateAtBottom(){
        ui.atBottom=Math.abs(
            div.scrollTop+div.clientHeight-div.scrollHeight
        )<=1
    }
    let div=doe.div(
        {
            className:'message',
            onscroll:updateAtBottom,
            onclick(e){
                getSelection().isCollapsed&&ui.textarea.focus()
            },
        },
        ui._topDiv=createTopDiv(ui),
        ui._previewNode=doe.div({className:'preview'})
    )
    updateAtBottom()
    ui.syncInnerMessageDivScroll=syncDivScroll
    return ui._innerMessageDiv=div
}
function createTopDiv(ui){
    return doe.div(
        {className:'top'},
        createShowOlderMessagesButton(ui)
    )
}
function createShowOlderMessagesButton(ui){
    return doe.button({onclick(e){
        e.stopPropagation()
        ui._queryOlder()
    }},'Show Older Messages')
}
export default createMessageDiv
