'use strict';
define([
		'marionette',
		'jquery',
        'i18n',
		'cron-util',
		'view/task-edit-cron-view'
	], function (Marionette, $, i18n, Cron, TaskEditCronView) {

	var app = new Marionette.Application(),
        model;

	app.addRegions({
		'popupRegion' : '[data-region="popup"]'
	});

	app.on('start', function () {

		var model = new Backbone.Model({
				description : 'Задача1',
				cron : new Cron('* * * * * *')
			}),
            $cron = $('[data-field="cron"]'),
            $description = $('[data-field="description"]');
            
        function onCronChange(){
            var cron = model.get('cron');
            $cron.text(i18n.tc('view.main.cron') + ': ' + cron.describe());
            $description.text(i18n.tc('view.main.description', 1, [model.get('description')]));
        }
        
        model.on('change', onCronChange);
        onCronChange();
        
		$('[data-action="open"]').on('click', function () {
			var view = new TaskEditCronView({
					model : model
				});

			app.popupRegion.show(view);
		});
	})

	return app;
});