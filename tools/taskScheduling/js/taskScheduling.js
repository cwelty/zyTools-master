function TaskScheduling() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        this.useAccessible = false;
        if (options && options.useAccessible) {
            this.useAccessible = options.useAccessible;
        }

        /*
            |expectedAnswer has two properties:
                * |tasks| is a list of expected tasks
                * |pattern| is the expected pattern
        */
        this.expectedAnswer = {
            tasks:   [],
            pattern: ''
        };

        this.taskTypes = [ 'A', 'B', 'C' ];

        var self = this;
        this.taskTypeClasses = [];
        this.taskTypes.forEach(function(taskType, index) {
            self.taskTypeClasses.push('type-' + index);
        });

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['taskScheduling']();

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         4,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.enableInteractiveElements();
            },
            reset: function() {
                self.makeLevel(0);
                self.disableInteractiveElements();
            },
            next: function(currentQuestion) {
                if (!self.userDidNotSupplyATask) {
                    self.makeLevel(currentQuestion);
                }
                self.enableInteractiveElements();
            },
            isCorrect: function(currentQuestion) {
                self.disableInteractiveElements();

                var userAnswerTaskTypes = self.getUserAnswerAsArrayOfTaskTypes();

                var isCorrect = true;
                // User's answers must match the expected pattern, but in any order.
                if (self.expectedAnswer.patternInAnyOrder) {
                    isCorrect = self.userAnswerMatchesExpectedPatternInAnyOrder(userAnswerTaskTypes);

                    // A task type should not be ordered twice in a row.
                    if (currentQuestion === 3) {
                        var sameTaskTwiceInARow = self.sameTaskTypeTwiceInARowInTaskOrder(userAnswerTaskTypes);
                        isCorrect = isCorrect && !sameTaskTwiceInARow;
                    }
                }
                // User's answers must match the expected pattern exactly.
                else {
                    isCorrect = self.userAnswerMatchesExpectedPattern(userAnswerTaskTypes);
                }

                self.userDidNotSupplyATask = self.didUserDidNotSupplyATask(userAnswerTaskTypes);

                if (self.userDidNotSupplyATask) {
                    explanationMessage = 'Fill in the missing task(s).';
                }
                else {
                    if (isCorrect) {
                        explanationMessage = 'Correct.';
                    }
                    else {
                        if (self.expectedAnswer.patternInAnyOrder) {
                            explanationMessage = 'One possible order: ' + self.expectedAnswer.pattern;
                        }
                        else {
                            explanationMessage = 'Expected order: ' + self.expectedAnswer.pattern;
                        }
                    }
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         JSON.stringify(userAnswerTaskTypes),
                    expectedAnswer:     JSON.stringify(self.expectedAnswer.tasks),
                    isCorrect:          isCorrect
                };
            }
        });

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$instructions = $thisTool.find('.instructions');
        this.$taskBanksContainer = $thisTool.find('.task-banks-container');
        this.$taskOrderContainer = $thisTool.find('.task-order-container');

        // Initialize equation
        this.makeLevel(0);
        this.disableInteractiveElements();
    };

    /*
        Return the user's task order as an array of task types. Ex: ['A', 'A', 'C', 'B']
    */
    this.getUserAnswerAsArrayOfTaskTypes = function() {
        var userAnswer = [];
        if (this.useAccessible) {
            this.$dropdowns.each(function() {
                var $dropdown = $(this);
                var usersTaskType = $dropdown.find('option:selected').val();
                userAnswer.push(usersTaskType);
            });
        }
        else {
            this.$taskLocations.each(function(index) {
                var $taskLocation = $(this);
                var usersTaskType = $taskLocation.find('.task').attr('type');

                // An empty string means the user didn't supply a task
                if (!usersTaskType) {
                    usersTaskType = '';
                }

                userAnswer.push(usersTaskType);
            });
        }

        return userAnswer;
    };

    /*
        Return whether the user did not supply a task in the task order.
        |userAnswerTaskTypes| is required and an array of strings.
    */
    this.didUserDidNotSupplyATask = function(userAnswerTaskTypes) {
        var userDidNotSupplyATask = false;
        var self = this;
        userAnswerTaskTypes.forEach(function(usersTaskType) {
            // An empty string means the user didn't supply a task
            if (usersTaskType === '') {
                userDidNotSupplyATask = true;
            }
        });

        return userDidNotSupplyATask;
    };

    /*
        Return whether the user's task order matches the expected task order.
        |userAnswerTaskTypes| is required and an array of strings.
    */
    this.userAnswerMatchesExpectedPattern = function(userAnswerTaskTypes) {
        var ordersMatch = true;
        var self = this;
        userAnswerTaskTypes.forEach(function(userTaskType, index) {
            var expectedTaskType = self.expectedAnswer.tasks[index];
            if (userTaskType !== expectedTaskType) {
                ordersMatch = false;
            }
        });

        return ordersMatch;
    };

    /*
        Return whether the number of tasks the user's task order contains matches the expected number of each task.
        |userAnswerTaskTypes| is required and an array of strings.
    */
    this.userAnswerMatchesExpectedPatternInAnyOrder = function(userAnswerTaskTypes) {
        var sortedUserAnswers = $.extend(true, [], userAnswerTaskTypes);
        sortedUserAnswers.sort();

        var sortedExpectedAnswers = $.extend(true, [], this.expectedAnswer.tasks);
        sortedExpectedAnswers.sort();

        // Compare that the sorted user and sorted expected answers match exactly.
        var userAnswerMatchesExpectedPatternInAnyOrder = true;
        sortedUserAnswers.forEach(function(userAnswer, index) {
            var expectedAnswer = sortedExpectedAnswers[index];

            if (userAnswer !== expectedAnswer) {
                userAnswerMatchesExpectedPatternInAnyOrder = false;
            }
        });

        return userAnswerMatchesExpectedPatternInAnyOrder;
    };

    /*
        Return whether a task type was ordered twice in a row in the task order.
        |userAnswerTaskTypes| is required and an array of strings.
    */
    this.sameTaskTypeTwiceInARowInTaskOrder = function(userAnswerTaskTypes) {
        var sameTaskTwiceInARow = false;
        var previousTaskType = '';
        userAnswerTaskTypes.forEach(function(userTaskType) {
            if (previousTaskType === userTaskType) {
                sameTaskTwiceInARow = true;
            }

            previousTaskType = userTaskType;
        });

        return sameTaskTwiceInARow;
    };

    // Enable all interactive elements.
    this.enableInteractiveElements = function() {
        this.$taskBanksContainer.removeClass('disable');
        this.$taskOrderContainer.removeClass('disable');

        if (this.useAccessible) {
            this.$dropdowns.attr('disabled', false);
        }
        else {
            this.$taskLocations.sortable('enable');
            this.$taskBanks.sortable('enable');
        }
    };

    // Disable all interactive elements.
    this.disableInteractiveElements = function() {
        this.$taskBanksContainer.addClass('disable');
        this.$taskOrderContainer.addClass('disable');

        if (this.useAccessible) {
            this.$dropdowns.attr('disabled', true);
        }
        else {
            this.$taskLocations.sortable('disable');
            this.$taskBanks.sortable('disable');
        }
    };

    this.resetTaskLocationClasses = function($taskLocation) {
        $taskLocation.removeClass('highlight-task');
        this.taskTypeClasses.forEach(function(taskTypeClass) {
            $taskLocation.removeClass(taskTypeClass);
        });
    };

    /*
        Reset CSS on |$task| and reset |$taskLocation|.
        |$task| and |$taskLocation| are required and jQuery objects.
    */
    this.handleTaskLocationHavingTask = function($task, $taskLocation) {
        $task.css({
            left:      '',
            position:  '',
            top:       '',
            'z-index': '',
        });

        $taskLocation.find('span').hide();
        this.resetTaskLocationClasses($taskLocation);
        $taskLocation.removeClass('task');
    };

    /*
        Enable the top-most task in |$taskBank|. Disable the others.
        |$taskBank| is required and a jQuery object.
    */
    this.setNextEnabledTask = function($taskBank) {
        var $tasks = $taskBank.find('.task:not(.empty-bank)');
        if ($tasks.length) {
            var numberOfTasksSupported = 3;

            // Remove order-0 through order-2.
            for (var i = 0; i < numberOfTasksSupported; i++) {
                $tasks.removeClass('order-' + i);
            }

            // Order tasks in reverse, starting with task-2, ending with task-0.
            jQuery.fn.reverse = [].reverse;
            $tasks.reverse().each(function(index, task) {
                $(task).addClass('order-' + (numberOfTasksSupported - index - 1));
            });
            $tasks.reverse();

            // Enable only the top-most task.
            $tasks.addClass('disable');
            $tasks.eq(0).removeClass('disable');
        }
    };

    /*
        Add the type class on |$task| to |$taskLocation|.
        |$taskLocation| and |$task| are required and jQuery objects.
    */
    this.addClassType = function($taskLocation, $task) {
        this.taskTypeClasses.forEach(function(taskTypeClass) {
            if ($task.hasClass(taskTypeClass)) {
                $taskLocation.addClass(taskTypeClass);
            }
        });
    };

    // Initialize the sortable behavior for |$taskBanks| and |$taskLocations|.
    this.initializeSortable = function() {
        var self = this;

        // A task in a task bank can be dragged to an open task location.
        this.$taskBanks.sortable({
            connectWith: '.receivable',
            items:       '.task:not(.disable):not(.empty-bank)',
            placeholder: 'empty-placeholder',
            over: function(event, ui) {
                self.$taskLocations.each(function() {
                    self.resetTaskLocationClasses($(this));
                });
            },
            receive: function(event, ui) {
                var $taskBank = $(event.target);
                self.setNextEnabledTask($taskBank);
            },
            remove: function(event, ui) {
                var $taskBank = $(event.target);
                self.setNextEnabledTask($taskBank);
            }
        });

        /*
            Empty task locations are marked with "receivable".
            Once a task location has a task, "receivable" is removed.
        */
        this.$taskLocations.addClass('receivable');
        this.$taskLocations.sortable({
            cancel:      'empty-task',
            items:       '.task',
            placeholder: 'empty-placeholder',
            start: function(event, ui) {
                var $taskLocation = $(event.target);
                $taskLocation.find('span').show();
                $taskLocation.addClass('highlight-task').addClass('task');
            },
            over: function(event, ui) {
                // Unhighlight currently highlighted task locations.
                self.$taskLocations.removeClass('highlight-task');

                // Highlight the newest hovered over task location.
                var $taskLocation = $(event.target);
                $taskLocation.addClass('highlight-task');

                self.addClassType($taskLocation, ui.item);
            },
            receive: function(event, ui) {
                var $taskLocation = $(event.target);
                self.handleTaskLocationHavingTask(ui.item, $taskLocation);

                // Disconnect this |$taskLocation| from receiving new $tasks.
                $taskLocation.removeClass('receivable');

                // Allow |$taskLocation| to only send tasks to the task bank that sent the task.
                $taskLocation.sortable('option', 'connectWith', ui.sender);
            },
            remove: function(event, ui) {
                var $taskLocation = $(event.target);
                $taskLocation.addClass('receivable');
            },
            beforeStop: function(event, ui) {
                var $taskLocation = $(event.target);
                var $tasksInTaskLocation = $taskLocation.find('.task');

                // If the task location has a task, then update visually.
                if ($tasksInTaskLocation.length) {
                    self.handleTaskLocationHavingTask(ui.item, $taskLocation);
                }
            }
        });
    };

    /*
        Set the number of tasks in each task bank given |numberOfEachTaskType|, and enable the top-most task in each task bank.
        |numberOfEachTaskType| is required and a number.
    */
    this.initializeTaskBanks = function(numberOfEachTaskType) {
        var maxNumberOfTasksPerBank = 3;
        var self = this;
        this.$taskBanks.each(function() {
            var $taskBank = $(this);
            var $tasks = $taskBank.find('.task:not(.empty-bank)');

            // Remove |maxNumberOfTasksPerBank| - |numberOfEachTaskType| tasks from each task bank.
            for (var i = 0; i < (maxNumberOfTasksPerBank - numberOfEachTaskType); i++) {
                $tasks.eq(i).remove();
            }

            // Enable top-most task in task bank.
            self.setNextEnabledTask($taskBank);
        });
    };

    /*
        Display an equation given the |currentQuestionNumber|
        |currentQuestionNumber| is an integer
    */
    this.makeLevel = function(currentQuestionNumber) {
        // Make a deep copy of the |taskTypes|.
        var orderOfTasksToShowUser = $.extend(true, [], this.taskTypes);
        this.utilities.shuffleArray(orderOfTasksToShowUser);

        var indicesOfTaskToHide = [];
        var instructions = '';
        var patternInAnyOrder = false;
        var numberOfEachTaskType = 3;

        // Task order should include 6 tasks in which each task type is represented once.
        if (currentQuestionNumber === 0) {
            instructions = 'Add the missing task using the pattern shown.';

            numberOfEachTaskType = 2;

            // Duplicate |orderOfTasksToShowUser|.
            orderOfTasksToShowUser = orderOfTasksToShowUser.concat(orderOfTasksToShowUser);

            // Pick a task to remove from the order.
            indicesOfTaskToHide = [ this.utilities.pickNumberInRange(0, orderOfTasksToShowUser.length - 1) ];
        }
        // Task order should include 4 tasks in which one task type is a duplicate.
        else if ((currentQuestionNumber === 1) || (currentQuestionNumber === 2) || (currentQuestionNumber === 3)) {
            var taskTypeToDouble = this.utilities.pickElementFromArray(orderOfTasksToShowUser);
            var taskTypesNotToDouble = [];
            orderOfTasksToShowUser.forEach(function(task) {
                if (task !== taskTypeToDouble) {
                    taskTypesNotToDouble.push(task);
                }
            });

            instructions = 'Add the missing task(s). ' + taskTypeToDouble + ' should run twice as often as ' + taskTypesNotToDouble[0] + ' and ' + taskTypesNotToDouble[1] + '.';

            // Add duplicate task between the first and second tasks, or between second and third tasks.
            var indexToInsertAt = this.utilities.flipCoin() ? 1 : 2;
            orderOfTasksToShowUser.splice(indexToInsertAt, 0, taskTypeToDouble);

            // |currentQuestionNumber| of 3 does not allow a task to run twice in a row.
            if (currentQuestionNumber === 3) {
                instructions += this.utilities.getNewline() + 'The same task should not run consecutively.';

                // Prevent two tasks in a row being the same.
                previousTask = '';
                orderOfTasksToShowUser.forEach(function(task, index) {
                    // Two tasks in row are the same.
                    if (task === previousTask) {
                        // First two tasks are the same, swap the first and second tasks.
                        if (index === 1) {
                            var tmp = orderOfTasksToShowUser[index];
                            orderOfTasksToShowUser[index] = orderOfTasksToShowUser[index + 1];
                            orderOfTasksToShowUser[index + 1] = tmp;
                        }
                        // Otherwise, swap the previous and previousx2 tasks.
                        else {
                            var tmp = orderOfTasksToShowUser[index - 1];
                            orderOfTasksToShowUser[index - 1] = orderOfTasksToShowUser[index - 2];
                            orderOfTasksToShowUser[index - 2] = tmp;
                        }
                    }
                    previousTask = orderOfTasksToShowUser[index];
                });
            }

            // Hide only the inserted task and show 2 task per task bank.
            if (currentQuestionNumber === 1) {
                indicesOfTaskToHide = [ indexToInsertAt ];
                numberOfEachTaskType = 2;
            }
            // Hide all tasks and tasks can be in any order.
            else {
                patternInAnyOrder = true;

                indicesOfTaskToHide = [];
                orderOfTasksToShowUser.forEach(function(task, index) {
                    indicesOfTaskToHide.push(index);
                });
            }
        }

        this.$instructions.html(instructions);

        // Build the task order, including which task locations should be pre-populated.
        var taskOrder = [];
        orderOfTasksToShowUser.forEach(function(task, index) {
            var newTask = {};
            if (indicesOfTaskToHide.indexOf(index) !== -1) {
                newTask.isTaskLocation = true;
            }
            else {
                newTask.taskType = task;
                newTask.isTaskLocation = false;
            }
            taskOrder.push(newTask);
        });

        // Get the expected order of tasks.
        var expectedAnswerTasks = [];
        indicesOfTaskToHide.forEach(function(indexOfTaskToHide) {
            expectedAnswerTasks.push(orderOfTasksToShowUser[indexOfTaskToHide]);
        });

        // Convert the order of tasks to string, which is the expected pattern.
        var stringifyTaskOrder = '';
        orderOfTasksToShowUser.forEach(function(task, index) {
            stringifyTaskOrder += task;
            if (index < (orderOfTasksToShowUser.length - 1)) {
                stringifyTaskOrder += ', ';
            }
        });

        this.expectedAnswer = {
            tasks:             expectedAnswerTasks,
            pattern:           stringifyTaskOrder,
            patternInAnyOrder: patternInAnyOrder
        };

        var taskOrderTemplateToUse = this.useAccessible ? 'accessibleTaskOrder' : 'taskOrder';
        var taskOrderHTML = this[this.name][taskOrderTemplateToUse]({
            taskOrder: taskOrder,
            taskTypes: this.taskTypes
        });
        this.$taskOrderContainer.html(taskOrderHTML);

        if (this.useAccessible) {
            this.$dropdowns = $('#' + this.id + ' select');
        }
        else {
            var taskBanksHTML = this[this.name]['taskBanks']({
                taskTypes: this.taskTypes
            });
            this.$taskBanksContainer.html(taskBanksHTML);

            this.$taskLocations = $('#' + this.id + ' .task-location');
            this.$taskBanks = $('#' + this.id + ' .task-bank');

            this.initializeTaskBanks(numberOfEachTaskType);
            this.initializeSortable();
        }
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var taskSchedulingExport = {
    create: function() {
        return new TaskScheduling();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = taskSchedulingExport;
