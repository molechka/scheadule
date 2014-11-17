'use strict';

define([
], function () {

    var en = {
        'messages': {
            '': {
                'domain': 'messages',
                'lang': 'en',
                'plural_forms': 'nplurals=2; plural=(n != 1);'
            },

            'model.common.one_of': [ null, '%s of %s'],
            'model.common.no_data_found': [ null, 'No data found'],
            'model.common.hang': [ null, 'Waiting for server response...'],

            'model.time.time': [ null, "%(h)d:%(m)'02d"],
            'model.time.date': [ null, "%(day)'02d.%(mon)'02d.%(year)d"],
            'model.time.datetime': [ null, "%(day)'02d.%(mon)'02d.%(year)d %(h)d:%(m)'02d"],

            'model.time.year': [ null, 'year', 'years'],
            'model.time.month': [ null, 'month', 'months'],
            'model.time.week': [ null, 'week', 'weeks'],
            'model.time.day': [ null, 'day', 'days'],
            'model.time.hour': [ null, 'hour', 'hours'],
            'model.time.minute': [ null, 'after %s minute', 'after %s minutes'],
            'model.time.second': [ null, 'after %s second', 'after %s seconds'],
            'model.time.in_infinite': [ null, 'after more than a year'],
            'model.time.in_year': [ null, 'after %s year', 'after %s years'],
            'model.time.in_month': [ null, 'after %s month', 'after %s months'],
            'model.time.in_week': [ null, 'after %s week', 'after %s weeks'],
            'model.time.in_day': [ null, 'after %s day', 'after %s days'],
            'model.time.in_hour': [ null, 'after %s hour', 'after %s hours'],
            'model.time.in_minute': [ null, 'after %s minute', 'after %s minutes'],
            'model.time.in_second': [ null, 'after %s second', 'after %s seconds'],
            'model.time.in': [ null, '%s in %s'],
            'model.time.month_*': [ null, 'all'],
            'model.time.month_1': [ null, 'January'],
            'model.time.month_2': [ null, 'February'],
            'model.time.month_3': [ null, 'March'],
            'model.time.month_4': [ null, 'April'],
            'model.time.month_5': [ null, 'May'],
            'model.time.month_6': [ null, 'June'],
            'model.time.month_7': [ null, 'July'],
            'model.time.month_8': [ null, 'August'],
            'model.time.month_9': [ null, 'September'],
            'model.time.month_10': [ null, 'October'],
            'model.time.month_11': [ null, 'November'],
            'model.time.month_12': [ null, 'December'],
            'model.time.dow_*': [ null, 'all'],
            'model.time.dow_0': [ null, 'Sunday'],
            'model.time.dow_1': [ null, 'Monday'],
            'model.time.dow_2': [ null, 'Tuesday'],
            'model.time.dow_3': [ null, 'Wednesday'],
            'model.time.dow_4': [ null, 'Thursday'],
            'model.time.dow_5': [ null, 'Friday'],
            'model.time.dow_6': [ null, 'Saturday'],

            'model.sync.description.m': [ null, 'minutes'],
            'model.sync.description.h': [ null, 'hours'],
            'model.sync.description.day': [ null, 'day of month'],
            'model.sync.description.mon': [ null, 'month'],
            'model.sync.description.dow': [ null, 'day of week'],

            'model.sync.descriptor.description': [ null, 'Task description'],

            'model.cron.undefined': [ null, 'no schedule'],
            'model.cron.everyday': [ null, 'every day'],
            'model.cron.everyday_of_month': [ null, 'every day'],
            'model.cron.every4day': [ null, 'every'],
            'model.cron.every4minute': [ null, 'every minute', 'every %s minutes'],
            'model.cron.every4hour': [ null, 'every hour', 'every %s hours'],
            'model.cron.day': [ null, 'day', 'days'],
            'model.cron.dow_1': [ null, 'Monday'],
            'model.cron.dow_2': [ null, 'Tuesday'],
            'model.cron.dow_3': [ null, 'Wednesday'],
            'model.cron.dow_4': [ null, 'Thursday'],
            'model.cron.dow_5': [ null, 'Friday'],
            'model.cron.dow_6': [ null, 'Saturday'],
            'model.cron.dow_7': [ null, 'Sunday'],
            'model.cron.dow_0': [ null, 'Sunday'],
            'model.cron.dow_from_1': [ null, 'from Monday'],
            'model.cron.dow_from_2': [ null, 'from Tuesday'],
            'model.cron.dow_from_3': [ null, 'from Wednesday'],
            'model.cron.dow_from_4': [ null, 'from Thursday'],
            'model.cron.dow_from_5': [ null, 'from Friday'],
            'model.cron.dow_from_6': [ null, 'from Saturday'],
            'model.cron.dow_from_7': [ null, 'from Sunday'],
            'model.cron.dow_from_0': [ null, 'from Sunday'],
            'model.cron.dow_to_1': [ null, 'to Monday'],
            'model.cron.dow_to_2': [ null, 'to Tuesday'],
            'model.cron.dow_to_3': [ null, 'to Wednesday'],
            'model.cron.dow_to_4': [ null, 'to Thursday'],
            'model.cron.dow_to_5': [ null, 'to Friday'],
            'model.cron.dow_to_6': [ null, 'to Saturday'],
            'model.cron.dow_to_7': [ null, 'to Sunday'],
            'model.cron.dow_to_0': [ null, 'to Sunday'],
            'model.cron.month_*': [ null, 'month'],
            'model.cron.month_1': [ null, 'January'],
            'model.cron.month_2': [ null, 'February'],
            'model.cron.month_3': [ null, 'March'],
            'model.cron.month_4': [ null, 'April'],
            'model.cron.month_5': [ null, 'May'],
            'model.cron.month_6': [ null, 'June'],
            'model.cron.month_7': [ null, 'July'],
            'model.cron.month_8': [ null, 'August'],
            'model.cron.month_9': [ null, 'September'],
            'model.cron.month_10': [ null, 'October'],
            'model.cron.month_11': [ null, 'November'],
            'model.cron.month_12': [ null, 'December'],
            'model.cron.and': [ null, ' and '],
            'model.cron.dow_prefix': [ null, 'если это '],
            'model.cron.or': [ null, ' or '],
            'model.cron.at': [ null, 'at '],
            'model.cron.at_minute': [ null, ':%s'],
            'model.cron.range': [ null, 'с %s to %s'],
            'model.cron.range_minute': [ null, 'from :%s to :%s'],
            'model.cron.range_hour': [ null, '%s:%s-%s:%s'],
            'model.cron.interval': [ null, 'during'],
            'model.cron.step': [ null, 'each day', 'each %s days'],
            'model.cron.error.empty': [ null, 'empty values not allowed'],
            'model.cron.error.manyslashes': [ null, 'redundant "/"'],
            'model.cron.error.stepNaN': [ null, 'not a number'],
            'model.cron.error.startNaN': [ null, 'start of range is not a number'],
            'model.cron.error.stopNaN': [ null, 'end of range is not a number'],
            'model.cron.error.tooSmall': [ null, 'too small value'],
            'model.cron.error.tooBig': [ null, 'too big value'],

            'view.main.description': [ null, 'Task "%s"'],
            'view.main.cron': [ null, 'Scheadule'],

            'view.sync.edit.cron_enabled': [ null, 'Scheduled run'],
            'view.sync.edit.editcron': [ null, 'Edit schedule'],
            'view.sync.edit.on': [ null, 'ON'],
            'view.sync.edit.off': [ null, 'OFF'],
            
            'view.sync.button.run': [ null, 'Run'],
            'view.sync.button.stop': [ null, 'Cancel'],
            'view.sync.button.cancel': [ null, 'Cancel'],
            'view.sync.button.close': [ null, 'Close'],
            'view.sync.button.save': [ null, 'Save'],
            'view.sync.button.delete': [ null, 'delete'],
            'view.sync.delete.title': [ null, 'Delete groups'],
            'view.sync.delete.confirm': [ null, 'Are you sure you want to delete this synchronization source?']

        }

    };

    return en;
});