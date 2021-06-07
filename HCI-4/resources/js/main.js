const parser = math.parser();

const SYMBOL_WIDTH = 50;
const SYMBOL_HEIGHT = 50;
// 팝업 메뉴 버튼 전용 크기 상수
const BUTTON_WIDTH = 36;
const BUTTON_HEIGHT = 36;

let MathApp = {};

MathApp.symbol_paths = {
        '+':    "add",
        '-':    "sub",
        '*':    "mul",
        '/':    "div",
        '(':    "parenthesis_open",
        ')':    "parenthesis_close",
        '[':    "squarebracket_open",
        ']':    "squarebracket_close",
        '{':    "curlybrace_open",
        '}':    "curlybrace_close",
        '.':    "period",
        ',':    "comma",
        ':':    "colon",
        ';':    "semicolon",
        '=':    "equal",
        '>':    "more",
        '<':    "less",
        '!':    "exclamation"
};

MathApp.blocks = [];
MathApp.selected_block = null;

MathApp.is_mouse_dragging = false;       
MathApp.mouse_drag_prev = {x:0, y:0};

MathApp.block_types = {
    UNDEFINED:  "undefind",
    SYMBOL:     "symbol",
    // 팝업 메뉴 버튼의 type
    BUTTON:     "button",
};

// 지난 입력 시간과 symbol 위치
MathApp.lastTime = null;
MathApp.lastPosition;
// interval 상수
const INTERVAL = 400;

MathApp.initialize = function() {
    for(let i=0; i <= 9; i++)
    {
        let key = i.toString();
        let value = key;
        this.symbol_paths[key] = value;
    }

    for(let c="a".charCodeAt(0); c <= "z".charCodeAt(0); c++)
    {
        let key = String.fromCharCode(c);
        let value = key;
        this.symbol_paths[key] = value;
    }

    this.canvas = new fabric.Canvas("c", {
        backgroundColor: "#eee",
        hoverCursor: "default",
        selection: false,
        width: window.innerWidth,
        height: window.innerHeight,
    });

    //
    $(document).keypress(function(event) {
        let key = String.fromCharCode(event.which);
        MathApp.handleKeyPress(key);
    });
    // 팝업 메뉴 키보드 입력을 위한 함수
    $(document).keydown(function(event) {
        MathApp.handleKeyDown(event);
    });
    $(document).mousedown(function(event) {
        let p = {x: event.pageX, y: event.pageY};
        MathApp.handleMouseDown(p);
    });
    $(document).mouseup(function(event) {
        let p = {x: event.pageX, y: event.pageY};
        MathApp.handleMouseUp(p);
    });
    $(document).mousemove(function(event) {
        let p = {x: event.pageX, y: event.pageY};
        MathApp.handleMouseMove(p);
    });
}

MathApp.handleKeyPress = function(key) {
    // selected_block이 있다면, deselected 시킨다.
    if( MathApp.selected_block != null)
    {
        MathApp.selected_block.onDeselected();
        MathApp.selected_block = null;
    }

    if (key in this.symbol_paths) 
    {
        // 빠른 입력 감지
        let newTime = new Date();
        let interval = newTime - MathApp.lastTime
        if(interval <= INTERVAL) {
            console.log('Interval : ' + interval + 'ms');
        }
        MathApp.lastTime = newTime;

        let size = {
            width : SYMBOL_WIDTH,
            height : SYMBOL_HEIGHT
        };
        let position;
        if(interval > INTERVAL)
        position = {
            x : Math.random() * (this.canvas.width-size.width) + size.width/2,
            y : Math.random() * (this.canvas.height-size.height) + size.height/2
        };
        else
        position = {
            x : MathApp.lastPosition.x + SYMBOL_WIDTH + 10,
            y : MathApp.lastPosition.y,
        };

        let new_symbol = new MathApp.Symbol(position, size, key);

        MathApp.lastPosition = position;
    }
}

MathApp.printSymbol = function (char, pos) {
    let size = {
        width: SYMBOL_WIDTH,
        height: SYMBOL_HEIGHT
    };

    let new_symbol = new MathApp.Symbol(pos, size, char);
}

MathApp.printSymbols = function (str, pos) {
    for (let i = 0; i < str.length; i++) {
        let new_pos = {
            x: pos.x + (SYMBOL_WIDTH * i),
            y: pos.y,
        }
        this.printSymbol(str[i], new_pos);
    }

    // setTimeout으로 지연 : visual_items 로딩까지
    // 출처 : https://helloworldjavascript.net/pages/285-async.html
    setTimeout(function () {
        // 조립(Assemble)
        for (let i = 0; i < str.length - 1; i++) {
            // block 뒤에 subBlock을 합친다
            let block = MathApp.blocks[MathApp.blocks.length - 2];
            let subBlock = MathApp.blocks[MathApp.blocks.length - 1];

            subBlock.visual_items.forEach(item => {
                block.visual_items.push(item);
            });

            block.name += subBlock.name;
            block.size.width += subBlock.size.width;

            // 다 합쳤으니, 기존의 subBlock은 destroy한다.
            subBlock.destroy();

            // 맨앞으로 가져오기
            block.visual_items.forEach(item => {
                MathApp.canvas.bringToFront(item);
            });
        }
    }, 250)
}

// 팝업메뉴를 위한 키보드 입력 : Enter 이외에 Delete, Shift, Ctrl
MathApp.handleKeyDown = function (event) {
    // 기존 선택된 블록 : 팝업 메뉴 입력을 위한 변수
    let prevSelectedBlock = MathApp.selected_block;

    // selected_block이 있다면, deselected 시킨다.
    if (MathApp.selected_block != null) {
        MathApp.selected_block.onDeselected();
        MathApp.selected_block = null;
    }

    if (prevSelectedBlock != null) {
        if (event.key == 'Enter') {
            console.log("KeyDown : " + event.key)

            let result = parser.eval(prevSelectedBlock.name).toString();
            var tokens = result.substring(0, 8);
            if (tokens == 'function') result = prevSelectedBlock.name[0]

            let position = {
                x: prevSelectedBlock.position.x,
                y: prevSelectedBlock.position.y + 60,
            };
            this.printSymbols(result, position)
        }

        else if (event.key == 'Delete') {
            console.log("KeyDown : " + event.key)

            prevSelectedBlock.destroy();
        }

        else if (event.key == 'Shift') {
            console.log("KeyDown : " + event.key)

            if (prevSelectedBlock.name.length <= 1)
                console.log('Can not disassemble !')
            else {
                console.log('disassemble')

                for (let i = 0; i < prevSelectedBlock.name.length; i++) {
                    let position = {
                        x: prevSelectedBlock.position.x + (60 * i),
                        y: prevSelectedBlock.position.y,
                    };

                    this.printSymbol(prevSelectedBlock.name[i], position);
                }
                prevSelectedBlock.destroy();
            }
        }

        else if (event.key == 'Control') {
            console.log("KeyDown : " + event.key)

            let position = {
                x: prevSelectedBlock.position.x,
                y: prevSelectedBlock.position.y + 60,
            };
            this.printSymbols(prevSelectedBlock.name, position)
        }
    }
}

MathApp.handleMouseDown = function(window_p) {
    if(MathApp.isInCanvas(window_p))
    {
        let canvas_p = MathApp.transformToCanvasCoords(window_p);

        // 코드 위치를 위쪽으로 변경
        let block = MathApp.findBlockOn(canvas_p);
        // 기존 선택된 블록 : 팝업 메뉴 버튼을 위한 변수
        let prevSelectedBlock = MathApp.selected_block;

        if( MathApp.selected_block != null)
        {
            MathApp.selected_block.onDeselected();
            MathApp.selected_block = null;
        }

        if(block != null)
        {
            // 팝업 메뉴 버튼을 클릭한 경우
            if (block.type == 'button') {
                // 1. 소멸
                if(block.name == 'destroy') {
                    console.log('Clicked : ' + block.name)

                    prevSelectedBlock.destroy();
                }

                // 2. 실행
                else if(block.name == 'execute') {
                    console.log('Clicked : ' + block.name)

                    let result = parser.eval(prevSelectedBlock.name).toString();
                    var tokens = result.substring(0,8);
                    if (tokens == 'function') result = prevSelectedBlock.name[0]

                    let position = {
                        x : prevSelectedBlock.position.x,
                        y : prevSelectedBlock.position.y + 60,
                    };
                    this.printSymbols(result, position)
                }

                // 3. 분해
                else if(block.name == 'disassemble') {
                    console.log('Clicked : ' + block.name)

                    if(prevSelectedBlock.name.length <= 1)
                        console.log('Noting happened!')
                    else {
                        for(let i=0; i<prevSelectedBlock.name.length; i++) {
                            let position = {
                                x : prevSelectedBlock.position.x + (60*i),
                                y : prevSelectedBlock.position.y,
                            };
    
                            this.printSymbol(prevSelectedBlock.name[i], position);
                        }
                        prevSelectedBlock.destroy();
                    }
                }

                // 4. 복제
                else if(block.name == 'copy') {
                    console.log('Clicked : ' + block.name)
                    
                    let position = {
                        x : prevSelectedBlock.position.x,
                        y : prevSelectedBlock.position.y + 60,
                    };
                    this.printSymbols(prevSelectedBlock.name, position)
                }

                return;
            }

            // 일반 버튼을 클릭한 경우
            else {
                MathApp.selected_block = block;
                MathApp.selected_block.onSelected();

                // 맨앞으로 가져오기
                block.visual_items.forEach(item => {
                    MathApp.canvas.bringToFront(item);
                });
            }
        }

        MathApp.is_mouse_dragging = true;
        MathApp.mouse_drag_prev = canvas_p;

        MathApp.canvas.requestRenderAll();
    }
    else
    {
        MathApp.is_mouse_dragging = false;
        MathApp.mouse_drag_prev = {x:0, y:0};
    }
}

MathApp.handleMouseMove = function(window_p) {
    if(MathApp.is_mouse_dragging)
    {
        let canvas_p = MathApp.transformToCanvasCoords(window_p);
        if(MathApp.selected_block != null)
        {
            let tx = canvas_p.x - MathApp.mouse_drag_prev.x;
            let ty = canvas_p.y - MathApp.mouse_drag_prev.y;
            MathApp.selected_block.translate({x: tx, y: ty});

            // 팝업 메뉴도 따라 움직이기
            let popupButton = [];

            for (let i = MathApp.blocks.length - 1; i >= MathApp.blocks.length - 4; i--)
                popupButton.push(MathApp.blocks[i]);

            popupButton.forEach(item => {
                item.translate({ x: tx, y: ty });
            })
        }
        MathApp.mouse_drag_prev = canvas_p;

        MathApp.canvas.requestRenderAll();
    }
}

MathApp.handleMouseUp = function(window_p) {
    if(MathApp.is_mouse_dragging)
    {
        let canvas_p = MathApp.transformToCanvasCoords(window_p);

        // MouseUp 할때, 어떤 다른 block 위에 있다면 조립(Assemble)
        let block = MathApp.findBlockOn(canvas_p);
        
        // 조립(Assemble)을 위한 코드
        if(block != this.selected_block && block != null && this.selected_block != null) {
            // block 뒤에 selected_block을 합친다
            let subBlock = this.selected_block;
            let new_pos = {
                x: block.position.x + block.size.width,
                y: block.position.y,
            };
            this.selected_block.moveTo(new_pos);
            subBlock.visual_items.forEach(item => {
                block.visual_items.push(item);
            });

            block.name += subBlock.name;
            block.size.width += subBlock.size.width;

            // 다 합쳤으니, 기존의 selected_block은 destroy한다.
            this.selected_block.destroy();

            // 맨앞으로 가져오기
            block.visual_items.forEach(item => {
                MathApp.canvas.bringToFront(item);
            });
        }

        MathApp.is_mouse_dragging = false;
        MathApp.mouse_drag_prev = {x:0, y:0};

        MathApp.canvas.requestRenderAll();
    }
}

MathApp.transformToCanvasCoords = function(window_p) {
    let rect = MathApp.canvas.getElement().getBoundingClientRect();
    let canvas_p = {
        x : window_p.x - rect.left,
        y : window_p.y - rect.top
    };
    return canvas_p;
}

MathApp.isInCanvas = function(window_p) {
    let rect = MathApp.canvas.getElement().getBoundingClientRect();
    if( window_p.x >= rect.left && 
        window_p.x < rect.left + rect.width &&
        window_p.y >= rect.top && 
        window_p.y < rect.top + rect.height )
    {
        return true;
    }
    else
    {
        return false;
    }
}

MathApp.findBlockOn = function (canvas_p) {
    let x = canvas_p.x;
    let y = canvas_p.y;

    for (let i = 0; i < this.blocks.length; i++) {
        let block = this.blocks[i];
        let halfWidth = SYMBOL_WIDTH / 2;

        if (block.type == 'button')
            halfWidth = BUTTON_WIDTH / 2;

        if ( // 기존 조건문 대신, 멀티 블록에도 적용가능한 조건문
            x >= block.position.x - halfWidth &&
            x <= block.position.x + (halfWidth * ((2 * block.visual_items.length / 3) - 1)) + 5 &&
            y >= block.position.y - block.size.height / 2 &&
            y <= block.position.y + block.size.height / 2) {
            // 어떤 블럭을 select하고 dragging할 때는, 그 밑에 있는 block을 return
            // 최초 select 시에는, 해당 block을 return
            if (block != this.selected_block)
                return block;
        }
    }
    return null;
}

//
MathApp.Block = function(position, size) {
    this.position = position;
    this.size = size;
    this.type = MathApp.block_types.UNDEFINED;

    this.visual_items = [];

    MathApp.blocks.push(this);
}

MathApp.Block.prototype.onDeselected = function () {
    // 싱글 블록인 경우
    if (this.visual_items.length <= 3) {
        this.visual_items[this.visual_items.length - 1].set({
            stroke: "rgba(0,0,0,1)"
        });
    }

    // 멀티 블록인 경우
    else {
        for (let i = this.visual_items.length - 1; i >= 0; i -= 3)
            this.visual_items[i].set({
                stroke: "rgba(0,0,0,1)"
            });
    }

    // 팝업 메뉴 없애기
    let popupButton = [];

    for (let i = MathApp.blocks.length - 1; i >= MathApp.blocks.length - 4; i--)
        popupButton.push(MathApp.blocks[i]);

    popupButton.forEach(item => item.destroy())
}

MathApp.Block.prototype.onSelected = function () {
    // 싱글 블록인 경우
    if (this.visual_items.length <= 3) {
        this.visual_items[this.visual_items.length - 1].set({
            stroke: "rgba(39,164,243,1)"
        });
    }

    // 멀티 블록인 경우
    else {
        for (let i = this.visual_items.length - 1; i >= 0; i -= 3)
            this.visual_items[i].set({
                stroke: "rgba(39,164,243,1)"
            });
    }

    // 팝업 메뉴 만들기
    let buttons = ["destroy", "execute", "disassemble", "copy"]

    for (let i = 0; i < 4; i++) {
        let size = {
            width: BUTTON_WIDTH,
            height: BUTTON_HEIGHT
        };
        let position = {
            x: this.position.x + (BUTTON_WIDTH * i) - (SYMBOL_WIDTH - BUTTON_WIDTH) / 2,
            y: this.position.y + SYMBOL_HEIGHT + 3,
        };

        let new_button = new MathApp.Button(position, size, buttons[i]);
    }
}

MathApp.Block.prototype.moveTo = function(p) {
    let tx = p.x - this.position.x;
    let ty = p.y - this.position.y;

    this.translate({x: tx, y: ty});
}

MathApp.Block.prototype.translate = function(v) {
    this.position.x += v.x;
    this.position.y += v.y;

    this.visual_items.forEach(item => {
        item.left += v.x;
        item.top += v.y;
    });
}

MathApp.Block.prototype.destroy = function() {
    if(this == MathApp.selected_block)
    {
        MathApp.selected_block = null;
        this.onDeselected();
    }

    this.visual_items.forEach(item => {
        MathApp.canvas.remove(item);
    });
    this.visual_items = [];
    
    let index = MathApp.blocks.indexOf(this);
    if(index > -1)
    {
        MathApp.blocks.splice(index, 1);
    }
}

//
MathApp.Symbol = function(position, size, name) {
    MathApp.Block.call(this, position, size);
    this.type = MathApp.block_types.SYMBOL;
    this.name = name;

    let block = this;

    if (name in MathApp.symbol_paths) 
    {
        let path = "resources/img/" + MathApp.symbol_paths[name] + ".jpg";
        fabric.Image.fromURL(path, function(img) {
            // (0) Background
            let background = new fabric.Rect({
                left: position.x - size.width/2,
                top: position.y - size.height/2,
                width: size.width,
                height: size.height,
                fill: "rgba(255,255,255,1)",
                stroke: "rgba(0,0,0,0)",
                selectable: false
            });

            // (1) Image
            img.scaleToWidth(size.width);
            img.scaleToHeight(size.height);

            let img_w = img.getScaledWidth();
            let img_h = img.getScaledHeight();

            img.set({
                left: position.x - img_w/2,
                top: position.y - img_h/2,
                selectable: false
            });

            // (2) Boundary
            let boundary = new fabric.Rect({
                left: position.x - size.width/2,
                top: position.y - size.height/2,
                width: size.width,
                height: size.height,
                fill: "rgba(0,0,0,0)",
                stroke: "rgba(0,0,0,1)",
                strokeWidth: 5,
                selectable: false
            });

            //
            MathApp.canvas.add(background);
            MathApp.canvas.add(img);
            MathApp.canvas.add(boundary);

            //
            block.visual_items.push(background);
            block.visual_items.push(img);
            block.visual_items.push(boundary);
        });
    }
}

MathApp.Symbol.prototype = Object.create(MathApp.Block.prototype);

// 팝업 메뉴에 사용 될 버튼
MathApp.Button = function(position, size, name) {
    MathApp.Block.call(this, position, size);
    // 타입 : Button
    this.type = MathApp.block_types.BUTTON;
    this.name = name;

    let block = this;

    let path = "resources/img/" + name + ".png";
    fabric.Image.fromURL(path, function(img) {
        // (0) Background
        let background = new fabric.Rect({
            left: position.x - size.width/2,
            top: position.y - size.height/2,
            width: size.width,
            height: size.height,
            fill: "rgba(100,100,100,1)",
            stroke: "rgba(0,0,0,0)",
            selectable: false
        });

        // (1) Image
        img.scaleToWidth(size.width/1.25);
        img.scaleToHeight(size.height/1.25);

        let img_w = img.getScaledWidth();
        let img_h = img.getScaledHeight();

        img.set({
            left: position.x - img_w/2,
            top: position.y - img_h/2,
            selectable: false
        });

        // (2) Boundary
        let boundary = new fabric.Rect({
            left: position.x - size.width/2,
            top: position.y - size.height/2,
            width: size.width,
            height: size.height,
            fill: "rgba(0,0,0,0)",
            stroke: "rgba(0,0,0,1)",
            strokeWidth: 3,
            selectable: false
        });

        //
        MathApp.canvas.add(background);
        MathApp.canvas.add(img);
        MathApp.canvas.add(boundary);

        //
        block.visual_items.push(background);
        block.visual_items.push(img);
        block.visual_items.push(boundary);
    });
}

MathApp.Button.prototype = Object.create(MathApp.Block.prototype);

//
$(document).ready(function() {
    MathApp.initialize();
});