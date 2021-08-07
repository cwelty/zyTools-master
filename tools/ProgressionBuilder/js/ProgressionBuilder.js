'use strict';

/* global InspectorController,
          CaptionController,
          ExportImportController,
          QuestionAreaController,
          ExplanationsController,
          ObjectListController,
          RibbonController,
          LevelsController,
          makeNewElement,
          findSelectedQuestionAndLevel,
          addNewLevelWithOneQuestions,
          defaultProgression,
          buildProgressionBuilderElementControllerPrototype,
          buildElementTextControllerPrototype,
          buildElementImageControllerPrototype,
          buildElementDropdownControllerPrototype,
          buildInspectorControllerConstants,
          buildElementShortAnswerControllerPrototype,
          buildElementTableControllerPrototype,
          buildElementCheckboxControllerPrototype,
          makeElementName,
          fromZyToolToXML,
          fromXMLToZyTool,
          ZyTool,
          ace,
          duplicateElementVariants,
          NewProgressionModalController,
          Sk */

/**
    Build progression activities via graphical interface.
    @module ProgressionBuilder
*/
class ProgressionBuilder {

    /**
        Initialize constants.
        @constructor
    */
    constructor() {

        <%= grunt.file.read(hbs_output) %>

        /**
            The name of the module.
            @property _name
            @private
            @type String
        */
        this._name = '<%= grunt.option("tool") %>';

        /**
            Dictionary of templates for this module.
            @property _templates
            @private
            @type Object
        */
        this._templates = this[this._name];

        /**
            The id assigned to this module.
            @property _id
            @private
            @type String
            @default ''
        */
        this._id = '';

        /**
            Reference to the parent of this module.
            @property _parentResource
            @private
            @type Object
            @default null
        */
        this._parentResource = null;

        /**
            Reference to ProgressionUtilities module.
            @property _progressionUtilities
            @private
            @type Object
            @default null
        */
        this._progressionUtilities = null;

        /**
            The next ID to be given to an element. Increment after giving ID.
            @property _nextElementID
            @private
            @type Number
            @default 0
        */
        this._nextElementID = 0;

        /**
            Array of {ProgressionController} that control parts of the builder.
            @property _controllers
            @private
            @type Array
            @default []
        */
        this._controllers = [];

        /**
            List of undoable actions.
            @property _undoList
            @private
            @type Array
            @default []
        */
        this._undoList = [];

        /**
            List of redoable actions.
            @property _redoList
            @private
            @type Array
            @default []
        */
        this._redoList = [];

        /**
            The properties of the zyTool, such as GUID and caption.
            @property _zyTool
            @private
            @type ZyTool
            @default null
        */
        this._zyTool = null;

        /**
            jQuery reference to the code editor.
            @property $codeEditor
            @private
            @type {Object}
            @default null
        */
        this.$codeEditor = null;
    }

    /**
        Render and initialize a progression builder.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @return {void}
    */
    init(id, parentResource) {

        // Build prototypes that were delayed while waiting for dependencies to be loaded.
        buildProgressionBuilderElementControllerPrototype();
        buildElementTextControllerPrototype();
        buildElementImageControllerPrototype();
        buildElementDropdownControllerPrototype();
        buildElementShortAnswerControllerPrototype();
        buildElementTableControllerPrototype();
        buildElementCheckboxControllerPrototype();
        buildInspectorControllerConstants();

        this._id = id;
        this._parentResource = parentResource;

        // Add ProgressionUtilities templates.
        this._progressionUtilities = require('ProgressionUtilities').create();
        $.extend(this._templates, this._progressionUtilities.templates);

        const css = `<style><%= grunt.file.read(css_filename) %></style>${this._progressionUtilities.css}`;
        const backWhiteImageURL = parentResource.getResourceURL('backWhite.png', this._name);
        const html = this._templates.ProgressionBuilder({ id, backWhiteImageURL }); // eslint-disable-line new-cap

        $(`#${id}`).html(css + html);

        this._initializeCodeExpandables();

        const lastSave = parentResource.getLocalStore('lastSave');

        if (lastSave) {
            this._zyTool = fromXMLToZyTool(lastSave);
        }
        else {
            this._createNewProgression();
        }

        this._initializeControllers();

        this._takeSnapshot();

        this._makeDOMReferenceFromClassName('back-to-builder').click(() => {
            this._switchToBuilder();
        });

        this._makeDOMReferenceFromClassName('back-to-code').click(() => {
            this._switchToCodeEditorFromPlayer();
        });

        this._initializeSegmentedController();

        this._switchToBuilder();
    }

    /**
        Initialize the expandable elements in the code editor page.
        @method _initializeCodeExpandables
        @private
        @return {void}
    */
    _initializeCodeExpandables() {
        const $expandableListElements = $(`#${this._id} div.title-container`);

        $expandableListElements.click(event => {
            let $target = $(event.target);

            // Target should be the title container.
            while (!$target.is('div')) {
                $target = $target.parent();
            }
            $target.parent().find('.expandable-content').toggle();

            const $icon = $target.find('i');
            const setArrowIcon = $icon.text() === 'keyboard_arrow_down' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

            $icon.text(setArrowIcon);
        });
    }

    /**
        Initialize the segmented controller used for switching between the object list and the inspector.
        @method _initializeSegmentedController
        @private
        @return {void}
    */
    _initializeSegmentedController() {
        this._showInspector();
        this._makeDOMReferenceFromClassName('segmented-control-inspector').click(() => {
            this._showInspector();
        });
        this._makeDOMReferenceFromClassName('segmented-control-object-list').click(() => {
            this._showObjectList();
        });
    }

    /**
        Show the inspector; hide the object list.
        @method _showInspector
        @private
        @return {void}
    */
    _showInspector() {
        this._makeDOMReferenceFromClassName('inspector-container').show();
        this._makeDOMReferenceFromClassName('segmented-control-inspector').addClass('highlighted');
        this._makeDOMReferenceFromClassName('object-list-container').hide();
        this._makeDOMReferenceFromClassName('segmented-control-object-list').removeClass('highlighted');
    }

    /**
        Show the object list; hide the inspector.
        @method _showObjectList
        @private
        @return {void}
    */
    _showObjectList() {
        this._makeDOMReferenceFromClassName('inspector-container').hide();
        this._makeDOMReferenceFromClassName('segmented-control-inspector').removeClass('highlighted');
        this._makeDOMReferenceFromClassName('object-list-container').show();
        this._makeDOMReferenceFromClassName('segmented-control-object-list').addClass('highlighted');
    }

    /**
        Cache the given snapshot.
        @method _cacheLastSave
        @private
        @param {String} lastSave The last save.
        @return {void}
    */
    _cacheLastSave(lastSave) {
        this._parentResource.setLocalStore('lastSave', lastSave);
    }

    /**
        Record current state of progression.
        @method _takeSnapshot
        @return {void}
    */
    _takeSnapshot() {
        fromZyToolToXML(this._zyTool).then(snapshot => {

            // Save if the undo list is empty or if the last save is not the same as this snapshot.
            if (!this._undoList.length || (snapshot !== this._undoList[this._undoList.length - 1])) {
                this._undoList.push(snapshot);
                this._cacheLastSave(snapshot);

                this._redoList.length = 0;

                const maxUndoSize = 1000;

                if (this._undoList.length > maxUndoSize) {
                    this._undoList.shift();
                }
            }
        });
    }

    /**
        Load the last {ZyTool} in the undo list.
        @method _loadLastZyToolInUndoList
        @private
        @return {void}
    */
    _loadLastZyToolInUndoList() {
        const snapshot = this._undoList[this._undoList.length - 1];
        const zyTool = fromXMLToZyTool(snapshot);

        this._cacheLastSave(snapshot);
        this._updateZyTool(zyTool);
    }

    /**
        Undo the progression.
        @method _undoProgression
        @private
        @return {void}
    */
    _undoProgression() {
        if (this._undoList.length > 1) {
            this._redoList.push(this._undoList.pop());
            this._loadLastZyToolInUndoList();
        }
        else {
            alert('No more to undo.'); // eslint-disable-line no-alert
        }
    }

    /**
        Redo the progression.
        @method _redoProgression
        @private
        @return {void}
    */
    _redoProgression() {
        if (this._redoList.length) {
            this._undoList.push(this._redoList.pop());
            this._loadLastZyToolInUndoList();
        }
        else {
            alert('No more to redo.'); // eslint-disable-line no-alert
        }
    }

    /**
        Switch to the progression player.
        @method _switchToPlayer
        @private
        @return {void}
    */
    _switchToPlayer() {
        $(window).off('beforeunload');
        this._disableArrowKeyMovement();
        this._makeDOMReferenceFromClassName('progression-builder-container').hide();
        this._makeDOMReferenceFromClassName('progression-player-container').show();
        this._makeDOMReferenceFromClassName('code-container').hide();

        const playerID = `player-${this._id}`;
        const options = {
            inBuilderMode: true,
            progression: this._zyTool.progression.toJSON(),
        };

        try {
            require('ProgressionPlayer').create().init(playerID, this._parentResource, options);
        }
        catch (error) {
            this._switchToBuilder();
        }
    }

    /**
        Switch to the player from the code editor.
        @method _switchToPlayerFromCodeEditor
        @param {Object} editedObject The progression, level, or question whose code is being edited.
        @param {String} editor The editor with the code.
        @return {void}
    */
    _switchToPlayerFromCodeEditor(editedObject, editor) {
        const progressionToPlay = this._zyTool.progression.clone();
        const editedLevel = this._zyTool.progression.levels.find(level => level === editedObject);
        const editedQuestion = this._zyTool.progression.levels.map(level => level.questions)
                                                              .flat()
                                                              .find(question => question === editedObject);
        let jumpToLevelIndex = 0;
        let objectForCode = progressionToPlay;

        if (editedLevel) {
            jumpToLevelIndex = this._zyTool.progression.levels.indexOf(editedLevel);
            objectForCode = progressionToPlay.levels[jumpToLevelIndex];
        }
        else if (editedQuestion) {
            const questionsLevel = this._zyTool.progression.levels.find(level => level.questions.includes(editedQuestion));

            jumpToLevelIndex = this._zyTool.progression.levels.indexOf(questionsLevel);

            const questionsIndex = this._zyTool.progression.levels[jumpToLevelIndex].questions.indexOf(editedQuestion);

            objectForCode = progressionToPlay.levels[jumpToLevelIndex].questions[questionsIndex];
        }

        objectForCode.code = editor.getValue();

        const playerID = `player-${this._id}`;
        const options = {
            inBuilderMode: true,
            progression: progressionToPlay,
        };

        const player = require('ProgressionPlayer').create();
        let noError = true;

        try {
            player.init(playerID, this._parentResource, options);
        }
        catch (error) {

            // An error in implementer's Python code.
            if (Sk.builtin.Exception.prototype.isPrototypeOf(error)) {

                // Put focus back on code.
                editor.focus();

                noError = false;
            }
            else {
                throw error;
            }
        }

        if (noError) {
            this.$codeEditor = $(editor.container).detach();
            this._makeDOMReferenceFromClassName('progression-player-container').show();
            this._makeDOMReferenceFromClassName('code-container').hide();

            // Default is index 0. Don't jump when index is 0 b/c re-randomizing can be slow if there are few permutations of questions.
            if (jumpToLevelIndex !== 0) {
                player.jumpToLevelIndex(jumpToLevelIndex);
            }
            player.focus();
        }
    }

    /**
        Switch to the code from the player.
        @method _switchToCodeEditorFromPlayer
        @return {void}
    */
    _switchToCodeEditorFromPlayer() {
        this._makeDOMReferenceFromClassName('code-editor-container').append(this.$codeEditor);
        this._makeDOMReferenceFromClassName('progression-player-container').hide();
        this._makeDOMReferenceFromClassName('code-container').show();
    }

    /**
        Switch to the progression builder.
        @method _switchToBuilder
        @private
        @return {void}
    */
    _switchToBuilder() {
        $(window).off('beforeunload');
        this._enableArrowKeyMovement();

        // Re-render the question area controller so LaTex rendering will go away.
        this._updateProgression(this._zyTool.progression);

        this._makeDOMReferenceFromClassName('progression-builder-container').show();
        this._makeDOMReferenceFromClassName('progression-player-container').hide();
        this._makeDOMReferenceFromClassName('code-container').hide();

        // These two buttons are in a hidden container, which is shown when the user switches to player.
        this._makeDOMReferenceFromClassName('back-to-builder').show();
        this._makeDOMReferenceFromClassName('back-to-code').hide();
    }

    /**
        Switch to the code editor.
        @method _switchToCodeEditor
        @private
        @param {String} editorLabel Label given to the editor.
        @param {Object} editedObject The progression, level, or question whose code is being edited.
        @return {void}
    */
    _switchToCodeEditor(editorLabel, editedObject) {
        $(window).on('beforeunload', () => '');
        this._disableArrowKeyMovement();

        this._makeDOMReferenceFromClassName('progression-builder-container').hide();
        this._makeDOMReferenceFromClassName('progression-player-container').hide();
        this._makeDOMReferenceFromClassName('code-container').show();

        // These two buttons are in a hidden container, which is shown when the user switches to player.
        this._makeDOMReferenceFromClassName('back-to-builder').hide();
        this._makeDOMReferenceFromClassName('back-to-code').show();

        // Set editor label
        this._makeDOMReferenceFromClassName('editor-label').text(editorLabel);

        // Create ace editor.
        const codeEditor = ace.edit(`editor-${this._id}`);

        // Configure ace editor.
        require('utilities').aceBaseSettings(codeEditor, 'python2');
        codeEditor.setValue(editedObject.code);
        codeEditor.moveCursorToPosition({
            column: 0,
            row: 0,
        });
        codeEditor.getSession().setUndoManager(new ace.UndoManager());

        const $closeEditor = this._makeDOMReferenceFromClassName('cancel-code-editor');
        const $saveAndCloseEditor = this._makeDOMReferenceFromClassName('save-and-close-code-editor');

        // Close the editor.
        $closeEditor.click(() => {
            const currentCode = codeEditor.getValue();
            const wasCodeModified = currentCode !== editedObject.code;

            if (wasCodeModified) {
                const title = 'Lose code changes?';
                const message = 'You have unsaved code changes.';
                const leftButton = {
                    label: 'Yes, lose code changes',
                    decoration: 'button-blue',
                    callback: () => {
                        this._closeCodeEditor(codeEditor);
                    },
                };
                const rightButton = {
                    label: 'No, do not lose code changes',
                    decoration: 'button-red',
                };

                this._parentResource.showModal(title, message, leftButton, rightButton);
            }
            else {
                this._closeCodeEditor(codeEditor);
            }
        });

        // Save, then close the editor.
        $saveAndCloseEditor.click(() => {
            editedObject.code = codeEditor.getValue();
            this._takeSnapshot();
            this._closeCodeEditor(codeEditor);
        });

        this._makeDOMReferenceFromClassName('run-player-from-code-editor').click(() => {
            this._switchToPlayerFromCodeEditor(editedObject, codeEditor);
        });
    }

    /**
        Closes the code editor, unbinds the callbacks and switches to the builder.
        @method _closeCodeEditor
        @private
        @param {ace} codeEditor The ace code editor to close.
        @return {void}
    */
    _closeCodeEditor(codeEditor) {
        codeEditor.renderer.freeze();
        codeEditor.destroy();
        this._makeDOMReferenceFromClassName('cancel-code-editor').unbind('click');
        this._makeDOMReferenceFromClassName('save-and-close-code-editor').unbind('click');
        this._makeDOMReferenceFromClassName('run-player-from-code-editor').unbind('click');
        this._switchToBuilder();
    }

    /**
        Begin a new progression.
        @method _beginNewProgression
        @private
        @return {void}
    */
    _beginNewProgression() {
        const modal = new NewProgressionModalController(this._parentResource, this._templates);

        modal.show(this._zyTool.progression)
             .then(newProgression => {
                 this._zyTool = new ZyTool(require('utilities').generateGUID(), '', newProgression);
                 this._updateZyTool(this._zyTool);
                 this._takeSnapshot();
             });
    }

    /**
        Create a new progression.
        @method _createNewProgression
        @private
        @return {void}
    */
    _createNewProgression() {

        // Default progression has 1 level and that level has 1 question.
        const progression = this._progressionUtilities.createProgression(defaultProgression);

        addNewLevelWithOneQuestions(progression.levels);

        this._zyTool = new ZyTool(require('utilities').generateGUID(), '', progression);

        // Have first question of first level be selected.
        this._zyTool.progression.levels[0].questions[0].isSelected = true;
    }

    /**
        Initialize the controllers.
        @method _initializeControllers
        @private
        @return {void}
    */
    _initializeControllers() {

        // Functions to inform the ProgressionBuilder that the {Progression} has been updated.
        const progressionBuilderFunctions = {
            selectedLevel: level => {
                this._selectLevel(level);
                this._takeSnapshot();
            },
            selectedQuestion: question => {
                this._selectQuestion(question);
                this._takeSnapshot();
            },
            selectedElement: (element, toggleSelect = false) => {
                if (toggleSelect) {
                    this._toggleSelectElement(element);
                }
                else {
                    this._selectElement(element);
                }
                this._takeSnapshot();
            },
            selectedElements: elements => {
                this._selectElements(elements);
                this._takeSnapshot();
            },
            deselectAllElements: () => {
                this._deselectAll();
                this._selectionChanged();
            },
            addElement: type => {
                this._addElement(type);
            },
            updatedProgression: progression => {
                this._updateProgression(progression);
                this._takeSnapshot();
            },
            updatedQuestionAreaViaInspector: progression => {
                this._updateQuestionArea(progression);
                this._takeSnapshot();
            },
            updatedZyTool: zyTool => {
                this._updateZyTool(zyTool);
                this._takeSnapshot();
            },
            updateElement: element => {
                this._updateElement(element);
                this._takeSnapshot();
            },
            updateElements: elements => {
                this._updateElements(elements);
                this._takeSnapshot();
            },
            elementStyleUpdate: (element, stylesUpdated) => {
                this._elementStyleUpdate(element, stylesUpdated);
                this._takeSnapshot();
            },
            moveSelectedElementsBy: (left, top) => {
                this._moveSelectedElementsBy(left, top);
            },
            enableArrowKeyMovement: () => {
                this._enableArrowKeyMovement();
            },
            disableArrowKeyMovement: () => {
                this._disableArrowKeyMovement();
            },
            levelUpdated: level => {
                this._levelUpdated(level);
                this._takeSnapshot();
            },
            duplicateElement: element => {
                this._duplicateElements([ element ]);
                this._takeSnapshot();
            },
            duplicateSelected: () => {
                const elementsToDuplicate = this._zyTool.progression.elements.filter(element => element.isSelected);

                this._duplicateElements(elementsToDuplicate);
                this._takeSnapshot();
            },
            deleteElement: element => {
                this._deleteElements([ element ]);
                this._takeSnapshot();
            },
            deleteSelected: () => {
                const elementsToDelete = this._zyTool.progression.elements.filter(element => element.isSelected);

                this._deleteElements(elementsToDelete);
                this._takeSnapshot();
            },
            takeSnapshot: () => {
                this._takeSnapshot();
            },
            undoProgression: () => {
                this._undoProgression();
            },
            redoProgression: () => {
                this._redoProgression();
            },
            switchToPlayer: () => {
                this._switchToPlayer();
            },
            switchToCodeEditor: (editorLabel, question) => {
                this._switchToCodeEditor(editorLabel, question);
            },
            beginNewProgression: () => {
                this._beginNewProgression();
            },
        };

        // The controllers to initialize.
        const controllerInfo = [
            {
                className: 'caption-container',
                ClassConstructor: CaptionController,
            },
            {
                className: 'levels-container',
                ClassConstructor: LevelsController,
            },
            {
                className: 'ribbon',
                ClassConstructor: RibbonController,
            },
            {
                className: 'object-list-container',
                ClassConstructor: ObjectListController,
            },
            {
                className: 'explanation-container',
                ClassConstructor: ExplanationsController,
            },
            {
                className: 'question-area-container',
                ClassConstructor: QuestionAreaController,
            },
            {
                className: 'export-import-container',
                ClassConstructor: ExportImportController,
            },
            {
                className: 'inspector-container',
                ClassConstructor: InspectorController,
            },
        ];

        this._controllers = controllerInfo.map(info =>
            new info.ClassConstructor(
                this._zyTool,
                this._makeDOMReferenceFromClassName(info.className),
                this._templates,
                progressionBuilderFunctions,
                this._parentResource
            )
        );
    }

    /**
        Return the DOM reference to the given class name.
        @method _makeDOMReferenceFromClassName
        @private
        @param {String} className The name of the class to reference.
        @return {Object} The DOM reference as a jQuery object.
    */
    _makeDOMReferenceFromClassName(className) {
        return $(`#${this._id} .${className}`);
    }

    /**
        Add an element of the given type to the progression.
        @method _addElement
        @private
        @param {String} elementType The type of element to add.
        @return {void}
    */
    _addElement(elementType) {
        const newElement = makeNewElement(elementType, this._nextElementID, this._zyTool.progression);

        this._nextElementID++;

        // Start element in edit mode.
        newElement.isInEditMode = true;

        // Add new element to list of elements.
        this._zyTool.progression.elements.unshift(newElement);

        // Add new element's id to the selected level.
        const result = findSelectedQuestionAndLevel(this._zyTool.progression.levels);
        const selectedLevel = result.selectedLevel;

        selectedLevel.usedElements.push(newElement.id);

        this._controllers.forEach(controller => {
            controller.elementAdded();
        });

        this._selectElement(newElement);
    }

    /**
        Duplicate the given elements.
        @method _duplicateElements
        @private
        @param {Array} elementsToDuplicate List of Element objects to be duplicated.
        @return {void}
    */
    _duplicateElements(elementsToDuplicate) {
        const duplicates = elementsToDuplicate.reverse().map(elementToDuplicate => {
            const newElement = elementToDuplicate.clone();
            const newID = this._nextElementID;

            this._nextElementID++;

            // Given new element an ID.
            newElement.id = String(newID);

            // Given new element a name.
            newElement.name = makeElementName(newID, newElement.type);

            // Offset new element top and left.
            const offsetValue = 8;

            newElement.style.left = `${parseFloat(newElement.style.left) + offsetValue}px`;
            newElement.style.top = `${parseFloat(newElement.style.top) + offsetValue}px`;

            // Add new element to list of elements.
            this._zyTool.progression.elements.unshift(newElement);

            // Add new element to same levels as element being duplicated.
            this._zyTool.progression.levels.filter(level => level.usedElements.indexOf(elementToDuplicate.id) !== -1)
                .forEach(level => {
                    level.usedElements.push(newElement.id);
                });

            // Duplicate across all levels and questions.
            this._zyTool.progression.levels.forEach(level => {
                duplicateElementVariants(level.elementVariants, elementToDuplicate.id, newElement.id);

                level.questions.forEach(question => {
                    duplicateElementVariants(question.elementVariants, elementToDuplicate.id, newElement.id);
                });
            });

            this._controllers.forEach(controller => {
                controller.elementAdded();
            });

            return newElement;
        });

        this._deselectAll();
        this._selectElements(duplicates);
    }

    /**
        Delete the given element from the entire progression.
        @method _deleteElements
        @private
        @param {Array} elementsToDelete List of elements to delete.
        @return {void}
    */
    _deleteElements(elementsToDelete) {
        const objectPlurality = elementsToDelete.length > 1 ? 'objects' : 'object';
        const title = `Delete ${objectPlurality}?`;
        const objectNames = elementsToDelete.reverse().map(element => element.name).join('<br>');
        const message = `The next ${objectPlurality} will be removed from every level, then deleted:<br>
                         ${objectNames}<br>
                         Note: Use level checkboxes to remove from a specific level.`;
        const leftButton = {
            label: `Yes, remove ${objectPlurality}`,
            callback: () => {
                elementsToDelete.forEach(elementToDelete => {

                    // Remove element from list of elements.
                    const indexToDelete = this._zyTool.progression.elements.indexOf(elementToDelete);

                    this._zyTool.progression.elements.splice(indexToDelete, 1);

                    // Remove element from levels and questions.
                    this._zyTool.progression.levels.forEach(level => {

                        // Remove element from level's usedElements list.
                        level.usedElements = level.usedElements.filter(usedElement => usedElement !== elementToDelete.id);

                        // Remove element from level variants.
                        level.elementVariants = level.elementVariants.filter(variant => variant.id !== elementToDelete.id);

                        // Remove element from question variants.
                        level.questions.forEach(question => {
                            question.elementVariants = question.elementVariants.filter(variant => variant.id !== elementToDelete.id);
                        });
                    });
                });

                this._controllers.forEach(controller => {
                    controller.updatedElements();
                });
            },
        };
        const rightButton = {
            label: `No, do not remove ${objectPlurality}`,
        };

        this._parentResource.showModal(title, message, leftButton, rightButton);
    }

    /**
        Update the builder to select and show the first question of |selectedLevel|.
        @method _selectLevel
        @private
        @param {Level} selectedLevel The selected level.
        @return {void}
    */
    _selectLevel(selectedLevel) {
        this._selectQuestion(selectedLevel.questions[0]);
    }

    /**
        Update the builder to show for the selected question.
        @method _selectQuestion
        @private
        @param {Question} selectedQuestion The selected question.
        @return {void}
    */
    _selectQuestion(selectedQuestion) {

        // Deselected all questions, then select |selectedQuestion|.
        this._zyTool.progression.levels.forEach(level => {
            level.isSelected = false;
            level.questions.forEach(question => {
                question.isSelected = false;
            });
        });
        selectedQuestion.isSelected = true;

        const selectedLevel = this._zyTool.progression.levels.find(level => level.questions.includes(selectedQuestion));

        selectedLevel.isSelected = true;

        this._controllers.forEach(controller => {
            controller.updateQuestionSelected();
        });
    }

    /**
        Toggles the isSelected property of the element.
        @method _toggleSelectElement
        @param {Element} element The element to toggle selection.
        @return {void}
    */
    _toggleSelectElement(element) {
        element.isSelected = !element.isSelected;
        this._selectionChanged();
    }

    /**
        Update the builder with the selected element.
        @method _selectElement
        @private
        @param {Element} elementSelected Element that was just selected.
        @return {void}
    */
    _selectElement(elementSelected) {

        // Deselected all elements, then select |elementSelected|.
        this._deselectAll();
        this._selectElements([ elementSelected ]);
    }

    /**
        Update the builder with multiple selected elements.
        @method _selectElements
        @private
        @param {Array} elementsToSelect Array of {Element}, the elements that were just selected.
        @return {void}
    */
    _selectElements(elementsToSelect) {
        elementsToSelect.forEach(element => {
            element.isSelected = true;
        });
        this._selectionChanged();
    }

    /**
        Deselects all the progression elements.
        @method _deselectAll
        @private
        @return {void}
    */
    _deselectAll() {
        this._zyTool.progression.elements.forEach(element => {
            element.isSelected = false;
        });
    }

    /**
        Set |_nextElementID| to the largest ID in |this._zyTool.progression|.
        @method _setNextElementIDToLargestIDInProgression
        @private
        @return {void}
    */
    _setNextElementIDToLargestIDInProgression() {

        // Update |_nextElementID| to be 1 larger than the largest element id.
        let largestElementID = -1;

        this._zyTool.progression.elements.forEach(element => {
            const elementID = parseInt(element.id, 10);

            if (elementID > largestElementID) {
                largestElementID = elementID;
            }
        });
        this._nextElementID = largestElementID + 1;
    }

    /**
        Update the progression model in each controller, then re-render.
        @method _updateProgression
        @private
        @param {Progression} progression The new progression model.
        @return {void}
    */
    _updateProgression(progression) {
        this._zyTool.progression = progression;
        this._setNextElementIDToLargestIDInProgression();

        this._controllers.forEach(controller => {
            controller.updateProgression(progression);
        });
    }

    /**
        Update the question area.
        @method _updateQuestionArea
        @private
        @param {Progression} progression The new progression model.
        @return {void}
    */
    _updateQuestionArea(progression) {
        this._zyTool.progression = progression;

        /* Updating the question area's height/width from the inspector. So call |updateProgression| on all controllers except for InspectorController.
           If we updated InspectorController it would rerender and we'd lose focus on the input that caused the change, which is very annoying. */
        this._controllers.filter(controller => !(controller instanceof InspectorController))
            .forEach(controller => controller.updateProgression(progression));
    }

    /**
        Update the ZyTool model.
        @method _updateZyTool
        @private
        @param {ZyTool} zyTool The updated zyTool.
        @return {void}
    */
    _updateZyTool(zyTool) {
        this._zyTool = zyTool;
        this._setNextElementIDToLargestIDInProgression();

        this._controllers.forEach(controller => {
            controller.updateZyTool(zyTool);
        });
    }

    /**
        Propagate that an element has been updated.
        @method _updateElement
        @private
        @param {Element} element The updated element.
        @return {void}
    */
    _updateElement(element) {
        this._controllers.forEach(controller => {
            controller.updatedElement(element);
        });
    }

    /**
        Update the {Elements} in |_progression|.
        @method _updateElements
        @private
        @param {Array} elements The updated elements.
        @return {void}
    */
    _updateElements(elements) {
        this._zyTool.progression.elements = elements;
        this._controllers.forEach(controller => {
            controller.updatedElements();
        });
    }

    /**
        Inform the controllers which element's style and which styles were just updated.
        @method _elementStyleUpdate
        @private
        @param {Element} element The element that just had a style update.
        @param {Array} stylesUpdated List of names of styles that were updated.
        @return {void}
    */
    _elementStyleUpdate(element, stylesUpdated) {
        this._controllers.forEach(controller => {
            controller.elementStyleUpdate(element, stylesUpdated);
        });
    }

    /**
        Ensure value between 0 and |maxValue|.
        @method _ensureValueBetweenZeroAndPassed
        @private
        @param {Integer} intendedValue The inteded value.
        @param {Integer} maxValue The maximum value allowed.
        @return {Number} The value if it's between 0 and |maxValue|, 0 if it's less than 0, or |maxValue| if it's greater than |maxValue|.
    */
    _ensureValueBetweenZeroAndPassed(intendedValue, maxValue) {
        return Math.round(Math.max(Math.min(intendedValue, maxValue), 0));
    }

    /**
        Moves the selected elements |left| pixels in the x axis, and |top| pixels in the y axis.
        @method _moveSelectedElementsBy
        @private
        @param {Number} left The number of pixels to move in the x axis.
        @param {Number} top The number of pixels to move in the y axis.
        @return {void}
    */
    _moveSelectedElementsBy(left, top) {
        const selectedElements = this._zyTool.progression.elements.filter(element => element.isSelected);
        const progressionWidth = parseInt(this._zyTool.progression.width, 10);
        const progressionHeight = parseInt(this._zyTool.progression.height, 10);

        selectedElements.forEach(element => {
            const originalLeft = parseInt(element.style.left, 10);
            const originalTop = parseInt(element.style.top, 10);
            const movedLeft = originalLeft + left;
            const movedTop = originalTop + top;

            // Ensure the new position is never greater than the width/height or less than 0.
            const newLeft = this._ensureValueBetweenZeroAndPassed(movedLeft, progressionWidth);
            const newTop = this._ensureValueBetweenZeroAndPassed(movedTop, progressionHeight);

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
            this._elementStyleUpdate(element, [ 'left', 'top' ]);
        });
    }

    /**
        Enables the arrow key movement.
        @method _enableArrowKeyMovement
        @private
        @return {void}
    */
    _enableArrowKeyMovement() {
        $(window).off(`keydown.${this._id}`).on(`keydown.${this._id}`, event => {

            // If an element is focused, don't do anything.
            if ($(':focus').length) {
                return;
            }
            const questionAreaController = this._controllers.find(controller => controller instanceof QuestionAreaController);
            let position = {};

            switch (event.key) { // eslint-disable-line default-case
                case 'ArrowLeft':
                    position = questionAreaController.getPositionWithinBounds(-1, 0);
                    break;
                case 'ArrowUp':
                    position = questionAreaController.getPositionWithinBounds(0, -1);
                    break;
                case 'ArrowRight':
                    position = questionAreaController.getPositionWithinBounds(1, 0);
                    break;
                case 'ArrowDown':
                    position = questionAreaController.getPositionWithinBounds(0, 1);
                    break;
                default:
                    return;
            }
            this._moveSelectedElementsBy(position.left, position.top);
            event.preventDefault();
        });
    }

    /**
        Disables the arrow key object movement.
        @method _disableArrowKeyMovement
        @private
        @return {void}
    */
    _disableArrowKeyMovement() {
        $(window).off(`keydown.${this._id}`);
    }

    /**
        Updates the controllers with the new element selection.
        @method _selectionChanged
        @private
        @return {void}
    */
    _selectionChanged() {
        this._controllers.forEach(controller => {
            controller.updateElementSelected();
        });
    }

    /**
        Inform the controllers that |level| was updated.
        @method _levelUpdated
        @private
        @param {Level} level The level that was updated.
        @return {void}
    */
    _levelUpdated(level) {
        this._controllers.forEach(controller => {
            controller.levelUpdated(level);
        });
    }
}

const ProgressionBuilderExport = {
    create: function() {
        return new ProgressionBuilder();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {

        <%= grunt.file.read(tests) %>
    },
};

module.exports = ProgressionBuilderExport;
