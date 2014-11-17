'use strict';

define(function(require) {
    var Jed = require('jed'),
        en = require('locale/en'),
        ru = require('locale/ru');

    var Languages = {
        DEFAULT_LANGUAGE: ru,
        LANGUAGES: [/*en,*/ ru],

        getLanguageNames: function () {
            return this.LANGUAGES.map(function (language) {
                return language.messages[''].lang;
            })
        },

        findLanguageByName: function (name) {
            var index = this.getLanguageNames().indexOf(name);
            if (index === -1) {
                return this.DEFAULT_LANGUAGE;
            } else {
                return this.LANGUAGES[index];
            }
        },

        guessUserLanguage: function () {
            var languageName = navigator.language || navigator.userLanguage;
            languageName = languageName.split('-').shift();
            return this.findLanguageByName(languageName);
        }
    };

    var i18n = new Jed({

        locale_data: Languages.guessUserLanguage()
        
    });

    i18n.capitalize = function (s) {
        if (s.length) {
            s = s.charAt(0).toUpperCase() + s.substr(1);
        }
        return s;
    };

    i18n.setLanguage = function (name) {
        i18n.options.locale_data = Languages.findLanguageByName(name);
    };

    i18n.t = function (text, count, options){
        var chain = i18n.translate(text);
        if (count) {
            chain.ifPlural(count);
        }
        return chain.fetch(options || count);
    };

    i18n.tc = function (text, count, options){
        return i18n.capitalize(i18n.t.apply(i18n, arguments));
    };
    
    i18n.helpers = {
        capitalize: i18n.capitalize,
        t: i18n.t,
        tc: i18n.tc
    };

    return i18n;
});
