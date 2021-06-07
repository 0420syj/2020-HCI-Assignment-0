let WebUI = {}

WebUI.WidgetTypes = {
    UNDEFINED:      "undefind",
    TEXT:           "text",
    IMAGE:          "image",
    PUSH_BUTTON:    "push_button",
    TEXT_FIELD:     "text_field",
    SWITCH:         "switch",
    
    // add new widget types here
    CONTAINER: "container",
    ROW: "row",
    COLUMN: "column",

    // V3 : 드롭다운 버튼
    DROPDOWN_BUTTON: "dropdown_button",
    GRID: "grid",
};

WebUI.Alignment = {
    // add alignment types here
    CENTER: "center",
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
};

WebUI.widgets = [];
WebUI.focused_widget = null;
WebUI.dragged_widget = null;
WebUI.hovered_widget = null;

WebUI.is_mouse_dragging = false;       
WebUI.mouse_drag_start = {x:0, y:0};
WebUI.mouse_drag_prev = {x:0, y:0};

WebUI.app = null;
// 수식 계산을 위한 객체 정의 (math.js 파서)
WebUI.parser = math.parser();
// 수식 계산결과
WebUI.value = '0';

// V3 : 함수 저장
WebUI.f = 'null';
WebUI.g = 'null';
// V3 : 계산 기록 저장
WebUI.record = [];
// V3 : 계산 기록 인덱스
WebUI.recordIdx = 0;

WebUI.initialize = function() {
    this.canvas = new fabric.Canvas("c", {
        // V3 : 배경색 변경
        backgroundColor: "#D9D9D9",
        hoverCursor: "default",
        selection: false,
        width: window.innerWidth,
        height: window.innerHeight
    });

    //
    $(document).keypress(function(event) {
        WebUI.handleKeyPress(event);
    });
    // V3 : 키 입력 감지 (keypress는 ESC, Backspace 감지 못함)
    $(document).keydown(function(event) {
        WebUI.handleKeyDown(event);
    });
    $(document).mousedown(function(event) {
        let p = {x: event.pageX, y: event.pageY};
        WebUI.handleMouseDown(p);
    });
    $(document).mouseup(function(event) {
        let p = {x: event.pageX, y: event.pageY};
        WebUI.handleMouseUp(p);
    });
    $(document).mousemove(function(event) {
        let p = {x: event.pageX, y: event.pageY};
        WebUI.handleMouseMove(p);
    });

    //
    WebUI.initWidgets();
    WebUI.initVisualItems();
    WebUI.layoutWhenResourceReady();
}

WebUI.initWidgets = function () {
    // V3 : ColorSet 객체
    let color = {
        cyan: {
            fill_color: '#0DA6A6',
            text_color: '#F2F2F2',
            stroke_color: '#40322A',
        },
        brown: {
            fill_color: '#40322A',
            text_color: '#F2F2F2',
            stroke_color: '#40322A',
        },
        green: {
            fill_color: '#03A678',
            text_color: '#F2F2F2',
            stroke_color: '#40322A',
        },
        yellow: {
            fill_color: '#F2B872',
            text_color: '#F2F2F2',
            stroke_color: '#40322A',
        },
        orange: {
            fill_color: '#F2695C',
            text_color: '#F2F2F2',
            stroke_color: '#40322A',
        },
        blue: {
            fill_color: '#5368A6',
            text_color: '#F2F2F2',
            stroke_color: '#40322A',
        },
    }

    // initialize widgets here
    WebUI.app = new WebUI.Row({
        desired_size: { width: 920, height: 650 },
        horizontal_alignment: WebUI.Alignment.CENTER,
        vertical_alignment: WebUI.Alignment.CENTER,
        children: [
            new WebUI.Container({
                desired_size: { width: 870, height: 60 },
                horizontal_alignment: WebUI.Alignment.CENTER,
                vertical_alignment: WebUI.Alignment.CENTER,
                // V3 : 텍스트 내용 및 색상 변경
                children: [new WebUI.Text("WebUI Calculator V3", { text_color: '#40322A', font_size: 36, font_weight: 'bold' })],
            }),
            new WebUI.Container({
                desired_size: { width: 870, height: 60 },
                horizontal_alignment: WebUI.Alignment.LEFT,
                vertical_alignment: WebUI.Alignment.CENTER,
                children: [
                    new WebUI.Text(WebUI.value, { desired_size: { width: 870, height: 30 }, isBoundary: true }),
                ],
            }),
            new WebUI.Row({
                desired_size: { width: 870, height: 500 },
                horizontal_alignment: WebUI.Alignment.CENTER,
                vertical_alignment: WebUI.Alignment.CENTER,
                children: [
                    new WebUI.Column({
                        children: [
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("%", { width: 50, height: 50 }, color.cyan),
                                    new WebUI.MyPushButton(":", { width: 50, height: 50 }, color.cyan),
                                    new WebUI.MyPushButton("[", { width: 50, height: 50 }, color.cyan),
                                    new WebUI.MyPushButton("(", { width: 50, height: 50 }, color.cyan),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("^", { width: 50, height: 50 }, color.cyan),
                                    new WebUI.MyPushButton(";", { width: 50, height: 50 }, color.cyan),
                                    new WebUI.MyPushButton("]", { width: 50, height: 50 }, color.cyan),
                                    new WebUI.MyPushButton(")", { width: 50, height: 50 }, color.cyan),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("7", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("4", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("1", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton(",", { width: 50, height: 50 }, color.cyan),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("8", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("5", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("2", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("0", { width: 50, height: 50 }, color.brown),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("9", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("6", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton("3", { width: 50, height: 50 }, color.brown),
                                    new WebUI.MyPushButton(".", { width: 50, height: 50 }, color.cyan),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("/", { width: 50, height: 50 }, color.green),
                                    new WebUI.MyPushButton("*", { width: 50, height: 50 }, color.green),
                                    new WebUI.MyPushButton("-", { width: 50, height: 50 }, color.green),
                                    new WebUI.MyPushButton("+", { width: 50, height: 50 }, color.green),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.MyPushButton("←", { width: 50, height: 50 }, color.yellow),
                                    new WebUI.MyPushButton("CL", { width: 50, height: 50 }, color.orange),
                                    new WebUI.MyPushButton("EV", { width: 50, height: 110 }, color.blue),
                                ]
                            }),
                            new WebUI.Row({
                                children: [
                                    new WebUI.Column({
                                        children: [
                                            new WebUI.TextField("계산 기록", { width: 350, height: 170 }),
                                            new WebUI.Row({
                                                children: [
                                                    new WebUI.MyPushButton("↑", { width: 50, height: 80 }, color.orange),
                                                    new WebUI.MyPushButton("↓", { width: 50, height: 80 }, color.blue),
                                                ]
                                            }),
                                        ]
                                    }),
                                    new WebUI.Column({
                                        children: [
                                            new WebUI.MyPushButton("f = ?", { width: 50, height: 50 }),
                                            new WebUI.MyPushButton("g = ?", { width: 50, height: 50 }),
                                            new WebUI.TextField("좌측 버튼 : 현재 함수 확인", { width: 290, height: 50 })
                                        ]
                                    }),
                                ]
                            }),
                        ]
                    }),
                    new WebUI.Column({
                        children: [
                            new WebUI.MyDropdownButton("비교연산 ▼", { width: 230, height: 50 },
                                {
                                    fill_color: '#A6A6A6',
                                    text_color: '#40322A',
                                    stroke_color: '#595856',
                                    children: [
                                        new WebUI.Grid(4, 2,
                                            {
                                                children: [
                                                    new WebUI.MyPushButton("<", { width: 50, height: 50 }, color.green),
                                                    new WebUI.MyPushButton(">", { width: 50, height: 50 }, color.green),
                                                    new WebUI.MyPushButton("<=", { width: 50, height: 50 }, color.green),
                                                    new WebUI.MyPushButton(">=", { width: 50, height: 50 }, color.green),
                                                    new WebUI.MyPushButton("==", { width: 50, height: 50 }, color.green),
                                                    new WebUI.MyPushButton("!=", { width: 50, height: 50 }, color.green),
                                                ]
                                            }
                                        ),
                                    ]
                                }),
                            new WebUI.MyDropdownButton("상수 ▼", { width: 170, height: 50 },
                                {
                                    fill_color: '#A6A6A6',
                                    text_color: '#40322A',
                                    stroke_color: '#595856',
                                    children: [
                                        new WebUI.Grid(3, 1,
                                            {
                                                children: [
                                                    new WebUI.MyPushButton("i", { width: 50, height: 50 }, color.brown),
                                                    new WebUI.MyPushButton("e", { width: 50, height: 50 }, color.brown),
                                                    new WebUI.MyPushButton("pi", { width: 50, height: 50 }, color.brown),
                                                ]
                                            }
                                        ),
                                    ]
                                }),
                            new WebUI.MyDropdownButton("함수 ▼", { width: 170, height: 50 },
                                {
                                    fill_color: '#A6A6A6',
                                    text_color: '#40322A',
                                    stroke_color: '#595856',
                                    children: [
                                        new WebUI.Grid(3, 6,
                                            {
                                                children: [
                                                    new WebUI.MyPushButton("exp", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("log", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("sqrt", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("sin", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("cos", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("tan", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("asin", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("acos", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("atan", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("cross", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("det", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("inv", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("dot", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("and", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("not", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("or", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("xor", { width: 50, height: 50 }),
                                                    new WebUI.MyPushButton("!", { width: 50, height: 50 }),
                                                ]
                                            }
                                        ),
                                    ]
                                }),
                            new WebUI.MyDropdownButton("방정식 ▼", { width: 230, height: 50 },
                                {
                                    fill_color: '#A6A6A6',
                                    text_color: '#40322A',
                                    stroke_color: '#595856',
                                    children: [
                                        new WebUI.Grid(4, 2,
                                            {
                                                children: [
                                                    new WebUI.MyPushButton("w", { width: 50, height: 50 }, color.cyan),
                                                    new WebUI.MyPushButton("x", { width: 50, height: 50 }, color.cyan),
                                                    new WebUI.MyPushButton("y", { width: 50, height: 50 }, color.cyan),
                                                    new WebUI.MyPushButton("z", { width: 50, height: 50 }, color.cyan),
                                                    new WebUI.MyPushButton("f", { width: 50, height: 50 }, color.cyan),
                                                    new WebUI.MyPushButton("g", { width: 50, height: 50 }, color.cyan),
                                                    new WebUI.MyPushButton("=", { width: 50, height: 50 }, color.cyan),
                                                ]
                                            }
                                        ),
                                    ]
                                }
                            ),
                        ]
                    }),
                ],
            }),
        ]
    });
}

//
WebUI.initVisualItems = function() {
    WebUI.widgets.forEach(widget => {
        widget.initVisualItems();
    });
}

WebUI.layoutWhenResourceReady = function() {
    let is_resource_loaded = true;
    for (let i in WebUI.widgets) {
        let widget = WebUI.widgets[i];
        if (!widget.is_resource_ready) {
            is_resource_loaded = false;
            break;
        }
    }

    if (!is_resource_loaded) {
        setTimeout(arguments.callee, 50);
    }
    else {
        // 최상위 위젯에 대해서 그 객체의 멤버 함수인 layout을 호출
        WebUI.app.layout();
        WebUI.canvas.requestRenderAll();
    }
}

WebUI.handleKeyPress = function(event) {
    let is_handled = false;

    if (WebUI.focused_widget) {
        is_handled = WebUI.focused_widget.handleKeyPress(event) || is_handled;
    }

    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

// V3 : 키보드 입력
WebUI.handleKeyDown = function(event) {
    console.log(event.key)
    if ((event.key >= 0 && event.key <= 9) ||
    event.key == '+' || event.key == '-' || event.key == '*' || event.key == '/' ||
    event.key == 'Escape' || event.key == 'Backspace' || event.key == 'Enter' ||
    event.key == '%' || event.key == '^' || event.key == ':' || event.key == ';' || 
    event.key == '(' || event.key == ')' || event.key == '[' || event.key == ']' || 
    event.key == ',' || event.key == '.' || 
    event.key == 'w' || event.key == 'x' || event.key == 'y' || event.key == 'z' || 
    event.key == 'f' || event.key == 'g' || event.key == '=' ||
    event.key == '<' || event.key == '>' || event.key == '!' ||
    event.key == 'i' || event.key == 'e' || event.key == 'p' ||
    event.key == 'ArrowUp' || event.key == 'ArrowDown'
    ) {
        // 계산식을 표시할 Text 위젯
        let textbox = WebUI.widgets[2];

        // 값 설정 함수
        function setValue(val) {
            // Text 위젯의 2번째 요소가 실제 값
            textbox.visual_items[1].text = val;
            textbox.label = val;

            if (textbox.hiddenTextarea != null) {
                textbox.hiddenTextarea.value = val;
            }

            return val;
        }

        let textboxRecord = WebUI.widgets[38];

        function setRecord(val) {
            // 값 추가 함수
            function addValue(val) {
                textboxRecord.visual_items[1].text += val;
                textboxRecord.label += val;
                if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value += val;
            }
    
            // 계산 기록 비우기
            textboxRecord.visual_items[1].text = '';
            textboxRecord.label = '';
            if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value = '';
    
            // 계산 기록 배열에 추가
            WebUI.record.push(val);
            WebUI.recordIdx = WebUI.record.length;
            
            // 최근 6개만 표시
            let record = [];
            record = WebUI.record.length > 6
                ? WebUI.record.slice(WebUI.record.length - 6, WebUI.record.length)
                : WebUI.record;

            // 저장된 계산 기록 출력
            let index=0;
            record.forEach(item => {
                index++;
                index < 6 ? addValue(item + '\n') : addValue(item);
            })
        }

        function setFunc(val) {
            if (val.substr(0, 1) == 'f') {
                WebUI.f = val;
            }
            else if (val.substr(0, 1) == 'g') {
                WebUI.g = val;
            }
        }

        if (WebUI.value == '0') WebUI.value = setValue('');

        if (event.key == 'Enter') {
            try {
                // V3 : 좌항 저장
                let left_eq = WebUI.value;
                WebUI.value = WebUI.parser.eval(WebUI.value).toString();
                let right_eq = WebUI.value;
                let result = (left_eq + '=' + right_eq);
    
                var tokens = WebUI.value.split(' ');
                if (tokens[0] == 'function') {
                    WebUI.value = tokens[0];
                    result = left_eq;
                    setFunc(result);
                }
    
                // V3 : 계산 기록에 추가
                setRecord(result);
    
                setValue(WebUI.value);
                // 계산 완료 flag 역할
                WebUI.value = '0';
            }
            catch (e) {
                console.error(e)
    
                // 계산 완료 flag 역할
                WebUI.value = '0'
                // Error 객체 참고
                // ref : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Error
                if (WebUI.value != 'function') setValue(e.name + ': ' + e.message);
            }
        }
        else {
            if (event.key == 'Escape') WebUI.value = setValue('0');
            // V3 : 마지막 단어 지우기 기능 추가
            else if (event.key == 'Backspace') WebUI.value = setValue(WebUI.value.slice(0, -1));
            else if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
                if (WebUI.record.length > 6) {
                    // 계산 기록 비우기
                    textboxRecord.visual_items[1].text = '';
                    textboxRecord.label = '';
                    if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value = '';
    
                    // 지정한 인덱스에서 새롭게 출력
                    function setIndex() {
                        function addValue(val) {
                            textboxRecord.visual_items[1].text += val;
                            textboxRecord.label += val;
                            if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value += val;
                        }
    
                        // 지정 인덱스 범위 6개만 record로 저장
                        let record = WebUI.record.slice(WebUI.recordIdx - 6, WebUI.recordIdx);
                        
                        // 저장된 계산 기록 출력
                        let index = 0;
                        record.forEach(item => {
                            index++;
                            index < 6 ? addValue(item + '\n') : addValue(item);
                        })
                    }
    
                    // 위 방향키인 경우,
                    if (event.key == 'ArrowUp') {
                        if(WebUI.recordIdx > 6) WebUI.recordIdx--;
                        setIndex();
                    }
    
                    // 아래 방향키인 경우,
                    else if(event.key == 'ArrowDown') {
                        if(WebUI.recordIdx < WebUI.record.length) WebUI.recordIdx++;
                        setIndex();
                    }
                }
            }
            else WebUI.value = setValue(WebUI.value + event.key);
        }
    }

    WebUI.canvas.requestRenderAll();
}

WebUI.handleMouseDown = function(window_p) {
    let is_handled = false;

    if (WebUI.isInCanvas(window_p)) {
        let canvas_p = WebUI.transformToCanvasCoords(window_p);        

        WebUI.is_mouse_dragging = true;
        WebUI.mouse_drag_start = canvas_p;
        WebUI.mouse_drag_prev = canvas_p;

        let widget = WebUI.findWidgetOn(canvas_p);
        if (widget) {
            WebUI.focused_widget = widget;    

            if (widget.is_draggable) {
                WebUI.dragged_widget = widget;
            }
            else {
                WebUI.dragged_widget = null;
            }

            is_handled = widget.handleMouseDown(canvas_p) || is_handled;
        }
        else {
            WebUI.focused_widget = null;
            WebUI.dragged_widget = null;
        }
    }
    else {
        WebUI.is_mouse_dragging = false;
        WebUI.mouse_drag_start = {x:0, y:0};
        WebUI.mouse_drag_prev = {x:0, y:0};

        WebUI.focused_widget = null;
        WebUI.dragged_widget = null;
    }

    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

WebUI.handleMouseMove = function(window_p) {
    let canvas_p = WebUI.transformToCanvasCoords(window_p);
    let is_handled = false;

    let widget = WebUI.findWidgetOn(canvas_p);
    if (widget != WebUI.hovered_widget) {
        if (WebUI.hovered_widget != null) {
            is_handled = WebUI.hovered_widget.handleMouseExit(canvas_p) || is_handled;
        }
        if (widget != null) {
            is_handled = widget.handleMouseEnter(canvas_p) || is_handled;
        }
        WebUI.hovered_widget = widget;
    }
    else {
        if (widget) {
            is_handled = widget.handleMouseMove(canvas_p) || is_handled;
        }
    }

    if (WebUI.is_mouse_dragging) {
        if (WebUI.dragged_widget != null) {
            let tx = canvas_p.x - WebUI.mouse_drag_prev.x;
            let ty = canvas_p.y - WebUI.mouse_drag_prev.y;
            WebUI.dragged_widget.translate({x: tx, y: ty});

            is_handled = true;
        }
        WebUI.mouse_drag_prev = canvas_p;
    }

    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

WebUI.handleMouseUp = function(window_p) {
    let is_handled = false;
    let canvas_p = WebUI.transformToCanvasCoords(window_p);

    let widget  = WebUI.findWidgetOn(canvas_p);
    if (widget) {
        is_handled = widget.handleMouseUp(canvas_p) || is_handled;
    }

    if (WebUI.is_mouse_dragging) {
        WebUI.is_mouse_dragging = false;
        WebUI.mouse_drag_start = {x:0, y:0};
        WebUI.mouse_drag_prev = {x:0, y:0};

        WebUI.dragged_widget = null;
        
        is_handled = true;
    }

    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

WebUI.transformToCanvasCoords = function(window_p) {
    let rect = WebUI.canvas.getElement().getBoundingClientRect();
    let canvas_p = {
        x : window_p.x - rect.left,
        y : window_p.y - rect.top
    };
    return canvas_p;
}

WebUI.isInCanvas = function(window_p) {
    let rect = WebUI.canvas.getElement().getBoundingClientRect();
    if (window_p.x >= rect.left && 
        window_p.x < rect.left + rect.width &&
        window_p.y >= rect.top && 
        window_p.y < rect.top + rect.height) {
        return true;
    }
    else {
        return false;
    }
}

WebUI.findWidgetOn = function(canvas_p) {
    let x = canvas_p.x;
    let y = canvas_p.y;

    for (let i=0; i < this.widgets.length; i++) {
        let widget = this.widgets[i];

        if (x >= widget.position.left &&
            x <= widget.position.left + widget.size.width &&
            y >= widget.position.top &&
            y <= widget.position.top + widget.size.height) {
            return widget;
        }               
    }
    return null;
}

WebUI.maxSize = function(size1, size2) {
    // implement this
    let max_size = { width: 0, height: 0 };
    
    max_size.width = (size1.width > size2.width) ?
        size1.width : size2.width;
    max_size.height = (size1.height > size2.height) ?
        size1.height : size2.height;

    // (오타수정) 빠진 코드 추가
    return max_size;
}

WebUI.minSize = function(size1, size2) {
    // implement this
    let min_size = { width: 0, height: 0 };
    
    min_size.width = (size1.width < size2.width) ?
        size1.width : size2.width;
    min_size.height = (size1.height < size2.height) ?
        size1.height : size2.height;

    // (오타수정) 빠진 코드 추가
    return min_size;
}


//
WebUI.Widget = function(properties) {
    this.type = WebUI.WidgetTypes.UNDEFINED;
    
    this.is_draggable = false;
    this.is_movable = true;

    //
    this.parent = null;
    this.children = [];
    
    //
    this.position = {left: 0, top: 0};
    this.size = {width: 0, height: 0};

    //
    this.visual_items = [];
    this.is_resource_ready = false;

    //
    WebUI.widgets.push(this);

    // implement the code for adding properties below
    // 객체 지정 속성 정의
    if (properties != undefined) {
        for (let name in properties) {
            let value = properties[name];
            if (name == 'children') {
                value.forEach(child => {
                    child.parent = this;
                    this.children.push(child);
                });
            } else this[name] = value;
        }
    }

    // 객체 기본 속성 정의
    this.setDefaultProperty('desired_size', {width: 0, height: 0});
    this.setDefaultProperty('horizontal_alignment', WebUI.Alignment.CENTER);
    this.setDefaultProperty('vertical_alignment', WebUI.Alignment.TOP);
    // V3 : fill, stroke 색상 및 두께 변경
    this.setDefaultProperty('fill_color', '#F2F2F2');
    this.setDefaultProperty('stroke_color', '#40322A');
    this.setDefaultProperty('stroke_width', 2);
    this.setDefaultProperty('text_align', 'left');
    // V3 : 기본색상 수정
    this.setDefaultProperty('text_color', '#40322A');
    // V3 : 기본글꼴 수정
    this.setDefaultProperty('font_family', 'Calibri');
    this.setDefaultProperty('font_size', 20);
    this.setDefaultProperty('font_weight', 'normal');
    this.setDefaultProperty('padding', 5);
    this.setDefaultProperty('margin', 10);
}

WebUI.Widget.prototype.setDefaultProperty = function(name, value) {
    if (this[name] == undefined) {
        this[name] = value;
    }
}

WebUI.Widget.prototype.getBoundingRect = function() {
    return {
        left:   this.position.left, 
        top:    this.position.top,
        width:  this.size.width,
        height: this.size.height
    };
}

WebUI.Widget.prototype.layout = function() {
    // implement this
    
    // (1) Measure size of each widget in bottom-up order
    this.measure();
    // (2) Arrange each widget in top-down order
    this.arrange(this.position);
}

WebUI.Widget.prototype.measure = function() {
    // implement this
    if (this.children.length > 0) {
        this.size_children = { width: 0, height: 0 };
        this.children.forEach(child => {
            let size_child = child.measure();
            this.size_children =
                this.extendSizeChildren(this.size_children, size_child);
        });
        this.size = WebUI.maxSize(this.desired_size, this.size_children);
    }
    else {
        this.size.width += this.padding * 2;
        this.size.height += this.padding * 2;
    }
    return this.size;
}
 
WebUI.Widget.prototype.arrange = function (position) {
    // implement this
                
    // arrange this
    this.moveTo(position);
    this.visual_items.forEach(item => { WebUI.canvas.add(item); });
    
    // arrange children
    if (this.children.length > 0) {
        let left_spacing = 0, top_spacing = 0;
        if (this.size.width > this.size_children.width) {
            let room_width = this.size.width - this.size_children.width;
            if (this.horizontal_alignment == WebUI.Alignment.LEFT)
                left_spacing = this.padding;
            else if (this.horizontal_alignment == WebUI.Alignment.CENTER)
                left_spacing = this.padding + room_width / 2.0;
            else if (this.horizontal_alignment == WebUI.Alignment.RIGHT)
                left_spacing = this.padding + room_width;
        }
        if (this.size.height > this.size_children.height) {
            let room_height =
                this.size.height - this.size_children.height;
            if (this.vertical_alignment == WebUI.Alignment.TOP)
                top_spacing = this.padding;
            else if (this.vertical_alignment == WebUI.Alignment.CENTER)
                top_spacing = this.padding + room_height / 2.0;
            else if (this.vertical_alignment == WebUI.Alignment.BOTTOM)
                top_spacing = this.padding + room_height;
        }
        let next_position = {
            left: position.left + left_spacing,
            top: position.top + top_spacing
        };

        // V3 : 드롭다운의 children은 위치 수정
        if (this.type == 'dropdown_button') {
            next_position.top += this.desired_size.height + this.margin;
        }

        this.children.forEach(child => {
            child.arrange(next_position);
            next_position = this.calcNextPosition
                (next_position, child.size);
        });
    }
}

// default implementation that is expected to be overridden
WebUI.Widget.prototype.extendSizeChildren = function(size, child_size) {
    if (size.width < child_size.width)      size.width = child_size.width;
    if (size.height < child_size.height)    size.height = child_size.height;

    return size;
}

// default implementation that is expected to be overridden
WebUI.Widget.prototype.calcNextPosition = function(position, size) {
    let next_left = position.left + size.width;
    let next_top = position.top;

    return {left: next_left, top: next_top};
}


WebUI.Widget.prototype.initVisualItems = function() {
    this.is_resource_ready = true;
    return true;
}

WebUI.Widget.prototype.moveTo = function(p) {
    if(!this.is_movable)
    {
        return;
    }

    let tx = p.left - this.position.left;
    let ty = p.top - this.position.top;

    this.translate({x: tx, y: ty});
}

WebUI.Widget.prototype.translate = function(v) {
    if(!this.is_movable)
    {
        return;
    }

    this.position.left += v.x;
    this.position.top += v.y;

    this.visual_items.forEach(item => {
        item.left += v.x;
        item.top += v.y;
    });

    this.children.forEach(child_widget => {
        child_widget.translate(v);
    });
}

WebUI.Widget.prototype.destroy = function() {
    if (this == WebUI.focused_widget) WebUI.focused_widget = null;
    if (this == WebUI.dragged_widget) WebUI.dragged_widget = null;
    if (this == WebUI.hovered_widget) WebUI.hovered_widget = null;

    this.visual_items.forEach(item => {
        WebUI.canvas.remove(item);
    });
    this.visual_items = [];
    
    let index = WebUI.widgets.indexOf(this);
    if(index > -1)
    {
        WebUI.widgets.splice(index, 1);
    }

    this.children.forEach(child_widget => {
        child_widget.destroy();
    });
    this.children = [];

    // assume that the parent is already null 
    // (that is, this widget has been detached from its original parent before being destructed)
}

WebUI.Widget.prototype.handleKeyPress = function(event) {
    return false;
}

WebUI.Widget.prototype.handleMouseDown = function(canvas_p) {
    return false;
}

WebUI.Widget.prototype.handleMouseMove = function(canvas_p) {
    return false;
}

WebUI.Widget.prototype.handleMouseUp = function(canvas_p) {
    return false;
}

WebUI.Widget.prototype.handleMouseEnter = function(canvas_p) {
    return false;
}

WebUI.Widget.prototype.handleMouseExit = function(canvas_p) {
    return false;
}

WebUI.Widget.prototype.handleResize = function() {
    return false;
}

//
WebUI.Container = function(properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.CONTAINER;
}

WebUI.Container.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Container.prototype.constructor = WebUI.Container;

WebUI.Container.prototype.extendSizeChildren = function(size, child_size) {
    // implement this
    if (size.width < child_size.width) size.width = child_size.width;
    if (size.height < child_size.height) size.height = child_size.height;
    
    return size;
}

WebUI.Container.prototype.calcNextPosition = function(position, size) {
    // implement this
    let next_left = position.left;
    let next_top = position.top;
    
    return { left: next_left, top: next_top };
}

//
WebUI.Column = function(properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.COLUMN;
}

WebUI.Column.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Column.prototype.constructor = WebUI.Column;

WebUI.Column.prototype.extendSizeChildren = function(size, child_size) {
    // implement this
    size.width += child_size.width;
    if (size.height < child_size.height) size.height = child_size.height;
    
    return size;
}

WebUI.Column.prototype.calcNextPosition = function(position, size) {
    // implement this
    let next_left = position.left + size.width;
    let next_top = position.top;
    
    return { left: next_left, top: next_top };
}


//
WebUI.Row = function(properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.ROW;
}

WebUI.Row.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Row.prototype.constructor = WebUI.Row;

WebUI.Row.prototype.extendSizeChildren = function(size, child_size) {
    // implement this
    if (size.width < child_size.width) size.width = child_size.width;
    size.height += child_size.height;
    
    return size;
}

WebUI.Row.prototype.calcNextPosition = function(position, size) {
    // implement this
    let next_left = position.left;
    let next_top = position.top + size.height;
    
    return { left: next_left, top: next_top };
}

// V3 : Grid 위젯
WebUI.Grid = function (x, y, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.GRID;
    
    // x축,y축 방향 갯수와 길이(정사각형이므로 너비&높이)
    this.x = x;
    this.y = y;

    // 배치된 갯수
    this.count = 0;
}

WebUI.Grid.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Grid.prototype.constructor = WebUI.Grid;

WebUI.Grid.prototype.extendSizeChildren = function(size, child_size) {
    // x축 갯수 * y축 갯수 만큼 extend되기 때문에 나눠서 더한다.
    // 그리드가 꽉차지 않은 경우도 대비한다.
    size.width += child_size.width / this.children.length * this.x;
    size.height += child_size.height / this.children.length * this.y;
    
    return size;
}

WebUI.Grid.prototype.calcNextPosition = function(position, size) {
    // 배치된 갯수 +1
    this.count++;

    // 왼쪽부터 오른쪽으로 배치
    let next_left = position.left + size.width;
    let next_top = position.top;

    // 계행 역할
    if(this.count % this.x == 0) {
        next_left -= size.width * this.x;
        next_top += size.height;
    }

    return { left: next_left, top: next_top };
}

//
WebUI.Text = function(label, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.TEXT;
    this.label = label;
}

WebUI.Text.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Text.prototype.constructor = WebUI.Text;

WebUI.Text.prototype.initVisualItems = function() {
    let text = new fabric.Text(this.label, {
        left:       this.position.left,
        top:        this.position.top,
        selectable: false,
        fontFamily: this.font_family,
        fontSize:   this.font_size,
        fontWeight: this.font_weight,
        textAlign:  this.text_align,
        stroke:     this.text_color,
        fill:       this.text_color,
    });

    // 계산식 테투리 디자인 : 직접 추가
    let boundary = new fabric.Rect({
        left: this.position.left - this.padding,
        top: this.position.top - this.padding,
        width: this.desired_size.width + this.padding,
        height: this.desired_size.height + this.padding,
        fill: this.fill_color,
        stroke: this.stroke_color,
        strokeWidth: this.stroke_width,
        selectable: false
    });

    //
    let bound = text.getBoundingRect();
    this.position.left = bound.left;
    this.position.top = bound.top;
    this.size.width = bound.width;
    this.size.height = bound.height;

    // properties의 isBoundary가 true인 경우에만 추가 : 직접 추가
    this.isBoundary && this.visual_items.push(boundary);
    this.visual_items.push(text);
    this.is_resource_ready = true;
}

WebUI.Text.prototype.setLabel = function(new_label) {
    let text = this.visual_items[0];
    text.set('text', new_label);

    this.label = new_label;

    WebUI.canvas.requestRenderAll();
}

//
WebUI.Image = function(path, desired_size, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.IMAGE;
    this.path = path;
    this.desired_size = desired_size;
}

WebUI.Image.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Image.prototype.constructor = WebUI.Image;

WebUI.Image.prototype.initVisualItems = function() {
    let widget = this;

    fabric.Image.fromURL(this.path, function(img) {
        console.log("Image[" + widget.path + "] is loaded");

        if (widget.desired_size != undefined) {
            img.scaleToWidth(widget.desired_size.width);
            img.scaleToHeight(widget.desired_size.height);
            widget.size = widget.desired_size;
        }
        else {
            widget.size = {width: img.width, height: img.height};
        }

        img.set({
            left: widget.position.left,
            top: widget.position.top,
            selectable: false,
        });

        widget.visual_items.push(img);
        widget.is_resource_ready = true;
    });
}

//
WebUI.TextField = function(label, desired_size, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.TEXT_FIELD;
    this.label = label;
    this.desired_size = desired_size;

    // V3 : 해당 코드 삭제
    // this.stroke_width = 5;
}

WebUI.TextField.prototype = Object.create(WebUI.Widget.prototype);
WebUI.TextField.prototype.constructor = WebUI.TextField;

WebUI.TextField.prototype.initVisualItems = function() {
    let boundary = new fabric.Rect({
        left: this.position.left,
        top: this.position.top,
        width: this.desired_size.width,
        height: this.desired_size.height,
        fill: this.fill_color,
        stroke: this.stroke_color,
        strokeWidth: this.stroke_width,
        selectable: false
    });

    let textbox = new fabric.Textbox(this.label, {
            left:       this.position.left + this.margin,
            selectable: false,
            fontFamily: this.font_family,
            fontSize:   this.font_size,
            fontWeight: this.font_weight,
            textAlign:  this.text_align,
            stroke:     this.text_color,
            fill:       this.text_color,
            // V3 : 초반에 공백 입력시 계행되던 버그 수정 (과제1 코드와 동일)
            width:      this.desired_size.width,
            // V3 : 키보드 입력 불가
            editable:   false,
        }
    );

    let bound = textbox.getBoundingRect();
    textbox.top = this.position.top + this.desired_size.height/2 - bound.height/2;

    // V3 : 계산 기록용 textbox에 대해, 예외적으로 수직 위치 재설정
    if(this.label == "계산 기록") {
        textbox.top = 10;

        let str = "-----------------[사용 메뉴얼]-----------------" + '\n' +
                  "1.  유색버튼은 키보드를 지원합니다." + '\n' +
                  "2.  ←  :  < Backspace >" + '\n' +
                  "3.  CL  :  < ESC >" + '\n' +
                  "4.  EV  :  < Enter >" + '\n' +
                  "*  이곳에 계산 기록이 저장됩니다.";
                  
        this.label = str;
        textbox.text = str;
        if (textbox.hiddenTextarea != null) {
            textbox.hiddenTextarea.value = str;
        }
    }
        
    this.size = this.desired_size;

    //
    this.visual_items.push(boundary);
    this.visual_items.push(textbox);
    this.is_resource_ready = true;
}

WebUI.TextField.prototype.handleMouseDown = function(canvas_p) {
    let textbox = this.visual_items[1];        
    textbox.enterEditing();

    return true;
}

WebUI.TextField.prototype.handleKeyPress = function(event) {
    let boundary = this.visual_items[0];
    let textbox = this.visual_items[1];        

    let new_label = textbox.text;
    let old_label = this.label;
    this.label = new_label;

    if (event.keyCode == 13) {
        let text_enter_removed = new_label.replace(/(\r\n|\n|\r)/gm, "");
        textbox.text = text_enter_removed;
        this.label = text_enter_removed;
        
        if (textbox.hiddenTextarea != null) {
            textbox.hiddenTextarea.value = text_enter_removed;
        }

        textbox.exitEditing();

        return true;    
    }

    if (old_label != new_label && old_label.length < new_label.length) {
        let canvas = document.getElementById("c");
        let context = canvas.getContext("2d");
        context.font = this.font_size.toString() + "px " + this.font_family;

        let boundary_right = boundary.left + boundary.width - this.margin;
        let text_bound = textbox.getBoundingRect();
        let text_width = context.measureText(new_label).width;
        let text_right = text_bound.left + text_width;

        if (boundary_right < text_right) {
            textbox.text = old_label;
            this.label = old_label;
            
            if (textbox.hiddenTextarea != null) {
                textbox.hiddenTextarea.value = old_label;
            }

            return true;
        }
    }
    
    return false;
}

//
WebUI.PushButton = function(label, desired_size, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.PUSH_BUTTON;
    this.label = label;       
    this.desired_size = desired_size;

    this.is_pushed = false;
}

WebUI.PushButton.prototype = Object.create(WebUI.Widget.prototype);
WebUI.PushButton.prototype.constructor = WebUI.PushButton;

WebUI.PushButton.prototype.initVisualItems = function() {
    let background = new fabric.Rect({
        left: this.position.left,
        top: this.position.top,
        width: this.desired_size.width,
        height: this.desired_size.height,
        fill: this.fill_color,
        stroke: this.stroke_color,
        strokeWidth: this.stroke_width,
        selectable: false
    });

    let text = new fabric.Text(this.label, {
        left: this.position.left,
        top: this.position.top,
        selectable: false,
        fontFamily: this.font_family,
        fontSize:   this.font_size,
        fontWeight: this.font_weight,
        textAlign:  this.text_align,
        stroke:     this.text_color,
        fill:       this.text_color,
    });

    let bound = text.getBoundingRect();
    text.left = this.position.left + this.desired_size.width/2 - bound.width/2;
    text.top = this.position.top + this.desired_size.height/2 - bound.height/2;

    this.size = this.desired_size;

    //
    this.visual_items.push(background);
    this.visual_items.push(text);
    this.is_resource_ready = true;
}

WebUI.PushButton.prototype.handleMouseDown = function() {
    if (!this.is_pushed) {
        this.translate({x:0, y:5});
        this.is_pushed = true;

        if (this.onPushed != undefined) {
            this.onPushed.call(this);
        }

        return true;    
    }
    else {
        return false;
    }
}

WebUI.PushButton.prototype.handleMouseUp = function() {
    if (this.is_pushed) {
        this.translate({x:0, y:-5});
        this.is_pushed = false;
        return true;
    }
    else {
        return true;
    }
}

WebUI.PushButton.prototype.handleMouseEnter = function() {
    this.visual_items[0].set('strokeWidth', 3);
    return true;
}

WebUI.PushButton.prototype.handleMouseExit = function() {
    // V3 : 기본 두께가 2이므로, 복원값도 2로 변경
    this.visual_items[0].set('strokeWidth', 2);

    if (this.is_pushed) {
        this.translate({x:0, y:-5});
        this.is_pushed = false;
    }

    return true;
}

// V3 : 드롭다운 버튼
WebUI.MyDropdownButton = function(label, desired_size, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.DROPDOWN_BUTTON;
    this.label = label;       
    this.desired_size = desired_size;

    this.is_pushed = false;
    
    // 생성자에서 이벤트 핸들러 연결
    this.onPushed = this.handleButtonPushed;

    // V3 : 드롭다운 상태관리
    this.is_dropped = true;
}

// PushButton으로부터 상속
WebUI.MyDropdownButton.prototype = Object.create(WebUI.PushButton.prototype);
WebUI.MyDropdownButton.prototype.constructor = WebUI.MyDropdownButton;

// handleButtonPushed 멤버 함수 추가 수식 , CL, EV 입력 처리
WebUI.MyDropdownButton.prototype.handleButtonPushed = function () {
    this.is_dropped = !this.is_dropped;

    if (!this.is_dropped) {
        this.children.forEach(item =>
            item.children.forEach(item => {
                item.visual_items.forEach(item => {
                    WebUI.canvas.remove(item);
                });
            })

        )
    }

    else {
        this.children.forEach(item =>
            item.children.forEach(item => {
                item.visual_items.forEach(item => {
                    WebUI.canvas.add(item);
                });
            })

        )
    }

    console.log(this.label + ' : ' + this.is_dropped);
}

// MyPushButton 클래스 정의
WebUI.MyPushButton = function(label, desired_size, properties) {
    WebUI.Widget.call(this, properties);

    this.type = WebUI.WidgetTypes.PUSH_BUTTON;
    this.label = label;       
    this.desired_size = desired_size;

    this.is_pushed = false;
    
    // 생성자에서 이벤트 핸들러 연결
    this.onPushed = this.handleButtonPushed;
}

// PushButton으로부터 상속
WebUI.MyPushButton.prototype = Object.create(WebUI.PushButton.prototype);
WebUI.MyPushButton.prototype.constructor = WebUI.MyPushButton;

// handleButtonPushed 멤버 함수 추가 수식 , CL, EV 입력 처리
WebUI.MyPushButton.prototype.handleButtonPushed = function () {
    console.log(this.label + ' clicked');

    // 계산식을 표시할 Text 위젯
    let textbox = WebUI.widgets[2];

    // 값 설정 함수
    function setValue(val) {
        // Text 위젯의 2번째 요소가 실제 값
        textbox.visual_items[1].text = val;
        textbox.label = val;

        if (textbox.hiddenTextarea != null) {
            textbox.hiddenTextarea.value = val;
        }

        return val;
    }

    let textboxRecord = WebUI.widgets[38];

    function setRecord(val) {
        // 값 추가 함수
        function addValue(val) {
            textboxRecord.visual_items[1].text += val;
            textboxRecord.label += val;
            if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value += val;
        }

        // 계산 기록 비우기
        textboxRecord.visual_items[1].text = '';
        textboxRecord.label = '';
        if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value = '';

        // 계산 기록 배열에 추가
        WebUI.record.push(val);
        WebUI.recordIdx = WebUI.record.length;

        // 최근 6개만 표시
        let record = [];
        record = WebUI.record.length > 6
            ? WebUI.record.slice(WebUI.record.length - 6, WebUI.record.length)
            : WebUI.record;

        // 저장된 계산 기록 출력
        let index=0;
        record.forEach(item => {
            index++;
            index < 6 ? addValue(item + '\n') : addValue(item);
        })
    }

    function setFunc(val) {
        if(val.substr(0,1) == 'f') {
            WebUI.f = val;
        }
        else if(val.substr(0,1)=='g'){
            WebUI.g = val;
        }
    }

    let textboxFunc = WebUI.widgets[45];

    function getFunc(val) {
        textboxFunc.visual_items[1].text = val;
        textboxFunc.label = val;

        if (textboxFunc.hiddenTextarea != null) {
            textboxFunc.hiddenTextarea.value = val;
        }
    }

    if (WebUI.value == '0') WebUI.value = setValue('');

    if (this.label == 'EV') {
        try {
            // V3 : 좌항 저장
            let left_eq = WebUI.value;
            WebUI.value = WebUI.parser.eval(WebUI.value).toString();
            let right_eq = WebUI.value;

            let result = (left_eq + '=' + right_eq);

            var tokens = WebUI.value.split(' ');
            if (tokens[0] == 'function') {
                WebUI.value = tokens[0];
                result = left_eq;
                setFunc(result);
            }

            // V3 : 계산 기록에 추가
            setRecord(result);

            setValue(WebUI.value);
            // 계산 완료 flag 역할
            WebUI.value = '0';
        }
        catch (e) {
            console.error(e)

            // 계산 완료 flag 역할
            WebUI.value = '0'
            // Error 객체 참고
            // ref : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Error
            if (WebUI.value != 'function') setValue(e.name + ': ' + e.message);
        }
    }
    else {
        if (this.label == 'CL') WebUI.value = setValue('0');
        // V3 : 마지막 단어 지우기 기능 추가
        else if (this.label == '←') WebUI.value = setValue(WebUI.value.slice(0, -1));
        else if (this.label == 'f = ?') getFunc(WebUI.f);
        else if (this.label == 'g = ?') getFunc(WebUI.g);
        // V3 : 계산 기록 스크롤바 기능 추가
        else if (this.label == '↓' || this.label == '↑') {
            if (WebUI.record.length > 6) {
                // 계산 기록 비우기
                textboxRecord.visual_items[1].text = '';
                textboxRecord.label = '';
                if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value = '';

                // 지정한 인덱스에서 새롭게 출력
                function setIndex() {
                    function addValue(val) {
                        textboxRecord.visual_items[1].text += val;
                        textboxRecord.label += val;
                        if (textboxRecord.hiddenTextarea != null) textboxRecord.hiddenTextarea.value += val;
                    }

                    // 지정 인덱스 범위 6개만 record로 저장
                    let record = WebUI.record.slice(WebUI.recordIdx - 6, WebUI.recordIdx);
                    
                    // 저장된 계산 기록 출력
                    let index = 0;
                    record.forEach(item => {
                        index++;
                        index < 6 ? addValue(item + '\n') : addValue(item);
                    })
                }

                // 위 방향키인 경우,
                if (this.label == '↑') {
                    if(WebUI.recordIdx > 6) WebUI.recordIdx--;
                    setIndex();
                }

                // 아래 방향키인 경우,
                else if(this.label == '↓') {
                    if(WebUI.recordIdx < WebUI.record.length) WebUI.recordIdx++;
                    setIndex();
                }
            }
        }
        else WebUI.value = setValue(WebUI.value + this.label);
    }
}

// Switch 객체
WebUI.Switch = function (is_on, desired_size, properties) {
    WebUI.Widget.call(this, properties);

    // 속성 : desired_size.width만 사용할 예정 (height는 무시)
    this.type = WebUI.WidgetTypes.SWITCH;
    this.desired_size = desired_size;
    this.radius = desired_size.width / 4;
    this.is_on = is_on;

    // 시각화 : is_on에 따라 색상 변경
    this.fill_color = is_on ? 'rgb(48,209,88)' : 'rgb(142,142,147)';
}

// Switch 객체 상속
WebUI.Switch.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Switch.prototype.constructor = WebUI.Switch;

// Switch 위젯 초기화
WebUI.Switch.prototype.initVisualItems = function () {
    // ref : https://developer.mozilla.org/ko/docs/Web/SVG/Tutorial/Paths
    let strPath = 'M' + this.radius + ',' + this.radius * 2
        + 'A' + this.radius + ',' + this.radius + ' ' // rx,ry : x축과 y축의 반지름
        + '0,0,1 '                                    // x-axis-rotation,large-arc-flag,sweep-flag : x축 회전각과 조건부 flag들
        + this.radius + ',' + 0                       // dx,dy : 호가 끝나는(dest) 좌표 
        + 'L' + this.radius * 3 + ' ' + 0
        + 'A' + this.radius + ',' + this.radius + ' '
        + '0,0,1 '
        + this.radius * 3 + ',' + this.radius * 2 + 'Z';

    // 스위치 배경
    let background = new fabric.Path(strPath, {
        left: this.position.left,
        top: this.position.top,
        width: this.desired_size.width,
        height: this.desired_size.height,

        fill: this.fill_color,
        stroke: this.fill_color,
        selectable: false,
    });

    // 원형 스위치
    let toggle = new fabric.Circle({
        left: this.position.left,
        top: this.position.top,

        radius: this.radius * 0.9,
        fill: 'white',
        stroke: this.fill_color,
        selectable: false,
    });

    this.size = this.desired_size;

    // toggle y축 기준 중앙 정렬
    toggle.top = this.position.top + (this.radius - toggle.radius);
    toggle.left = this.position.left + (this.radius - toggle.radius);

    // Switch의 is_on에 따라, 원형 스위치 초기위치 조정
    if (this.is_on) toggle.left += this.radius * 2;

    this.visual_items.push(background);
    this.visual_items.push(toggle);
    this.is_resource_ready = true;
}

WebUI.Switch.prototype.handleMouseDown = function () {
    // is_on값 변경
    this.is_on = !this.is_on;
    // is_on에 따른 색상값 color 지역변수에 저장
    let color = this.is_on ? 'rgb(48,209,88)' : 'rgb(142,142,147)';

    // 색상 변경 : 배경&획 색상, 버튼 획 생상
    this.visual_items[0].set({
        fill: color,
        stroke: color,
    });
    this.visual_items[1].set('stroke', color);

    // 버튼 좌우 위치 절대값으로 저장 : 상대값으로 애니메이션 했을 시, 빠르게 연타하면 위치 벗어남
    let togglePosX = {
        off: this.visual_items[0].left + this.radius * 0.1,
        on: this.visual_items[0].left + this.radius * 2.1,
    }

    // 버튼 이동 애니메이션
    this.visual_items[1].animate('left', this.is_on ? togglePosX.on : togglePosX.off, {
        duration: 100, // 100ms로 지정
        onChange: WebUI.canvas.renderAll.bind(WebUI.canvas),
    })

    return true;
}

//
$(document).ready(function() {    
    WebUI.initialize();
});
