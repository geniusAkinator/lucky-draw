$(document).ready(function () {
    //list随机生成一百个用户名
    var list = []
    const nlen = list.length
    var winner = JSON.parse(localStorage.getItem('winner')) || []
    var timer = null
    var timerList = []

    $("#counter").html("参与人数：" + nlen)

    //生成dom插入到draw-list中,每5秒轮流切换50个,不随机按顺序
    var index = 0
    function carousel() {
        timer = setInterval(drawList(), 5000)
        timerList.push(timer)
    }

    function drawList() {
        var str = ''
        for (var i = 0; i < 50; i++) {
            //判断list[index]是否是winner中的元素
            const isWinner = winner.indexOf(list[index]) !== -1
            str += '<li class="draw-item' + (isWinner ? ' active' : '') + '">' + (list[index] || ' ') + '</li>'
            index++
        }
        $('.draw-list').html(str)
        if (index >= nlen) {
            index = 0
        }
        return drawList
    }

    carousel()

    function clearTimer() {
        timerList.forEach(item => {
            clearInterval(item)
        })
    }

    var start = false
    var num = $('#num').val()
    var round = winner.length / num + 1

    //点击开始抽奖,抽奖动画，draw-list中的li随机排序
    $('#start').click(function () {
        if (start) {
            return
        }
        start = true
        //关闭轮播
        clearTimer()
        var left = []
        var temp = []
        //left是剩余的名单，取list和winner的差集
        for (var i = 0; i < nlen; i++) {
            if (winner.indexOf(list[i]) === -1) {
                left.push(list[i])
            }
        }
        const leftLen = left.length
        if (leftLen === 0) {
            alert('抽奖结束，谢谢参与！')
            start = false
            return
        }

        $('.stop-main').fadeIn();
        $('#stop-time').show().html('3');
        $("#start").text("倒计时...")
        var stop_time = setTimeout(function () {
            $('#stop-time').fadeIn();
            $('#stop-time').text('2');
            $('#stop-time').fadeOut();
        }, 1000);
        stop_time = setTimeout(function () {
            $('#stop-time').fadeIn();
            $('#stop-time').text('1');
        }, 2000);
        stop_time = setTimeout(function () {
            $('#stop-time').fadeOut();
            clearTimeout(stop_time);
            $('.stop-main').hide();
        }, 2800);

        $('.draw-list').fadeOut()
        setTimeout(() => {
            var arr = []
            for (var i = 0; i < num; i++) {
                arr.push(i)
            }
            var len = arr.length > leftLen ? leftLen : arr.length
            $("#start").text("抽奖中...")
            $(".draw-round span").text("第" + round + "轮抽取中").fadeIn()
            round++
            var timer = setInterval(() => {
                var str = ''
                for (var i = 0; i < len; i++) {
                    var index = Math.floor(Math.random() * leftLen)
                    str += `<li class="draw-item">${left[index]}</li>`
                }
                $('.draw-list').html(str).fadeIn()
            }, 30)
            setTimeout(() => {
                clearInterval(timer)
                $("#start").text("开始抽奖")
                var str = ''
                var selected = new Array(leftLen).fill(false);
                var index;
                for (var i = 0; i < len; i++) {
                    do {
                        index = Math.floor(Math.random() * leftLen);
                    } while (selected[index]);
                    selected[index] = true;
                    str += `<li class="draw-item">${left[index]}</li>`;
                    winner.push(left[index])
                    temp.push(left[index])
                }
                localStorage.setItem('winner', JSON.stringify(winner))
                updateWinner()
                $('.draw-list').html(str)
                start = false
            }, 4000)
            //抽奖结束后,modal弹出,显示中奖名单
            setTimeout(() => {
                $('#lottery-result').fadeIn()
                $(".draw-round span").text('').fadeOut()
                var str = ''
                $('.modal-winner-list').html('')
                for (var i = 0; i < temp.length; i++) {
                    //temp[i]的文字拆成单独的span
                    var arr = temp[i].split('')
                    var len = arr.length
                    str += `<li class="modal-winner-item">`
                    for (var j = 0; j < len; j++) {
                        str += `<span>${arr[j]}</span>`
                    }
                    str += `</li>`
                }
                $('.modal-winner-list').html(str)
            }, 5000)
        }, 2900);
    })

    updateWinner()

    function updateWinner() {
        //winners-list也要更新
        var str = ''
        for (var i = 0; i < winner.length; i++) {
            str += `<li class="winners-item">${winner[i]}</li>`
        }
        //每行3个，不够的用空格补齐
        var len = winner.length % 3
        if (len) {
            for (var i = 0; i < 3 - len; i++) {
                str += `<li class="winners-item"></li>`
            }
        }
        $('.winners-list').html(str)
        updateJoinNum()
    }

    function updateJoinNum() {
        $('#counter').html('参与人数：' + nlen + (winner.length ? '<br/>中奖人数：' + winner.length : ''))
    }

    $("#close").click(function () {
        $('#lottery-result').fadeOut()
        $('.modal-winner-list').html('')
        carousel()
        start = false
    })

    $("#clear").click(function () {
        if (confirm('确定清空中奖名单吗？')) {
            round = 1
            winner = []
            localStorage.setItem('winner', JSON.stringify(winner))
            updateJoinNum()
            $('.winners-list').html('')
            $('.draw-list').html('')
        }
    })

    var canvas = document.getElementById('lottery-canvas');
    function setCanvasSize() {
        const width = document.body.clientWidth
        const height = document.body.clientHeight || document.documentElement.clientHeight
        canvas.width = width;
        canvas.height = height;
        cx = canvas.width / 2;
        cy = canvas.height / 2;
    }
    window.onload = function () {
        setCanvasSize();
    };
    window.addEventListener("resize", () => {
        setCanvasSize()
    });
    var seeds = new Array();
    // spawnSeed(); // spawn initial seed
    initVars();
    frame();
    function spawnSeed() {
        seed = new Object();
        seed.x = -50 + Math.random() * 100;
        seed.y = 25;
        seed.z = -50 + Math.random() * 100;
        seed.vx = .1 - Math.random() * .2;
        seed.vy = -1.5;//*(1+Math.random()/2);
        seed.vz = .1 - Math.random() * .2;
        seed.born = frames;
        seeds.push(seed);
    }

    function initVars() {
        pi = Math.PI;
        ctx = canvas.getContext("2d");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        cx = canvas.width / 2;
        cy = canvas.height / 2;
        playerZ = -25;
        playerX = playerY = playerVX = playerVY = playerVZ = pitch = yaw = pitchV = yawV = 0;
        scale = 600;
        seedTimer = 0; seedInterval = 5, seedLife = 100; gravity = .02;
        seeds = new Array();
        sparkPics = new Array();
        s = "assets/images/";
        for (i = 1; i <= 10; ++i) {
            sparkPic = new Image();
            sparkPic.src = s + "spark" + i + ".png";
            sparkPics.push(sparkPic);
        }
        sparks = new Array();
        pow1 = new Audio(s + "pow1.mp3");
        pow2 = new Audio(s + "pow2.mp3");
        pow3 = new Audio(s + "pow3.mp3");
        pow4 = new Audio(s + "pow4.mp3");
        frames = 0;
    }

    function draw() {
        ctx.clearRect(0, 0, cx * 2, cy * 2);
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 1;
        // console.log(seeds.length)
        for (i = 0; i < seeds.length; ++i) {
            point = rasterizePoint(seeds[i].x, seeds[i].y, seeds[i].z);
            if (point.d != -1) {
                size = 200 / (1 + point.d);
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
            }
        }
        point1 = new Object();
        for (i = 0; i < sparks.length; ++i) {
            point = rasterizePoint(sparks[i].x, sparks[i].y, sparks[i].z);
            if (point.d != -1) {
                size = sparks[i].radius * 200 / (1 + point.d);
                if (sparks[i].alpha < 0) sparks[i].alpha = 0;
                if (sparks[i].trail.length) {
                    point1.x = point.x;
                    point1.y = point.y;
                    switch (sparks[i].img) {
                        case sparkPics[0]: ctx.strokeStyle = "#f84"; break;
                        case sparkPics[1]: ctx.strokeStyle = "#84f"; break;
                        case sparkPics[2]: ctx.strokeStyle = "#8ff"; break;
                        case sparkPics[3]: ctx.strokeStyle = "#fff"; break;
                        case sparkPics[4]: ctx.strokeStyle = "#4f8"; break;
                        case sparkPics[5]: ctx.strokeStyle = "#f44"; break;
                        case sparkPics[6]: ctx.strokeStyle = "#f84"; break;
                        case sparkPics[7]: ctx.strokeStyle = "#84f"; break;
                        case sparkPics[8]: ctx.strokeStyle = "#fff"; break;
                        case sparkPics[9]: ctx.strokeStyle = "#44f"; break;
                    }
                    for (j = sparks[i].trail.length - 1; j >= 0; --j) {
                        point2 = rasterizePoint(sparks[i].trail[j].x, sparks[i].trail[j].y, sparks[i].trail[j].z);
                        if (point2.d != -1) {
                            ctx.globalAlpha = j / sparks[i].trail.length * sparks[i].alpha / 2;
                            ctx.beginPath();
                            ctx.moveTo(point1.x, point1.y);
                            ctx.lineWidth = 1 + sparks[i].radius * 10 / (sparks[i].trail.length - j) / (1 + point2.d);
                            ctx.lineTo(point2.x, point2.y);
                            ctx.stroke();
                            point1.x = point2.x;
                            point1.y = point2.y;
                        }
                    }
                }
                ctx.globalAlpha = sparks[i].alpha;
                ctx.drawImage(sparks[i].img, point.x - size / 2, point.y - size / 2, size, size);
            }
        }
    }

    function frame() {

        if (frames > 100000) {
            seedTimer = 0;
            frames = 0;
        }
        frames++;
        draw();
        doLogic()
        requestAnimationFrame(frame);
    }

    function rasterizePoint(x, y, z) {

        var p, d;
        x -= playerX;
        y -= playerY;
        z -= playerZ;
        p = Math.atan2(x, z);
        d = Math.sqrt(x * x + z * z);
        x = Math.sin(p - yaw) * d;
        z = Math.cos(p - yaw) * d;
        p = Math.atan2(y, z);
        d = Math.sqrt(y * y + z * z);
        y = Math.sin(p - pitch) * d;
        z = Math.cos(p - pitch) * d;
        var rx1 = -1000, ry1 = 1, rx2 = 1000, ry2 = 1, rx3 = 0, ry3 = 0, rx4 = x, ry4 = z, uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
        if (!uc) return { x: 0, y: 0, d: -1 };
        var ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
        var ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
        if (!z) z = .000000001;
        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return {
                x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
                y: cy + y / z * scale,
                d: Math.sqrt(x * x + y * y + z * z)
            };
        } else {
            return {
                x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
                y: cy + y / z * scale,
                d: -1
            };
        }
    }

    function splode(x, y, z) {

        t = 5 + parseInt(Math.random() * 150);
        sparkV = 1 + Math.random() * 2.5;
        type = parseInt(Math.random() * 3);
        switch (type) {
            case 0:
                pic1 = parseInt(Math.random() * 10);
                break;
            case 1:
                pic1 = parseInt(Math.random() * 10);
                do { pic2 = parseInt(Math.random() * 10); } while (pic2 == pic1);
                break;
            case 2:
                pic1 = parseInt(Math.random() * 10);
                do { pic2 = parseInt(Math.random() * 10); } while (pic2 == pic1);
                do { pic3 = parseInt(Math.random() * 10); } while (pic3 == pic1 || pic3 == pic2);
                break;
        }
        for (m = 1; m < t; ++m) {
            spark = new Object();
            spark.x = x; spark.y = y; spark.z = z;
            p1 = pi * 2 * Math.random();
            p2 = pi * Math.random();
            v = sparkV * (1 + Math.random() / 6)
            spark.vx = Math.sin(p1) * Math.sin(p2) * v;
            spark.vz = Math.cos(p1) * Math.sin(p2) * v;
            spark.vy = Math.cos(p2) * v;
            switch (type) {
                case 0: spark.img = sparkPics[pic1]; break;
                case 1:
                    spark.img = sparkPics[parseInt(Math.random() * 2) ? pic1 : pic2];
                    break;
                case 2:
                    switch (parseInt(Math.random() * 3)) {
                        case 0: spark.img = sparkPics[pic1]; break;
                        case 1: spark.img = sparkPics[pic2]; break;
                        case 2: spark.img = sparkPics[pic3]; break;
                    }
                    break;
            }
            spark.radius = 25 + Math.random() * 50;
            spark.alpha = 1;
            spark.trail = new Array();
            sparks.push(spark);
        }
        switch (parseInt(Math.random() * 4)) {
            case 0: pow = new Audio(s + "pow1.mp3"); break;
            case 1: pow = new Audio(s + "pow2.mp3"); break;
            case 2: pow = new Audio(s + "pow3.mp3"); break;
            case 3: pow = new Audio(s + "pow4.mp3"); break;
        }
        d = Math.sqrt((x - playerX) * (x - playerX) + (y - playerY) * (y - playerY) + (z - playerZ) * (z - playerZ));
        pow.volume = 1.5 / (1 + d / 10);
        // pow.play();
    }


    function doLogic() {

        if (seedTimer < frames) {
            seedTimer = frames + seedInterval * Math.random() * 5;
            spawnSeed();
        }
        for (i = 0; i < seeds.length; ++i) {
            seeds[i].vy += gravity;
            seeds[i].x += seeds[i].vx;
            seeds[i].y += seeds[i].vy;
            seeds[i].z += seeds[i].vz;
            if (frames - seeds[i].born > seedLife) {
                splode(seeds[i].x, seeds[i].y, seeds[i].z);
                seeds.splice(i, 1);
            }
        }
        for (i = 0; i < sparks.length; ++i) {
            if (sparks[i].alpha > 0 && sparks[i].radius > 5) {
                sparks[i].alpha -= .01;
                sparks[i].radius /= 1.02;
                sparks[i].vy += gravity;
                point = new Object();
                point.x = sparks[i].x;
                point.y = sparks[i].y;
                point.z = sparks[i].z;
                if (sparks[i].trail.length) {
                    x = sparks[i].trail[sparks[i].trail.length - 1].x;
                    y = sparks[i].trail[sparks[i].trail.length - 1].y;
                    z = sparks[i].trail[sparks[i].trail.length - 1].z;
                    d = ((point.x - x) * (point.x - x) + (point.y - y) * (point.y - y) + (point.z - z) * (point.z - z));
                    if (d > 9) {
                        sparks[i].trail.push(point);
                    }
                } else {
                    sparks[i].trail.push(point);
                }
                if (sparks[i].trail.length > 5) sparks[i].trail.splice(0, 1);
                sparks[i].x += sparks[i].vx;
                sparks[i].y += sparks[i].vy;
                sparks[i].z += sparks[i].vz;
                sparks[i].vx /= 1.075;
                sparks[i].vy /= 1.075;
                sparks[i].vz /= 1.075;
            } else {
                sparks.splice(i, 1);
            }
        }
        p = Math.atan2(playerX, playerZ);
        d = Math.sqrt(playerX * playerX + playerZ * playerZ);
        d += Math.sin(frames / 80) / 1.25;
        t = Math.sin(frames / 200) / 40;
        playerX = Math.sin(p + t) * d;
        playerZ = Math.cos(p + t) * d;
        yaw = pi + p + t;
    }
})
