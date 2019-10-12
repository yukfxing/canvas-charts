var colorArr = ["rgb(173,147,219)","#3ac9cb","#5FB2ED"];

function drawRadarChart(canvasId, labelArr, dataArr, options = {}) {
    // 雷达图宽高，圆心坐标
    var width, height, originX, originY;
    // 雷达图标签个数，圆环个数
    var labelNum, circleNum;
    // 雷达图初始圆半径，初始刻度值，绘制起始角度
    var radius, basePoint, startAngle;
    // 雷达图动画相关参数
    var ctr, numctr, speed;
    // 雷达图矩形提示框高度，提示框文字
    var rectTipHeight, tipTextObj;
    // 光标位置
    var mousePosition;
    // 雷达图与文字间距
    var textPadding;

    // 默认配置
    var defaultOptions = {
        width: 300,
        height: 300,
        originX: 300,
        originY: 300,
        labelNum: 5,
        circleNum: 3,
        radius: 40,
        basePoint: 2,
        startAngle: Math.PI / 2,
        ctr: 1,
        numctr: 40,
        speed: 1,
        rectTipHeight: 120,
        textPadding: 15,
    };

    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext('2d');

    initChart();
    // 初始化雷达图
    function initChart() {
        width = options.width || defaultOptions.width;
        height = options.height || defaultOptions.height;
        originX = options.originX || defaultOptions.originX;
        originY = options.originY || defaultOptions.originY;
        labelNum = options.labelNum || defaultOptions.labelNum;
        circleNum = options.circleNum || defaultOptions.circleNum;
        radius = options.radius || defaultOptions.radius;
        basePoint = options.basePoint || defaultOptions.basePoint;
        startAngle = options.startAngle || defaultOptions.startAngle;
        ctr = options.ctr || defaultOptions.ctr;
        numctr = options.numctr || defaultOptions.numctr;
        speed = options.speed || defaultOptions.speed;
        rectTipHeight = options.rectTipHeight || defaultOptions.rectTipHeight;
        textPadding = options.textPadding || defaultOptions.textPadding;
        tipTextObj = {};
        mousePosition = {};

        canvas.width = width * 2;
        canvas.height = height * 2;
        canvas.style.width = canvas.width / 2 + 'px';
        canvas.style.height = canvas.height / 2 + 'px';
    }

    drawLabel();
    // draw radar chart label
    function drawLabel() {
        context.font = '24px Arial';
        context.lineWidth = 2;
        for(var i = 0; i < circleNum; i += 1) {
            context.beginPath();
            context.strokeStyle = 'rgba(9,111,177,0.75)';
            context.arc(originX, originY, radius * (i + 1), 0, Math.PI * 2);
            context.closePath();
            context.stroke();
        }

        context.beginPath();
        for(var j = 0; j <= circleNum; j += 1) {
            context.fillStyle = '#666';
            context.fillText(String(basePoint * j), originX - 6, originY - radius * j - 2);
        }
        context.closePath();

        context.beginPath();
        context.strokeStyle = 'rgba(9,111,177,0.75)';
        for(var k = 0; k < labelNum; k += 1) {
            startAngle += Math.PI * 2 / labelNum;
            var circleRadius = radius * circleNum;
            var destX = parseInt(originX + circleRadius * Math.cos(startAngle));
            var destY = parseInt(originY + circleRadius * Math.sin(startAngle));
            context.moveTo(originX, originY);
            context.lineTo(destX, destY);

            // draw markers
            context.fillStyle = '#333';
            drawMarkers(labelArr[k], { x: destX, y: destY });
        }
        // context.closePath();
        context.fill();
        context.stroke();
    }

    function drawMarkers(text, point) {
        if (point.x < originX && point.y <= originY) {
            context.textAlign = 'right';
            context.fillText(text, point.x - textPadding, point.y - textPadding);
        } else if (point.x < originX && point.y > originY) {
            context.textAlign = 'right';
            context.fillText(text, point.x - textPadding, point.y + textPadding);
        } else if (point.y <= originY) {
            context.textAlign = 'left';
            context.fillText(text, point.x + textPadding, point.y - textPadding);
        } else {
            context.textAlign = 'left';
            context.fillText(text, point.x + textPadding, point.y + textPadding);
        }
    }

    drawChart();
    // draw radar chart animation
    function drawChart() {
        var isDrawTip = false;
        for(var i = 0; i < dataArr.length; i += 1) {
            var arcArr = [];
            var pointArr = dataArr[i].value;
            var color = colorArr[i % colorArr.length];
            context.beginPath();
            context.strokeWidth = 2;
            context.strokeStyle = color;
            context.fillStyle = color;
            startAngle = Math.PI / 2;

            for(var j = 0; j < labelNum; j += 1) {
                startAngle += Math.PI * 2 / labelNum;
                var realRadius = pointArr[j] / basePoint * radius * ctr / numctr;
                var destX = originX + realRadius * Math.cos(startAngle);
                var destY = originY + realRadius * Math.sin(startAngle);
                context.lineTo(destX, destY);

                function drawArc(point, color, tipText) {
                    return function() {
                        context.beginPath();
                        context.strokeStyle = color;
                        context.arc(point.x, point.y, 6 * ctr / numctr, 0, Math.PI * 2);
                        if (context.isPointInPath(mousePosition.x * 2, mousePosition.y * 2)) {
                            isDrawTip = true;
                            tipTextObj = tipText;
                            context.fill();
                            context.beginPath();
                            context.globalAlpha = 0.4;
                            context.arc(point.x, point.y, 10 * ctr / numctr, 0, Math.PI * 2);
                        }
                        context.fill();
                        context.globalAlpha = 1;
                    }
                }
                arcArr.push(drawArc({ x: destX, y: destY }, color, { title: labelArr[j], last: dataArr[0].value[j], now: dataArr[1].value[j] }));
            }
            context.fillStyle = color;
            context.closePath();
            context.globalAlpha = 0.5;
            context.fill();
            context.globalAlpha = 1;
            context.stroke();

            for(var m = 0; m < arcArr.length; m += 1) {
                arcArr[m]();
            }

            isDrawTip && drawTips(mousePosition.x * 2, mousePosition.y * 2, tipTextObj);
        }

        if (ctr < numctr) {
            ctr += 1;
            setTimeout(function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                drawLabel();
                drawChart();
            }, speed *= 1.1);
        }
    }

    // draw tips when cursor hover
    function drawTips(startX, startY, labelText) {
        var fillTextX = startX + 20;
        context.beginPath();
        context.strokeStyle = '#f40';
        context.lineWidth = 2;
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        if (startX >= originX) {
            fillTextX = startX - rectTipHeight * 2;
            drawRoundedRect(context, startX - 10, startY - rectTipHeight / 2, 2 * rectTipHeight, rectTipHeight, 5, -1);
        } else {
            drawRoundedRect(context, startX + 10, startY - rectTipHeight / 2, 2 * rectTipHeight, rectTipHeight, 5, 1);
        }

        context.textAlign = 'left';
        context.fillStyle = '#000';
        context.fillText(labelText.title, fillTextX, startY - rectTipHeight / 6);
        context.fillText('去年同期评价：' + labelText.last, fillTextX, startY + rectTipHeight / 10);
        context.fillText('个股本期评价：' + labelText.now, fillTextX, startY + rectTipHeight / 3);
    }

    // draw different direction rounded rectangle
    function drawRoundedRect(context, x, y, width, height, radius, direction = 1) {
        context.moveTo(x, y + radius);
        context.beginPath();
        context.lineTo(x, y + height - radius);
        context.quadraticCurveTo(x, y + height, x + direction * radius, y + height);
        context.lineTo(x + direction * (width - radius), y + height);
        context.quadraticCurveTo(x + direction * width, y + height, x + direction * width, y + height - radius);
        context.lineTo(x + direction * width, y + radius);
        context.quadraticCurveTo(x + direction * width, y, x + direction * (width - radius), y);
        context.lineTo(x + direction * radius, y);
        context.quadraticCurveTo(x, y, x, y + radius);
        context.closePath();
        context.fill();
        context.stroke();
    }

    var mouseTimer = null;
    canvas.addEventListener('mousemove', function(e) {
        e = e || window.event;
        if(e.offsetX || e.offsetX === 0){
            mousePosition.x = e.offsetX;
            mousePosition.y = e.offsetY;
        }else if(e.layerX || e.layerX === 0){
            mousePosition.x = e.layerX;
            mousePosition.y = e.layerY;
        }

        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(function(){
            context.clearRect(0,0,canvas.width, canvas.height);
            drawLabel();
            drawChart();
        },10);
    });
}