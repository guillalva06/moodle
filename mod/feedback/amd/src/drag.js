/**
 * Created by galvarez on 2/21/18.
 */
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Edit items in feedback module
 *
 * @module     mod_feedback/edit
 * @package    mod_feedback
 * @copyright  2018 Guillermo Alvarez
 */
define(['jquery', 'core/ajax', 'core/templates'], function($, ajax, templates) {

    return {

        init: function(cmid) {

            var CSS = {
                DRAGAREA: '#feedback_dragarea',
                DRAGITEMCLASS: 'feedback_itemlist',
                DRAGITEM: 'div.feedback_itemlist',
                DRAGLIST: '#feedback_dragarea form',
                DRAGHANDLE: 'itemhandle'
            };

            var oldContainerId = null;
            var cont = 0;

            /**
             * Saves the new order of questions via ajax.
             * @param {int} cmid
             * @param {string} itemorder
             * @param {node} spinner
             */
            var saveItems = function(cmid, itemorder, spinner) {
                spinner.show();

                var promise = ajax.call([{
                    methodname: 'mod_feedback_update_questions_order',
                    args: {
                        cmid: cmid,
                        itemorder: itemorder
                    }
                }]);

                promise[0].done(function() {
                    spinner.hide();
                }).fail(function() {
                    spinner.hide();
                });
            };

            /**
             * Returns the numeric id from the dom id of an item.
             *
             * @param {string} id The dom id, f.g.: feedback_item_22
             * @return {int}
             */
            var getNodeId = function(id) {
                return Number(id.replace(/^.*feedback_item_/i, ''));
            };

            /**
             * Creates an icon to drag the questions.
             * @param {string} classname
             * @param {string} title
             * @returns {*|jQuery|HTMLElement}
             */
            var createDragHandler = function(classname, title) {
                var handler = $('<span></span>');
                handler.addClass(classname);
                handler.attr('title', title);
                handler.attr('tabIndex', 0);
                handler.attr('role', 'button');
                handler.attr('draggable', true);
                templates.renderPix('i/move_2d', 'core').then(function(html) {
                        handler.append(html);
                        return true;
                    }
                ).fail();

                handler.on();

                return handler;
            };

            var listItems = $(CSS.DRAGITEM);

            // Set all this elements draggable and define the events handlers.
            listItems.each(function() {

                $(this).attr('id', 'mod_feedback' + cont++);

                var handlertitle = M.util.get_string('move_item', 'feedback');

                var handler = createDragHandler(CSS.DRAGHANDLE, handlertitle);

                $(this).append(handler);

                /**
                 * Enable or disable mouse events for drag elements children
                 * @param {string} val
                 */
                var setPointerEvents = function(val) {
                    $(CSS.DRAGITEM).find('div').css('pointer-events', val);
                };

                /**
                 * Swap the content of two questions.
                 * @param {string} newContainerId
                 */
                var swapContainers = function(newContainerId) {
                    if (newContainerId !== oldContainerId) {
                        var newContainer = $('#' + newContainerId);
                        var oldContainer = $('#' + oldContainerId);
                        var oldContent = newContainer.html();
                        newContainer.html(oldContainer.html());
                        oldContainer.html(oldContent);
                        oldContainerId = newContainerId;
                    }
                };

                $(this).attr('draggable', true);

                // Event when the drag starts.
                $(this).on('dragstart', function() {
                    setPointerEvents('none');
                    oldContainerId = $(this).attr('id');
                });

                $(this).on('dragover', function(e) {
                    // We need this line to allow drop.
                    e.preventDefault();
                    return false;
                });

                $(this).on('dragenter', function() {
                    $(this).addClass('drag_item_active');
                    swapContainers($(this).attr('id'));

                });

                $(this).on('dragleave', function() {
                    $(this).removeClass('drag_item_active');
                });

                $(this).on('drop', function() {
                    $(this).removeClass('drag_item_active');
                    setPointerEvents('auto');
                    var elementsIds = [];
                    // Get children ids nodes.
                    $('.felement [id^="feedback_item_"]').each(function() {
                        elementsIds.push(getNodeId($(this).attr('id')));
                    });
                    var spinner = $('<img>').attr('src', M.util.image_url('i/loading_small', 'moodle'));
                    $(this).append(spinner);
                    saveItems(cmid, elementsIds.toString(), spinner);
                });

            });
        }
    };

});
