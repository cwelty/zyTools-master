'use strict';

/* eslint-disable no-underscore-dangle */
/* global addNewLevelWithOneQuestions,
          addNewQuestion,
          ProgressionController,
          updateNamingOfQuestions,
          updateNamingOfLevels */

/**
    Control the levels.
    @class LevelsController
    @constructor
    @extends ProgressionController
*/
function LevelsController(...args) {
    ProgressionController.prototype.constructor.apply(this, args);
}

LevelsController.prototype = new ProgressionController();
LevelsController.prototype.contructor = LevelsController;

/**
    Render the levels and questions, then add listeners.
    @method render
    @return {void}
*/
LevelsController.prototype.render = function() {
    this._$dom.empty();

    const levelsHTML = this._templates.Levels({ // eslint-disable-line new-cap
        levels: this._makeLevelAndQuestionsLiteralArrays(),

        editCodeWhiteImageURL: this._parentResource.getResourceURL('editCodeWhite.png', 'ProgressionBuilder'),

        addWhiteImageURL: this._parentResource.getResourceURL('addWhite.png', 'ProgressionBuilder'),
        deleteWhiteImageURL: this._parentResource.getResourceURL('deleteWhite.png', 'ProgressionBuilder'),
        downArrowWhiteImageURL: this._parentResource.getResourceURL('downArrowWhite.png', 'ProgressionBuilder'),
        duplicateWhiteImageURL: this._parentResource.getResourceURL('duplicateWhite.png', 'ProgressionBuilder'),
        upArrowWhiteImageURL: this._parentResource.getResourceURL('upArrowWhite.png', 'ProgressionBuilder'),

        addBlueImageURL: this._parentResource.getResourceURL('addBlue.png', 'ProgressionBuilder'),
        deleteBlueImageURL: this._parentResource.getResourceURL('deleteBlue.png', 'ProgressionBuilder'),
        duplicateBlueImageURL: this._parentResource.getResourceURL('duplicateBlue.png', 'ProgressionBuilder'),
        editCodeBlueImageURL: this._parentResource.getResourceURL('editCodeBlue.png', 'ProgressionBuilder'),
    });

    this._$dom.html(levelsHTML);
    this._addListeners();
};

/**
    Convert |_progression.levels| into a literal array.
    Convert each |Level|'s |Questions| into a literal array.
    @method _makeLevelAndQuestionsLiteralArrays
    @private
    @return {Array} Levels as literal array
*/
LevelsController.prototype._makeLevelAndQuestionsLiteralArrays = function() {

    // Convert |_levels| to a literal array for use with handlebars' #each.
    const literalArrayLevels = this._progression.levels.slice();

    // Convert each question to a literal array.
    literalArrayLevels.forEach(level => {
        level.questions = level.questions.slice();
    });

    return literalArrayLevels;
};

/**
    Add listeners to add level and questions, and listeners for each question.
    @method _addListeners
    @private
    @return {void}
*/
LevelsController.prototype._addListeners = function() {
    this._$dom.find('.edit-global-code').click(() => {
        this._progressionChangingFunctions.switchToCodeEditor('Edit code: Global', this._progression);
    });

    this._$dom.find('.add-level-clickable-area').click(() => {
        const newLevel = addNewLevelWithOneQuestions(this._progression.levels);

        this._progressionChangingFunctions.selectedLevel(newLevel);
    });

    const $levels = this._$dom.find('.level');

    $levels.click(event => {
        const levelIndex = $levels.index(event.currentTarget);
        const clickedLevel = this._progression.levels[levelIndex];

        this._progressionChangingFunctions.selectedLevel(clickedLevel);
    });

    const $editLevelCodes = this._$dom.find('.edit-level-code');

    $editLevelCodes.click(event => {
        const levelIndex = $editLevelCodes.index(event.currentTarget);
        const clickedLevel = this._progression.levels[levelIndex];
        const editorLabel = `Edit code: ${clickedLevel.name}`;

        this._progressionChangingFunctions.switchToCodeEditor(editorLabel, clickedLevel);
    });


    const $addQuestionButtons = this._$dom.find('.add-question-clickable-area');

    $addQuestionButtons.click(event => {
        const levelIndex = $addQuestionButtons.index(event.currentTarget);
        const uncollapsedLevels = this._getUncollapsedLevels();
        const newQuestion = addNewQuestion(uncollapsedLevels[levelIndex].questions);

        this._progressionChangingFunctions.selectedQuestion(newQuestion);
    });

    const $questions = this._$dom.find('.question');

    $questions.click(event => {
        const questionIndex = $questions.index(event.currentTarget);
        const clickedQuestion = this._getClickedQuestion(questionIndex);

        this._progressionChangingFunctions.selectedQuestion(clickedQuestion);
    });

    const $duplicateQuestions = this._$dom.find('.duplicate-question');

    $duplicateQuestions.click(event => {
        const questionIndex = $duplicateQuestions.index(event.currentTarget);
        const clickedQuestion = this._getClickedQuestion(questionIndex);
        const newQuestion = clickedQuestion.clone();
        const levelOfQuestion = this._findLevelForGivenQuestion(clickedQuestion);

        levelOfQuestion.questions.push(newQuestion);

        updateNamingOfQuestions(levelOfQuestion.questions);

        this._progressionChangingFunctions.selectedQuestion(newQuestion);
    });

    const $deleteQuestions = this._$dom.find('.delete-question');

    $deleteQuestions.click(event => {
        const questionIndex = $deleteQuestions.index(event.currentTarget);
        const clickedQuestion = this._getClickedQuestion(questionIndex);
        const levelOfQuestion = this._findLevelForGivenQuestion(clickedQuestion);

        if (levelOfQuestion.questions.length === 1) {
            alert('Cannot remove the last question of a level.'); // eslint-disable-line no-alert
            return;
        }
        const indexInLevel = levelOfQuestion.questions.indexOf(clickedQuestion);

        levelOfQuestion.questions.splice(indexInLevel, 1);

        updateNamingOfQuestions(levelOfQuestion.questions);

        this._progressionChangingFunctions.levelUpdated(levelOfQuestion);
    });

    const $editQuestionCodes = this._$dom.find('.edit-code');

    $editQuestionCodes.click(event => {
        const questionIndex = $editQuestionCodes.index(event.currentTarget);
        const clickedQuestion = this._getClickedQuestion(questionIndex);
        const levelOfQuestion = this._findLevelForGivenQuestion(clickedQuestion);
        const editorLabel = `Edit code: ${levelOfQuestion.name}, ${clickedQuestion.name}`;

        this._progressionChangingFunctions.switchToCodeEditor(editorLabel, clickedQuestion);
    });

    const $collapsedLevels = this._$dom.find('.collapse-level');

    $collapsedLevels.click(event => {
        const levelIndex = $collapsedLevels.index(event.currentTarget);
        const levelClicked = this._progression.levels[levelIndex];

        levelClicked.isCollapsed = !levelClicked.isCollapsed;

        this.render();
        this._progressionChangingFunctions.takeSnapshot();
    });

    const $deleteLevels = this._$dom.find('.delete-level');

    $deleteLevels.click(event => {
        if (this._progression.levels.length === 1) {
            alert('Cannot remove the last level. Instead, create a new progression.'); // eslint-disable-line no-alert
            return;
        }
        const levelIndex = $deleteLevels.index(event.currentTarget);

        this._progression.levels.splice(levelIndex, 1);
        updateNamingOfLevels(this._progression.levels);
        this._progressionChangingFunctions.updatedProgression(this._progression);
    });

    const $duplicateLevels = this._$dom.find('.duplicate-level');

    $duplicateLevels.click(event => {
        const levelIndex = $duplicateLevels.index(event.currentTarget);
        const clickedLevel = this._progression.levels[levelIndex];
        const newLevel = clickedLevel.clone();

        this._progression.levels.push(newLevel);
        updateNamingOfLevels(this._progression.levels);
        this._progressionChangingFunctions.updatedProgression(this._progression);
    });

    this._$dom.sortable({
        items: '.level-container',
        stop: () => {
            const $levelContainers = this._$dom.find('.level-container');
            const $newLevelIndices = $levelContainers.map((index, levelContainer) => parseInt($(levelContainer).attr('level-index'), 10));
            const newLevelsOrder = $newLevelIndices.toArray().map(newLevelIndex => this._progression.levels[newLevelIndex]);

            this._progression.levels = newLevelsOrder;

            updateNamingOfLevels(this._progression.levels);

            this._progressionChangingFunctions.updatedProgression(this._progression);
        },
    });
};

/**
    Return the level that contains the given question.
    @method _findLevelForGivenQuestion
    @private
    @param {Question} question Find the level that this question is in.
    @return {Level} The question is in this level.
*/
LevelsController.prototype._findLevelForGivenQuestion = function(question) {
    return this._progression.levels.find(level => level.questions.indexOf(question) !== -1);
};

/**
    Return the question for the given clicked question index.
    @method _getClickedQuestion
    @param {Number} index The index of the clicked question.
    @return {Question} The clicked question.
*/
LevelsController.prototype._getClickedQuestion = function(index) {

    // Find clicked question by concatenating list of all questions to |questionObjects|.
    let questionObjects = [];

    this._getUncollapsedLevels().forEach(level => {
        questionObjects = questionObjects.concat(level.questions);
    });

    return questionObjects[index];
};

/**
    Return the uncollapsed levels.
    @method _getUncollapsedLevels
    @private
    @return {Array} of {Level}. The uncollapsed levels.
*/
LevelsController.prototype._getUncollapsedLevels = function() {
    return this._progression.levels.filter(level => !level.isCollapsed);
};

/**
    A question was selected, so re-render the levels.
    @method updateQuestionSelected
    @return {void}
*/
LevelsController.prototype.updateQuestionSelected = function() {
    this.render();
};

/**
    Notification that a {Level} was updated. Re-render.
    @method levelUpdated
    @return {void}
*/
LevelsController.prototype.levelUpdated = function() {
    this.render();
};
