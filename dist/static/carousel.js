;(function($){

	var Carousel = function(poster){
		var self = this;
		//保存单个旋转木马对象
		this.poster = poster;
		this.posterItemMain = poster.find("ul.poster-list");
		this.nextBtn = poster.find("div.poster-next-btn");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.posterItems = poster.find("li.poster-item");
		this.information = poster.next();

		this.info = this.information.find("p.info");
		this.info.text($(this.posterItems).attr("info"));
		this.title = this.information.find("p.title");
		this.title.text($(this.posterItems).attr("label"));



		this.posterFirstItem = this.posterItems.first();
		this.posterLastItem = this.posterItems.last();
		this.rotateFlag = true;
		//默认配置参数
		this.setting = {
			"width" : 1000,			//幻灯片的宽度
			"height" : 540,			//幻灯片的高度
			"posterWidth" : 640,	//幻灯片第一帧的宽度
			"posterHeight" : 540,	//幻灯片第一帧的高度
			"scale" : 0.8,			//记录显示比例关系
			"speed" : 500,
			"delay" : 5000,
			"verticalAlign" : "middle" //top bottom
		};
		$.extend( this.setting,this.getSetting() );

		//设置配置参数值
		this.setSettingValue();
		//初始化幻灯片位置
		this.setPosterPos();
		//左旋转按钮
		this.nextBtn.click(function(){
			if(self.rotateFlag){
				self.rotateFlag = false;
				self.carouseRotate("left");
			};
		});
		//右旋转按钮
		this.prevBtn.click(function(){
			if(self.rotateFlag){
				self.rotateFlag = false;
				self.carouseRotate("right");
			};
		});
	};
	Carousel.prototype = {
		//旋转
		carouseRotate:function(dir){
			var _this_  = this;
			var zIndexArr = [];
			//左旋转
			if(dir === "left"){
				this.posterItems.each(function(){
					var self = $(this),
						prev = self.prev().get(0)?self.prev():_this_.posterLastItem,
						width = prev.width(),
						height =prev.height(),
						opacity = prev.css("opacity"),
						left = prev.css("left"),
						top = prev.css("top"),
						zIndex = prev.css("zIndex");


					zIndexArr.push(zIndex);
					self.animate({
						width :width,
						height :height,
					  //zIndex :zIndex,
					    opacity :opacity,
					    left :left,
					    top :top
					},_this_.setting.speed,function(){
						_this_.rotateFlag = true;
					});
          // var current = $("li.poster-item[style*='width:640px']");

				});



				//zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
        var currentPrev = $("li.poster-item[style*='640px']");
        var current = currentPrev.next().get(0) ? currentPrev.next() : _this_.posterFirstItem;
        $(_this_.info).text($(current).attr("info"));
				$(_this_.title).text($(current).attr("label"));




			}else if(dir === "right"){//右旋转
				this.posterItems .each(function(){
					var self = $(this),
						next = self.next().get(0)?self.next():_this_.posterFirstItem,
						width = next.width(),
						height =next.height(),
						opacity = next.css("opacity"),
						left = next.css("left"),
						top = next.css("top"),
						zIndex = next.css("zIndex");

					zIndexArr.push(zIndex);
					self.animate({
						width :width,
						height :height,
					  //zIndex :zIndex,
					    opacity :opacity,
					    left :left,
					    top :top
					},_this_.setting.speed,function(){
						_this_.rotateFlag = true;
					});
				});
				//zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
        var currentPrev = $("li.poster-item[style*='640px']");
        var current = currentPrev.prev().get(0) ? currentPrev.prev() : _this_.posterLastItem;

        $(_this_.info).text($(current).attr("info"));
				$(_this_.title).text($(current).attr("label"));

			};
      // var currentPrev = $("li.poster-item[style*='640px']");
      // var current = currentPrev.next().get(0) ? currentPrev.next() : _this_.posterFirstItem;
      // $(_this_.info).text($(current.attr("info")).selector);
		},
		//设置剩余的帧的位置关系
		setPosterPos:function(){
			var self = this,
				sliceItems = this.posterItems.slice(1),
				sliceSize = sliceItems.size()/2,
				rightSlice = sliceItems.slice(0,sliceSize),
				//存在图片奇偶数问题
				level = Math.floor(this.posterItems.size()/2),
				leftSlice = sliceItems.slice(sliceSize);

			//设置右边帧的位置关系和宽度高度top
			var firstLeft = (this.setting.width - this.setting.posterWidth)/2;
			var rw = this.setting.posterWidth,
				fixOffsetLeft = firstLeft + rw,
				rh = this.setting.posterHeight,
				gap = ((this.setting.width - this.setting.posterWidth)/2)/level;

			//设置右边位置关系
			rightSlice.each(function(i){
				level--;
				rw = rw * self.setting.scale;
				rh = rh * self.setting.scale;
				var j = i;
				$(this).css({
					zIndex :level,
					width :rw,
					height :rh,
					opacity :1/(++j),
					left :fixOffsetLeft+(++i)*gap - rw,
					top :self.setVerticalAlign(rh)
				});
			});

			//设置左边的位置关系
			var lw = rightSlice.last().width(),
				lh  =rightSlice.last().height(),
				oloop = Math.floor(this.posterItems.size()/2);
			leftSlice.each(function(i){
				$(this).css({
					zIndex:i,
					width:lw,
					height:lh,
					opacity:1/oloop,
					left:i*gap,
					top:self.setVerticalAlign(lh)
				});
				lw = lw/self.setting.scale;
				lh = lh/self.setting.scale;
				oloop--;
			});
		},

		//设置垂直排列对齐
		setVerticalAlign:function(height){
			var verticalType  = this.setting.verticalAlign,
				top = 0;
			if(verticalType === "middle"){
				top = (this.setting.height-height)/2;
			}else if(verticalType === "top"){
				top = 0;
			}else if(verticalType === "bottom"){
				top = this.setting.height-height;
			}else{
				top = (this.setting.height-height)/2;
			};
			return top;
		},

		//设置配置参数值去控制基本的宽度高度。。。
		setSettingValue:function(){
			this.poster.css({
				width:this.setting.width,
				height:this.setting.height
			});
			this.posterItemMain.css({
				width:this.setting.width,
				height:this.setting.height
			});
			//计算上下切换按钮的宽度
			var w = (this.setting.width-this.setting.posterWidth)/2;
			//设置切换按钮的宽高，层级关系
			this.nextBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			this.prevBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			this.posterFirstItem.css({
				width:this.setting.posterWidth,
				height:this.setting.posterHeight,
				left:w,
				top:0,
				zIndex:Math.floor(this.posterItems.size()/2)
			});
		},

		//获取人工配置参数
		getSetting:function(){
			var setting = this.poster.attr("data-setting");
			if(setting && setting != ""){
				return $.parseJSON(setting);
			}else{
				return {};
			};
		}
	};

	Carousel.init = function(posters){
		var _this_ = this;
		posters.each(function(){
			new  _this_($(this));
		});
	};

	//挂载到window下
	window["Carousel"] = Carousel;

})(jQuery);
