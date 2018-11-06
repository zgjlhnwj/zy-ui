// 注册
;
(function() {
	function mkdir(catalog, name) {
		return catalog[name] = catalog[name] || {};
	}

	function __eco__(root, path, name, bind) {
		if(typeof path === undefined || typeof path === 'function' || typeof path === 'array' || typeof path === 'object' || typeof path === 'number') {
			throw new Error('目录错误');
		}
		var list = path.split('.');
		var head = list.shift();
		var content = null;
		if(root[head] === undefined) {
			content = root[head] = {};
		} else {
			content = root[head];
		}
		while(list.length) {
			var dir = list.shift();
			content = mkdir(content, dir);
		}
		content[name] = bind;
	}
	window.__eco__ = __eco__;

}());
//两个及以上多个异步调用同时返回成功后同步处理回调
;
(function() {
	var eachof = function(files, fn, callback) {
		callback = callback || function() {};
		files = files || [];
		if(!files.length) {}
		var count = 0;
		var queue = [];
		for(var i = 0; i < files.length; i++) {
			fn(files[i], i, nextPointer);
		}

		function nextPointer(err, data, insert) {
			count++;
			if(err) {}
			queue.splice(insert, 0, data);
			if(count === files.length) {
				callback(queue);
			}
		}
	}
	window.__eco__(this, 'base', 'eachof', eachof);
}());
// 事件监听
;
(function() {
	function Monitor() {
		this.json = {}; //{abc: [fn, fn, fn], data: [], end: [...]}
	};
	Monitor.prototype.addListener = Monitor.prototype.on = function(name, fn) {
		if(!this.json[name]) {
			this.json[name] = [];
		}

		this.json[name].push(fn);
	};
	Monitor.prototype.emit = function(name) {
		var arr = [];
		arr = arr.concat.apply(arr, arguments);

		arr.shift();

		if(this.json[name]) {
			var fns = this.json[name];
			for(var i = 0; i < fns.length; i++) {
				fns[i].apply(null, arr);
			}
		}
	};
	window.__eco__(this, 'base', 'monitor', new Monitor());
}());
// 队列
;
(function() {
	var queue = [];

	function Then(callback, context) {
		callback(function() {
			queue[0] && queue.shift().apply(null, [arguments.callee].concat(Array.prototype.slice.call(arguments, 0)))
		}, context || {});

		return this;
	}

	Then.prototype.then = function(callback) {
		queue.push(callback);

		return this;
	}

	window.__eco__(this, 'base.promise', 'Then', function(callback, context) {
		return new Then(callback, context);
	});
}());

//函数原型
Function.prototype.after = function(fn) {
	var me = this;
	return function() {
		var ret = me.apply(this, arguments);
		if(ret === false) {
			return false;
		}
		fn.apply(this, arguments);
		return ret;
	}
}
//函数原型
Function.prototype.before = function(fn) {
	var me = this;
	return function() {
		var ret = fn.apply(this, arguments);
		if(ret === false) {
			return false;
		}
		return me.apply(this, arguments);
	}
};

/*function zhunbei() {
	alert('执行 准备 工作');
}

function miaosha() {
	alert('执行 秒杀 业务');
}

function shangbao() {
	alert('执行 统计数据 上报')
}

$('.aaa').click(miaosha.before(zhunbei).after(shangbao));


miaosha.before(zhunbei).after(shangbao);*/

//实现服务延时加载
(function() {
	var serverlazy = {};
	var callback = function() {};
	var offset, poll, delay, useDebounce, unload;
	var isHidden = function(element) {
		return(element.offsetParent === null);
	};
	var inView = function(element, view) {
		if(isHidden(element)) {
			return false;
		}
		var box = element.getBoundingClientRect();
		return(box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
	};
	var debounceOrThrottle = function() {
		if(!useDebounce && !!poll) {
			return;
		}
		clearTimeout(poll);
		poll = setTimeout(function() {
			serverlazy.render();
			poll = null;
		}, delay);
	};
	serverlazy.Selector = null;
	serverlazy.init = function(opts) {
		// 	opts:{
		// offset:10, //四个方向全部为10，距离边界为10时开始加载，组1，组1、组2、组3优先级组3>组2>组1
		// offsetVertical:30, //垂直方向距离边界为30时开始加载，组2，组1，组1、组2、组3优先级组3>组2>组1
		// offsetHorizontal:30, //水平方向距离边界为30时开始加载，组2
		// offsetTop:20, //垂直方向距离上边界为20时开始加载，组3，组1，组1、组2、组3优先级组3>组2>组1
		// offsetBottom:20, //垂直方向距离下边界为20时开始加载，组3
		// offsetLeft:20, //垂直方向距离左边界为20时开始加载，组3
		// offsetRight:20, //垂直方向距离右边界为20时开始加载，组3
		// throttle:'2000',  //延迟加载的时间，和debounce一起使用
		// debounce:false,   //要不要用延迟加载，和throttle一起使用
		// unload:'',
		// callback:function(){}
		// 	}
		opts = opts || {};
		var offsetAll = opts.offset || 0;
		var offsetVertical = opts.offsetVertical || offsetAll;
		var offsetHorizontal = opts.offsetHorizontal || offsetAll;
		var optionToInt = function(opt, fallback) {
			return parseInt(opt || fallback, 10);
		};
		offset = {
			t: optionToInt(opts.offsetTop, offsetVertical),
			b: optionToInt(opts.offsetBottom, offsetVertical),
			l: optionToInt(opts.offsetLeft, offsetHorizontal),
			r: optionToInt(opts.offsetRight, offsetHorizontal)
		};
		delay = optionToInt(opts.throttle, 250);
		useDebounce = opts.debounce !== false;
		unload = !!opts.unload;
		callback = opts.callback || callback;
		serverlazy.render();
		if(document.addEventListener) {
			window.addEventListener('scroll', debounceOrThrottle, false);
			window.addEventListener('load', debounceOrThrottle, false);
		} else {
			window.attachEvent('onscroll', debounceOrThrottle);
			window.attachEvent('onload', debounceOrThrottle);
		}
	};
	serverlazy.render = function() {
		//var nodes = document.querySelectorAll('img[data-serverlazy], [data-serverlazy-background]');
		var nodes = document.querySelectorAll(serverlazy.Selector);
		var length = nodes.length;
		var src,
			elem;
		var view = {
			l: 0 - offset.l,
			t: 0 - offset.t,
			b: (window.innerHeight || document.documentElement.clientHeight) + offset.b,
			r: (window.innerWidth || document.documentElement.clientWidth) + offset.r
		};
		for(var i = 0; i < length; i++) {
			elem = nodes[i];
			if(inView(elem, view)) {
				if(elem.unload === undefined) {
					callback(elem, 'load');
				}

				elem.unload = true;
			}
		}
		if(!length) {
			serverlazy.detach();
		}
	};
	serverlazy.detach = function() {
		if(document.removeEventListener) {
			window.removeEventListener('scroll', debounceOrThrottle);
		} else {
			window.detachEvent('onscroll', debounceOrThrottle);
		}
		clearTimeout(poll);
	};
	window.__eco__(this, 'base', 'serverlazy', function(Selector) {
		serverlazy.Selector = Selector;
		return serverlazy;
	});
}());
// Device.js
// (c) 2014 Matthew Hudson
// Device.js is freely distributable under the MIT license.
// For all details and documentation:
// http://matthewhudson.me/projects/device.js/
(function($) {
	function device(){
		var device,
			previousDevice,
			find,
			userAgent;

		// Save the previous value of the device variable.
		previousDevice = window.device;

		device = {};

		// Add device as a global object.
		window.device = device;

		// The client user agent string.
		// Lowercase, so we can use the more efficient indexOf(), instead of Regex
		userAgent = window.navigator.userAgent.toLowerCase();

		// Main functions

		device.isWechat = function() {//判断是否是微信环境
			if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
				return true;
			}
			return false;
		};

		device.isAlipay = function() {//判断是否是支付宝环境
			if(userAgent.match(/Alipay/i)=="alipay"){
				return true;
			}else{
				return false;
			}
		};

		device.ios = function () {
			return device.iphone() || device.ipod() || device.ipad();
		};

		device.iphone = function () {
			return !device.windows() && find('iphone');
		};

		device.ipod = function () {
			return find('ipod');
		};

		device.ipad = function () {
			return find('ipad');
		};

		device.android = function () {
			return !device.windows() && find('android');
		};

		device.androidPhone = function () {
			return device.android() && find('mobile');
		};

		device.androidTablet = function () {
			return device.android() && !find('mobile');
		};

		device.blackberry = function () {
			return find('blackberry') || find('bb10') || find('rim');
		};

		device.blackberryPhone = function () {
			return device.blackberry() && !find('tablet');
		};

		device.blackberryTablet = function () {
			return device.blackberry() && find('tablet');
		};

		device.windows = function () {
			return find('windows');
		};

		device.windowsPhone = function () {
			return device.windows() && find('phone');
		};

		device.windowsTablet = function () {
			return device.windows() && (find('touch') && !device.windowsPhone());
		};

		device.fxos = function () {
			return (find('(mobile;') || find('(tablet;')) && find('; rv:');
		};

		device.fxosPhone = function () {
			return device.fxos() && find('mobile');
		};

		device.fxosTablet = function () {
			return device.fxos() && find('tablet');
		};

		device.meego = function () {
			return find('meego');
		};

		device.cordova = function () {
			return window.cordova && location.protocol === 'file:';
		};

		device.nodeWebkit = function () {
			return typeof window.process === 'object';
		};

		device.mobile = function () {
			return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
		};

		device.tablet = function () {
			return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
		};

		device.desktop = function () {
			return !device.tablet() && !device.mobile();
		};

		device.television = function() {
			var i, television = [
				"googletv",
				"viera",
				"smarttv",
				"internet.tv",
				"netcast",
				"nettv",
				"appletv",
				"boxee",
				"kylo",
				"roku",
				"dlnadoc",
				"roku",
				"pov_tv",
				"hbbtv",
				"ce-html"
			];

			i = 0;
			while (i < television.length) {
				if (find(television[i])) {
					return true;
				}
				i++;
			}
			return false;
		};

		device.portrait = function () {
			return (window.innerHeight / window.innerWidth) > 1;
		};

		device.landscape = function () {
			return (window.innerHeight / window.innerWidth) < 1;
		};

		// Public Utility Functions
		// ------------------------

		// Run device.js in noConflict mode,
		// returning the device variable to its previous owner.
		device.noConflict = function () {
			window.device = previousDevice;
			return this;
		};

		// Private Utility Functions
		// -------------------------

		// Simple UA string search
		find = function (needle) {
			return userAgent.indexOf(needle) !== -1;
		};

		return device;
	};
	$.__eco__(this,"utils","device",device());
}(window));

(function (doc, win) {
	//px 转成 rem，   px*2/100
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function () {
			var clientWidth = docEl.clientWidth;
			if (clientWidth >= 750) {
				clientWidth = 750;
			}
			;
			if (clientWidth <= 320) {
				clientWidth = 320;
			}
			if (!clientWidth) return;
			docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
		};
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
