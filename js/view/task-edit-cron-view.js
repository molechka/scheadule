'use strict';

define([
    'underscore',
    'marionette',
    'i18n',
    'cron-util',
    'text!template/task-descriptor-cron-view.html'
], function (_, Marionette, i18n, Cron, editTemplate) {

    var TaskEditCronView = Marionette.ItemView.extend({
        className: 'modal fade in',
        attributes: {style: 'display:none'},
        
        template: _.template(editTemplate),
        templateHelpers: function(){
            var tempCron = this.tempCron;
            var cronEnabled = this.cronEnabled;
            return _.extend({
                    getTempCron: function() {
                        return tempCron;
                    },
                    isCronEnabled: function(){
                        return cronEnabled;
                    }
                }, i18n.helpers);
        },
        ui: {
            'switch': 'input:checkbox',
            'alert': '.alert',
            'inputs': '[data-cron]',
            'btnSave': '[data-action="save"]',
            'details': '[data-field="cron-details"]',
            'selects': 'select.selectpicker',
            'description': '[data-field="description"]'
        },
        events: {
            'keyup input[data-cron]': 'cronChanged',
            'change select[data-cron]': 'cronChanged',
            'switch-change input:checkbox': 'onSwitchChanged',
            'click [data-action="save"]': 'applyEdit',
            'hidden.bs.modal': 'close'
        },
        
        initialize: function(){
            var cron = this.model.get('cron');
            this.cronEnabled = true;
            this.tempCron = new Cron(cron.toString() || '0 * * * * *');
        },
        
        onRender: function(){
            this.ui.switch.bootstrapSwitch();
            this.ui.selects.selectpicker();
            this.updateAlert();
        },
        
        onShow: function(){
            this.$el.modal('show');
            this.resetInputsSelection();
        },
        
        hide: function(){
            this.$el.modal('hide');
        },

        resetInputsSelection: function(){
            this.ui.inputs.each(function(){
                this.value = this.value;
            });
        },
        
        updateAlert: function(){
            this.ui.alert
                .toggleClass('alert-error', !this.tempCron.isCorrect() )
                .text( i18n.capitalize( this.cronEnabled ? this.tempCron.describe() : i18n.t('model.cron.undefined')) );
        },
        
        cronChanged: function(){
            var cron = this.tempCron;
            cron.schedule.s.fromString('0');
            this.ui.inputs.each(function(){
                var $el = $(this),
                    cronPart = $el.attr('data-cron'),
                    error = cron.schedule[cronPart].fromString($el.val());
                $el.closest('.control-group').toggleClass('error', !!error)
                    .find('.help-block').text(error||'');
            });
            this.updateAlert();
            this.updateSaveBtn();
        },
        
        updateSaveBtn: function(){
            this.ui.btnSave.attr('disabled', this.cronEnabled && !this.tempCron.isCorrect());
        },

        onSwitchChanged: function(e, data) {
            this.cronEnabled = data.value;
            this.ui.details.toggle(this.cronEnabled);
            this.updateAlert();
            this.updateSaveBtn();
        },
        
        applyEdit: function(){
            var cron = this.model.get('cron'),
                errorsHandler = _.bind(this.putErrors, this);
                
            cron.fromString(this.cronEnabled ? this.tempCron.toString() : '');
            this.model.set('description',  this.ui.description.val(), { silent: true });
            this.model.trigger('change');
            this.hide();
        },
        
        putErrors: function(errors) {
            errors = errors || {};
            errors.globalErrors = errors.globalErrors || [];
            errors.fieldErrors = errors.fieldErrors || {};
            var messages = [].concat(errors.globalErrors).concat(_.values(errors.fieldErrors));
            this.ui.alert.toggle(messages.length > 0)
                .addClass('alert-error')
                .text( messages.join(', ') );

        }
    });
    
    return TaskEditCronView;
});
