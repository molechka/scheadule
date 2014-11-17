'use strict';

/**
 * RequireJS configuration.
 */
require.config({
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },

        'bootstrap': ['jquery'],
        'bootstrap-select': ['jquery'],
        'bootstrap-switch': ['jquery'],
    },
    paths: {
        'underscore': 'underscore-1.7.0',
        'marionette': 'backbone.marionette',
        'i18n': 'locale/i18n'
    }
});

require([
		'app',
		'jquery',
		'bootstrap',
		'bootstrap-select',
		'bootstrap-switch'
	], function (app, $) {

	$(function () {
		app.start();
	});

});