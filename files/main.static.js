import core from '/lib/core.static.js';
import EventEmmiter from 'https://gitcdn.link/cdn/anliting/simple.js/99b7ab1b872bc2da746dd648dd0c078b3bc6961e/src/simple/EventEmmiter.js';
import moduleLoader from 'https://cdn.rawgit.com/anliting/module/3d316feea7b5a428cf73252750ba79b4a1f4179f/src/esm/moduleLoader.js';

let loadPromise;
async function load(){
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3',
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`;
    document.head.appendChild(
        Object.assign(document.createElement('link'),{
            rel:'stylesheet',
            href:styleSheetUrl,
        })
    );
    await new Promise(onload=>{
        document.body.appendChild(
            Object.assign(document.createElement('script'),{
                src:scriptUrl,
                onload,
            })
        );
    });
}
var loadKatex = ()=>{
    if(!loadPromise)
        loadPromise=load();
    return loadPromise
};

/*
    To support the math typesetting function, one may
        . implement it from scratch,
        . use the KaTeX library, or
        . use the MathJax library.
    2017-05-05:
        I chosed the KaTeX approach, because I don't want to implement it
        myself, and with KaTeX, I know how to solve the problem in a much
        proper way by the comparison of MathJax.
*/
let {dom: dom$3,uri}=core;
let whitelist={
    a:{
        href:/^https?:\/\//,
    },
    blockquote:{
        style:0,
    },
    br:{},
    code:{
        style:0,
    },
    div:{
        style:0,
    },
    iframe:{
        width:0,
        height:0,
        src:/^https:\/\/www\.youtube\.com\/embed\//,
        frameborder:0,
        allowfullscreen:0,
    },
    img:{
        src:/^img\//,
        style:0,
    },
    p:{
        style:0,
    },
    pre:{
        style:0,
    },
    q:{
        style:0,
    },
    span:{
        class:0,
        style:0,
    },
};
async function compile(s){
    let body=(new DOMParser).parseFromString(
        `<!docytpe html><title>0</title><body>${s}`,'text/html'
    ).body;
    await traverse(body);
    return[...body.childNodes]
}
async function traverse(m){
    await Promise.all([...m.childNodes].map(async n=>{
        if(!test(n))
            return m.removeChild(n)
        if(n.nodeType==1){
            if(n.className=='tex'){
                let s=n.textContent;
                n.textContent='';
                await loadKatex();
                try{
                    katex.render(s,n);
                }catch(e){
                    n.textContent=s;
                }
            }else
                traverse(n);
        }else if(n.nodeType==3){
            for(let o of renderUrl(n.wholeText))
                m.insertBefore(o,n);
            m.removeChild(n);
        }
    }));
}
function test(n){
    if(n.nodeType==1){
        let name=n.nodeName.toLowerCase();
        if(!(name in whitelist))
            return
        let nodeTest=whitelist[name];
        return[...n.attributes].every(a=>{
            if(!(a.name in nodeTest))
                return 
            let attrTest=nodeTest[a.name];
            if(attrTest==0)
                return true
            return attrTest.test(a.value)
        })
    }else if(n.nodeType==3)
        return 1
}
function*renderUrl(s){
    for(let m;m=uri.matchAbsoluteUri(s);){
        yield dom$3.tn(s.substring(0,m.index));
        yield /^https?/.test(m[0])?
            dom$3.a(decodeURI(m[0]),{href:m[0]})
        :
            dom$3.tn(m[0]);
        s=s.substring(m.index+m[0].length);
    }
    yield dom$3.tn(s);
}

let {dom: dom$4}=core;
function createMessageDiv(ui){
    function syncDivScroll(){
        if(ui.atBottom)
            div.scrollTop=div.scrollHeight;
    }
    function updateAtBottom(){
        ui.atBottom=Math.abs(
            div.scrollTop+div.clientHeight-div.scrollHeight
        )<=1;
    }
    let div=dom$4.div(
        {
            className:'message',
            onscroll:updateAtBottom,
            onclick(e){
                getSelection().isCollapsed&&ui.textarea.focus();
            },
        },
        ui._topDiv=createTopDiv(ui),
        ui._previewNode=dom$4.div({className:'preview'})
    );
    updateAtBottom();
    ui.syncInnerMessageDivScroll=syncDivScroll;
    return ui._innerMessageDiv=div
}
function createTopDiv(ui){
    return dom$4.div(
        {className:'top'},
        createShowOlderMessagesButton(ui)
    )
}
function createShowOlderMessagesButton(ui){
    return dom$4.button({onclick(e){
        e.stopPropagation();
        ui._queryOlder();
    }},'Show Older Messages')
}

let {browser: browser$1}=core;
let colorScheme={
    'default':{
        name:'Default',
        style:`
div.chat>div.message>div.preview{
    color:gray;
}
${!browser$1.isMobile?`
div.chat>div.message::-webkit-scrollbar{
    width:12px;
}
div.chat>div.message::-webkit-scrollbar-track{
    border-radius:6px;
    background:#DDD;
}
div.chat>div.message::-webkit-scrollbar-thumb{
    border-radius:6px;
    background:#BBB;
}
`:''}`,
    },
    'gnulinux':{
        name:'GNU/Linux',
        style:`
div.chat>div.message>div.preview{
    color:dimgray;
}
div.chat a:active,div.chat a:link,div.chat a:hover,div.chat a:visited{
    color:lightblue;
}
div.chat button{
    background-color:black;
    color:lightgray;
}
div.chat>div.message{
    background-color:black;
    color:lightgray;
}
div.chat>div.message a.user{
    color:lightgray;
}
div.chat>div.bottom textarea{
    background-color:black;
    color:lightgray;
}
${!browser$1.isMobile?`
div.chat>div.message::-webkit-scrollbar{
    width:12px;
}
div.chat>div.message::-webkit-scrollbar-track{
    border-radius:6px;
    background:#222;
}
div.chat>div.message::-webkit-scrollbar-thumb{
    border-radius:6px;
    background:#444;
}
`:''}
`,
    }
};

let {dom: dom$6}=core;
function setupSettingsButton(ui){
    ui._settingsButton=dom$6.button('Settings',{onclick(e){
        ui._push();
        let bF=dom$6.createBF();
        dom$6(ui.node,bF.node);
        bF.appendChild(createSettingsDiv(ui));
        bF.on('backClick',e=>{
            ui.node.removeChild(bF.node);
            ui._pop();
        });
    }});
}
function createSettingsDiv(ui){
    return dom$6.div(
        n=>{
            dom$6(n.style,{
                margin:'16px 24px',
                width:'280px',
            });
        },
        notificationSound(ui),
        colorSchemeP(ui),
        pressEnterToSendP(ui),
        showTexButton(ui),
        showSendButton(ui),
    )
}
function notificationSound(ui){
    return dom$6.p(
        'Notification Sound: ',
        dom$6.input({
            type:'range',
            max:1,
            step:0.01,
            value:ui.getSetting('notificationSound'),
            onchange(e){
                ui.setSetting('notificationSound',this.value);
                ui.playNotificationSound();
            }
        })
    )
}
function colorSchemeP(ui){
    let s=ui.getSetting('colorScheme');
    return dom$6.p(
        'Color Scheme: ',
        dom$6.select(
            ...Object.keys(colorScheme).map(i=>
                dom$6.option({value:i},colorScheme[i].name,n=>{
                    if(s==i)
                        n.selected=true;
                })
            ),
            {onchange(e){
                ui.setSetting('colorScheme',this.value);
            }}
        )
    )
}
function pressEnterToSendP(ui){
    return dom$6.p(
        dom$6.label(
            dom$6.input({
                type:'checkbox',
                checked:ui.getSetting('pressEnterToSend'),
                onchange(e){
                    ui.setSetting('pressEnterToSend',this.checked);
                }
            }),' Press Enter to send.')
    )
}
function showTexButton(ui){
    return dom$6.p(
        dom$6.label(
            dom$6.input({
                type:'checkbox',
                checked:ui.getSetting('showTexButton'),
                onchange(e){
                    ui.setSetting('showTexButton',this.checked);
                    ui._changeButtonDisplay(
                        '_bottomTexButton',
                        this.checked
                    );
                }
            }),' Show `TeX\' button.')
    )
}
function showSendButton(ui){
    return dom$6.p(
        dom$6.label(
            dom$6.input({
                type:'checkbox',
                checked:ui.getSetting('showSendButton'),
                onchange(e){
                    ui.setSetting('showSendButton',this.checked);
                    ui._changeButtonDisplay(
                        '_bottomSendButton',
                        this.checked
                    );
                }
            }),' Show `Send\' button.')
    )
}

let {dom: dom$7}=core;
async function loadVim(){
    let module=await moduleLoader();
    return module.importByPath(`${
        'https://gitcdn.link/cdn/anliting/webvim'
    }/${
        '585df5a6d6daa30dc78af958804f658c163dfe59'
    }/src/Vim.static.js`,{mode:1})
}
async function load$1(ui,textarea){
    if(typeof loadVim=='function')
        loadVim=loadVim();
    textarea.disabled=true;
    let Vim=await loadVim;
    let vim=new Vim(p=>{
        if(p=='~/.vimrc')
            return localStorage.webvimVimrc
    }),viewDiv=createViewDiv(vim);
    vim.text=textarea.value;
    vim._cursor.moveTo(textarea.selectionStart);
    dom$7.head(vim.style);
    dom$7.body(viewDiv);
    vim.polluteCopy;
    vim.focus();
    vim.on('quit',e=>{
        document.head.removeChild(vim.style);
        document.body.removeChild(viewDiv);
        textarea.disabled=false;
        textarea.focus();
    });
    vim.write=p=>{
        if(p==undefined){
            ui._changeTextareaValue(vim.text);
            textarea.selectionStart=textarea.selectionEnd=
                vim.cursor;
        }else if(p=='~/.vimrc')
            localStorage.webvimVimrc=vim.text;
    };
}
function createViewDiv(vim){
    vim.width=80;
    vim.height=24;
    return dom$7.div(
        vim.node,
        {onclick(){
            vim.focus();
        }},
        n=>{dom$7(n.style,{
            position:'fixed',
            left:'50%',
            top:'50%',
            transform:'translate(-50%,-50%)',
            width:'min-content',
            zIndex:'3'
        });}
    )
}

let {arg: arg$1,dom: dom$5}=core;
function createTextarea(ui){
    let textarea=dom$5.textarea({
        rows:2,
        title:'Alt+V: Open the Web Vim editor.',
        oninput(e){
            ui.updateTextareaHeight();
            ui._updatePreview();
        }
    });
    textarea.onkeydown=e=>{
        let pdsp=_=>{e.stopPropagation(),e.preventDefault();};
        if(
            ui.getSetting('pressEnterToSend')&&
            !e.ctrlKey&&!e.shiftKey&&e.key=='Enter'
        ){
            pdsp();
            return ui._send()
        }
        if(e.altKey&&e.key.toLowerCase()=='v'){
            pdsp();
            return load$1(ui,textarea)
        }
    }
    ;(async()=>{
        let user=await ui._currentUser;
        await user.load('nickname');
        textarea.placeholder=`${user.nickname}: `;
    })();
    return textarea
}
function setupFileButton(ui){
    ui._fileButton=dom$5.createFileButton('Image');
    ui._fileButton.on('file',async a=>{
        ui._fileButton.n.disabled=true;
        let imageIds=await ui.imageUploader.uploadImages(a);
        ui.textarea.value+=imageIds.map(id=>
            `<img src=img/${id}c800x600.jpg>\n`
        ).join('');
        ui._updatePreview();
        ui.updateTextareaHeight();
        ui._fileButton.n.disabled=false;
    });
}
function setupStatusNode(ui){
    ui._statusNode=dom$5.span();
}
function createSendButton(ui){
    return dom$5.button('Send',{onclick(){
        ui._send();
    }})
}
function createBottom(ui){
    setupFileButton(ui);
    setupSettingsButton(ui);
    setupFindButton(ui);
    setupStatusNode(ui);
    return dom$5.div(
        {className:'bottom'},
        ui.textarea=createTextarea(ui),
        arg$1.h&&[ui._findButton,' '],
        ui._bottomTexButton=createTexButton(ui),' ',
        ui._fileButton.n,' ',
        ui._bottomSendButton=createSendButton(ui),' ',
        ui._settingsButton,' ',
        ui._statusNode
    )
}
function createTexButton(ui){
    return dom$5.button('TeX',{
        title:`
When you click this button, it places \`<span class=tex>' and \`</span>' around your selection in the input.
`,
        onclick(e){
            let
                s=ui.textarea.value,
                a=ui.textarea.selectionStart,
                b=ui.textarea.selectionEnd,
                stepForward='<span class=tex>'.length;
            ui.textarea.value=`${s.substring(0,a)}<span class=tex>${
                s.substring(a,b)
            }</span>${s.substring(b)}`;
            ui.textarea.selectionStart=a+stepForward;
            ui.textarea.selectionEnd=b+stepForward;
            ui.textarea.focus();
            ui._updatePreview();
        }
    })
}
function setupFindButton(ui){
    ui._findButton=dom$5.button('Find');
}

function StyleManager(){
    this._style=[];
}
StyleManager.prototype.insert=function(content){
    let s={content};
    if(this._forEach)
        s.rollback=this._forEach(s.content);
    this._style.push(s);
    return this._style.length-1
};
StyleManager.prototype.remove=function(id){
    let s=this._style[id];
    if(this._forEach)
        s.rollback();
    this._style.splice(id,1);
};
Object.defineProperty(StyleManager.prototype,'forEach',{set(forEach){
    this._forEach=forEach;
    this._style.map(forEach?
        s=>s.rollback=forEach(s.content)
    :
        s=>s.rollback()
    );
},get(){
    return this._forEach
}});

function loadSettings(){
    this._changeButtonDisplay(
        '_bottomTexButton',
        this.getSetting('showTexButton')
    );
    this._changeButtonDisplay(
        '_bottomSendButton',
        this.getSetting('showSendButton')
    );
}

let {dom: dom$8}=core;
function createSingleMessageNode(ui,message){
    let
        n=dom$8.p(),
        p=(async()=>{
            let a=await(ui.users[message.fromUser]).finalA;
            let span=await createSpan(message);
            dom$8(n,a,': ',span.span);
            ui.syncInnerMessageDivScroll();
            await span.promise;
            ui.syncInnerMessageDivScroll();
        })();
    return{n,p}
}
async function createSpan(message){
    let span=dom$8.span(
        {title:(new Date(message.timestamp)).toLocaleString()},
        await compile(message.message)
    );
    return{
        span,
        promise:Promise.all(
            [...span.getElementsByTagName('img')].map(img=>
                new Promise((rs,rj)=>{
                    img.addEventListener('load',rs);
                    img.addEventListener('error',rs);
                })
            )
        )
    }
}

async function uiAddMessages(messages,mode){
    let insert;
    if(mode=='prepend'){
        messages=messages.slice();
        messages.reverse();
        insert=div=>this._topDiv.after(div);
    }else if(mode=='append'){
        insert=div=>this._previewNode.before(div);
    }
    messages.map(message=>
        insert(createSingleMessageNode(this,message).n)
    );
    this.syncInnerMessageDivScroll();
}

let {dom: dom$2}=core;
function Ui(currentUser,getSetting,setSetting){
    this._currentUser=currentUser;
    this._styleManager=new StyleManager;
    this.getSetting=getSetting;
    this.setSetting=setSetting;
    this.users={};
    this.node=dom$2.div(
        {className:'chat'},
        this.messageDiv=createMessageDiv(this),
        this.bottomDiv=createBottom(this)
    );
    loadSettings.call(this);
}
Ui.prototype._push=function(){
    this._settingsButton.disabled=true;
};
Ui.prototype._pop=function(){
    this._settingsButton.disabled=false;
};
Ui.prototype._changeButtonDisplay=function(button,display){
    this[button].style.display=display?'':'none';
};
Ui.prototype._changeTextareaValue=function(v){
    this.textarea.value=v;
    this._updatePreview();
    this.updateTextareaHeight();
};
Ui.prototype._updatePreview=async function(){
    dom$2(this._previewNode,
        {innerHTML:''},
        await compile(this.textarea.value)
    );
    this.syncInnerMessageDivScroll();
};
Ui.prototype._send=function(){
    if(this.textarea.value=='')
        return
    this.sendMessage(this.textarea.value);
    this.textarea.value='';
    this._updatePreview();
};
Ui.prototype._queryOlder=function(){
    this.queryOlder();
};
Ui.prototype.focus=function(){
    this.textarea.focus();
};
Ui.prototype.updateTextareaHeight=function(){
    let rows=Math.max(2,Math.min(4,
        this.textarea.value.split('\n').length
    ));
    this.textarea.rows=rows;
    this.syncInnerMessageDivScroll();
};
Ui.prototype.prepend=async function(messages){
    return uiAddMessages.call(this,messages,'prepend')
};
Ui.prototype.append=async function(messages){
    return uiAddMessages.call(this,messages,'append')
};
Ui.prototype.changeStyle=function(id){
    if(this._style!=undefined)
        this._styleManager.remove(this._style);
    this._style=this._styleManager.insert({
        id,
        content:colorScheme[id].style,
    });
};
Object.defineProperty(Ui.prototype,'style',{set(val){
    this._styleManager.forEach=val;
},get(){
    return this._styleManager.forEach
}});
Object.defineProperty(Ui.prototype,'connectionStatus',{set(val){
    this._connectionStatus=val;
    this._statusNode.textContent=val=='online'?'':'offline';
}});

var ui = {get(){
    if(this._ui)
        return this._ui
    if(this.getSetting('colorScheme')==undefined)
        this.setSetting('colorScheme','default');
    if(this.getSetting('notificationSound')==undefined)
        this.setSetting('notificationSound',0);
    if(this.getSetting('pressEnterToSend')==undefined)
        this.setSetting('pressEnterToSend',false);
    if(this.getSetting('showTexButton')==undefined)
        this.setSetting('showTexButton',false);
    if(this.getSetting('showSendButton')==undefined)
        this.setSetting('showSendButton',true);
    let ui=new Ui(this._currentUser,this.getSetting,(k,v)=>{
        this.setSetting(k,v);
        if(k=='colorScheme')
            ui.changeStyle(v);
    });
    ui.queryOlder=()=>this._getMessages('before');
    ui.sendMessage=m=>this._sendMessage(m);
    ui.playNotificationSound=this.playNotificationSound;
    ui.imageUploader=this._imageUploader;
    ui.connectionStatus=this._connectionStatus;
    ui.changeStyle(this.getSetting('colorScheme'));
    return this._ui=ui
}};

var style = `
div.chat{
    display:flex;
    flex-direction:column;
}
div.chat>div.message{
    margin-bottom:8px;
    flex:1;
}
div.chat>div.message{
    padding-right:8px;
    overflow-y:scroll;
    overflow-wrap:break-word;
/*
    In Chrome 57, 'word-break:break-all' is causing
    'overflow-wrap:break-word' not to break 'a lot of continuous "！"'. I
    considered it as a browser bug.

    It also results in horizontal scroll.
*/
    /*word-break:break-all;*/
    /*text-align:justify;*/
}
div.chat>div.message>div.top{
    text-align:center;
}
div.chat>div.message a.user{
    color:black;
    text-decoration:none;
}
div.chat>div.message img{
    max-width:60%;
}
div.chat>div.bottom>textarea{
    width:calc(100% - 6px);
    resize:none;
}
/* start fullscreen */
/*body:-webkit-full-screen{
    margin:0;
    width:100%;
    height:100%;
    background-color:white;
}
body:-webkit-full-screen>.chat{
    padding:8px;
    width:calc(100% - 16px);
    height:calc(100% - 16px);
    background-color:white;
}*/
/* end fullscreen */
`;

var mobileStyle = ``;

var desktopStyle = ``;

let {browser}=core;
let deviceSpecificStyle=browser.isMobile?mobileStyle:desktopStyle;
let blockSize=16;
function Room(
    send,
    createSession,
    getUser,
    imageUploader,
    conversationId,
    currentUser,
    target
){
    EventEmmiter.call(this);
    this._sendFunction=send;
    this._createSession=createSession;
    this._getUser=getUser;
    this._imageUploader=imageUploader;
    this._conversationId=conversationId;
    this._currentUser=currentUser;
    this._messages=[]
    ;(async()=>{
        await this._getMessages('before');
        let session=this._createSession();
        session.send({
            function:       'listenMessages',
            conversation:   (await this._conversationId),
            after:          roomCalcAfter.call(this),
        });
        session.onMessage=doc=>{
            let res=doc.value;
            if(this._ui)
                roomAddMessagesToUi.call(this,'append',res);
            this._messages=this._messages.concat(res);
            if(res.length)
                this.emit('append');
        };
    })();
}
Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype);
Room.prototype._getMessagesData=async function(){
    let
        chat=this;
    let doc={
        function:       'getMessages',
        conversation:   (await this._conversationId),
    };
    doc.after=0;
    doc.before=calcBefore();
    doc.last=blockSize;
    return this._send(doc)
    function calcBefore(){
        return chat._messages.length==0?
            0
        :
            chat._messages[0].id
    }
};
function roomCalcAfter(){
    return this._messages.length==0?
        0
    :
        this._messages[this._messages.length-1].id+1
}
Room.prototype._getMessages=async function(){
    if(this._getMessagesPromise)
        return
    this._getMessagesPromise=this._getMessagesData();
    try{
        let res=await this._getMessagesPromise;
        if(res.length){
            res.sort((a,b)=>a.id-b.id);
            if(this._ui)
                roomAddMessagesToUi.call(this,'prepend',res);
            this._messages=res.concat(this._messages);
        }
    }catch(e){}
    delete this._getMessagesPromise;
};
Room.prototype._sendMessage=async function(message){
    return this._send({
        function:       'sendMessage',
        conversation:   (await this._conversationId),
        message,
    })
};
Room.prototype._send=async function(doc){
    return this._sendFunction(doc)
};
Object.defineProperty(Room.prototype,'connectionStatus',{set(val){
    this._connectionStatus=val;
    if(this._ui)
        this._ui.connectionStatus=val;
}});
Room.prototype.style=style+deviceSpecificStyle;
Object.defineProperty(Room.prototype,'ui',ui);
async function roomAddMessagesToUi(mode,messages){
    await Promise.all(messages.map(async row=>{
        this._ui.users[row.fromUser]=await this._getUser(row.fromUser);
    }));
    this._ui[mode](messages);
}

var Chat = {
    Room
};

let {ImageUploader}=core;
async function getTwoMenConversation(s,target){
    let site=await s;
    let id=await site.send({
        function:'getTwoMenConversation',
        target:(await target).id,
    });
    return id
}
var createChatRoom = async function(target,site){
    site=await site;
    let chatRoom=new Chat.Room(
        async d=>site.send(d),
        ()=>site.createSession(),
        async i=>site.getUser(i),
        new ImageUploader(site),
        getTwoMenConversation(site,target),
        site.currentUser,
        target
    );
    chatRoom.getSetting=k=>this.settings[k];
    chatRoom.setSetting=(k,v)=>this.setSetting(k,v);
    chatRoom.playNotificationSound=()=>this.playSound();
    update();
    addEventListener('offline',update);
    addEventListener('online',update);
    return chatRoom
    function update(){
        chatRoom.connectionStatus=navigator.onLine?'online':'offline';
    }
};

var mainStyle = `
html{
    height:100%;
}
body{
    height:calc(100% - 16px);
}
a:active,a:link,a:hover,a:visited{
    color:blue;
}
.chat{
    height:100%;
    max-width:600px;
    margin:0 auto;
}
.conversationList{
    height:100%;
    max-width:600px;
    margin:0 auto;
}
/*
    I don't know why the KaTeX makes the scroll bar appear; but this fixes
    it on desktop version; and the mobile version does still.
*/
body{
    overflow-y:hidden;
}
`;

let {dom: dom$9,order}=core;
function createConversation(site,id){
    let
        user=site.getUser(id),
        tc=textContent(id);
    return{
        n:dom$9.div(createLink(id)),
        order:tc,
    }
    async function textContent(id){
        let u=await user;
        await u.load(['username','nickname']);
        return u.nickname||u.username
    }
    async function createLink(id){
        return dom$9.a(async n=>{
            let u=await user;
            await u.load('username');
            n.href=`chat/${u.username}`;
            return tc
        })
    }
}
var showConversationList = async function(){
    document.title='Conversations - Chat';
    let n=dom$9.div('Conversations:',{className:'conversationList'});
    order.post(
        (await this._site.send('getConversations')).map(async id=>{
            let c=createConversation(this._site,id);
            return{
                n:c.n,
                o:await c.order
            }
        }),
        (a,b)=>n.insertBefore(a.n,b.n),
        e=>dom$9(n,e.n),
        (a,b)=>a.o.localeCompare(b.o)<0
    );
    dom$9.body(n);
};

let {dom: dom$1,Site}=core;
let site=new Site;
function ChatPage(){
    this._site=site;
    this.settings=localStorage.altheaChatSettings?
        JSON.parse(localStorage.altheaChatSettings)
    :
        {notificationSound:0};
    dom$1.head(
        this.style=dom$1.style(mainStyle),
        this.themeColor=dom$1.meta({name:'theme-color'})
    );
}
ChatPage.prototype.playSound=function(settings){
    dom$1.body(dom$1.audio({
        autoplay:true,
        src:'plugins/althea-chat/main/notification-a.mp3',
        onended(e){document.body.removeChild(this);},
        volume:this.settings.notificationSound,
    }));
};
ChatPage.prototype.showConversationList=showConversationList;
ChatPage.prototype.showChatRoom=function(id){
    let
        target=getUser(id),
        chatRoom=createChatRoom.call(
            this,
            target,
            site
        );
    notification.call(this,chatRoom,target);
    content.call(this,chatRoom);
    async function getUser(id){
        return site.getUser(id)
    }
};
ChatPage.prototype.setSetting=function(k,v){
    this.settings[k]=v;
    localStorage.altheaChatSettings=JSON.stringify(this.settings);
};
async function notification(chat,target){
    await Promise.all([
        (async()=>{
            chat=await chat;
        })(),
        (async()=>{
            target=await target;
            await target.load('nickname');
        })(),
    ]);
    let
        tabIsFocused=true,
        notification=0,
        unread=0;
    updateTitle();
    setInterval(updateTitle,1000);
    chat.on('append',()=>{
        if(tabIsFocused)
            return
        if(unread==0)
            notification=1;
        unread++;
        this.playSound();
    });
    addEventListener('focusin',e=>{
        tabIsFocused=true;
        unread=0;
    });
    addEventListener('focusout',e=>{
        tabIsFocused=false;
    });
    function updateTitle(){
        let notiPart=unread==0?'':`${'◯⬤'[notification]} (${unread}) `;
        lazyChangeTitle(`${notiPart}${target.nickname}`);
        notification=1-notification;
    }
    function lazyChangeTitle(s){
        document.title==s||(document.title=s);
    }
}
async function content(chat){
    chat=await chat;
    let ui=chat.ui;
    dom$1(this.style,await chat.style);
    ui.style=s=>{
        let n=dom$1.tn(s.content);
        dom$1(this.style,n);
        let color={
            default:'',
            gnulinux:'black',
        }[s.id];
        this.themeColor.content=color;
        document.body.style.backgroundColor=color;
        return()=>this.style.removeChild(n)
    };
    dom$1.body(ui.node);
    ui.focus();
}
var chatPage = new ChatPage;

let {dom,general}=core;
dom.head(
    dom.link({rel:'icon',href:'plugins/althea-chat/icon.png'})
);
general();
arg.userId==undefined?
    chatPage.showConversationList()
:
    chatPage.showChatRoom(arg.userId);
