import { ImageUploader, Site, arg as arg$1, browser, dom, general, html, order, uri } from '/lib/core.static.js';
import { DecalarativeSet, EventEmmiter, dom as dom$1 } from 'https://gitcdn.link/cdn/anliting/simple.js/55124630741399dd0fcbee2f0396642a428cdd24/src/simple.static.js';

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
`

let loadPromise;
async function load(){
    let
        root='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3',
        styleSheetUrl=`${root}/katex.min.css`,
        scriptUrl=`${root}/katex.min.js`;
    dom$1.head(
        dom$1.link({
            rel:'stylesheet',
            href:styleSheetUrl,
        })
    );
    await new Promise(rs=>
        dom$1.body(
            dom$1.script({
                src:scriptUrl,
                onload(){
                    document.body.removeChild(this);
                    rs();
                },
            })
        )
    );
}
var loadKatex = ()=>{
    if(!loadPromise)
        loadPromise=load();
    return loadPromise
}

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
let whitelist={
    a:[
        {
            href:/^img\//,
        },
        {
            href:/^https?:\/\//,
        },
    ],
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
    script:{
        type:/^tex$/,
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
            if(n.nodeName.toLowerCase()=='script'&&n.type=='tex'){
                await loadKatex();
                let o=document.createElement('span');
                try{
                    katex.render(n.textContent,o);
                }catch(e){
                    o.style.fontFamily='monospace';
                    o.title=e;
                    o.textContent=n.textContent;
                }
                m.replaceChild(o,n);
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
        return nodeTest instanceof Array?nodeTest.some(test):test(nodeTest)
        function test(nodeTest){
            return[...n.attributes].every(a=>{
                if(!(a.name in nodeTest))
                    return 
                let attrTest=nodeTest[a.name];
                return attrTest==0||attrTest.test(a.value)
            })
        }
    }else if(n.nodeType==3)
        return 1
}
function*renderUrl(s){
    for(let m;m=uri.matchAbsoluteUri(s);){
        yield dom.tn(s.substring(0,m.index));
        yield /^https?/.test(m[0])?
            dom.a(decodeURI(m[0]),{href:m[0]})
        :
            dom.tn(m[0]);
        s=s.substring(m.index+m[0].length);
    }
    yield dom.tn(s);
}

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
    let div=dom.div(
        {
            className:'message',
            onscroll:updateAtBottom,
            onclick(e){
                getSelection().isCollapsed&&ui.textarea.focus();
            },
        },
        ui._topDiv=createTopDiv(ui),
        ui._previewNode=dom.div({className:'preview'})
    );
    updateAtBottom();
    ui.syncInnerMessageDivScroll=syncDivScroll;
    return ui._innerMessageDiv=div
}
function createTopDiv(ui){
    return dom.div(
        {className:'top'},
        createShowOlderMessagesButton(ui)
    )
}
function createShowOlderMessagesButton(ui){
    return dom.button({onclick(e){
        e.stopPropagation();
        ui._queryOlder();
    }},'Show Older Messages')
}

let colorScheme={
    'default':{
        name:'Default',
        style:`
            .chat>.message>.preview{
                color:gray;
            }
            ${!browser.isMobile?`
            .chat>.message::-webkit-scrollbar{
                width:12px;
            }
            .chat>.message::-webkit-scrollbar-track{
                border-radius:6px;
                background:#DDD;
            }
            .chat>.message::-webkit-scrollbar-thumb{
                border-radius:6px;
                background:#BBB;
            }
            `:''}
        `,
    },
    'gnulinux':{
        name:'GNU/Linux',
        style:`
            .chat>.message>.preview{
                color:dimgray;
            }
            .chat a:active,
            .chat a:link,
            .chat a:hover,
            .chat a:visited
            {
                color:lightblue;
            }
            .chat>.message>.top>button,
            .chat>.bottom>button,
            .chat>.bottom>select
            {
                background-color:black;
                color:lightgray;
            }
            .chat>.message{
                background-color:black;
                color:lightgray;
            }
            .chat>.message a.user{
                color:lightgray;
            }
            .chat>.bottom textarea{
                background-color:black;
                color:lightgray;
            }
            ${!browser.isMobile?`
            .chat>.message::-webkit-scrollbar{
                width:12px;
            }
            .chat>.message::-webkit-scrollbar-track{
                border-radius:6px;
                background:#222;
            }
            .chat>.message::-webkit-scrollbar-thumb{
                border-radius:6px;
                background:#444;
            }
            `:''}
        `,
    }
};

function setupSettingsButton(ui){
    ui._settingsButton=dom.button('Settings',{onclick(e){
        ui._push();
        let bF=dom.createBF();
        bF.appendChild(createSettingsDiv(ui));
        dom(ui.node,bF.node);
        bF.on('backClick',e=>{
            ui.node.removeChild(bF.node);
            ui._pop();
        });
    }});
}
function createSettingsDiv(ui){
    return dom.div(
        n=>{
            dom(n.style,{
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
    return dom.p(
        'Notification Sound: ',
        dom.input({
            type:'range',
            max:1,
            step:0.01,
            value:ui.notificationSound,
            onchange(e){
                ui.notificationSound=this.value;
                ui.set('notificationSound');
                ui._playNotificationSound();
            }
        })
    )
}
function colorSchemeP(ui){
    let s=ui._colorScheme;
    return dom.p(
        'Color Scheme: ',
        dom.select(
            ...Object.keys(colorScheme).map(i=>
                dom.option({value:i},colorScheme[i].name,n=>{
                    if(s==i)
                        n.selected=true;
                })
            ),
            {onchange(e){
                ui.colorScheme=this.value;
                ui.set('colorScheme');
            }}
        )
    )
}
function pressEnterToSendP(ui){
    return dom.p(
        dom.label(
            dom.input({
                type:'checkbox',
                checked:ui.pressEnterToSend,
                onchange(e){
                    ui.pressEnterToSend=this.checked;
                    ui.set('pressEnterToSend');
                },
            }),' Press Enter to send.')
    )
}
function showTexButton(ui){
    return dom.p(
        dom.label(
            dom.input(
                {
                    type:'checkbox',
                    checked:ui._showTexButton,
                    onchange(e){
                        ui.showTexButton=this.checked;
                        ui.set('showTexButton');
                    }
                }),
                ' Show `',
                dom.span(
                    n=>{n.style.fontFamily='serif';},
                    'T',
                    dom.span(n=>{n.style.verticalAlign='sub';},'E'),
                    'X'
                ),
                '\' button in HTML mode.',
            )
    )
}
function showSendButton(ui){
    return dom.p(
        dom.label(
            dom.input({
                type:'checkbox',
                checked:ui._showSendButton,
                onchange(e){
                    ui.showSendButton=this.checked;
                    ui.set('showSendButton');
                }
            }),' Show `Send\' button.')
    )
}

let Vim;
function evalImport(s){
    return eval(`import(${JSON.stringify(s)})`)
}
async function loadVim(){
    return(await evalImport('https://gitcdn.link/cdn/anliting/webvim/b3e769a34f699755b7f7585231e11778390e5034/src/Vim.static.js')).default
}
async function setUpVim(ui,textarea){
    textarea.disabled=true;
    if(!Vim)
        Vim=await loadVim();
    let vim=new Vim(p=>{
        if(p=='~/.vimrc')
            return localStorage.webvimVimrc
    }),viewDiv=createViewDiv(vim);
    vim.text=textarea.value;
    vim._cursor.moveTo(textarea.selectionStart);
    let
        headStyle={type:'head',node:vim.style},
        bodyUi={type:'body',node:viewDiv};
    ui.out.in(headStyle);
    ui.out.in(bodyUi);
    vim.focus();
    vim.on('quit',e=>{
        ui.out.out(headStyle);
        ui.out.out(bodyUi);
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
    return dom.div(
        vim.node,
        {onclick(){
            vim.focus();
        }},
        n=>{dom(n.style,{
            position:'fixed',
            left:'50%',
            top:'50%',
            transform:'translate(-50%,-50%)',
            width:'min-content',
            zIndex:'3'
        });}
    )
}

function createTextarea(ui){
    return dom.textarea({
        rows:2,
        title:'Alt+V: Open the Web Vim editor.',
        oninput(e){
            ui.updateTextareaHeight();
            ui._updatePreview();
        },
        onkeydown(e){
            let pdsp=_=>{e.stopPropagation(), e.preventDefault();};
            if(
                ui.pressEnterToSend&&
                !e.ctrlKey&&!e.shiftKey&&e.key=='Enter'
            ){
                pdsp();
                return ui._send()
            }
            if(e.altKey&&e.key.toLowerCase()=='v'){
                pdsp();
                return setUpVim(ui,this)
            }
        },
    })
}
function setupFileButton(ui){
    ui._fileButton=dom.createFileButton('Image');
    ui._fileButton.on('file',async a=>{
        ui._fileButton.n.disabled=true;
        let imageIds=await ui.imageUploader.uploadImages(a);
        ui.textarea.value+=imageIds.map(id=>
            `<a href=img/${id}.jpg><img src=img/${id}c800x600.jpg></a>`
        ).join('');
        ui._updatePreview();
        ui.updateTextareaHeight();
        ui._fileButton.n.disabled=false;
    });
    ui._fileButton.n.style.display='none';
}
function setupStatusNode(ui){
    ui._statusNode=dom.span();
}
function createSendButton(ui){
    return dom.button('Send',{onclick(){
        ui._send();
    }})
}
function createBottom(ui){
    setupFileButton(ui);
    setupSettingsButton(ui);
    setupFindButton(ui);
    setupStatusNode(ui);
    return dom.div(
        {className:'bottom'},
        ui.textarea=createTextarea(ui),
        dom.a({
            href:'/chat',
            onclick(e){
                if(!(
                    !e.altKey&&
                    !e.ctrlKey&&
                    !e.metaKey&&
                    !e.shiftKey&&
                    e.button==0
                ))
                    return
                e.preventDefault();
                e.stopPropagation();
                ui._goConversations();
            },
        },'Conversations'),' ',
        arg$1.h&&[ui._findButton,' '],
        ui._modeSelect=createModeSelect(ui),' ',
        ui._bottomTexButton=createTexButton(ui),' ',
        ui._fileButton.n,' ',
        ui._bottomSendButton=createSendButton(ui),' ',
        ui._settingsButton,' ',
        ui._statusNode,
    )
}
function createModeSelect(ui){
    return dom.select(
        {
            onchange(){
                ui._setMode(this.value);
            },
        },
        dom.option({value:'plainText'},'Plain Text'),
        dom.option({value:'html'},'HTML'),
    )
}
function createTexButton(ui){
    return dom.button(
        {
            title:`
    When you click this button, it places \`<script type=tex>' and \`</script>' around your selection in the input.
    `,
            onclick(e){
                let
                    s=ui.textarea.value,
                    a=ui.textarea.selectionStart,
                    b=ui.textarea.selectionEnd,
                    stepForward='<script type=tex>'.length;
                ui.textarea.value=`${s.substring(0,a)}<script type=tex>${
                    s.substring(a,b)
                }</script>${s.substring(b)}`;
                ui.textarea.selectionStart=a+stepForward;
                ui.textarea.selectionEnd=b+stepForward;
                ui.textarea.focus();
                ui._updatePreview();
            }
        },
        dom.span(
            n=>{n.style.fontFamily='serif';},
            'T',
            dom.span(n=>{n.style.verticalAlign='sub';},'E'),
            'X'
        )
    )
}
function setupFindButton(ui){
    ui._findButton=dom.button('Find');
}

function createSingleMessageNode(ui,message){
    let
        n=dom.p(),
        p=(async()=>{
            let a=await(ui.users[message.fromUser]).finalA;
            let span=await createSpan(message);
            dom(n,a,': ',span.span);
            ui.syncInnerMessageDivScroll();
            await span.promise;
            ui.syncInnerMessageDivScroll();
        })();
    return{n,p}
}
async function createSpan(message){
    let span=dom.span(
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

function loadInterface(o){
    Object.defineProperty(o,'connectionStatus',{set(val){
        this._connectionStatus=val;
        this._statusNode.textContent=val=='online'?'':'offline';
    }});
    Object.defineProperty(o,'currentUserNickname',{set(val){
        this.textarea.placeholder=`${val}: `;
    }});
    o.focus=function(){
        this.textarea.focus();
    };
    Object.defineProperty(o,'showSendButton',{set(val){
        this._changeButtonDisplay(
            '_bottomSendButton',
            val
        );
        this._showSendButton=val;
    },get(){
        return this._showSendButton
    }});
    Object.defineProperty(o,'showTexButton',{set(val){
        this._changeButtonDisplay(
            '_bottomTexButton',
            this._mode=='html'&&val
        );
        this._showTexButton=val;
    },get(){
        return this._showTexButton
    }});
}

function Ui(){
    this._mode='plainText';
    this.users={};
    this.out=new DecalarativeSet;
    this.node=dom.div(
        {className:'chat'},
        this.messageDiv=createMessageDiv(this),
        this.bottomDiv=createBottom(this),
        ()=>{
            this._changeButtonDisplay(
                '_bottomTexButton',
                this._mode=='html'&&this._showTexButton
            );
            this._changeButtonDisplay(
                '_bottomSendButton',
                this._showSendButton
            );
        },
    );
    this.out.in({
        type:'body',
        node:this.node,
    });
    this.colorScheme='default';
}
Ui.prototype._push=function(){
    this._settingsButton.disabled=true;
};
Ui.prototype._pop=function(){
    this._settingsButton.disabled=false;
};
Ui.prototype._setMode=function(mode){
    this._mode=mode;
    this._updatePreview();
    this._changeButtonDisplay(
        '_bottomTexButton',
        this._mode=='html'&&this._showTexButton
    );
    this._fileButton.n.style.display=this._mode=='html'?'':'none';
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
    dom(this._previewNode,
        {innerHTML:''},
        await compile(this._mode=='html'?
            this.textarea.value
        :
            html.encodeText(this.textarea.value)
        )
    );
    this.syncInnerMessageDivScroll();
};
Ui.prototype._send=function(){
    if(this.textarea.value=='')
        return
    this.sendMessage(this._mode=='html'?
        this.textarea.value
    :
        html.encodeText(this.textarea.value)
    );
    this.textarea.value='';
    this._updatePreview();
};
Ui.prototype._queryOlder=function(){
    this.queryOlder();
};
Ui.prototype._goConversations=function(){
    if(this.goConversations)
        this.goConversations();
};
Ui.prototype._changeStyle=function(id){
};
Ui.prototype._showSendButton=true;
Ui.prototype._showTexButton=false;
Ui.prototype._playNotificationSound=function(){
    this.out.in({'type':'playSound'});
};
Ui.prototype.notificationSound=0;
Ui.prototype.pressEnterToSend=false;
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
Object.defineProperty(Ui.prototype,'colorScheme',{set(id){
    this._style&&this.out.out(this._style);
    this.out.in(this._style={
        type:'styleIdContent',
        id,
        content:colorScheme[id].style,
    });
    this._colorScheme=id;
},get(){
    return this._colorScheme
}});
loadInterface(Ui.prototype);

let pull=[
    'colorScheme',
    'notificationSound',
    'pressEnterToSend',
    'showSendButton',
    'showTexButton',
];
function createUi(){
    let ui=Object.assign(new Ui,this.settings,{
        set:k=>{
            if(pull.includes(k)){
                this.settings[k]=ui[k];
                this.set('settings');
            }
        },
        queryOlder:          ()=>this._getMessages('before'),
        sendMessage:         m=>this._sendMessage(m),
        imageUploader:       this._imageUploader,
        connectionStatus:    this._connectionStatus,
        goConversations:()=>{
            this.emit('goConversations');
        },
    });(async()=>{
        let user=await this._currentUser;
        await user.load('nickname');
        ui.currentUserNickname=user.nickname;
    })();
    ui.out.in({type:'style',node:dom.tn(this.style)});
    return ui
}

var style = `
.chat{
    display:flex;
    flex-direction:column;
}
.chat>.message{
    margin-bottom:8px;
    flex:1;
}
.chat>.message{
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
.chat>.message a.user{
    color:black;
    text-decoration:none;
}
.chat>.message img{
    max-width:100%;
    max-height:16em;
}
.chat>.message>.top{
    text-align:center;
}
.chat>.bottom>textarea{
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
`

var mobileStyle = ``

var desktopStyle = ``

async function roomAddMessagesToUi(mode,messages){
    await Promise.all(messages.map(async row=>{
        this.ui.users[row.fromUser]=await this._getUser(row.fromUser);
    }));
    this.ui[mode](messages);
}

async function startListen(){
    let
        startListen,
        promise=new Promise(rs=>startListen=rs);
    this._session=this._createSession();
    this._session.send({
        function:       'chat_listenMessages',
        conversation:   (await this._conversationId),
    });
    this._session.onMessage=doc=>{
        if(doc.error)
            return console.error(doc.error)
        let res=doc.value;
        switch(res.function){
            case'pushMessages':
                if(!res.value.length)
                    break
                res.value.sort((a,b)=>a.id-b.id);
                if(
                    !this._messages.length||
                    res.value[0].id<this._messages[0].id
                ){
                    roomAddMessagesToUi.call(this,'prepend',res.value);
                    this._messages=res.value.concat(this._messages);
                    this._gettingMessages=0;
                }else{
                    roomAddMessagesToUi.call(this,'append',res.value);
                    this._messages=this._messages.concat(res.value);
                    this.emit('append');
                }
            break
            case'listenStarted':
                startListen();
            break
        }
    };
    await promise;
}

let deviceSpecificStyle=browser.isMobile?mobileStyle:desktopStyle;
let blockSize=16;
function Room(
    send,
    createSession,
    getUser,
    imageUploader,
    conversationId,
    currentUser
){
    EventEmmiter.call(this);
    this._sendFunction=send;
    this._createSession=createSession;
    this._getUser=getUser;
    this._imageUploader=imageUploader;
    this._conversationId=conversationId;
    this._currentUser=currentUser;
    this._messages=[];
    this.ui=createUi.call(this);
    this._listenStart=new Promise(rs=>
        this._startListen=rs
    )
    ;(async()=>{
        await this._getMessages('before');
        this._startListen(startListen.call(this));
        await this._listenStart;
        this._session.send({
            function:       'chat_listenMessages_addRange',
            start:          roomCalcAfter.call(this),
        });
    })();
}
Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype);
Room.prototype._getMessagesData=async function(){
    return this._send({
        function:       'chat_getMessages',
        conversation:   (await this._conversationId),
        after:0,
        before:this._messages.length==0?0:this._messages[0].id,
        last:blockSize,
    })
};
function roomCalcAfter(){
    return this._messages.length==0?
        0
    :
        this._messages[this._messages.length-1].id+1
}
Room.prototype._getMessages=async function(){
    if(this._gettingMessages)
        return
    this._gettingMessages=1;
    if(this._messages.length==0){
        let res=await this._getMessagesData();
        if(res.length){
            res.sort((a,b)=>a.id-b.id);
            roomAddMessagesToUi.call(this,'prepend',res);
            this._messages=res.concat(this._messages);
        }
        this._gettingMessages=0;
    }else{
        await this._listenStart;
        this._session.send({
            function:       'chat_listenMessages_addRange',
            start:          0,
            end:            this._messages[0].id,
            last:           blockSize,
        });
    }
};
Room.prototype._sendMessage=async function(message){
    return this._send({
        function:       'chat_sendMessage',
        conversation:   (await this._conversationId),
        message,
    })
};
Room.prototype._send=async function(doc){
    return this._sendFunction(doc)
};
Room.prototype._settings={};
Object.defineProperty(Room.prototype,'connectionStatus',{set(val){
    this._connectionStatus=val;
    this.ui.connectionStatus=val;
}});
Object.defineProperty(Room.prototype,'settings',{set(val){
    this._settings=val;
    Object.assign(this.ui,val);
},get(){
    return this._settings
}});
Room.prototype.style=style+deviceSpecificStyle;

var Chat = {
    Room
}

async function getTwoMenConversation(site,target){
    return site.send({
        function:'chat_getTwoMenConversation',
        target:(await target).id,
    })
}
function createChatRoom(target){
    let chatRoom=new Chat.Room(
        d=>this._site.send(d),
        ()=>this._site.createSession(),
        i=>this._site.getUser(i),
        new ImageUploader({
            post:a=>this._site.post(a),
            send:a=>this._site.send(a),
        }),
        getTwoMenConversation(this._site,target),
        this._site.currentUser
    );
    chatRoom.settings=JSON.parse(JSON.stringify(this._settings));
    chatRoom.set=k=>{
        if(k=='settings')
            this._setSetting(chatRoom.settings);
    };
    chatRoom.on('goConversations',e=>{
        this.goConversationList();
    });
    update();
    addEventListener('offline',update);
    addEventListener('online',update);
    return chatRoom
    function update(){
        chatRoom.connectionStatus=navigator.onLine?'online':'offline';
    }
}

async function notification(chat,target){
    let out=chat.ui.out;
    await Promise.all([
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
    out.in({type:'interval',arguments:[updateTitle,1000]});
    chat.on('append',()=>{
        if(tabIsFocused)
            return
        if(unread==0)
            notification=1;
        unread++;
        out.in({'type':'playSound'});
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
function showChatRoom(id){
    let
        target=this._site.getUser(id),
        chatRoom=createChatRoom.call(this,target),
        out=new DecalarativeSet;
    chatRoom.ui.out.forEach={
        in(e){
            if(
                e.type=='styleIdContent'
            ){
                let color={
                    default:'initial',
                    gnulinux:'black',
                }[e.id];
                out.in(e.style={
                    type:'style',
                    node:dom.tn(
                        `${e.content}body{background-color:${color}}`
                    ),
                });
                out.in(e.themeColor={type:'themeColor',color});
            }else
                out.in(e);
        },
        out(e){
            if(
                e.type=='styleIdContent'
            ){
                out.out(e.style);
                out.out(e.themeColor);
            }else
                out.out(e);
        },
    };
    notification.call(this,chatRoom,target);
    this._setMainOut(out);
    chatRoom.ui.focus();
}

function createConversation(chatPage,site,id){
    let
        user=site.getUser(id),
        tc=textContent();
    return{
        n:dom.div(createLink()),
        order:tc,
    }
    async function textContent(){
        let u=await user;
        await u.load(['username','nickname']);
        return u.nickname||u.username
    }
    async function createLink(){
        return dom.a(async n=>{
            let u=await user;
            await u.load('username');
            n.href=`chat/${u.username}`;
            n.onclick=e=>{
                if(
                    e.altKey||
                    e.ctrlKey||
                    e.metaKey||
                    e.shiftKey||
                    e.button!=0
                )
                    return
                e.preventDefault();
                e.stopPropagation();
                chatPage.goChatRoom(id);
            };
            return tc
        })
    }
}
function goConversationList(){
    document.title='Conversations - Chat';
    let out=new DecalarativeSet;
    this._setMainOut(out);
    out.in({type:'body',node:dom.div(
        {className:'conversationList'},
        'Conversations:',
        async n=>{
            order.post(
                (await this._site.send('chat_getConversations')).map(async id=>{
                    let c=createConversation(this,this._site,id);
                    return{
                        n:c.n,
                        o:await c.order
                    }
                }),
                (a,b)=>n.insertBefore(a.n,b.n),
                e=>dom(n,e.n),
                (a,b)=>a.o.localeCompare(b.o)<0
            );
        }
    )});
}

function ChatPage(site){
/*
    properties:
        _mainOut
        _status
*/
    this._site=site;
    this._settings=localStorage.altheaChatSettings?
        JSON.parse(localStorage.altheaChatSettings)
    :
        {notificationSound:0};
    onpopstate=e=>{
        this._go(e.state);
    };
    dom.head(
        this._style=         dom.style(mainStyle),
        this._themeColor=    dom.meta({name:'theme-color'}),
    );
}
ChatPage.prototype._playSound=function(){
    dom.body(dom.audio({
        autoplay:true,
        src:'plugins/chat/main/ChatPage/notification-a.mp3',
        onended(e){document.body.removeChild(this);},
        volume:this._settings.notificationSound,
    }));
};
ChatPage.prototype._setSetting=function(settings){
    this._settings=settings;
    localStorage.altheaChatSettings=JSON.stringify(this._settings);
};
ChatPage.prototype._setMainOut=function(out){
    if(this._mainOut)
        this._mainOut.forEach=0;
    out.forEach={
        in:doc=>{
            switch(doc.type){
                case'head':
                    document.head.appendChild(doc.node);
                break
                case'body':
                    document.body.appendChild(doc.node);
                break
                case'interval':
                    doc.id=setInterval(...doc.arguments);
                break
                case'style':
                    this._style.appendChild(doc.node);
                break
                case'themeColor':
                    this._themeColor.content=doc.color;
                break
                case'playSound':
                    this._playSound();
                    out.out(doc);
                break
            }
        },
        out:doc=>{
            switch(doc.type){
                case'head':
                    document.head.removeChild(doc.node);
                break
                case'body':
                    document.body.removeChild(doc.node);
                break
                case'interval':
                    clearInterval(doc.id);
                break
                case'style':
                    this._style.removeChild(doc.node);
                break
                case'themeColor':
                    this._themeColor.content='';
                break
            }
        },
    };
    this._mainOut=out;
};
ChatPage.prototype._go=async function(status,internal=1){
    let setState=url=>{
        if(internal)
            return
        history[this._status?'pushState':'replaceState'](
            status,
            '',
            url
        );
    };
    if(status.name=='chatRoom'){
        let u=await this._site.getUser(status.id);
        await u.load('username');
        setState(`/chat/${encodeURIComponent(u.username)}`);
        showChatRoom.call(this,status.id);
    }else if(status.name='conversationList'){
        setState(`/chat`);
        goConversationList.call(this);
    }
    this._status=status;
};
ChatPage.prototype.go=async function(status){
    this._go(status,0);
};
ChatPage.prototype.goChatRoom=function(id){
    return this.go({
        name:'chatRoom',
        id,
    })
};
ChatPage.prototype.goConversationList=function(){
    return this.go({
        name:'conversationList',
    })
};

general();
let chatPage=new ChatPage(new Site);
dom.head(
    dom.link({rel:'icon',href:'plugins/chat/icon.png'})
);
arg.userId==undefined?
    chatPage.goConversationList()
:
    chatPage.goChatRoom(arg.userId);
