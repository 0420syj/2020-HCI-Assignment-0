// 싱글톤(singleton) : 변수나 객체를 감싸는 네임스페이스 역할
let WebUI = {}

// 위젯 유형 정의
WebUI.WidgetTypes = {
    UNDEFINED:      "undefind",
    TEXT:           "text",
    IMAGE:          "image",
    PUSH_BUTTON:    "push_button",
    TEXT_FIELD:     "text_field",
    SWITCH:         "switch",
};

// 위젯 배열 관리
WebUI.widgets = [];

// 상호작용 대상 위젯 관리 : 현재 어떤 위젯이 상호작용중인지 추적 및 관리
WebUI.focused_widget = null;
WebUI.dragged_widget = null;
WebUI.hovered_widget = null;

// 마우스 드래그 처리 : 드래그 관련된 상태 추적 및 관리
WebUI.is_mouse_dragging = false;       
WebUI.mouse_drag_start = {x:0, y:0};
WebUI.mouse_drag_prev = {x:0, y:0};

/*
초기화 관련 함수
*/

// WebUI 초기화 함수
WebUI.initialize = function() {
    // 캔버스 객체 생성
    this.canvas = new fabric.Canvas("c", {
        backgroundColor: "#eee",
        hoverCursor: "default",
        selection: false,
        width: window.innerWidth,
        height: window.innerHeight
    });

    // 이벤트 핸들러 등록
    $(document).keypress(function(event) {
        WebUI.handleKeyPress(event);
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

    // 위젯 생성, 시각적 요소 초기화, 리소스 로딩 대기
    WebUI.initWidgets();
    WebUI.initVisualItems();
    WebUI.layoutWhenResourceReady();
}

// 위젯 생성 : 추가 입력
WebUI.initWidgets = function() {
    WebUI.title = new WebUI.Text("Introduction to HCI");

    WebUI.img_html =
        new WebUI.Image("resources/HTML5.png", { width: 100, height: 80 });
    WebUI.img_css =
        new WebUI.Image("resources/CSS3.png", { width: 100, height: 80 });
    WebUI.img_js =
        new WebUI.Image("resources/JS.png", { width: 100, height: 80 });

    WebUI.text_id = new WebUI.Text("ID");
    WebUI.text_pwd = new WebUI.Text("Password");

    WebUI.edit_id = new WebUI.TextField("", { width: 200, height: 50 });
    WebUI.edit_pwd = new WebUI.TextField("", { width: 200, height: 50 });

    WebUI.btn_ok = new WebUI.PushButton("OK", { width: 100, height: 50 });
    WebUI.btn_cancel =
        new WebUI.PushButton("Cancel", { width: 100, height: 50 });

    WebUI.text_blah = new WebUI.Text("I want to get A+!");
    WebUI.switch = new WebUI.Switch(false, { width: 100, height: 50 });
}

// 시각적 요소 초기화
WebUI.initVisualItems = function() {
    WebUI.widgets.forEach(widget => {
        widget.initVisualItems();
    });
}

// 리소스 로딩 대기
WebUI.layoutWhenResourceReady = function() {
    // 리소스 준비여부 확인
    let is_resource_loaded = true;
    for (let i in WebUI.widgets) {
        let widget = WebUI.widgets[i];
        if (!widget.is_resource_ready) {
            is_resource_loaded = false;
            break;
        }
    }

    // 50ms마다 준비여부 확인
    if (!is_resource_loaded) {
        setTimeout(arguments.callee, 50);
    }
    // 리소스 준비 완료
    else {
        WebUI.widgets.forEach(widget => {
            widget.visual_items.forEach(item => {
                WebUI.canvas.add(item);
            });
        });
    
        // 위젯 배치
        WebUI.layoutWidgets();

        // 다시 렌더링
        WebUI.canvas.requestRenderAll();
    }
}

// 위젯 배치 : 추가 입력
WebUI.layoutWidgets = function() {
    WebUI.title.moveTo({ left: 100, top: 10 });

    WebUI.img_html.moveTo({ left: 50, top: 50 });
    WebUI.img_css.moveTo({ left: 160, top: 50 });
    WebUI.img_js.moveTo({ left: 270, top: 50 });

    WebUI.text_id.moveTo({ left: 50, top: 160 });
    WebUI.text_pwd.moveTo({ left: 50, top: 220 });

    WebUI.edit_id.moveTo({ left: 150, top: 140 });
    WebUI.edit_pwd.moveTo({ left: 150, top: 200 });

    WebUI.text_blah.moveTo({ left: 50, top: 300 });
    WebUI.switch.moveTo({ left: 250, top: 280 });

    WebUI.btn_ok.moveTo({ left: 50, top: 350 });
    WebUI.btn_cancel.moveTo({ left: 160, top: 350 });
}

/*
이벤트 핸들러 함수
*/

// 키 입력 이벤트
WebUI.handleKeyPress = function(event) {
    let is_handled = false;

    // focus된 위젯 처리
    if (WebUI.focused_widget) {
        is_handled = WebUI.focused_widget.handleKeyPress(event);
    }

    // handle되었다면 다시 렌더링
    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

// 마우스 다운 이벤트 : 추가 입력
WebUI.handleMouseDown = function(window_p) {
    let is_handled = false;

    // 캔버스 내부인지 확인
    if (WebUI.isInCanvas(window_p)) {
        let canvas_p = WebUI.transformToCanvasCoords(window_p);

        WebUI.is_mouse_dragging = true;
        WebUI.mouse_drag_start = canvas_p;
        WebUI.mouse_drag_prev = canvas_p;

        let widget = WebUI.findWidgetOn(canvas_p);
        // 어떤 위젯인지 확인
        if (widget) {
            WebUI.focused_widget = widget;

            if (widget.is_draggable) {
                WebUI.dragged_widget = widget;
            }
            else {
                WebUI.dragged_widget = null;
            }

            // handle 되었는지 확인
            is_handled = widget.handleMouseDown(canvas_p);
        }
        else {
            WebUI.focused_widget = null;
            WebUI.dragged_widget = null;
        }
    }
    else {
        WebUI.is_mouse_dragging = false;
        WebUI.mouse_drag_start = { x: 0, y: 0 };
        WebUI.mouse_drag_prev = { x: 0, y: 0 };
        WebUI.focused_widget = null;
        WebUI.dragged_widget = null;
    }

    // handle 되었다면 다시 렌더링
    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

// 마우스 무브 이벤트 : 추가 입력, 오타 수정
WebUI.handleMouseMove = function(window_p) {
    let is_handled = false;
    let canvas_p = WebUI.transformToCanvasCoords(window_p); // tansform -> transform 오타 수정
    let widget = WebUI.findWidgetOn(canvas_p);

    // 현재 위젯이, 이전에 hover된 위젯과 다르다면
    if (widget != WebUI.hovered_widget) {
        // 이전에 다른 위젯에 있었다면
        if (WebUI.hovered_widget != null) {
            // 이전 위젯에서 MouseExit
            is_handled = is_handled ||
                WebUI.hovered_widget.handleMouseExit(canvas_p);
        }
        // 새로운에 위젯에 들어오면
        if (widget != null) {
            // 새로운 위젯에 MouseEnter
            is_handled = is_handled ||
                widget.handleMouseEnter(canvas_p);
        }
        // 새로운 위젯에 hover 되었음을 update
        WebUI.hovered_widget = widget;
    }
    // 그게 아니라면, 단순히 같은 위젯 내에서 MouseMove한 것
    else {
        if (widget) {
            is_handled = widget.handleMouseMove(canvas_p);
        }
    }

    // 마우스가 눌린 상태로 dragging이라면
    if (WebUI.is_mouse_dragging) {
        if (WebUI.dragged_widget != null) {
            let tx = canvas_p.x - WebUI.mouse_drag_prev.x;
            let ty = canvas_p.y - WebUI.mouse_drag_prev.y;
            // 위젯 이동
            WebUI.dragged_widget.translate({ x: tx, y: ty });

            // handle 됨
            is_handled = true;
        }
        WebUI.mouse_drag_prev = canvas_p;
    }

    // handle되었으니 다시 렌더링
    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

// 마우스 업 이벤트 : 추가 입력
WebUI.handleMouseUp = function(window_p) {
    let is_handled = false;
    let canvas_p = WebUI.transformToCanvasCoords(window_p);
    let widget = WebUI.findWidgetOn(canvas_p);

    // 해당 위젯에 MouseUp
    if (widget) {
        is_handled = widget.handleMouseUp(canvas_p);
    }

    // dragging이었다면 상태 해제 및 초기화
    if (WebUI.is_mouse_dragging) {
        WebUI.is_mouse_dragging = false;
        WebUI.mouse_drag_start = { x: 0, y: 0 };
        WebUI.mouse_drag_prev = { x: 0, y: 0 };
        WebUI.dragged_widget = null;

        // handle 됨
        is_handled = true;
    }

    // handle 되었으니 다시 렌더링
    if (is_handled) {
        WebUI.canvas.requestRenderAll();
    }
}

/*
좌표 계산 및 추적 함수
*/

// 윈도우 창 좌표를 캔버스 내부 상대좌표로 변환
WebUI.transformToCanvasCoords = function(window_p) {
    let rect = WebUI.canvas.getElement().getBoundingClientRect();
    let canvas_p = {
        x : window_p.x - rect.left,
        y : window_p.y - rect.top
    };
    return canvas_p;
}

// 캔버스 경계 내부에 있는지 확인
WebUI.isInCanvas = function(window_p) {
    let rect = WebUI.canvas.getElement().getBoundingClientRect();
    // 현재 위치가 캔버스 경계 내부에 있는지 boolean 값 return
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

// 주어진 캔버스 좌표가 어떤 위젯 내부에 있는지 확인 : 추가 입력
WebUI.findWidgetOn = function(canvas_p) {
    let x = canvas_p.x;
    let y = canvas_p.y;

    // 위젯 갯수만큼 전부 확인
    for (let i = 0; i < this.widgets.length; i++) {
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

/*
위젯 관련 함수
Widget 기본 속성 : 강의 자료 p39
*/

// Widget 객체 생성자 함수 : 추가 입력
WebUI.Widget = function() {
    // 종류
    this.type = WebUI.WidgetTypes.UNDEFINED;

    // 계층적 구조
    this.parent = null;
    this.children = [];

    // 공간적 배치
    this.position = { left: 0, top: 0 };
    this.size = { width: 0, height: 0 };

    // 조작 가능성
    this.is_draggable = false;
    this.is_movable = true; // 오타 수정 p40

    // 시각적 표현
    this.visual_items = [];
    this.is_resource_ready = false;

    // 처음에 null로 생성한 widgets 배열에 저장 : 관리를 용이하게 하기 위함
    WebUI.widgets.push(this);
}

// Widget 객체 소멸자 함수 : 추가 입력, 오타 수정
WebUI.Widget.prototype.destroy = function() {
    // 상태 남아있다면, 삭제
    if (this == WebUI.focused_widget) WebUI.focused_widget = null;
    if (this == WebUI.dragged_widget) WebUI.dragged_widget = null;
    if (this == WebUI.hovered_widget) WebUI.hovered_widget = null; // WebUi -> WebUI 오타 수정

    // 시각데이터 삭제
    this.visual_items.forEach(item => {
        WebUI.canvas.remove(item);
    });
    this.visual_items = [];

    // widgets 배열에서 해당 위젯만 삭제
    // ref : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    let index = WebUI.widgets.indexOf(this);
    if (index > -1) {
        // index(삭제하려는 위젯)로 부터 1개의 요소 splice
        WebUI.widgets.splice(index, 1);
    }

    // 모든 자식 객체 삭제
    this.children.forEach(child_widget => {
        child_widget.destroy();
    });
    this.children = [];
}

// Widget 이동 함수1 (절대 위치로 이동)
WebUI.Widget.prototype.moveTo = function(p) {
    if (!this.is_movable) return;

    // 목적지 좌표 계산
    let tx = p.left - this.position.left;
    let ty = p.top - this.position.top;

    // 아래의 translate 함수 활용
    this.translate({ x: tx, y: ty });
}

// Widget 이동 함수2 (상대값 만큼 이동) : 추가 입력
WebUI.Widget.prototype.translate = function(v) {
    if (!this.is_movable) return;

    // 매개변수 값만큼 이동
    this.position.left += v.x;
    this.position.top += v.y;

    // 시각 데이터도 이동
    this.visual_items.forEach(item => {
        item.left += v.x;
        item.top += v.y;
    });

    // 자식 객체도 이동
    this.children.forEach(child_widget => {
        child_widget.translate(v);
    });
}

// Widget에서 쓰일 가상함수들 선언
WebUI.Widget.prototype.initVisualItems = function() {
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

// Text 위젯 생성 : 추가 입력
WebUI.Text = function(label) {
    // 위젯 생성자 함수 호출 : widgets 배열에 저장하기 위해 반드시 필요
    WebUI.Widget.call(this);

    // 위젯 타입 지정
    this.type = WebUI.WidgetTypes.TEXT;
    this.label = label;

    // 텍스트 스타일 지정
    this.font_family = 'System';
    this.font_size = 20;
    this.font_weight = 'bold';
    this.text_align = 'left';
    this.text_color = 'black';
}

// Widget의 프로토타입 위임(상속)받는다 : 추가 입력
WebUI.Text.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Text.prototype.constructor = WebUI.Text;

// Text 위젯 시각화 : 추가 입력
WebUI.Text.prototype.initVisualItems = function () {
    let text = new fabric.Text(this.label, {
        left: this.position.left,
        top: this.position.top,
        selectable: false,
        fontFamily: this.font_family,
        fontSize: this.font_size,
        fontWeight: this.font_weight,
        textAlign: this.text_align,
        stroke: this.text_color,
        fill: this.text_color
    });

    let bound = text.getBoundingRect();
    this.position.left = bound.left;
    this.position.top = bound.top;
    this.size.width = bound.width;
    this.size.height = bound.height;

    this.visual_items.push(text);
    this.is_resource_ready = true;
}

// Image 위젯
WebUI.Image = function(path, desired_size) {
    WebUI.Widget.call(this);

    // 타입, 파일 경로, 기대 크기
    this.type = WebUI.WidgetTypes.IMAGE;
    this.path = path;
    this.desired_size = desired_size;
}

// 프로토타입 상속
WebUI.Image.prototype = Object.create(WebUI.Widget.prototype);
WebUI.Image.prototype.constructor = WebUI.Image;

// Image 위젯 시각화 : 추가 입력
WebUI.Image.prototype.initVisualItems = function() {
    let widget = this;

    // 비동기적으로 이미지 로딩
    fabric.Image.fromURL(this.path, function (img) {
        // 지정 크기 설정
        if (widget.desired_size != undefined) {
            img.scaleToWidth(widget.desired_size.width);
            img.scaleToHeight(widget.desired_size.height);
            widget.size = widget.desired_size;
        }
        // 지정 크기없다면, 이미지 크기 그대로 사용
        else {
            widget.size = {
                width: img.width,
                height: img.height
            };
        }

        img.set({
            left: widget.position.left,
            top: widget.position.top,
            selectable: false
        });
        
        widget.visual_items.push(img);
        widget.is_resource_ready = true;
    });
}

// TextField 위젯
WebUI.TextField = function(label, desired_size) {
    WebUI.Widget.call(this);

    this.type = WebUI.WidgetTypes.TEXT_FIELD;
    this.label = label;
    this.desired_size = desired_size;
    this.margin = 10; // 텍스트 입력 영역 좌측과 텍스트 박스 좌측 사이의 여백값

    this.stroke_color = 'black';
    this.fill_color = 'white';
    this.stroke_width = 5;    

    this.font_family = 'System';
    this.font_size = 20;
    this.font_weight = 'normal';
    this.text_align = 'left';
    this.text_color = 'black';
}

WebUI.TextField.prototype = Object.create(WebUI.Widget.prototype);
WebUI.TextField.prototype.constructor = WebUI.TextField;

// TextField 위젯 초기화 : 추가 입력
WebUI.TextField.prototype.initVisualItems = function() {
    // 텍스트 박스 외곽선
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

    // 텍스트 입력 영역 : 오타 수정
    let textbox = new fabric.Textbox(this.label, {
        left: this.position.left + this.margin, // margin -> this.margin 오타 수정
        fontFamily: this.font_family,
        fontSize: this.font_size,
        fontWeight: this.font_weight,
        textAlign: this.text_align,
        stroke: this.text_color,
        fill: this.text_color,
        selectable: false,
        // 초반에 공백 입력시 계행되던 버그 수정
        width: this.desired_size.width,
    });

    // 텍스트 y축 기준 중앙 정렬
    let bound = textbox.getBoundingRect();
    textbox.top = this.position.top + 
        (this.desired_size.height - bound.height) /2; // 높이의 중간값

    this.size = this.desired_size;

    this.visual_items.push(boundary);
    this.visual_items.push(textbox);
    this.is_resource_ready = true;
}

// 1. 클릭되었을 때 : 입력 활성화
WebUI.TextField.prototype.handleMouseDown = function(canvas_p) {
    let textbox = this.visual_items[1];        
    // 입력 활성화
    textbox.enterEditing();

    return true;
}

// 2. 키 값이 입력되었을 때 : 빈칸 아니였지만 추가 입력, Enter키와 텍스트 박스 크기를 넘어서는 경우 제한
WebUI.TextField.prototype.handleKeyPress = function(event) {
    let boundary = this.visual_items[0];
    let textbox = this.visual_items[1];        

    let new_label = textbox.text;
    let old_label = this.label;
    this.label = new_label;

    // Enter키가 입력되면, 빠져나감
    if (event.keyCode == 13) {
        // Enter키에 해당하는 문자 제거
        let text_enter_removed = new_label.replace(/(\r\n|\n|\r)/gm, "");
        textbox.text = text_enter_removed;
        this.label = text_enter_removed;
        
        // hiddenTextarea에 있는 값도 Enter키 없는 문자열로 대체
        if (textbox.hiddenTextarea != null) {
            textbox.hiddenTextarea.value = text_enter_removed;
        }

        // 입력 비활성화
        textbox.exitEditing();

        return true;    
    }

    // 새로운 문자가 입력된 경우
    if (old_label != new_label && old_label.length < new_label.length) {
        let canvas = document.getElementById("c");
        let context = canvas.getContext("2d");
        context.font = this.font_size.toString() + "px " + this.font_family;

        let boundary_right = boundary.left + boundary.width - this.margin - boundary.strokeWidth; // 입력폼 오른쪽 경계 (오른쪽에도 여백 두도록 margin값을 뺌)
        let text_bound = textbox.getBoundingRect(); // 현재 textbox 정보 불러오기
        let text_width = context.measureText(new_label).width; // new_label 텍스트들의 길이
        let text_right = text_bound.left + text_width; // textbox의 경계

        // 새로 입력한 텍스트 경계가 입력폼 경계를 넘을 경우
        if (boundary_right < text_right) {
            // old_label로 대체
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

// PushButton 위젯 생성
WebUI.PushButton = function(label, desired_size) {
    WebUI.Widget.call(this);

    // 속성
    this.type = WebUI.WidgetTypes.PUSH_BUTTON;
    this.label = label;
    this.desired_size = desired_size;
    this.is_pushed = false;

    // 시각화
    this.stroke_color = 'black';
    this.fill_color = 'white';

    // 시각화(텍스트)
    this.font_family = 'System';
    this.font_size = 20;
    this.font_weight = 'bold';
    this.text_align = 'center';
    this.text_color = 'black';
}

// 프로토 타입 상속
WebUI.PushButton.prototype = Object.create(WebUI.Widget.prototype);
WebUI.PushButton.prototype.constructor = WebUI.PushButton;

// PushButton 위젯 초기화
WebUI.PushButton.prototype.initVisualItems = function() {
    // 배경 설정
    let background = new fabric.Rect({
        left: this.position.left,
        top: this.position.top,
        width: this.desired_size.width,
        height: this.desired_size.height,
        fill: this.fill_color,
        stroke: this.stroke_color,
        strokeWidth: 1,
        selectable: false
    });

    // 텍스트 설정
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

    // 텍스트 정중앙 정렬
    let bound = text.getBoundingRect();
    text.left = this.position.left + this.desired_size.width/2 - bound.width/2;
    text.top = this.position.top + this.desired_size.height/2 - bound.height/2;

    this.size = this.desired_size;

    this.visual_items.push(background);
    this.visual_items.push(text);
    this.is_resource_ready = true;
}

// PushButton 위젯 상호작용 관련 함수
// 1. 눌림 활성화, 위젯 하향 이동 : 추가 입력
WebUI.PushButton.prototype.handleMouseDown = function () {
    if (!this.is_pushed) {
        // 눌렸다면 y축으로 5만큼 아래로 이동
        this.translate({ x: 0, y: 5 });
        this.is_pushed = true;
        
        // onPushed가 등록되어있다면 해당 이벤트 핸들러 호출
        if (this.onPushed != undefined) {
            this.onPushed.call(this);
        }
        return true;
    }
    else {
        return false;
    }
}

// 2. 눌림 해제, 위젯 위치 복원 : 추가 입력
WebUI.PushButton.prototype.handleMouseUp = function() {
    if (this.is_pushed) {
        // 눌렸던 위치를 원래대로 y축으로 5만큼 위로 이동
        this.translate({ x: 0, y: -5 });
        this.is_pushed = false;
        return true;
    }
    else {
        return false;
    }
}

// 3. 호버 상태 표시 : 추가 입력
WebUI.PushButton.prototype.handleMouseEnter = function() {
    // 획 더 두껍게
    this.visual_items[0].set('strokeWidth', 3);
    return true;
}

// 4. 호버 상태 해제 : 추가 입력
WebUI.PushButton.prototype.handleMouseExit = function() {
    // 획 두께 원래대로
    this.visual_items[0].set('strokeWidth', 1);

    // 눌린 상태(is_pushed)로 MouseExit 하더라도, 눌림 해체(복원)될 수 있도록
    if (this.is_pushed) {
        this.translate({ x: 0, y: -5 });
        this.is_pushed = false;
    }
    return true;
}

// Switch 객체
WebUI.Switch = function(is_on, desired_size) {
    WebUI.Widget.call(this);

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
    if(this.is_on) toggle.left += this.radius * 2;

    this.visual_items.push(background);
    this.visual_items.push(toggle);
    this.is_resource_ready = true;
}

WebUI.Switch.prototype.handleMouseDown = function() {
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
        off : this.visual_items[0].left + this.radius * 0.1,
        on : this.visual_items[0].left + this.radius * 2.1,
    }

    // 버튼 이동 애니메이션
    this.visual_items[1].animate('left', this.is_on ? togglePosX.on : togglePosX.off , {
        duration: 100, // 100ms로 지정
        onChange: WebUI.canvas.renderAll.bind(WebUI.canvas),
    })

    return true;
}

// WebUI 초기화 함수 실행
$(document).ready(function() {    
    WebUI.initialize();
});
