/**
 * Created by litao on 2018/5/16.
 */

$(function () {
    console.log($(window).width());  //980 改成 320
    var viewWidth = $(window).width();
    var viewHeight = $(window).height();
    var desWidth = 667;
    var touchstart = 'touchstart';
    var touchmove = 'touchmove';
    var touchend = 'touchend';
    //定義一個全局變量id用於存放歌曲的唯一id
    var id = 0;
    //歌曲列表的索引0,1,2,3
    var index = 0;
    var oAudio = $('#audio1').get(0);
    var $loading = $('#loading');

    //首頁
    var $main = $('#main');
    var $listContent = $('#listContent');
    var $listContentUl = $('#listContentUl');
    var $listTitle = $('#listTitle');
    //首頁底部的黑條（包括頭像，歌曲名和歌手名，以及一個播放按鈕）
    var $listAudio = $('#listAudio');
    var $listAudioImg = $('#listAudioImg');
    var $listAudioText = $('#listAudioText');
    var $listAudioBtn = $('#listAudioBtn');


    var $musicDetails = $('#musicDetails');
    var $detailsTitle = $('#detailsTitle');
    var $detailsName = $('#detailsName');
    var $detailsAudioProUp = $('#detailsAudioProUp');
    var $detailsAudioProBar = $('#detailsAudioProBar');
    var $detailsNowTime = $('#detailsNowTime');
    var $detailsAllTime = $('#detailsAllTime');
    var $detailsPlay = $('#detailsPlay');
    var $detailsPrev = $('#detailsPrev');
    var $detailsNext = $('#detailsNext');
    var $detailsLyric = $('#detailsLyric');
    var $detailsLyricUl = $('#detailsLyricUl');
    var $detailsAudio = $('#detailsAudio');
    var $detailsMessage = $('#detailsMessage');
    var $detailsMessageTa = $('#detailsMessageTa');
    var $detailsMessageBtn = $('#detailsMessageBtn');
    var $detailsMessageUl = $('#detailsMessageUl');
    var $detailsBtn = $('#detailsBtn');

//整个项目的初始化
    function init(){
        loadingFn();
        //兼容PC和移动端
        device();
        //音乐列表页操作
        musicList.init();
        //音樂詳情頁操作
        musicDetails.init();
        musicAudio.init();
    }
    //兼容PC和移动端
    function device(){
        console.log( navigator.userAgent );
        var isMobile = /Mobile/i.test(navigator.userAgent);
        if(viewWidth > desWidth){
            $main.css('width','667px');
        }
        if(!isMobile){
            touchstart = 'mousedown';
            touchmove = 'mousemove';
            touchend = 'mouseup';
        }
        $(window).resize(function(){
            viewWidth = $(window).width();
            viewHeight = $(window).height();
            musicDetails.sildeDown();
        });
    }

    //loading效果函數
    function loadingFn(){    //loading效果
        var arr = ['bg.jpg','detailsBg.jpg','details_pause.png','details_play.png','details_next.png','details_prev.png','list_audioBg.png','miaov.jpg'];
        var iNum = 0;
        $.each(arr,function(i,img){
            var objImg = new Image();
            objImg.onload = function(){
                iNum++;
                if(iNum == arr.length){
                    $loading.animate({opacity:0},1000,function(){
                        $(this).remove();
                    });
                }
            };
            objImg.onerror = function(){
                $loading.animate({opacity:0},1000,function(){
                    $(this).remove();
                });
            };
            objImg.src = 'img/' + img;
        });
    }

    //音乐列表页操作
    var musicList = (function(){

        var bbsUrl = 'http://bbs.miaov.com/forum.php?mod=viewthread&tid=14670s';
        var listUrl = 'php/musicList.php';
        var downY = 0;
        var prevY = 0;
        var downT = 0;
        var parentH = $listContent.height();
        var childH = $listContentUl.height();
        var onoff1 = true;
        var onoff2 = true;
        var onoff3 = true;
        var timer = null;
        var speed = 0;
        var $loadingLi = null;
        var page = 0;

        //初始
        function init(){
            //在初始化中請求數據，可以顯示歌曲列表
            data();
            bind();
            moveScroll();
        }
        //通過ajax請求数据，并在成功之後動態生成li
        function data(){
            $.ajax({
                url : listUrl,
                type : 'GET',
                dataType : 'json',
                success : function(data){
                    $.each(data,function(i,obj){
                        var $li = '<li musicId="'+(obj.id)+'"><h3 class="title">'+(obj.musicName)+'</h3><p class="name">'+(obj.name)+'</p></li>';
                        $listContentUl.append($li);
                    });
                    childH = $listContentUl.height();
                }
            });
        }
        //事件
        //給首頁綁定不同的事件，當點擊時候會觸發相應事件操作
        function bind(){
            $listTitle.on(touchstart,function(){
                window.location = bbsUrl;
            });
            //給ul上面的li綁定事件
            $listContentUl.delegate('li',touchend,function(){
                if(onoff3){
                    $(this).attr('class','active').siblings().attr('class','');
                    
                    id = $(this).attr('musicId');
                    //通過id加載音樂
                    musicAudio.loadMusic(id);
                    //獲取到歌曲在列表中的索引
                    index = $(this).index();
                }
            });

            $listAudio.on(touchstart,function(){
                if(id){
                    //如果有id，說明播放著歌曲，此時點擊可以彈出歌曲詳情頁
                    musicDetails.sildeUp();
                }
            });
        }
        //滑动列表 （難點）
        function moveScroll(){   //滑动列表
            $(document).on(touchmove,function(ev){
                ev.preventDefault();
            });
            $listContentUl.on(touchstart,function(ev){
                //ev.pageX
                //touch.pageX
                //ev.originalEvent -> JQ的event转成JS的event
                if(parentH > childH){return false;}
                var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                var This = this;
                downY = touch.pageY;
                prevY = touch.pageY;
                downT = $(this).position().top;
                onoff1 = true;
                onoff2 = true;
                onoff3 = true;
                clearInterval(timer);
                $(document).on(touchmove+'.move',function(ev){
                    onoff3 = false;
                    var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                    var iTop = $(This).position().top;

                    speed = touch.pageY - prevY;
                    prevY = touch.pageY;

                    if(iTop >= 0){   //头
                        if(onoff1){
                            onoff1 = false;
                            downY = touch.pageY;
                        }
                        $(This).css('transform','translate3d(0,'+(touch.pageY - downY)/3+'px,0)');
                    }
                    else if(iTop <= parentH - childH){  //尾
                        if(onoff2){
                            onoff2 = false;
                            downY = touch.pageY;
                            $loadingLi = $('<li style="color:white;">loading...</li>');
                            $(This).append($loadingLi);
                        }
                        $(This).css('transform','translate3d(0,'+((touch.pageY - downY)/3 + (parentH - childH))+'px,0)');
                    }
                    else{
                        $(This).css('transform','translate3d(0,'+(touch.pageY - downY + downT)+'px,0)');
                    }

                });
                $(document).on(touchend+'.move',function(){
                    $(this).off('.move');

                    if($loadingLi){   //懒加载数据
                        $loadingLi.remove();
                        $loadingLi = null;
                        $.ajax({
                            url : 'pageMusic.php',
                            type : 'GET',
                            dataType : 'json',
                            data : { page : page },
                            success : function(data){
                                //console.log(data);
                                $.each(data,function(i,obj){
                                    var $li = '<li musicId="'+(obj.id)+'"><h3 class="title">'+(obj.musicName)+'</h3><p class="name">'+(obj.name)+'</p></li>';
                                    $listContentUl.append($li);
                                });
                                childH = $listContentUl.height();
                                page++;
                            }
                        });
                    }

                    if(!onoff3){
                        clearInterval(timer);
                        timer = setInterval(function(){
                            var iTop = $(This).position().top;
                            if(Math.abs(speed) <= 1 || iTop > 50 || iTop < parentH - childH - 50){
                                clearInterval(timer);
                                if(iTop >= 0){
                                    $(This).css('transition','.2s');
                                    $(This).css('transform','translate3d(0,0,0)');
                                }
                                else if(iTop <= parentH - childH){
                                    $(This).css('transition','.2s');
                                    $(This).css('transform','translate3d(0,'+(parentH - childH)+'px,0)');
                                }
                            }
                            else{
                                speed *= 0.9;
                                $(This).css('transform','translate3d(0,'+(iTop + speed)+'px,0)');
                            }

                        },13);
                    }
                });
                return false;
            });
            $listContentUl.on('transitonend webkitTransitionEnd',function(){
                $(this).css('transition','');
            });
        }

        //显示
        //將歌曲信息顯示在首頁底部（包括歌手名，歌曲名，頭像）
        function show(sName,sMusicName,sImg){
            $listAudioImg.attr('src','img/'+sImg);
            $listAudioText.find('h3').html(sMusicName);
            $listAudioText.find('p').html(sName);
            $listAudioBtn.show();
        }
        return {
            init : init,
            show : show
        };
    })();

    //音乐播放器操作
    var musicAudio = (function(){
        //控制歌曲關閉與否
        var onoff = true;
        //創建一個定時器變量
        var timer = null;
        var scale = 0;
        var disX = 0;
        //獲取到滾動條父親元素的寬度
        var parentW = $detailsAudioProBar.parent().width();
        //初始
        function init(){
            //初始化播放器的時候為其綁定事件
            bind();
        }
        //载入音乐
        //提供一個接口給外面函數調用，該接口的功能是加載歌曲
        function loadMusic(id){
            $.ajax({
                url : 'php/musicAudio.php',
                type : 'GET',
                dataType : 'json',
                data : { id : id },
                async : false,   //苹果下能够播放
                success : function(data){
                    //獲取到一條歌曲的全部數據data,通過show方法展示出去
                    show(data);
                }
            });
        }

        //显示數據（將ajax獲取到的一首歌的數據全部通過這個方法顯示出來）
        function show(obj){
            var sName = obj.name;
            var sMusicName = obj.musicName;
            var sLyric = obj.lyric;
            var sImg = obj.img;
            var sAudio = obj.audio;
            //此處調用musicList的對外接口show函數，將數據作為實參傳遞，可以顯示數據在首頁底部信息欄
            musicList.show(sName,sMusicName,sImg);
            //此處調用musicDEtails的對外接口show函數，將數據作為實參傳遞，顯示信息在詳情頁（包括歌詞和歌曲名和歌手名）
            musicDetails.show(sName,sMusicName,sLyric);
            //給媒體對象添加src屬性
            oAudio.src = 'img/'+sAudio;
            //調用play方法，該方法用於播放音樂
            play();
            $(oAudio).one('canplaythrough',function(){
                //歌曲可以播放的話，就獲取歌曲的總時間，并將其格式為自己想要的數據
                $detailsAllTime.html( formatTime(oAudio.duration) );
            });
            $(oAudio).one('ended',function(){
                next();
            });
        }

        //播放歌曲
        function play(){
            //歌曲是否關閉了？是為true，否為false
            onoff = false;
            //開始播放音樂時候，往圖片元素上添加move類，讓其旋轉
            $listAudioImg.addClass('move');
            $listAudioBtn.css('backgroundImage','url(img/list_audioPause.png)');
            $detailsPlay.css('backgroundImage','url(img/details_pause.png)');
            //音樂開始播放
            oAudio.play();
            //當歌曲播放時候，會調用playing（）方法，該方法用於處理歌曲正在播放時要處理的事情
            playing();
            clearInterval(timer);
            //加入定時器，每隔一秒調用一次該方法
            timer = setInterval(playing,1000);
        }
        //歌曲暂停
        function pause(){
            onoff = true;
            $listAudioImg.removeClass('move');
            $listAudioBtn.css('backgroundImage','url(img/list_audioPlay.png)');
            $detailsPlay.css('backgroundImage','url(img/details_play.png)');
            //音樂暫停
            oAudio.pause();
            clearInterval(timer);
        }

        //事件
        //初始化頁面時后為頁面中的元素綁定一些事件
        function bind(){

            $listAudioBtn.add($detailsPlay).on(touchstart,function(){
                if(onoff){
                    play();
                }
                else{
                    pause();
                }
                return false;
            });

            //滾動條上圓點的拖動操作
            $detailsAudioProBar.on(touchstart,function(ev){
                var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                var This = this;
                disX = touch.pageX - $(this).position().left;
                clearInterval(timer);
                $(document).on(touchmove+'.move',function(ev){
                    var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                    var L = touch.pageX - disX;
                    if(L<=0){
                        L = 0;
                    }
                    else if(L >= parentW){
                        L = parentW;
                    }
                    $(This).css('left', L );
                    scale = L/parentW;
                });
                $(document).on(touchend+'.move',function(){
                    $(this).off('.move');
                    oAudio.currentTime = scale * oAudio.duration;
                    playing();
                    clearInterval(timer);
                    timer = setInterval(playing,1000);
                });
                return false;
            });

            //為按鈕綁定點擊事件，當點擊上一首按鈕時候，執行相應操作
            $detailsPrev.on(touchstart,function(){
                prev();
            });
            //為按鈕綁定點擊事件，當點擊下一首按鈕時候，執行相應操作
            $detailsNext.on(touchstart,function(){
                next();
            });
        }


        //格式日期，參數為歌曲時長，將時長轉換為MM：SS形式如：03：35
        function formatTime(num){
            num = parseInt(num);
            var iM = Math.floor(num%3600/60);
            var iS = Math.floor(num%60);
            return toZero(iM) + ':' + toZero(iS);
        }
        //补零操作
        function toZero(num){
            if(num < 10){
                return '0' + num;
            }
            else{
                return '' + num;
            }
        }

        //播放进行中（當歌曲正在播放的時候回調用這個方法，每秒調用一次）
        function playing(){
            $detailsNowTime.html( formatTime(oAudio.currentTime) );
            //獲取到百分比（這個百分比例是每秒不短變化的，因為currentTime在不短變化）
            scale = oAudio.currentTime / oAudio.duration;
            //根據scale控制著進度條的長度隨播放時間變化而變化
            $detailsAudioProUp.css('width',scale * 100 + '%');
            $detailsAudioProBar.css('left',scale * 100 + '%');
            //調用musicDetails的對外接口scrollLyric(正在播放的時候讓歌詞滾動起來）
            musicDetails.scrollLyric(oAudio.currentTime);
        }
        //下一首歌
        function next(){
            var $li = $listContentUl.find('li');
            index = index == $li.length - 1 ? 0 : index + 1;
            id = $li.eq(index).attr('musicId');
            $li.eq(index).attr('class','active').siblings().attr('class','');
            loadMusic(id);
        }
        //上一首歌
        function prev(){
            var $li = $listContentUl.find('li');
            index = index == 0 ? $li.length - 1 : index - 1;
            id = $li.eq(index).attr('musicId');
            $li.eq(index).attr('class','active').siblings().attr('class','');
            loadMusic(id);
        }

        return {
            init : init,
            loadMusic : loadMusic
        };
    })();


    //音乐详情页操作
    var musicDetails = (function(){
        //正則表達式
        var re = /\[[^[]+/g;
        var arr = [];
        var $li = null;
        var iLiH = 0;
        //創建一個變量downX用於存放剛點擊后x坐標
        var downX = 0;
        var range = 20;
        //創建一個定時器變量
        var timer = null;
        //初始（頁面的初始化）
        function init(){
            //頁面初始化將詳情頁放置在首頁下面
            $musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
            $detailsMessage.css('transform','translate3d('+(viewWidth)+'px,0,0)');
            bind();
        }
        //向上展开（將詳細頁往上進行位移）
        function sildeUp(){
            $musicDetails.css('transition','.5s');
            $musicDetails.css('transform','translate3d(0,0,0)');
        }
        function sildeDown(){   //向下收缩
            $musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
            //這句代碼是何意思？
            $musicDetails.one('transitionend weikitTransitionEnd',function(){
                $detailsLyric.add($detailsAudio).css('transform','translate3d(0,0,0)');
                $detailsMessage.css('transform','translate3d('+(viewWidth)+'px,0,0)');
                $detailsBtn.find('li').eq(0).attr('class','active').siblings().attr('class','');
            });
        }
        //事件
        function bind(){
            $detailsTitle.on(touchstart,function(){
                sildeDown();
            });
            $musicDetails.on(touchstart,function(ev){
                var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                downX = touch.pageX;
                $(document).on(touchend+'.move',function(ev){
                    $(this).off('.move');
                    var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                    if( touch.pageX - downX < -range ){   //←
                        $detailsLyric.add($detailsAudio).css('transform','translate3d('+(-viewWidth)+'px,0,0)');
                        $detailsMessage.css('transform','translate3d(0,0,0)');
                        $detailsBtn.find('li').eq(1).attr('class','active').siblings().attr('class','');
                        loadMessage();
                        clearInterval(timer);
                        timer = setInterval(scrollMessage,3000);
                    }
                    else if( touch.pageX - downX > range ){   //→
                        $detailsLyric.add($detailsAudio).css('transform','translate3d(0,0,0)');
                        $detailsMessage.css('transform','translate3d('+(viewWidth)+'px,0,0)');
                        $detailsBtn.find('li').eq(0).attr('class','active').siblings().attr('class','');
                        clearInterval(timer);
                    }
                });
            });

            $detailsMessageBtn.on(touchstart,function(){
                addMessage();
            });
        }
        //显示（對外接口：將ajax請求數據顯示到頁面上去）
        //此處將歌曲信息顯示到詳情頁上，（包括歌曲名，歌手名和歌詞）
        function show(sName,sMusicName,sLyric){
            $detailsName.html(sMusicName + ' <span>'+ sName +'</span>');
            $detailsLyricUl.empty().css('transform','translate3d(0,0,0)');
            console.log(sLyric);
            //歌詞匹配正則表達式re，結果返回到一個數組中
            arr = sLyric.match(re);
            console.log(arr);

            for(var i=0;i<arr.length;i++){
                arr[i] = [formatTime(arr[i].substring(0,10)) , arr[i].substring(10).trim()];
            }
            console.log(arr);
            for(var i=0;i<arr.length;i++){
                $detailsLyricUl.append('<li>'+arr[i][1]+'</li>');
            }
            $li = $detailsLyricUl.find('li');
            //讓第一個li默認是被激活狀態的，也就是顏色為藍色
            $li.first().attr('class','active');
            //這ju代碼是什麼意思？？？？(這局代碼的意思是獲取到第一個li標籤的高度）
            iLiH = $li.first().outerHeight(true);
        }
        //格式日期
        function formatTime(num){
            num = num.substring(1,num.length-1);
            var arr = num.split(':');
            return (parseFloat(arr[0]*60) + parseFloat(arr[1])).toFixed(2);
        }
        //滚动歌词 （難點）
        function scrollLyric(ct){
            console.log(ct);
            for(var i=0;i<arr.length;i++){
                if( i != arr.length - 1 && ct > arr[i][0] && ct < arr[i+1][0] ){
                    $li.eq(i).attr('class','active').siblings().attr('class','');
                    if(i>3){
                        $detailsLyricUl.css('transform','translate3d(0,'+(-iLiH*(i-3))+'px,0)');
                    }
                    else{
                        $detailsLyricUl.css('transform','translate3d(0,0,0)');
                    }
                }
                else if(i == arr.length-1 && ct > arr[i][0]){
                    $li.eq(i).attr('class','active').siblings().attr('class','');
                    $detailsLyricUl.css('transform','translate3d(0,'+(-iLiH*(i-3))+'px,0)');
                }
            }
        }
        //载入留言
        function loadMessage(){
            $detailsMessageUl.empty();
            $.ajax({
                url : 'php/loadMessage.php',
                type : 'GET',
                dataType : 'json',
                data : { mid : id },
                success : function(data){
                    $.each(data,function(i,obj){
                        var $li = $('<li>'+obj.text+'</li>');
                        $detailsMessageUl.prepend($li);
                    });
                }
            });
        }
        //添加留言
        function addMessage(){
            var value = $detailsMessageTa.val();
            $detailsMessageTa.val('');
            $.ajax({
                url : 'php/addMessage.php',
                type : 'POST',
                dataType : 'json',
                data : { mid : id , text : value},
                success : function(data){
                    if(data.code){
                        var $li = $('<li>'+data.message+'</li>');
                        $detailsMessageUl.prepend($li);
                    }
                }
            });
        }
        //滚动留言
        function scrollMessage(){
            var $last = $detailsMessageUl.find('li').last();
            $detailsMessageUl.prepend($last);
            $last.css('opacity',0);
            setTimeout(function(){
                $last.css('opacity',1);
            },200);
        }
        return {
            init : init,
            sildeUp : sildeUp,
            sildeDown : sildeDown,
            show : show,
            scrollLyric : scrollLyric
        };
    })();



    init();
});