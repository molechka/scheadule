(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['backbone', 'underscore'], function (Backbone, _) {
			return (root.Marionette = factory(root, Backbone, _));
		});
	} else if (typeof exports !== 'undefined') {
		var Backbone = require('backbone');
		var _ = require('underscore');
		module.exports = factory(root, Backbone, _);
	} else {
		root.Marionette = factory(root, root.Backbone, root._);
	}
}
	(this, function (root, Backbone, _) {
		'use strict';
		(function (Backbone, _) {
			"use strict";
			var previousChildViewContainer = Backbone.ChildViewContainer;
			Backbone.ChildViewContainer = function (Backbone, _) {
				var Container = function (views) {
					this._views = {};
					this._indexByModel = {};
					this._indexByCustom = {};
					this._updateLength();
					_.each(views, this.add, this);
				};
				_.extend(Container.prototype, {
					add : function (view, customIndex) {
						var viewCid = view.cid;
						this._views[viewCid] = view;
						if (view.model) {
							this._indexByModel[view.model.cid] = viewCid;
						}
						if (customIndex) {
							this._indexByCustom[customIndex] = viewCid;
						}
						this._updateLength();
						return this;
					},
					findByModel : function (model) {
						return this.findByModelCid(model.cid);
					},
					findByModelCid : function (modelCid) {
						var viewCid = this._indexByModel[modelCid];
						return this.findByCid(viewCid);
					},
					findByCustom : function (index) {
						var viewCid = this._indexByCustom[index];
						return this.findByCid(viewCid);
					},
					findByIndex : function (index) {
						return _.values(this._views)[index];
					},
					findByCid : function (cid) {
						return this._views[cid];
					},
					remove : function (view) {
						var viewCid = view.cid;
						if (view.model) {
							delete this._indexByModel[view.model.cid];
						}
						_.any(this._indexByCustom, function (cid, key) {
							if (cid === viewCid) {
								delete this._indexByCustom[key];
								return true;
							}
						}, this);
						delete this._views[viewCid];
						this._updateLength();
						return this;
					},
					call : function (method) {
						this.apply(method, _.tail(arguments));
					},
					apply : function (method, args) {
						_.each(this._views, function (view) {
							if (_.isFunction(view[method])) {
								view[method].apply(view, args || []);
							}
						});
					},
					_updateLength : function () {
						this.length = _.size(this._views);
					}
				});
				var methods = ["forEach", "each", "map", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "toArray", "first", "initial", "rest", "last", "without", "isEmpty", "pluck"];
				_.each(methods, function (method) {
					Container.prototype[method] = function () {
						var views = _.values(this._views);
						var args = [views].concat(_.toArray(arguments));
						return _[method].apply(_, args);
					};
				});
				return Container;
			}
			(Backbone, _);
			Backbone.ChildViewContainer.VERSION = "0.1.4";
			Backbone.ChildViewContainer.noConflict = function () {
				Backbone.ChildViewContainer = previousChildViewContainer;
				return this;
			};
			return Backbone.ChildViewContainer;
		})(Backbone, _);
		(function (Backbone, _) {
			"use strict";
			var previousWreqr = Backbone.Wreqr;
			var Wreqr = Backbone.Wreqr = {};
			Backbone.Wreqr.VERSION = "1.3.1";
			Backbone.Wreqr.noConflict = function () {
				Backbone.Wreqr = previousWreqr;
				return this;
			};
			Wreqr.Handlers = function (Backbone, _) {
				"use strict";
				var Handlers = function (options) {
					this.options = options;
					this._wreqrHandlers = {};
					if (_.isFunction(this.initialize)) {
						this.initialize(options);
					}
				};
				Handlers.extend = Backbone.Model.extend;
				_.extend(Handlers.prototype, Backbone.Events, {
					setHandlers : function (handlers) {
						_.each(handlers, function (handler, name) {
							var context = null;
							if (_.isObject(handler) && !_.isFunction(handler)) {
								context = handler.context;
								handler = handler.callback;
							}
							this.setHandler(name, handler, context);
						}, this);
					},
					setHandler : function (name, handler, context) {
						var config = {
							callback : handler,
							context : context
						};
						this._wreqrHandlers[name] = config;
						this.trigger("handler:add", name, handler, context);
					},
					hasHandler : function (name) {
						return !!this._wreqrHandlers[name];
					},
					getHandler : function (name) {
						var config = this._wreqrHandlers[name];
						if (!config) {
							return;
						}
						return function () {
							var args = Array.prototype.slice.apply(arguments);
							return config.callback.apply(config.context, args);
						};
					},
					removeHandler : function (name) {
						delete this._wreqrHandlers[name];
					},
					removeAllHandlers : function () {
						this._wreqrHandlers = {};
					}
				});
				return Handlers;
			}
			(Backbone, _);
			Wreqr.CommandStorage = function () {
				"use strict";
				var CommandStorage = function (options) {
					this.options = options;
					this._commands = {};
					if (_.isFunction(this.initialize)) {
						this.initialize(options);
					}
				};
				_.extend(CommandStorage.prototype, Backbone.Events, {
					getCommands : function (commandName) {
						var commands = this._commands[commandName];
						if (!commands) {
							commands = {
								command : commandName,
								instances : []
							};
							this._commands[commandName] = commands;
						}
						return commands;
					},
					addCommand : function (commandName, args) {
						var command = this.getCommands(commandName);
						command.instances.push(args);
					},
					clearCommands : function (commandName) {
						var command = this.getCommands(commandName);
						command.instances = [];
					}
				});
				return CommandStorage;
			}
			();
			Wreqr.Commands = function (Wreqr) {
				"use strict";
				return Wreqr.Handlers.extend({
					storageType : Wreqr.CommandStorage,
					constructor : function (options) {
						this.options = options || {};
						this._initializeStorage(this.options);
						this.on("handler:add", this._executeCommands, this);
						var args = Array.prototype.slice.call(arguments);
						Wreqr.Handlers.prototype.constructor.apply(this, args);
					},
					execute : function (name, args) {
						name = arguments[0];
						args = Array.prototype.slice.call(arguments, 1);
						if (this.hasHandler(name)) {
							this.getHandler(name).apply(this, args);
						} else {
							this.storage.addCommand(name, args);
						}
					},
					_executeCommands : function (name, handler, context) {
						var command = this.storage.getCommands(name);
						_.each(command.instances, function (args) {
							handler.apply(context, args);
						});
						this.storage.clearCommands(name);
					},
					_initializeStorage : function (options) {
						var storage;
						var StorageType = options.storageType || this.storageType;
						if (_.isFunction(StorageType)) {
							storage = new StorageType();
						} else {
							storage = StorageType;
						}
						this.storage = storage;
					}
				});
			}
			(Wreqr);
			Wreqr.RequestResponse = function (Wreqr) {
				"use strict";
				return Wreqr.Handlers.extend({
					request : function () {
						var name = arguments[0];
						var args = Array.prototype.slice.call(arguments, 1);
						if (this.hasHandler(name)) {
							return this.getHandler(name).apply(this, args);
						}
					}
				});
			}
			(Wreqr);
			Wreqr.EventAggregator = function (Backbone, _) {
				"use strict";
				var EA = function () {};
				EA.extend = Backbone.Model.extend;
				_.extend(EA.prototype, Backbone.Events);
				return EA;
			}
			(Backbone, _);
			Wreqr.Channel = function (Wreqr) {
				"use strict";
				var Channel = function (channelName) {
					this.vent = new Backbone.Wreqr.EventAggregator();
					this.reqres = new Backbone.Wreqr.RequestResponse();
					this.commands = new Backbone.Wreqr.Commands();
					this.channelName = channelName;
				};
				_.extend(Channel.prototype, {
					reset : function () {
						this.vent.off();
						this.vent.stopListening();
						this.reqres.removeAllHandlers();
						this.commands.removeAllHandlers();
						return this;
					},
					connectEvents : function (hash, context) {
						this._connect("vent", hash, context);
						return this;
					},
					connectCommands : function (hash, context) {
						this._connect("commands", hash, context);
						return this;
					},
					connectRequests : function (hash, context) {
						this._connect("reqres", hash, context);
						return this;
					},
					_connect : function (type, hash, context) {
						if (!hash) {
							return;
						}
						context = context || this;
						var method = type === "vent" ? "on" : "setHandler";
						_.each(hash, function (fn, eventName) {
							this[type][method](eventName, _.bind(fn, context));
						}, this);
					}
				});
				return Channel;
			}
			(Wreqr);
			Wreqr.radio = function (Wreqr) {
				"use strict";
				var Radio = function () {
					this._channels = {};
					this.vent = {};
					this.commands = {};
					this.reqres = {};
					this._proxyMethods();
				};
				_.extend(Radio.prototype, {
					channel : function (channelName) {
						if (!channelName) {
							throw new Error("Channel must receive a name");
						}
						return this._getChannel(channelName);
					},
					_getChannel : function (channelName) {
						var channel = this._channels[channelName];
						if (!channel) {
							channel = new Wreqr.Channel(channelName);
							this._channels[channelName] = channel;
						}
						return channel;
					},
					_proxyMethods : function () {
						_.each(["vent", "commands", "reqres"], function (system) {
							_.each(messageSystems[system], function (method) {
								this[system][method] = proxyMethod(this, system, method);
							}, this);
						}, this);
					}
				});
				var messageSystems = {
					vent : ["on", "off", "trigger", "once", "stopListening", "listenTo", "listenToOnce"],
					commands : ["execute", "setHandler", "setHandlers", "removeHandler", "removeAllHandlers"],
					reqres : ["request", "setHandler", "setHandlers", "removeHandler", "removeAllHandlers"]
				};
				var proxyMethod = function (radio, system, method) {
					return function (channelName) {
						var messageSystem = radio._getChannel(channelName)[system];
						var args = Array.prototype.slice.call(arguments, 1);
						return messageSystem[method].apply(messageSystem, args);
					};
				};
				return new Radio();
			}
			(Wreqr);
			return Backbone.Wreqr;
		})(Backbone, _);
		var previousMarionette = root.Marionette;
		var Marionette = Backbone.Marionette = {};
		Marionette.VERSION = '2.2.0';
		Marionette.noConflict = function () {
			root.Marionette = previousMarionette;
			return this;
		};
		Backbone.Marionette = Marionette;
		Marionette.Deferred = Backbone.$.Deferred;
		var slice = Array.prototype.slice;
		Marionette.extend = Backbone.Model.extend;
		Marionette.getOption = function (target, optionName) {
			if (!target || !optionName) {
				return;
			}
			var value;
			if (target.options && (target.options[optionName] !== undefined)) {
				value = target.options[optionName];
			} else {
				value = target[optionName];
			}
			return value;
		};
		Marionette.proxyGetOption = function (optionName) {
			return Marionette.getOption(this, optionName);
		};
		Marionette.normalizeMethods = function (hash) {
			var normalizedHash = {};
			_.each(hash, function (method, name) {
				if (!_.isFunction(method)) {
					method = this[method];
				}
				if (!method) {
					return;
				}
				normalizedHash[name] = method;
			}, this);
			return normalizedHash;
		};
		Marionette.normalizeUIString = function (uiString, ui) {
			return uiString.replace(/@ui\.[a-zA-Z_$0-9]*/g, function (r) {
				return ui[r.slice(4)];
			});
		};
		Marionette.normalizeUIKeys = function (hash, ui) {
			if (typeof(hash) === 'undefined') {
				return;
			}
			hash = _.clone(hash);
			_.each(_.keys(hash), function (key) {
				var normalizedKey = Marionette.normalizeUIString(key, ui);
				if (normalizedKey !== key) {
					hash[normalizedKey] = hash[key];
					delete hash[key];
				}
			});
			return hash;
		};
		Marionette.normalizeUIValues = function (hash, ui) {
			if (typeof(hash) === 'undefined') {
				return;
			}
			_.each(hash, function (val, key) {
				if (_.isString(val)) {
					hash[key] = Marionette.normalizeUIString(val, ui);
				}
			});
			return hash;
		};
		Marionette.actAsCollection = function (object, listProperty) {
			var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'toArray', 'first', 'initial', 'rest', 'last', 'without', 'isEmpty', 'pluck'];
			_.each(methods, function (method) {
				object[method] = function () {
					var list = _.values(_.result(this, listProperty));
					var args = [list].concat(_.toArray(arguments));
					return _[method].apply(_, args);
				};
			});
		};
		Marionette.triggerMethod = function (event) {
			var splitter = /(^|:)(\w)/gi;
			function getEventName(match, prefix, eventName) {
				return eventName.toUpperCase();
			}
			var methodName = 'on' + event.replace(splitter, getEventName);
			var method = this[methodName];
			var result;
			if (_.isFunction(method)) {
				result = method.apply(this, _.tail(arguments));
			}
			if (_.isFunction(this.trigger)) {
				this.trigger.apply(this, arguments);
			}
			return result;
		};
		Marionette.triggerMethodOn = function (context, event) {
			var args = _.tail(arguments, 2);
			var fnc;
			if (_.isFunction(context.triggerMethod)) {
				fnc = context.triggerMethod;
			} else {
				fnc = Marionette.triggerMethod;
			}
			return fnc.apply(context, [event].concat(args));
		};
		Marionette.MonitorDOMRefresh = (function (documentElement) {
			function handleShow(view) {
				view._isShown = true;
				triggerDOMRefresh(view);
			}
			function handleRender(view) {
				view._isRendered = true;
				triggerDOMRefresh(view);
			}
			function triggerDOMRefresh(view) {
				if (view._isShown && view._isRendered && isInDOM(view)) {
					if (_.isFunction(view.triggerMethod)) {
						view.triggerMethod('dom:refresh');
					}
				}
			}
			function isInDOM(view) {
				return Backbone.$.contains(documentElement, view.el);
			}
			return function (view) {
				view.listenTo(view, 'show', function () {
					handleShow(view);
				});
				view.listenTo(view, 'render', function () {
					handleRender(view);
				});
			};
		})(document.documentElement);
		(function (Marionette) {
			'use strict';
			function bindFromStrings(target, entity, evt, methods) {
				var methodNames = methods.split(/\s+/);
				_.each(methodNames, function (methodName) {
					var method = target[methodName];
					if (!method) {
						throw new Marionette.Error('Method "' + methodName + '" was configured as an event handler, but does not exist.');
					}
					target.listenTo(entity, evt, method);
				});
			}
			function bindToFunction(target, entity, evt, method) {
				target.listenTo(entity, evt, method);
			}
			function unbindFromStrings(target, entity, evt, methods) {
				var methodNames = methods.split(/\s+/);
				_.each(methodNames, function (methodName) {
					var method = target[methodName];
					target.stopListening(entity, evt, method);
				});
			}
			function unbindToFunction(target, entity, evt, method) {
				target.stopListening(entity, evt, method);
			}
			function iterateEvents(target, entity, bindings, functionCallback, stringCallback) {
				if (!entity || !bindings) {
					return;
				}
				if (!_.isFunction(bindings) && !_.isObject(bindings)) {
					throw new Marionette.Error({
						message : 'Bindings must be an object or function.',
						url : 'marionette.functions.html#marionettebindentityevents'
					});
				}
				if (_.isFunction(bindings)) {
					bindings = bindings.call(target);
				}
				_.each(bindings, function (methods, evt) {
					if (_.isFunction(methods)) {
						functionCallback(target, entity, evt, methods);
					} else {
						stringCallback(target, entity, evt, methods);
					}
				});
			}
			Marionette.bindEntityEvents = function (target, entity, bindings) {
				iterateEvents(target, entity, bindings, bindToFunction, bindFromStrings);
			};
			Marionette.unbindEntityEvents = function (target, entity, bindings) {
				iterateEvents(target, entity, bindings, unbindToFunction, unbindFromStrings);
			};
			Marionette.proxyBindEntityEvents = function (entity, bindings) {
				return Marionette.bindEntityEvents(this, entity, bindings);
			};
			Marionette.proxyUnbindEntityEvents = function (entity, bindings) {
				return Marionette.unbindEntityEvents(this, entity, bindings);
			};
		})(Marionette);
		var errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number'];
		Marionette.Error = Marionette.extend.call(Error, {
				urlRoot : 'http://marionettejs.com/docs/' + Marionette.VERSION + '/',
				constructor : function (message, options) {
					if (_.isObject(message)) {
						options = message;
						message = options.message;
					} else if (!options) {
						options = {};
					}
					var error = Error.call(this, message);
					_.extend(this, _.pick(error, errorProps), _.pick(options, errorProps));
					this.captureStackTrace();
					if (options.url) {
						this.url = this.urlRoot + options.url;
					}
				},
				captureStackTrace : function () {
					if (Error.captureStackTrace) {
						Error.captureStackTrace(this, Marionette.Error);
					}
				},
				toString : function () {
					return this.name + ': ' + this.message + (this.url ? ' See: ' + this.url : '');
				}
			});
		Marionette.Error.extend = Marionette.extend;
		Marionette.Callbacks = function () {
			this._deferred = Marionette.Deferred();
			this._callbacks = [];
		};
		_.extend(Marionette.Callbacks.prototype, {
			add : function (callback, contextOverride) {
				var promise = _.result(this._deferred, 'promise');
				this._callbacks.push({
					cb : callback,
					ctx : contextOverride
				});
				promise.then(function (args) {
					if (contextOverride) {
						args.context = contextOverride;
					}
					callback.call(args.context, args.options);
				});
			},
			run : function (options, context) {
				this._deferred.resolve({
					options : options,
					context : context
				});
			},
			reset : function () {
				var callbacks = this._callbacks;
				this._deferred = Marionette.Deferred();
				this._callbacks = [];
				_.each(callbacks, function (cb) {
					this.add(cb.cb, cb.ctx);
				}, this);
			}
		});
		Marionette.Controller = function (options) {
			this.options = options || {};
			if (_.isFunction(this.initialize)) {
				this.initialize(this.options);
			}
		};
		Marionette.Controller.extend = Marionette.extend;
		_.extend(Marionette.Controller.prototype, Backbone.Events, {
			destroy : function () {
				var args = slice.call(arguments);
				this.triggerMethod.apply(this, ['before:destroy'].concat(args));
				this.triggerMethod.apply(this, ['destroy'].concat(args));
				this.stopListening();
				this.off();
				return this;
			},
			triggerMethod : Marionette.triggerMethod,
			getOption : Marionette.proxyGetOption
		});
		Marionette.Object = function (options) {
			this.options = _.extend({}, _.result(this, 'options'), options);
			this.initialize.apply(this, arguments);
		};
		Marionette.Object.extend = Marionette.extend;
		_.extend(Marionette.Object.prototype, {
			initialize : function () {},
			destroy : function () {
				this.triggerMethod('before:destroy');
				this.triggerMethod('destroy');
				this.stopListening();
			},
			triggerMethod : Marionette.triggerMethod,
			getOption : Marionette.proxyGetOption,
			bindEntityEvents : Marionette.proxyBindEntityEvents,
			unbindEntityEvents : Marionette.proxyUnbindEntityEvents
		});
		_.extend(Marionette.Object.prototype, Backbone.Events);
		Marionette.Region = function (options) {
			this.options = options || {};
			this.el = this.getOption('el');
			this.el = this.el instanceof Backbone.$ ? this.el[0] : this.el;
			if (!this.el) {
				throw new Marionette.Error({
					name : 'NoElError',
					message : 'An "el" must be specified for a region.'
				});
			}
			this.$el = this.getEl(this.el);
			if (this.initialize) {
				var args = slice.apply(arguments);
				this.initialize.apply(this, args);
			}
		};
		_.extend(Marionette.Region, {
			buildRegion : function (regionConfig, DefaultRegionClass) {
				if (_.isString(regionConfig)) {
					return this._buildRegionFromSelector(regionConfig, DefaultRegionClass);
				}
				if (regionConfig.selector || regionConfig.el || regionConfig.regionClass) {
					return this._buildRegionFromObject(regionConfig, DefaultRegionClass);
				}
				if (_.isFunction(regionConfig)) {
					return this._buildRegionFromRegionClass(regionConfig);
				}
				throw new Marionette.Error({
					message : 'Improper region configuration type.',
					url : 'marionette.region.html#region-configuration-types'
				});
			},
			_buildRegionFromSelector : function (selector, DefaultRegionClass) {
				return new DefaultRegionClass({
					el : selector
				});
			},
			_buildRegionFromObject : function (regionConfig, DefaultRegionClass) {
				var RegionClass = regionConfig.regionClass || DefaultRegionClass;
				var options = _.omit(regionConfig, 'selector', 'regionClass');
				if (regionConfig.selector && !options.el) {
					options.el = regionConfig.selector;
				}
				var region = new RegionClass(options);
				if (regionConfig.parentEl) {
					region.getEl = function (el) {
						if (_.isObject(el)) {
							return Backbone.$(el);
						}
						var parentEl = regionConfig.parentEl;
						if (_.isFunction(parentEl)) {
							parentEl = parentEl();
						}
						return parentEl.find(el);
					};
				}
				return region;
			},
			_buildRegionFromRegionClass : function (RegionClass) {
				return new RegionClass();
			}
		});
		_.extend(Marionette.Region.prototype, Backbone.Events, {
			show : function (view, options) {
				this._ensureElement();
				var showOptions = options || {};
				var isDifferentView = view !== this.currentView;
				var preventDestroy = !!showOptions.preventDestroy;
				var forceShow = !!showOptions.forceShow;
				var isChangingView = !!this.currentView;
				var _shouldDestroyView = !preventDestroy && isDifferentView;
				var _shouldShowView = isDifferentView || forceShow;
				if (isChangingView) {
					this.triggerMethod('before:swapOut', this.currentView);
				}
				if (_shouldDestroyView) {
					this.empty();
				}
				if (_shouldShowView) {
					view.once('destroy', _.bind(this.empty, this));
					view.render();
					if (isChangingView) {
						this.triggerMethod('before:swap', view);
					}
					this.triggerMethod('before:show', view);
					Marionette.triggerMethodOn(view, 'before:show');
					if (isChangingView) {
						this.triggerMethod('swapOut', this.currentView);
					}
					this.attachHtml(view);
					this.currentView = view;
					if (isChangingView) {
						this.triggerMethod('swap', view);
					}
					this.triggerMethod('show', view);
					Marionette.triggerMethodOn(view, 'show');
					return this;
				}
				return this;
			},
			_ensureElement : function () {
				if (!_.isObject(this.el)) {
					this.$el = this.getEl(this.el);
					this.el = this.$el[0];
				}
				if (!this.$el || this.$el.length === 0) {
					throw new Marionette.Error('An "el" ' + this.$el.selector + ' must exist in DOM');
				}
			},
			getEl : function (el) {
				return Backbone.$(el);
			},
			attachHtml : function (view) {
				this.el.innerHTML = '';
				this.el.appendChild(view.el);
			},
			empty : function () {
				var view = this.currentView;
				if (!view) {
					return;
				}
				this.triggerMethod('before:empty', view);
				this._destroyView();
				this.triggerMethod('empty', view);
				delete this.currentView;
				return this;
			},
			_destroyView : function () {
				var view = this.currentView;
				if (view.destroy && !view.isDestroyed) {
					view.destroy();
				} else if (view.remove) {
					view.remove();
				}
			},
			attachView : function (view) {
				this.currentView = view;
				return this;
			},
			hasView : function () {
				return !!this.currentView;
			},
			reset : function () {
				this.empty();
				if (this.$el) {
					this.el = this.$el.selector;
				}
				delete this.$el;
				return this;
			},
			getOption : Marionette.proxyGetOption,
			triggerMethod : Marionette.triggerMethod
		});
		Marionette.Region.extend = Marionette.extend;
		Marionette.RegionManager = (function (Marionette) {
			var RegionManager = Marionette.Controller.extend({
					constructor : function (options) {
						this._regions = {};
						Marionette.Controller.call(this, options);
					},
					addRegions : function (regionDefinitions, defaults) {
						if (_.isFunction(regionDefinitions)) {
							regionDefinitions = regionDefinitions.apply(this, arguments);
						}
						var regions = {};
						_.each(regionDefinitions, function (definition, name) {
							if (_.isString(definition)) {
								definition = {
									selector : definition
								};
							}
							if (definition.selector) {
								definition = _.defaults({}, definition, defaults);
							}
							var region = this.addRegion(name, definition);
							regions[name] = region;
						}, this);
						return regions;
					},
					addRegion : function (name, definition) {
						var region;
						if (definition instanceof Marionette.Region) {
							region = definition;
						} else {
							region = Marionette.Region.buildRegion(definition, Marionette.Region);
						}
						this.triggerMethod('before:add:region', name, region);
						this._store(name, region);
						this.triggerMethod('add:region', name, region);
						return region;
					},
					get : function (name) {
						return this._regions[name];
					},
					getRegions : function () {
						return _.clone(this._regions);
					},
					removeRegion : function (name) {
						var region = this._regions[name];
						this._remove(name, region);
						return region;
					},
					removeRegions : function () {
						var regions = this.getRegions();
						_.each(this._regions, function (region, name) {
							this._remove(name, region);
						}, this);
						return regions;
					},
					emptyRegions : function () {
						var regions = this.getRegions();
						_.each(regions, function (region) {
							region.empty();
						}, this);
						return regions;
					},
					destroy : function () {
						this.removeRegions();
						return Marionette.Controller.prototype.destroy.apply(this, arguments);
					},
					_store : function (name, region) {
						this._regions[name] = region;
						this._setLength();
					},
					_remove : function (name, region) {
						this.triggerMethod('before:remove:region', name, region);
						region.empty();
						region.stopListening();
						delete this._regions[name];
						this._setLength();
						this.triggerMethod('remove:region', name, region);
					},
					_setLength : function () {
						this.length = _.size(this._regions);
					}
				});
			Marionette.actAsCollection(RegionManager.prototype, '_regions');
			return RegionManager;
		})(Marionette);
		Marionette.TemplateCache = function (templateId) {
			this.templateId = templateId;
		};
		_.extend(Marionette.TemplateCache, {
			templateCaches : {},
			get : function (templateId) {
				var cachedTemplate = this.templateCaches[templateId];
				if (!cachedTemplate) {
					cachedTemplate = new Marionette.TemplateCache(templateId);
					this.templateCaches[templateId] = cachedTemplate;
				}
				return cachedTemplate.load();
			},
			clear : function () {
				var i;
				var args = slice.call(arguments);
				var length = args.length;
				if (length > 0) {
					for (i = 0; i < length; i++) {
						delete this.templateCaches[args[i]];
					}
				} else {
					this.templateCaches = {};
				}
			}
		});
		_.extend(Marionette.TemplateCache.prototype, {
			load : function () {
				if (this.compiledTemplate) {
					return this.compiledTemplate;
				}
				var template = this.loadTemplate(this.templateId);
				this.compiledTemplate = this.compileTemplate(template);
				return this.compiledTemplate;
			},
			loadTemplate : function (templateId) {
				var template = Backbone.$(templateId).html();
				if (!template || template.length === 0) {
					throw new Marionette.Error({
						name : 'NoTemplateError',
						message : 'Could not find template: "' + templateId + '"'
					});
				}
				return template;
			},
			compileTemplate : function (rawTemplate) {
				return _.template(rawTemplate);
			}
		});
		Marionette.Renderer = {
			render : function (template, data) {
				if (!template) {
					throw new Marionette.Error({
						name : 'TemplateNotFoundError',
						message : 'Cannot render the template since its false, null or undefined.'
					});
				}
				var templateFunc;
				if (typeof template === 'function') {
					templateFunc = template;
				} else {
					templateFunc = Marionette.TemplateCache.get(template);
				}
				return templateFunc(data);
			}
		};
		Marionette.View = Backbone.View.extend({
				constructor : function (options) {
					_.bindAll(this, 'render');
					this.options = _.extend({}, _.result(this, 'options'), _.isFunction(options) ? options.call(this) : options);
					this._behaviors = Marionette.Behaviors(this);
					Backbone.View.apply(this, arguments);
					Marionette.MonitorDOMRefresh(this);
					this.listenTo(this, 'show', this.onShowCalled);
				},
				getTemplate : function () {
					return this.getOption('template');
				},
				serializeModel : function (model) {
					return model.toJSON.apply(model, slice.call(arguments, 1));
				},
				mixinTemplateHelpers : function (target) {
					target = target || {};
					var templateHelpers = this.getOption('templateHelpers');
					if (_.isFunction(templateHelpers)) {
						templateHelpers = templateHelpers.call(this);
					}
					return _.extend(target, templateHelpers);
				},
				normalizeUIKeys : function (hash) {
					var ui = _.result(this, 'ui');
					var uiBindings = _.result(this, '_uiBindings');
					return Marionette.normalizeUIKeys(hash, uiBindings || ui);
				},
				normalizeUIValues : function (hash) {
					var ui = _.result(this, 'ui');
					var uiBindings = _.result(this, '_uiBindings');
					return Marionette.normalizeUIValues(hash, uiBindings || ui);
				},
				configureTriggers : function () {
					if (!this.triggers) {
						return;
					}
					var triggerEvents = {};
					var triggers = this.normalizeUIKeys(_.result(this, 'triggers'));
					_.each(triggers, function (value, key) {
						triggerEvents[key] = this._buildViewTrigger(value);
					}, this);
					return triggerEvents;
				},
				delegateEvents : function (events) {
					this._delegateDOMEvents(events);
					this.bindEntityEvents(this.model, this.getOption('modelEvents'));
					this.bindEntityEvents(this.collection, this.getOption('collectionEvents'));
					_.each(this._behaviors, function (behavior) {
						behavior.bindEntityEvents(this.model, behavior.getOption('modelEvents'));
						behavior.bindEntityEvents(this.collection, behavior.getOption('collectionEvents'));
					}, this);
					return this;
				},
				_delegateDOMEvents : function (eventsArg) {
					var events = eventsArg || this.events;
					if (_.isFunction(events)) {
						events = events.call(this);
					}
					events = this.normalizeUIKeys(events);
					if (_.isUndefined(eventsArg)) {
						this.events = events;
					}
					var combinedEvents = {};
					var behaviorEvents = _.result(this, 'behaviorEvents') || {};
					var triggers = this.configureTriggers();
					var behaviorTriggers = _.result(this, 'behaviorTriggers') || {};
					_.extend(combinedEvents, behaviorEvents, events, triggers, behaviorTriggers);
					Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
				},
				undelegateEvents : function () {
					var args = slice.call(arguments);
					Backbone.View.prototype.undelegateEvents.apply(this, args);
					this.unbindEntityEvents(this.model, this.getOption('modelEvents'));
					this.unbindEntityEvents(this.collection, this.getOption('collectionEvents'));
					_.each(this._behaviors, function (behavior) {
						behavior.unbindEntityEvents(this.model, behavior.getOption('modelEvents'));
						behavior.unbindEntityEvents(this.collection, behavior.getOption('collectionEvents'));
					}, this);
					return this;
				},
				onShowCalled : function () {},
				_ensureViewIsIntact : function () {
					if (this.isDestroyed) {
						throw new Marionette.Error({
							name : 'ViewDestroyedError',
							message : 'View (cid: "' + this.cid + '") has already been destroyed and cannot be used.'
						});
					}
				},
				destroy : function () {
					if (this.isDestroyed) {
						return;
					}
					var args = slice.call(arguments);
					this.triggerMethod.apply(this, ['before:destroy'].concat(args));
					this.isDestroyed = true;
					this.triggerMethod.apply(this, ['destroy'].concat(args));
					this.unbindUIElements();
					this.remove();
					_.invoke(this._behaviors, 'destroy', args);
					return this;
				},
				bindUIElements : function () {
					this._bindUIElements();
					_.invoke(this._behaviors, this._bindUIElements);
				},
				_bindUIElements : function () {
					if (!this.ui) {
						return;
					}
					if (!this._uiBindings) {
						this._uiBindings = this.ui;
					}
					var bindings = _.result(this, '_uiBindings');
					this.ui = {};
					_.each(_.keys(bindings), function (key) {
						var selector = bindings[key];
						this.ui[key] = this.$(selector);
					}, this);
				},
				unbindUIElements : function () {
					this._unbindUIElements();
					_.invoke(this._behaviors, this._unbindUIElements);
				},
				_unbindUIElements : function () {
					if (!this.ui || !this._uiBindings) {
						return;
					}
					_.each(this.ui, function ($el, name) {
						delete this.ui[name];
					}, this);
					this.ui = this._uiBindings;
					delete this._uiBindings;
				},
				_buildViewTrigger : function (triggerDef) {
					var hasOptions = _.isObject(triggerDef);
					var options = _.defaults({}, (hasOptions ? triggerDef : {}), {
							preventDefault : true,
							stopPropagation : true
						});
					var eventName = hasOptions ? options.event : triggerDef;
					return function (e) {
						if (e) {
							if (e.preventDefault && options.preventDefault) {
								e.preventDefault();
							}
							if (e.stopPropagation && options.stopPropagation) {
								e.stopPropagation();
							}
						}
						var args = {
							view : this,
							model : this.model,
							collection : this.collection
						};
						this.triggerMethod(eventName, args);
					};
				},
				setElement : function () {
					var ret = Backbone.View.prototype.setElement.apply(this, arguments);
					_.invoke(this._behaviors, 'proxyViewProperties', this);
					return ret;
				},
				triggerMethod : function () {
					var args = arguments;
					var triggerMethod = Marionette.triggerMethod;
					var ret = triggerMethod.apply(this, args);
					_.each(this._behaviors, function (b) {
						triggerMethod.apply(b, args);
					});
					return ret;
				},
				normalizeMethods : Marionette.normalizeMethods,
				getOption : Marionette.proxyGetOption,
				bindEntityEvents : Marionette.proxyBindEntityEvents,
				unbindEntityEvents : Marionette.proxyUnbindEntityEvents
			});
		Marionette.ItemView = Marionette.View.extend({
				constructor : function () {
					Marionette.View.apply(this, arguments);
				},
				serializeData : function () {
					var data = {};
					if (this.model) {
						data = _.partial(this.serializeModel, this.model).apply(this, arguments);
					} else if (this.collection) {
						data = {
							items : _.partial(this.serializeCollection, this.collection).apply(this, arguments)
						};
					}
					return data;
				},
				serializeCollection : function (collection) {
					return collection.toJSON.apply(collection, slice.call(arguments, 1));
				},
				render : function () {
					this._ensureViewIsIntact();
					this.triggerMethod('before:render', this);
					this._renderTemplate();
					this.bindUIElements();
					this.triggerMethod('render', this);
					return this;
				},
				_renderTemplate : function () {
					var template = this.getTemplate();
					if (template === false) {
						return;
					}
					if (!template) {
						throw new Marionette.Error({
							name : 'UndefinedTemplateError',
							message : 'Cannot render the template since it is null or undefined.'
						});
					}
					var data = this.serializeData();
					data = this.mixinTemplateHelpers(data);
					var html = Marionette.Renderer.render(template, data, this);
					this.attachElContent(html);
					return this;
				},
				attachElContent : function (html) {
					this.$el.html(html);
					return this;
				},
				destroy : function () {
					if (this.isDestroyed) {
						return;
					}
					return Marionette.View.prototype.destroy.apply(this, arguments);
				}
			});
		Marionette.CollectionView = Marionette.View.extend({
				childViewEventPrefix : 'childview',
				constructor : function (options) {
					var initOptions = options || {};
					this.sort = _.isUndefined(initOptions.sort) ? true : initOptions.sort;
					if (initOptions.collection && !(initOptions.collection instanceof Backbone.Collection)) {
						throw new Marionette.Error('The Collection option passed to this view needs to be an instance of a Backbone.Collection');
					}
					this.once('render', this._initialEvents);
					this._initChildViewStorage();
					Marionette.View.apply(this, arguments);
					this.initRenderBuffer();
				},
				initRenderBuffer : function () {
					this.elBuffer = document.createDocumentFragment();
					this._bufferedChildren = [];
				},
				startBuffering : function () {
					this.initRenderBuffer();
					this.isBuffering = true;
				},
				endBuffering : function () {
					this.isBuffering = false;
					this._triggerBeforeShowBufferedChildren();
					this.attachBuffer(this, this.elBuffer);
					this._triggerShowBufferedChildren();
					this.initRenderBuffer();
				},
				_triggerBeforeShowBufferedChildren : function () {
					if (this._isShown) {
						_.each(this._bufferedChildren, _.partial(this._triggerMethodOnChild, 'before:show'));
					}
				},
				_triggerShowBufferedChildren : function () {
					if (this._isShown) {
						_.each(this._bufferedChildren, _.partial(this._triggerMethodOnChild, 'show'));
						this._bufferedChildren = [];
					}
				},
				_triggerMethodOnChild : function (event, childView) {
					Marionette.triggerMethodOn(childView, event);
				},
				_initialEvents : function () {
					if (this.collection) {
						this.listenTo(this.collection, 'add', this._onCollectionAdd);
						this.listenTo(this.collection, 'remove', this._onCollectionRemove);
						this.listenTo(this.collection, 'reset', this.render);
						if (this.sort) {
							this.listenTo(this.collection, 'sort', this._sortViews);
						}
					}
				},
				_onCollectionAdd : function (child) {
					this.destroyEmptyView();
					var ChildView = this.getChildView(child);
					var index = this.collection.indexOf(child);
					this.addChild(child, ChildView, index);
				},
				_onCollectionRemove : function (model) {
					var view = this.children.findByModel(model);
					this.removeChildView(view);
					this.checkEmpty();
				},
				onShowCalled : function () {
					this.children.each(_.partial(this._triggerMethodOnChild, 'show'));
				},
				render : function () {
					this._ensureViewIsIntact();
					this.triggerMethod('before:render', this);
					this._renderChildren();
					this.triggerMethod('render', this);
					return this;
				},
				resortView : function () {
					this.render();
				},
				_sortViews : function () {
					var orderChanged = this.collection.find(function (item, index) {
							var view = this.children.findByModel(item);
							return !view || view._index !== index;
						}, this);
					if (orderChanged) {
						this.resortView();
					}
				},
				_renderChildren : function () {
					this.destroyEmptyView();
					this.destroyChildren();
					if (this.isEmpty(this.collection)) {
						this.showEmptyView();
					} else {
						this.triggerMethod('before:render:collection', this);
						this.startBuffering();
						this.showCollection();
						this.endBuffering();
						this.triggerMethod('render:collection', this);
					}
				},
				showCollection : function () {
					var ChildView;
					this.collection.each(function (child, index) {
						ChildView = this.getChildView(child);
						this.addChild(child, ChildView, index);
					}, this);
				},
				showEmptyView : function () {
					var EmptyView = this.getEmptyView();
					if (EmptyView && !this._showingEmptyView) {
						this.triggerMethod('before:render:empty');
						this._showingEmptyView = true;
						var model = new Backbone.Model();
						this.addEmptyView(model, EmptyView);
						this.triggerMethod('render:empty');
					}
				},
				destroyEmptyView : function () {
					if (this._showingEmptyView) {
						this.triggerMethod('before:remove:empty');
						this.destroyChildren();
						delete this._showingEmptyView;
						this.triggerMethod('remove:empty');
					}
				},
				getEmptyView : function () {
					return this.getOption('emptyView');
				},
				addEmptyView : function (child, EmptyView) {
					var emptyViewOptions = this.getOption('emptyViewOptions') || this.getOption('childViewOptions');
					if (_.isFunction(emptyViewOptions)) {
						emptyViewOptions = emptyViewOptions.call(this);
					}
					var view = this.buildChildView(child, EmptyView, emptyViewOptions);
					this.proxyChildEvents(view);
					if (this._isShown) {
						Marionette.triggerMethodOn(view, 'before:show');
					}
					this.children.add(view);
					this.renderChildView(view, -1);
					if (this._isShown) {
						Marionette.triggerMethodOn(view, 'show');
					}
				},
				getChildView : function (child) {
					var childView = this.getOption('childView');
					if (!childView) {
						throw new Marionette.Error({
							name : 'NoChildViewError',
							message : 'A "childView" must be specified'
						});
					}
					return childView;
				},
				addChild : function (child, ChildView, index) {
					var childViewOptions = this.getOption('childViewOptions');
					if (_.isFunction(childViewOptions)) {
						childViewOptions = childViewOptions.call(this, child, index);
					}
					var view = this.buildChildView(child, ChildView, childViewOptions);
					this._updateIndices(view, true, index);
					this._addChildView(view, index);
					return view;
				},
				_updateIndices : function (view, increment, index) {
					if (!this.sort) {
						return;
					}
					if (increment) {
						view._index = index;
						this.children.each(function (laterView) {
							if (laterView._index >= view._index) {
								laterView._index++;
							}
						});
					} else {
						this.children.each(function (laterView) {
							if (laterView._index >= view._index) {
								laterView._index--;
							}
						});
					}
				},
				_addChildView : function (view, index) {
					this.proxyChildEvents(view);
					this.triggerMethod('before:add:child', view);
					this.children.add(view);
					this.renderChildView(view, index);
					if (this._isShown && !this.isBuffering) {
						Marionette.triggerMethodOn(view, 'show');
					}
					this.triggerMethod('add:child', view);
				},
				renderChildView : function (view, index) {
					view.render();
					this.attachHtml(this, view, index);
					return view;
				},
				buildChildView : function (child, ChildViewClass, childViewOptions) {
					var options = _.extend({
							model : child
						}, childViewOptions);
					return new ChildViewClass(options);
				},
				removeChildView : function (view) {
					if (view) {
						this.triggerMethod('before:remove:child', view);
						if (view.destroy) {
							view.destroy();
						} else if (view.remove) {
							view.remove();
						}
						this.stopListening(view);
						this.children.remove(view);
						this.triggerMethod('remove:child', view);
						this._updateIndices(view, false);
					}
					return view;
				},
				isEmpty : function () {
					return !this.collection || this.collection.length === 0;
				},
				checkEmpty : function () {
					if (this.isEmpty(this.collection)) {
						this.showEmptyView();
					}
				},
				attachBuffer : function (collectionView, buffer) {
					collectionView.$el.append(buffer);
				},
				attachHtml : function (collectionView, childView, index) {
					if (collectionView.isBuffering) {
						collectionView.elBuffer.appendChild(childView.el);
						collectionView._bufferedChildren.push(childView);
					} else {
						if (!collectionView._insertBefore(childView, index)) {
							collectionView._insertAfter(childView);
						}
					}
				},
				_insertBefore : function (childView, index) {
					var currentView;
					var findPosition = this.sort && (index < this.children.length - 1);
					if (findPosition) {
						currentView = this.children.find(function (view) {
								return view._index === index + 1;
							});
					}
					if (currentView) {
						currentView.$el.before(childView.el);
						return true;
					}
					return false;
				},
				_insertAfter : function (childView) {
					this.$el.append(childView.el);
				},
				_initChildViewStorage : function () {
					this.children = new Backbone.ChildViewContainer();
				},
				destroy : function () {
					if (this.isDestroyed) {
						return;
					}
					this.triggerMethod('before:destroy:collection');
					this.destroyChildren();
					this.triggerMethod('destroy:collection');
					return Marionette.View.prototype.destroy.apply(this, arguments);
				},
				destroyChildren : function () {
					var childViews = this.children.map(_.identity);
					this.children.each(this.removeChildView, this);
					this.checkEmpty();
					return childViews;
				},
				proxyChildEvents : function (view) {
					var prefix = this.getOption('childViewEventPrefix');
					this.listenTo(view, 'all', function () {
						var args = slice.call(arguments);
						var rootEvent = args[0];
						var childEvents = this.normalizeMethods(_.result(this, 'childEvents'));
						args[0] = prefix + ':' + rootEvent;
						args.splice(1, 0, view);
						if (typeof childEvents !== 'undefined' && _.isFunction(childEvents[rootEvent])) {
							childEvents[rootEvent].apply(this, args.slice(1));
						}
						this.triggerMethod.apply(this, args);
					}, this);
				}
			});
		Marionette.CompositeView = Marionette.CollectionView.extend({
				constructor : function () {
					Marionette.CollectionView.apply(this, arguments);
				},
				_initialEvents : function () {
					if (this.collection) {
						this.listenTo(this.collection, 'add', this._onCollectionAdd);
						this.listenTo(this.collection, 'remove', this._onCollectionRemove);
						this.listenTo(this.collection, 'reset', this._renderChildren);
						if (this.sort) {
							this.listenTo(this.collection, 'sort', this._sortViews);
						}
					}
				},
				getChildView : function (child) {
					var childView = this.getOption('childView') || this.constructor;
					if (!childView) {
						throw new Marionette.Error({
							name : 'NoChildViewError',
							message : 'A "childView" must be specified'
						});
					}
					return childView;
				},
				serializeData : function () {
					var data = {};
					if (this.model) {
						data = _.partial(this.serializeModel, this.model).apply(this, arguments);
					}
					return data;
				},
				render : function () {
					this._ensureViewIsIntact();
					this.isRendered = true;
					this.resetChildViewContainer();
					this.triggerMethod('before:render', this);
					this._renderTemplate();
					this._renderChildren();
					this.triggerMethod('render', this);
					return this;
				},
				_renderChildren : function () {
					if (this.isRendered) {
						Marionette.CollectionView.prototype._renderChildren.call(this);
					}
				},
				_renderTemplate : function () {
					var data = {};
					data = this.serializeData();
					data = this.mixinTemplateHelpers(data);
					this.triggerMethod('before:render:template');
					var template = this.getTemplate();
					var html = Marionette.Renderer.render(template, data, this);
					this.attachElContent(html);
					this.bindUIElements();
					this.triggerMethod('render:template');
				},
				attachElContent : function (html) {
					this.$el.html(html);
					return this;
				},
				attachBuffer : function (compositeView, buffer) {
					var $container = this.getChildViewContainer(compositeView);
					$container.append(buffer);
				},
				_insertAfter : function (childView) {
					var $container = this.getChildViewContainer(this);
					$container.append(childView.el);
				},
				getChildViewContainer : function (containerView) {
					if ('$childViewContainer' in containerView) {
						return containerView.$childViewContainer;
					}
					var container;
					var childViewContainer = Marionette.getOption(containerView, 'childViewContainer');
					if (childViewContainer) {
						var selector = _.isFunction(childViewContainer) ? childViewContainer.call(containerView) : childViewContainer;
						if (selector.charAt(0) === '@' && containerView.ui) {
							container = containerView.ui[selector.substr(4)];
						} else {
							container = containerView.$(selector);
						}
						if (container.length <= 0) {
							throw new Marionette.Error({
								name : 'ChildViewContainerMissingError',
								message : 'The specified "childViewContainer" was not found: ' + containerView.childViewContainer
							});
						}
					} else {
						container = containerView.$el;
					}
					containerView.$childViewContainer = container;
					return container;
				},
				resetChildViewContainer : function () {
					if (this.$childViewContainer) {
						delete this.$childViewContainer;
					}
				}
			});
		Marionette.LayoutView = Marionette.ItemView.extend({
				regionClass : Marionette.Region,
				constructor : function (options) {
					options = options || {};
					this._firstRender = true;
					this._initializeRegions(options);
					Marionette.ItemView.call(this, options);
				},
				render : function () {
					this._ensureViewIsIntact();
					if (this._firstRender) {
						this._firstRender = false;
					} else {
						this._reInitializeRegions();
					}
					return Marionette.ItemView.prototype.render.apply(this, arguments);
				},
				destroy : function () {
					if (this.isDestroyed) {
						return this;
					}
					this.regionManager.destroy();
					return Marionette.ItemView.prototype.destroy.apply(this, arguments);
				},
				addRegion : function (name, definition) {
					this.triggerMethod('before:region:add', name);
					var regions = {};
					regions[name] = definition;
					return this._buildRegions(regions)[name];
				},
				addRegions : function (regions) {
					this.regions = _.extend({}, this.regions, regions);
					return this._buildRegions(regions);
				},
				removeRegion : function (name) {
					this.triggerMethod('before:region:remove', name);
					delete this.regions[name];
					return this.regionManager.removeRegion(name);
				},
				getRegion : function (region) {
					return this.regionManager.get(region);
				},
				getRegions : function () {
					return this.regionManager.getRegions();
				},
				_buildRegions : function (regions) {
					var that = this;
					var defaults = {
						regionClass : this.getOption('regionClass'),
						parentEl : function () {
							return that.$el;
						}
					};
					return this.regionManager.addRegions(regions, defaults);
				},
				_initializeRegions : function (options) {
					var regions;
					this._initRegionManager();
					if (_.isFunction(this.regions)) {
						regions = this.regions(options);
					} else {
						regions = this.regions || {};
					}
					var regionOptions = this.getOption.call(options, 'regions');
					if (_.isFunction(regionOptions)) {
						regionOptions = regionOptions.call(this, options);
					}
					_.extend(regions, regionOptions);
					regions = this.normalizeUIValues(regions);
					this.addRegions(regions);
				},
				_reInitializeRegions : function () {
					this.regionManager.emptyRegions();
					this.regionManager.each(function (region) {
						region.reset();
					});
				},
				getRegionManager : function () {
					return new Marionette.RegionManager();
				},
				_initRegionManager : function () {
					this.regionManager = this.getRegionManager();
					this.listenTo(this.regionManager, 'before:add:region', function (name) {
						this.triggerMethod('before:add:region', name);
					});
					this.listenTo(this.regionManager, 'add:region', function (name, region) {
						this[name] = region;
						this.triggerMethod('add:region', name, region);
					});
					this.listenTo(this.regionManager, 'before:remove:region', function (name) {
						this.triggerMethod('before:remove:region', name);
					});
					this.listenTo(this.regionManager, 'remove:region', function (name, region) {
						delete this[name];
						this.triggerMethod('remove:region', name, region);
					});
				}
			});
		Marionette.Behavior = (function (_, Backbone) {
			function Behavior(options, view) {
				this.view = view;
				this.defaults = _.result(this, 'defaults') || {};
				this.options = _.extend({}, this.defaults, options);
				this.$ = function () {
					return this.view.$.apply(this.view, arguments);
				};
				this.initialize.apply(this, arguments);
			}
			_.extend(Behavior.prototype, Backbone.Events, {
				initialize : function () {},
				destroy : function () {
					this.stopListening();
				},
				proxyViewProperties : function (view) {
					this.$el = view.$el;
					this.el = view.el;
				},
				triggerMethod : Marionette.triggerMethod,
				getOption : Marionette.proxyGetOption,
				bindEntityEvents : Marionette.proxyBindEntityEvents,
				unbindEntityEvents : Marionette.proxyUnbindEntityEvents
			});
			Behavior.extend = Marionette.extend;
			return Behavior;
		})(_, Backbone);
		Marionette.Behaviors = (function (Marionette, _) {
			function Behaviors(view, behaviors) {
				if (!_.isObject(view.behaviors)) {
					return {};
				}
				behaviors = Behaviors.parseBehaviors(view, behaviors || _.result(view, 'behaviors'));
				Behaviors.wrap(view, behaviors, _.keys(methods));
				return behaviors;
			}
			var methods = {
				behaviorTriggers : function (behaviorTriggers, behaviors) {
					var triggerBuilder = new BehaviorTriggersBuilder(this, behaviors);
					return triggerBuilder.buildBehaviorTriggers();
				},
				behaviorEvents : function (behaviorEvents, behaviors) {
					var _behaviorsEvents = {};
					var viewUI = _.result(this, 'ui');
					_.each(behaviors, function (b, i) {
						var _events = {};
						var behaviorEvents = _.clone(_.result(b, 'events')) || {};
						var behaviorUI = _.result(b, 'ui');
						var ui = _.extend({}, viewUI, behaviorUI);
						behaviorEvents = Marionette.normalizeUIKeys(behaviorEvents, ui);
						_.each(_.keys(behaviorEvents), function (key) {
							var whitespace = (new Array(i + 2)).join(' ');
							var eventKey = key + whitespace;
							var handler = _.isFunction(behaviorEvents[key]) ? behaviorEvents[key] : b[behaviorEvents[key]];
							_events[eventKey] = _.bind(handler, b);
						});
						_behaviorsEvents = _.extend(_behaviorsEvents, _events);
					});
					return _behaviorsEvents;
				}
			};
			_.extend(Behaviors, {
				behaviorsLookup : function () {
					throw new Marionette.Error({
						message : 'You must define where your behaviors are stored.',
						url : 'marionette.behaviors.html#behaviorslookup'
					});
				},
				getBehaviorClass : function (options, key) {
					if (options.behaviorClass) {
						return options.behaviorClass;
					}
					return _.isFunction(Behaviors.behaviorsLookup) ? Behaviors.behaviorsLookup.apply(this, arguments)[key] : Behaviors.behaviorsLookup[key];
				},
				parseBehaviors : function (view, behaviors) {
					return _.chain(behaviors).map(function (options, key) {
						var BehaviorClass = Behaviors.getBehaviorClass(options, key);
						var behavior = new BehaviorClass(options, view);
						var nestedBehaviors = Behaviors.parseBehaviors(view, _.result(behavior, 'behaviors'));
						return [behavior].concat(nestedBehaviors);
					}).flatten().value();
				},
				wrap : function (view, behaviors, methodNames) {
					_.each(methodNames, function (methodName) {
						view[methodName] = _.partial(methods[methodName], view[methodName], behaviors);
					});
				}
			});
			function BehaviorTriggersBuilder(view, behaviors) {
				this._view = view;
				this._viewUI = _.result(view, 'ui');
				this._behaviors = behaviors;
				this._triggers = {};
			}
			_.extend(BehaviorTriggersBuilder.prototype, {
				buildBehaviorTriggers : function () {
					_.each(this._behaviors, this._buildTriggerHandlersForBehavior, this);
					return this._triggers;
				},
				_buildTriggerHandlersForBehavior : function (behavior, i) {
					var ui = _.extend({}, this._viewUI, _.result(behavior, 'ui'));
					var triggersHash = _.clone(_.result(behavior, 'triggers')) || {};
					triggersHash = Marionette.normalizeUIKeys(triggersHash, ui);
					_.each(triggersHash, _.partial(this._setHandlerForBehavior, behavior, i), this);
				},
				_setHandlerForBehavior : function (behavior, i, eventName, trigger) {
					var triggerKey = trigger.replace(/^\S+/, function (triggerName) {
							return triggerName + '.' + 'behaviortriggers' + i;
						});
					this._triggers[triggerKey] = this._view._buildViewTrigger(eventName);
				}
			});
			return Behaviors;
		})(Marionette, _);
		Marionette.AppRouter = Backbone.Router.extend({
				constructor : function (options) {
					Backbone.Router.apply(this, arguments);
					this.options = options || {};
					var appRoutes = this.getOption('appRoutes');
					var controller = this._getController();
					this.processAppRoutes(controller, appRoutes);
					this.on('route', this._processOnRoute, this);
				},
				appRoute : function (route, methodName) {
					var controller = this._getController();
					this._addAppRoute(controller, route, methodName);
				},
				_processOnRoute : function (routeName, routeArgs) {
					var routePath = _.invert(this.getOption('appRoutes'))[routeName];
					if (_.isFunction(this.onRoute)) {
						this.onRoute(routeName, routePath, routeArgs);
					}
				},
				processAppRoutes : function (controller, appRoutes) {
					if (!appRoutes) {
						return;
					}
					var routeNames = _.keys(appRoutes).reverse();
					_.each(routeNames, function (route) {
						this._addAppRoute(controller, route, appRoutes[route]);
					}, this);
				},
				_getController : function () {
					return this.getOption('controller');
				},
				_addAppRoute : function (controller, route, methodName) {
					var method = controller[methodName];
					if (!method) {
						throw new Marionette.Error('Method "' + methodName + '" was not found on the controller');
					}
					this.route(route, methodName, _.bind(method, controller));
				},
				getOption : Marionette.proxyGetOption
			});
		Marionette.Application = function (options) {
			this.options = options;
			this._initializeRegions(options);
			this._initCallbacks = new Marionette.Callbacks();
			this.submodules = {};
			_.extend(this, options);
			this._initChannel();
			this.initialize.apply(this, arguments);
		};
		_.extend(Marionette.Application.prototype, Backbone.Events, {
			initialize : function () {},
			execute : function () {
				this.commands.execute.apply(this.commands, arguments);
			},
			request : function () {
				return this.reqres.request.apply(this.reqres, arguments);
			},
			addInitializer : function (initializer) {
				this._initCallbacks.add(initializer);
			},
			start : function (options) {
				this.triggerMethod('before:start', options);
				this._initCallbacks.run(options, this);
				this.triggerMethod('start', options);
			},
			addRegions : function (regions) {
				return this._regionManager.addRegions(regions);
			},
			emptyRegions : function () {
				return this._regionManager.emptyRegions();
			},
			removeRegion : function (region) {
				return this._regionManager.removeRegion(region);
			},
			getRegion : function (region) {
				return this._regionManager.get(region);
			},
			getRegions : function () {
				return this._regionManager.getRegions();
			},
			module : function (moduleNames, moduleDefinition) {
				var ModuleClass = Marionette.Module.getClass(moduleDefinition);
				var args = slice.call(arguments);
				args.unshift(this);
				return ModuleClass.create.apply(ModuleClass, args);
			},
			getRegionManager : function () {
				return new Marionette.RegionManager();
			},
			_initializeRegions : function (options) {
				var regions = _.isFunction(this.regions) ? this.regions(options) : this.regions || {};
				this._initRegionManager();
				var optionRegions = Marionette.getOption(options, 'regions');
				if (_.isFunction(optionRegions)) {
					optionRegions = optionRegions.call(this, options);
				}
				_.extend(regions, optionRegions);
				this.addRegions(regions);
				return this;
			},
			_initRegionManager : function () {
				this._regionManager = this.getRegionManager();
				this.listenTo(this._regionManager, 'before:add:region', function (name) {
					this.triggerMethod('before:add:region', name);
				});
				this.listenTo(this._regionManager, 'add:region', function (name, region) {
					this[name] = region;
					this.triggerMethod('add:region', name, region);
				});
				this.listenTo(this._regionManager, 'before:remove:region', function (name) {
					this.triggerMethod('before:remove:region', name);
				});
				this.listenTo(this._regionManager, 'remove:region', function (name, region) {
					delete this[name];
					this.triggerMethod('remove:region', name, region);
				});
			},
			_initChannel : function () {
				this.channelName = _.result(this, 'channelName') || 'global';
				this.channel = _.result(this, 'channel') || Backbone.Wreqr.radio.channel(this.channelName);
				this.vent = _.result(this, 'vent') || this.channel.vent;
				this.commands = _.result(this, 'commands') || this.channel.commands;
				this.reqres = _.result(this, 'reqres') || this.channel.reqres;
			},
			triggerMethod : Marionette.triggerMethod,
			getOption : Marionette.proxyGetOption
		});
		Marionette.Application.extend = Marionette.extend;
		Marionette.Module = function (moduleName, app, options) {
			this.moduleName = moduleName;
			this.options = _.extend({}, this.options, options);
			this.initialize = options.initialize || this.initialize;
			this.submodules = {};
			this._setupInitializersAndFinalizers();
			this.app = app;
			if (_.isFunction(this.initialize)) {
				this.initialize(moduleName, app, this.options);
			}
		};
		Marionette.Module.extend = Marionette.extend;
		_.extend(Marionette.Module.prototype, Backbone.Events, {
			startWithParent : true,
			initialize : function () {},
			addInitializer : function (callback) {
				this._initializerCallbacks.add(callback);
			},
			addFinalizer : function (callback) {
				this._finalizerCallbacks.add(callback);
			},
			start : function (options) {
				if (this._isInitialized) {
					return;
				}
				_.each(this.submodules, function (mod) {
					if (mod.startWithParent) {
						mod.start(options);
					}
				});
				this.triggerMethod('before:start', options);
				this._initializerCallbacks.run(options, this);
				this._isInitialized = true;
				this.triggerMethod('start', options);
			},
			stop : function () {
				if (!this._isInitialized) {
					return;
				}
				this._isInitialized = false;
				this.triggerMethod('before:stop');
				_.each(this.submodules, function (mod) {
					mod.stop();
				});
				this._finalizerCallbacks.run(undefined, this);
				this._initializerCallbacks.reset();
				this._finalizerCallbacks.reset();
				this.triggerMethod('stop');
			},
			addDefinition : function (moduleDefinition, customArgs) {
				this._runModuleDefinition(moduleDefinition, customArgs);
			},
			_runModuleDefinition : function (definition, customArgs) {
				if (!definition) {
					return;
				}
				var args = _.flatten([this, this.app, Backbone, Marionette, Backbone.$, _, customArgs]);
				definition.apply(this, args);
			},
			_setupInitializersAndFinalizers : function () {
				this._initializerCallbacks = new Marionette.Callbacks();
				this._finalizerCallbacks = new Marionette.Callbacks();
			},
			triggerMethod : Marionette.triggerMethod
		});
		_.extend(Marionette.Module, {
			create : function (app, moduleNames, moduleDefinition) {
				var module = app;
				var customArgs = slice.call(arguments);
				customArgs.splice(0, 3);
				moduleNames = moduleNames.split('.');
				var length = moduleNames.length;
				var moduleDefinitions = [];
				moduleDefinitions[length - 1] = moduleDefinition;
				_.each(moduleNames, function (moduleName, i) {
					var parentModule = module;
					module = this._getModule(parentModule, moduleName, app, moduleDefinition);
					this._addModuleDefinition(parentModule, module, moduleDefinitions[i], customArgs);
				}, this);
				return module;
			},
			_getModule : function (parentModule, moduleName, app, def, args) {
				var options = _.extend({}, def);
				var ModuleClass = this.getClass(def);
				var module = parentModule[moduleName];
				if (!module) {
					module = new ModuleClass(moduleName, app, options);
					parentModule[moduleName] = module;
					parentModule.submodules[moduleName] = module;
				}
				return module;
			},
			getClass : function (moduleDefinition) {
				var ModuleClass = Marionette.Module;
				if (!moduleDefinition) {
					return ModuleClass;
				}
				if (moduleDefinition.prototype instanceof ModuleClass) {
					return moduleDefinition;
				}
				return moduleDefinition.moduleClass || ModuleClass;
			},
			_addModuleDefinition : function (parentModule, module, def, args) {
				var fn = this._getDefine(def);
				var startWithParent = this._getStartWithParent(def, module);
				if (fn) {
					module.addDefinition(fn, args);
				}
				this._addStartWithParent(parentModule, module, startWithParent);
			},
			_getStartWithParent : function (def, module) {
				var swp;
				if (_.isFunction(def) && (def.prototype instanceof Marionette.Module)) {
					swp = module.constructor.prototype.startWithParent;
					return _.isUndefined(swp) ? true : swp;
				}
				if (_.isObject(def)) {
					swp = def.startWithParent;
					return _.isUndefined(swp) ? true : swp;
				}
				return true;
			},
			_getDefine : function (def) {
				if (_.isFunction(def) && !(def.prototype instanceof Marionette.Module)) {
					return def;
				}
				if (_.isObject(def)) {
					return def.define;
				}
				return null;
			},
			_addStartWithParent : function (parentModule, module, startWithParent) {
				module.startWithParent = module.startWithParent && startWithParent;
				if (!module.startWithParent || !!module.startWithParentIsConfigured) {
					return;
				}
				module.startWithParentIsConfigured = true;
				parentModule.addInitializer(function (options) {
					if (module.startWithParent) {
						module.start(options);
					}
				});
			}
		});
		return Marionette;
	}));