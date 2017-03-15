/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(['require',
    'backbone',
    'hbs!tmpl/search/SearchLayoutView_tmpl',
    'collection/VTagList',
    'utils/Utils',
], function(require, Backbone, SearchLayoutViewTmpl, VTagList, Utils) {
    'use strict';

    var SearchLayoutView = Backbone.Marionette.LayoutView.extend(
        /** @lends SearchLayoutView */
        {
            _viewName: 'SearchLayoutView',

            template: SearchLayoutViewTmpl,

            /** Layout sub regions */
            regions: {},

            /** ui selector cache */
            ui: {
                searchInput: '[data-id="searchInput"]',
                searchType: 'input[name="queryType"]',
                searchBtn: '[data-id="searchBtn"]',
                clearSearch: '[data-id="clearSearch"]',
                typeLov: '[data-id="typeLOV"]',
                tagLov: '[data-id="tagLOV"]',
                refreshBtn: '[data-id="refreshBtn"]',
                advancedInfoBtn: '[data-id="advancedInfo"]',
            },
            /** ui events hash */
            events: function() {
                var events = {},
                    that = this;
                events["keyup " + this.ui.searchInput] = function(e) {
                    var code = e.which;
                    if (code == 13) {
                        that.findSearchResult();
                    }
                    this.checkForButtonVisiblity();
                };
                events["change " + this.ui.searchType] = 'dslFulltextToggle';
                events["click " + this.ui.searchBtn] = 'findSearchResult';
                events["click " + this.ui.clearSearch] = 'clearSearchData';
                events["change " + this.ui.typeLov] = 'checkForButtonVisiblity';
                events["change " + this.ui.tagLov] = 'checkForButtonVisiblity';
                events["click " + this.ui.refreshBtn] = 'onRefreshButton';
                events["click " + this.ui.advancedInfoBtn] = 'advancedInfo';
                return events;
            },
            /**
             * intialize a new SearchLayoutView Layout
             * @constructs
             */
            initialize: function(options) {
                _.extend(this, _.pick(options, 'globalVent', 'value'));
                this.typecollection = new VTagList([], {});
                this.tagCollection = new VTagList();
                this.type = "basic";
                this.asyncFetchCounter = 0;
                var param = Utils.getUrlState.getQueryParams();
                this.query = {
                    dsl: {
                        query: "",
                        type: ""
                    },
                    basic: {
                        query: "",
                        type: "",
                        tag: ""
                    }
                };
                this.dsl = false;
                if (param && param.searchType) {
                    _.extend(this.query[param.searchType], _.pick(param, 'query', 'type', 'tag'));
                }
                this.bindEvents();
            },
            bindEvents: function(param) {

                this.listenTo(this.typecollection, "reset", function(value) {
                    this.renderTypeList();
                    this.setValues();
                    this.ui.typeLov.select2({
                        placeholder: "Select",
                        allowClear: true
                    });
                }, this);
                this.listenTo(this.tagCollection, "reset", function() {
                    this.renderTagList();
                    this.setValues();
                    this.ui.tagLov.select2({
                        placeholder: "Select",
                        allowClear: true
                    });

                }, this);

            },
            checkForButtonVisiblity: function() {
                var that = this,
                    value = this.ui.searchInput.val() || this.ui.typeLov.val();
                if (!this.dsl && !value.length) {
                    value = this.ui.tagLov.val();
                }
                if (value && value.length) {
                    this.ui.searchBtn.removeAttr("disabled");
                    setTimeout(function() {
                        that.ui.searchInput.focus();
                    }, 0);
                } else {
                    this.ui.searchBtn.attr("disabled", "true");
                }
                if (this.asyncFetchCounter == 0) {
                    this.$('.fontLoader').hide();
                    this.$('.showHideElement').show();
                }
            },
            onRender: function() {
                // array of tags which is coming from url
                this.fetchCollection();
            },
            fetchCollection: function(value) {
                var that = this;
                this.$('.fontLoader').show();
                this.$('.showHideElement').hide();
                this.asyncFetchCounter = 2;
                $.extend(this.typecollection.queryParams, { type: 'CLASS' });
                this.typecollection.fetch({
                    reset: true,
                    complete: function() {
                        --that.asyncFetchCounter;
                        that.checkForButtonVisiblity();
                    }
                });
                $.extend(this.tagCollection.queryParams, { type: 'TRAIT', notsupertype: 'TaxonomyTerm' });
                this.tagCollection.fetch({
                    reset: true,
                    complete: function() {
                        --that.asyncFetchCounter;
                        that.checkForButtonVisiblity();
                    }
                });
            },

            onRefreshButton: function() {
                this.fetchCollection();
            },
            advancedInfo: function(e) {
                require([
                    'views/search/AdvancedSearchInfoView',
                    'modules/Modal'
                ], function(AdvancedSearchInfoView, Modal) {
                    var view = new AdvancedSearchInfoView();
                    var modal = new Modal({
                        title: 'Advanced Search Queries',
                        content: view,
                        okCloses: true,
                        showFooter: true,
                        allowCancel: false
                    }).open();
                    view.on('closeModal', function() {
                        modal.trigger('cancel');
                    });
                });
            },
            manualRender: function(paramObj) {
                this.setValues(paramObj);
            },
            renderTypeList: function() {
                var that = this;
                this.ui.typeLov.empty();
                var str = '<option></option>';
                this.typecollection.fullCollection.comparator = function(model) {
                    return model.get('tags').toLowerCase();
                }
                this.typecollection.fullCollection.sort().each(function(model) {
                    str += '<option>' + model.get("tags") + '</option>';
                });
                that.ui.typeLov.html(str);
            },
            renderTagList: function() {
                var that = this;
                this.ui.tagLov.empty();
                var str = '<option></option>';
                this.tagCollection.fullCollection.comparator = function(model) {
                    return model.get('tags').toLowerCase();
                }
                this.tagCollection.fullCollection.sort().each(function(model) {
                    str += '<option>' + model.get("tags") + '</option>';
                });
                that.ui.tagLov.html(str);
            },
            setValues: function(paramObj) {
                var arr = [],
                    that = this;
                if (paramObj) {
                    this.value = paramObj;
                }
                if (this.value) {
                    if (this.value.dslChecked == "true" && this.dsl == false) {
                        this.ui.searchType.prop("checked", true).trigger("change");
                    } else if (this.value.dslChecked == "false" && this.dsl == true) {
                        this.ui.searchType.prop("checked", false).trigger("change");
                    }
                    if (this.value.query !== undefined) {
                        // get only search value and append it to input box

                        if (this.ui.typeLov.data('select2')) {
                            this.ui.typeLov.val(this.value.type).trigger('change');
                        } else {
                            this.ui.typeLov.val(this.value.type);
                        }
                        if (!this.dsl) {
                            if (this.ui.tagLov.data('select2')) {
                                this.ui.tagLov.val(this.value.tag).trigger('change');
                            } else {
                                this.ui.tagLov.val(this.value.tag);
                            }
                        }
                        this.ui.searchInput.val(this.value.query);
                        setTimeout(function() {
                            that.ui.searchInput.focus();
                        }, 0);
                    }
                }
            },
            findSearchResult: function() {
                this.triggerSearch(this.ui.searchInput.val());
            },
            triggerSearch: function(value) {
                this.query[this.type].query = value;
                this.query[this.type].type = this.ui.typeLov.select2('val');
                if (!this.dsl) {
                    this.query[this.type].tag = this.ui.tagLov.select2('val');
                }
                Utils.setUrl({
                    url: '#!/search/searchResult',
                    urlParams: _.extend(this.query[this.type], {
                        searchType: this.type,
                        dslChecked: this.ui.searchType.is(':checked')
                    }),
                    updateTabState: function() {
                        return { searchUrl: this.url, stateChanged: true };
                    },
                    mergeBrowserUrl: false,
                    trigger: true
                });
            },
            dslFulltextToggle: function(e) {
                var paramQuery = "";
                if (e.currentTarget.checked) {
                    this.type = "dsl";
                    this.dsl = true;
                    this.$('.tagBox').hide();
                } else {
                    this.$('.tagBox').show();
                    this.dsl = false;
                    this.type = "basic";
                }
                if (Utils.getUrlState.getQueryParams() && this.query[this.type].query !== Utils.getUrlState.getQueryParams().query && this.type == Utils.getUrlState.getQueryParams().searchType) {
                    this.query[this.type].query = Utils.getUrlState.getQueryParams().query;
                }
                Utils.setUrl({
                    url: '#!/search/searchResult',
                    urlParams: _.extend(this.query[this.type], {
                        searchType: this.type,
                        dslChecked: this.ui.searchType.is(':checked')
                    }),
                    updateTabState: function() {
                        return { searchUrl: this.url, stateChanged: true };
                    },
                    mergeBrowserUrl: false,
                    trigger: true
                });
            },
            clearSearchData: function() {
                this.query[this.type].query = "";
                this.ui.typeLov.val("").trigger("change");
                this.ui.tagLov.val("").trigger("change");
                this.ui.searchInput.val("");
                this.checkForButtonVisiblity()
                Utils.setUrl({
                    url: '#!/search',
                    mergeBrowserUrl: false,
                    trigger: true
                });
            }
        });
    return SearchLayoutView;
});
