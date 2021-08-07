function zyAnimator() {

    this.init = function(id, parentResource, options) {
        var html;
        var css;

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useHomePageBehavior = (options && options.useHomePageBehavior);

        css = '<style><%= grunt.file.read(css_filename) %></style>';
        html = this[this.name]['zyAnimator']({
            id,
            addLineImage:            this.parentResource.getResourceURL('addline.png', this.name), // David May 7/19/20 Line object image
            addBoxImage:             this.parentResource.getResourceURL('addbox.png', this.name),
            addTextImage:            this.parentResource.getResourceURL('addtext.png', this.name),
            addANDImage:             this.parentResource.getResourceURL('addAND.png', this.name),
            addORImage:              this.parentResource.getResourceURL('addOR.png', this.name),
            addXORImage:             this.parentResource.getResourceURL('addXOR.png', this.name),
            addTriangleImage:        this.parentResource.getResourceURL('addTriangle.png', this.name),
            addMoveImage:            this.parentResource.getResourceURL('addmove.png', this.name),
            addFadeImage:            this.parentResource.getResourceURL('addfade.png', this.name),
            addResizeImage:          this.parentResource.getResourceURL('addresize.png', this.name),
            addStepImage:            this.parentResource.getResourceURL('addscene.png', this.name),
            addRotateImage:          this.parentResource.getResourceURL('addRotate.png', this.name),
            addBackgroundColorImage: this.parentResource.getResourceURL('addBackgroundColor.png', this.name),
            addBorderColorImage:     this.parentResource.getResourceURL('addBorderColor.png', this.name),
            addFontColorImage:       this.parentResource.getResourceURL('addFontColor.png', this.name),
        });
        const $animation = $('#' + this.id);

        $animation.html(css + html);

        if (this.useHomePageBehavior) {
            $animation.addClass('home-page-styling');
        }

        var useLoadOnDemandBehavior = options && options.loadOnDemand;

        // If not |useLoadOnDemandBehavior|, then immediately load zyAnimator.
        if (!useLoadOnDemandBehavior) {
            this.loadZyAnimator(options);
        }
        // Otherwise, load the show animation button
        else {
            $('#' + this.id + ' .the-animation').hide();
            $('#' + this.id + ' .loading-message').hide();

            var self = this;
            $('#' + this.id + ' .load-zyanimator-on-demand-button').click(function() {
                $('#' + self.id + ' .loading-message').show();
                $('#' + self.id + ' .load-zyanimator-on-demand-button').hide();

                // Delay 100ms to give time for button to disappear and message to appear
                var delay = 100;
                setTimeout(function() {
                    self.loadZyAnimator(options);
                }, delay);
            });
        }
    };

    this.loadZyAnimator = function(options) {
        if (!options) {
            this.dependenciesLoadedNowStartzyAnimator();
        }
        else {
            this.dependenciesLoadedNowStartzyAnimator(options.canEdit, options.isEditorShown, options.animXMLToLoad);
        }

        $('#' + this.id + ' .load-zyanimator-on-demand-button').hide();
        $('#' + this.id + ' .loading-message').hide();
        $('#' + this.id + ' .the-animation').show();
    };

    this.dependenciesLoadedNowStartzyAnimator = function(canEdit, isEditorShown, animXMLToLoad) {

        var self = this;
        // const zyAnimatorVersion = '2.17.12.20'; David May commenting out for new release numbers
        const zyAnimatorVersion = '2.19.0.1';
        document.getElementById('version-number').innerHTML = 'Animation Builder, version ' + zyAnimatorVersion; // David May 8/3/20 Assign version number
        var instrExecTimeLength = 1000; // in ms
        var gridGranularity = 4; // in pixels

        // Rotation spinner values are limited to 4 characters to prevent overflow in the spinner.
        var maxRotationSpinnerDegree = 9999;
        var minRotationSpinnerDegree = -999;

        // Map color names here
        var BLACK_COLOR = 'zyAnimator-black';
        var GRAY_COLOR = 'zyAnimator-gray';
        var WHITE_COLOR = 'zyAnimator-white';
        var GREEN_COLOR = 'zyAnimator-green';
        var RED_COLOR = 'zyAnimator-red';
        var LIGHT_RED_COLOR = 'zyAnimator-light-red';
        var PURPLE_COLOR = 'zyAnimator-purple';
        var BROWN_COLOR = 'zyAnimator-brown';
        var BLUE_COLOR = 'zyAnimator-blue';
        var LIGHT_BLUE_COLOR = 'zyAnimator-light-blue';
        var ORANGE_COLOR = 'zyAnimator-orange';
        var LIGHT_ORANGE_COLOR = 'zyAnimator-light-orange';
        var YELLOW_COLOR = 'zyAnimator-yellow';

        // Map color rgb values here
        const utilities = require('utilities');
        const COLORS = {};

        COLORS[BLACK_COLOR] = utilities.zyAnimatorBlack;
        COLORS[GRAY_COLOR] = utilities.zyAnimatorGray;
        COLORS[WHITE_COLOR] = utilities.zyAnimatorWhite;
        COLORS[GREEN_COLOR] = utilities.zyAnimatorGreen;
        COLORS[RED_COLOR] = utilities.zyAnimatorRed;
        COLORS[BLUE_COLOR] = utilities.zyAnimatorBlue;
        COLORS[LIGHT_BLUE_COLOR] = utilities.zyAnimatorLightBlue;
        COLORS[ORANGE_COLOR] = utilities.zyAnimatorOrange;
        COLORS[LIGHT_ORANGE_COLOR] = utilities.zyAnimatorLightOrange;
        COLORS[YELLOW_COLOR] = utilities.zyAnimatorYellow;
        COLORS[PURPLE_COLOR] = utilities.zyAnimatorPurple;
        COLORS[BROWN_COLOR] = utilities.zyAnimatorBrown;

        // Name to RGB lookup table
        // Used in function setAnimationXML for css properties background-color, border-color, and text-color.
        var COLORS_NAME_TO_RGB = {};
        COLORS_NAME_TO_RGB[BLACK_COLOR] = COLORS[BLACK_COLOR];
        COLORS_NAME_TO_RGB[GRAY_COLOR] = COLORS[GRAY_COLOR];
        COLORS_NAME_TO_RGB[WHITE_COLOR] = COLORS[WHITE_COLOR];
        COLORS_NAME_TO_RGB[GREEN_COLOR] = COLORS[GREEN_COLOR];
        COLORS_NAME_TO_RGB[RED_COLOR] = COLORS[RED_COLOR];
        COLORS_NAME_TO_RGB[LIGHT_RED_COLOR] = COLORS[PURPLE_COLOR]; // Light-red replaced with purple in June 2016.
        COLORS_NAME_TO_RGB[BLUE_COLOR] = COLORS[BLUE_COLOR];
        COLORS_NAME_TO_RGB[LIGHT_BLUE_COLOR] = COLORS[LIGHT_BLUE_COLOR];
        COLORS_NAME_TO_RGB[ORANGE_COLOR] = COLORS[ORANGE_COLOR];
        COLORS_NAME_TO_RGB[LIGHT_ORANGE_COLOR] = COLORS[LIGHT_ORANGE_COLOR];
        COLORS_NAME_TO_RGB[YELLOW_COLOR] = COLORS[YELLOW_COLOR];
        COLORS_NAME_TO_RGB[PURPLE_COLOR] = COLORS[PURPLE_COLOR];
        COLORS_NAME_TO_RGB[BROWN_COLOR] = COLORS[BROWN_COLOR];

        // The old zyAnimator color scheme for background-color, border-color, and text-color.
        // Used during import to map old colors to new colors via the color |NAME|
        var OLD_RGB_TO_NEW_COLOR_NAME = {
            'rgb(0, 0, 0)' : BLACK_COLOR,
            'rgb(160, 160, 160)' : GRAY_COLOR,
            'rgb(255, 255, 255)' : WHITE_COLOR,
            'rgb(0, 159, 0)' : GREEN_COLOR,
            'rgb(176, 59, 196)' : RED_COLOR, // The RGB value here is a purple color from the old color scheme
            'rgb(70, 95, 255)' : BLUE_COLOR,
            'rgb(179, 213, 252)' : LIGHT_BLUE_COLOR,
            'rgb(255, 0, 0)' : PURPLE_COLOR, // Light-red replaced with purple in June 2016.
            'rgb(244, 126, 42)' : ORANGE_COLOR,
            'rgb(252, 246, 226)' : LIGHT_ORANGE_COLOR
        };

        var CSS_PROPERTIES_USED_BY_ALL_OBJECTS = [ 'top', 'left', 'opacity', 'border-radius', 'background-color' ];
        var DEFAULT_CSS_PROPERTIES_USED_BY_ALL_OBJECTS = { 'opacity': '1', 'border-radius': '0px', 'background-color': 'rgba(0, 0, 0, 0)' };

        var CSS_PROPERTIES_USED_BY_LINE_OBJECTS = [ 'height', 'width', 'border-width', 'border-style', 'border-color', 'background-color' ]
        var DEFAULT_CSS_PROPERTIES_USED_BY_LINE_OBJECTS = { 'height': '3px', 'width': '100px', 'border-width': '0px', 'border-style': 'solid', 'border-color': 'transparent', 'background-color': COLORS[BLACK_COLOR]}; // David May 7/19/20 Adding line object properties

        var CSS_PROPERTIES_USED_BY_BOX_OBJECTS = [ 'height', 'width', 'border-width', 'border-style', 'border-color' ];
        var DEFAULT_CSS_PROPERTIES_USED_BY_BOX_OBJECTS = { 'height': '20px', 'width': '100px', 'border-width': '2px', 'border-style': 'solid', 'border-color': COLORS[BLACK_COLOR] }; // David May 7/13/20 Changed default box color to black

        var DEFAULT_CSS_PROPERTIES_USED_BY_IMAGE_OBJECTS = {
            height: '165px',
            width:  '165px',
        };

        var COMIC_SANS_FONT = '\'Comic Sans MS\'';
        var ARIAL_FONT = 'arial, sans-serif';

        // Default properties are applied when an animation is loading.
        var CSS_PROPERTIES_USED_BY_TEXT_OBJECTS = [ 'color', 'font-size', 'font-style', 'font-weight', 'font-family', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 'text-align', 'border-width', 'border-style', 'border-color', 'white-space', 'line-height' ];
        var DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS = { 'color': COLORS[BLACK_COLOR], 'font-size': '14px', 'font-style': 'normal', 'font-weight': 'normal', 'font-family': COMIC_SANS_FONT,
                                             'padding-left': '2px', 'padding-right': '2px', 'padding-top': '2px', 'padding-bottom': '2px',
                                             'text-align': 'left', 'border-width': '0px', 'border-style': 'none', 'border-color': COLORS[BLACK_COLOR], 'white-space': 'pre', 'line-height': 'normal' };

        // Initial properties are applied to a new text object, when the user clicks "Add text object.
        var INITIAL_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS = jQuery.extend(true, {}, DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS);
        INITIAL_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['font-family'] = ARIAL_FONT;

        // Courier and Helvetica require a special line-height that is different from |DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS|.
        var SPECIAL_LINE_HEIGHT_VALUE = '120%';
        var SPECIAL_LINE_HEIGHTS = {
            courier:   SPECIAL_LINE_HEIGHT_VALUE,
            helvetica: SPECIAL_LINE_HEIGHT_VALUE
        };

        var CSS_PROPERTIES_USED_BY_GATE_OBJECTS = [ 'height', 'width', 'border-width', 'border-style', 'border-color' ];
        var DEFAULT_CSS_PROPERTIES_USED_BY_GATE_OBJECTS = { 'height': '50px', 'width': '60px', 'border-width': '2px', 'border-style': 'solid', 'border-color': COLORS[BLUE_COLOR] };

        var OBJECT_PROPERTIES = {
            box: {
                name: 'Box',
                type: 'box'
            },
            text: {
                name: 'Text',
                type: 'text'
            },
            image: {
                name: 'Image',
                type: 'image'
            },
            ANDgate: {
                name: 'AND gate',
                type: 'ANDgate'
            },
            ORgate: {
                name: 'OR gate',
                type: 'ORgate'
            },
            XORgate: {
                name: 'XOR gate',
                type: 'XORgate'
            },
            NOTgate: {
                name: 'NOT gate',
                type: 'NOTgate'
            },
            NANDgate: {
                name: 'NAND gate',
                type: 'NANDgate'
            },
            NORgate: {
                name: 'NOR gate',
                type: 'NORgate'
            },
            XNORgate: {
                name: 'XNOR gate',
                type: 'XNORgate'
            },
            triangle: {
                name: 'Triangle',
                type: 'triangle'
            }
        };

        $("#logic-gate-div").hide(); // David May 4/25/20 Hide logic gates initially
        $("#clearInstr").hide(); // David May 5/28/20 Hide "Clear all" button initially

        var INSTR_STEP_PLACEHOLDER_TEXT = 'Edit caption for this step';

        // Control the execution speed. 1 is normal speed, 0.5 is double speed.
        let executionSpeedFactor = 1;
        const $doubleSpeed = $(`#${self.id} label.speed-control`);
        const $doubleSpeedCheckbox = $doubleSpeed.find('input');

        // Toggle the speed control between double and normal speed.
        $doubleSpeedCheckbox.change(() => {
            if ($doubleSpeedCheckbox.is(':checked')) {
                executionSpeedFactor = 0.5;
            }
            else {
                executionSpeedFactor = 1;
            }

            // Force a re-rendering. iPhone optimizes away re-renderings, so the checkbox was not visually changing.
            $doubleSpeedCheckbox.hide();
            $doubleSpeedCheckbox.get(0).offsetHeight; // eslint-disable-line no-unused-expressions
            $doubleSpeedCheckbox.show();
            self.parentResource.postEvent({
                part: 0,
                complete: false,
                metadata: {
                    event: `2x speed clicked. Execution speed now: ${1 / executionSpeedFactor}`,
                },
            });
        });

        /*
            Return whether |objectType| is a gate object.
            |objectType| is required and a string.
        */
        function isObjectTypeGate(objectType) {
            var gateType = [
                OBJECT_PROPERTIES.ANDgate.type,
                OBJECT_PROPERTIES.ORgate.type,
                OBJECT_PROPERTIES.XORgate.type,
                OBJECT_PROPERTIES.NOTgate.type,
                OBJECT_PROPERTIES.NANDgate.type,
                OBJECT_PROPERTIES.NORgate.type,
                OBJECT_PROPERTIES.XNORgate.type
            ];
            return (gateType.indexOf(objectType) !== -1);
        }

        /*
            Return whether |objectType| is a box or image object.
            |objectType| is required and a string.
        */
        function isObjectBoxOrImage(objectType) {
            var boxAndImageType = [
                OBJECT_PROPERTIES.box.type,
                OBJECT_PROPERTIES.image.type
            ];
            return (boxAndImageType.indexOf(objectType) !== -1);
        }

        /*
            Return whether |objectType| is a box, image, or gate.
            |objectType| is required and a string.
        */
        function isObjectTypeBoxImageOrGate(objectType) {
            return (isObjectBoxOrImage(objectType) || isObjectTypeGate(objectType));
        }

        var zyAnimatorActive = false;
        var isAnimationPlaying = false;
        var numObjs = 0;
        var numInstrs = 0;
        var undoSnapshots = []; var undoSnapshots_maxSize = 5000000;
        var redoSnapshots = []; var redoSnapshots_maxSize = undoSnapshots_maxSize;
        var currSnapshot;
        var justHadTextEditting = false;

        var zyAnimationID = utilities.generateGUID();
        document.getElementById("GUID").value = zyAnimationID; // David May 3/25/20 updates displayed GUID
        var zyAnimationCaption = document.getElementById("caption").value; // David May 3/25/20 stores caption
        var zyAnimationLoadOnDemand = false;
        let zyAltDescription = '';

        // Update the instruction list's height based on the page size
        var pageBannerHeight = 50;
        var marginAboveZyAnimator = 43;
        var spaceAboveList = 65;
        function updateInstructionListHeight() {
            var spaceUnderInstructionList = 11;
            var heightOffset = pageBannerHeight + (2 * marginAboveZyAnimator) + spaceAboveList + spaceUnderInstructionList;
            var windowHeight = $(window).height();

            var minValueOfHeight = 518;
            var newHeight = Math.max(minValueOfHeight, windowHeight - heightOffset);
            $('#' + self.id + ' .instrList').css('height', newHeight);
        }

        // Update the object list's height based on the page size
        function updateObjectListHeight() {
            // Space under object list when largest inspector is shown (for text object).
            var spaceUnderObjectList = 403;
            var heightOffset = pageBannerHeight + (2 * marginAboveZyAnimator) + spaceAboveList + spaceUnderObjectList;
            var windowHeight = $(window).height();

            var minValueOfHeight = 529 - spaceUnderObjectList;
            var newHeight = Math.max(minValueOfHeight, windowHeight - heightOffset);
            $('#' + self.id + ' .objList').css('height', newHeight);
        }

        jQuery.fn.reverse = [].reverse; // jQuery plugin to .reverse() a jQuery object's order

        jQuery.fn.selectText = function() { // jQuery plugin to select the text of an object
            var doc = document;
            var element = this[0];
            var range;
            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(element);
                range.select();
            } else if (window.getSelection) {
                var selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        /*
            Transform |$stepObject| to given |degree|.
            |$stepObject| is required and a jQuery object.
            |degree| is required and a string.
        */
        function updateStepObjectTransform($stepObject, degree) {
            $stepObject.css('transform', 'rotate(' + degree + 'deg)');
            $stepObject.css('-webkit-transform', 'rotate(' + degree + 'deg)');
            $stepObject.css('-moz-transform', 'rotate(' + degree + 'deg)');
            $stepObject.css('-o-transform', 'rotate(' + degree + 'deg)');
            $stepObject.css('-ms-transform', 'rotate(' + degree + 'deg)');
        }

        /*
            Animate the rotation of an object.
            |angle| is required and a number. |angle| is in degrees.
            |duration| is optional and a number. |duration| is the number of milliseconds the rotation takes to execute.
            |easing| is optional and a string. |easing| indicates which easing function to use. See: http://api.jquery.com/animate/
            |complete| is optional and a function. |complete| is called when the animation is done.
            |delay| is optional and a number. |delay| is the number of milliseconds to wait before starting the animation.
            When using this plugin, be aware that obj.animateRotate() does not apply .animate() to obj, so obj.stop() won't stop the animation
            a better plugin would apply .animate() directly to obj, e.g. obj.animate()
            Modified animateRotate from: http://stackoverflow.com/questions/15191058/css-rotation-cross-browser-with-jquery-animate
        */
        $.fn.animateRotate = function(angle, duration, easing, complete, delay) {
            var args = $.speed(duration, easing, complete);
            var step = args.step;
            var startingDegrees = this.attr('transformDeg') === undefined ? 0 : parseInt(this.attr('transformDeg'));
            return this.each(function(i, e) {
                args.step = function(now) {
                    updateStepObjectTransform($(e), now);

                    if (step) return step.apply(this, arguments);
                };
                $({ deg: startingDegrees }).delay(delay).animate({ deg: angle }, args);
            });
        };

        function takeSnapshot() {
            var newSnapshot = getAnimationXML().xml;
            if (newSnapshot !== currSnapshot) { // don't take snapshot if previous snapshot is the same
                $('#animatorUndo_' + self.id).removeClass('ui-state-disabled');
                undoSnapshots.push(currSnapshot);
                redoSnapshots = [];
                $('#animatorRedo_' + self.id).addClass('ui-state-disabled');
                currSnapshot = newSnapshot;
                if (undoSnapshots.length > undoSnapshots_maxSize) {
                    undoSnapshots.shift();
                }

                self.parentResource.setLocalStore('animationXML', currSnapshot);
            }
        }

        function removeAllContentEditableObjs() {
            try {
                window.getSelection().removeAllRanges(); // AE 062814: This line occasionally causes an error in IE.
                                                         // The cause is more strict JS evaluation due to having loaded the JS via $getScript
            } catch (err) {
                // do nothing
            }

            var $objs = $('#canvas_' + self.id + ' .stepObjectGraphic[contenteditable=true]');
            $objs.each(function() {
                var $this = $(this);
                $this.draggable('enable');

                if ($this.attr('contenteditable')) {
                    if ($this.data('shouldChangeObjName')) {
                        $this.data('shouldChangeObjName', false);
                        var objNameToBe = $this.text().substr(0, 20);
                        if ((objNameToBe !== 'add text') && (objNameToBe !== '')) {
                            var $listItem = $('#listObject_' + self.id + '_' + $this.attr('objNum'));
                            $listItem.children('.labelText').text(objNameToBe);
                            $listItem.attr('objName', objNameToBe);

                            $('#instrContainer_' + self.id).find('.label').each(function() {
                                var $instr = $(this);
                                if ($instr.attr('objNum') === $listItem.attr('objNum')) {
                                    $('#instrObjName_' + self.id + '_' + $instr.attr('instrNum')).text($this.text());
                                }
                            });
                        }
                    }

                    // Store the text object's raw text.
                    if ($this.attr('objtype') === OBJECT_PROPERTIES.text.type) {
                        const text = escapeXml($this[0].innerText);

                        setTextOnTextObject(text, $this);
                        self.parentResource.latexChanged();
                    }
                }

                $this.attr('contenteditable', 'false');
                $this.off('keyup');

                var objNum = $this.attr('objNum');
                updateGraphicOutline(objNum, 'height', $this.css('height'));
                updateGraphicOutline(objNum, 'width', $this.css('width'));

                if ($this.data('title_tmp')) {
                    $this.attr('title', $this.data('title_tmp'));
                }
            });

            if ($objs.length > 0) {
                takeSnapshot();
            }
        }

        // Gets and sets an internal variable used for shift selecting list objects
        function listObjPivot(newPivotObject) {
            listObjPivot.pivotObject = listObjPivot.pivotObject === undefined ? null : listObjPivot.pivotObject;
            if (newPivotObject === undefined) {
                return listObjPivot.pivotObject;
            } else {
                listObjPivot.pivotObject = newPivotObject;
            }
        }

        function shiftSelectedIndices(newIndices) {
            shiftSelectedIndices.selectedIndices = shiftSelectedIndices.selectedIndices === undefined ? { start: 0, end: -1 } : shiftSelectedIndices.selectedIndices;
            if (newIndices === undefined) {
                return shiftSelectedIndices.selectedIndices;
            } else {
                shiftSelectedIndices.selectedIndices = newIndices;
            }
        }

        function deselectAllObjs() {
            $('#canvas_' + self.id + ' .stepObjectOutline').hide();
            $('#canvas_' + self.id + ' .stepObjectGraphic').attr('isSelected', 'false');
            $('#objList_' + self.id + ' .label').removeClass('labelSelected');
            $('#instrList_' + self.id + ' .labelSelected').addClass('labelSelectedButNotObjNum');

            // Remove blank options from text menu options in the inspector properties.
            // The blanks may appear when multiple objects are selected and the options
            // mismatch.
            var textOptionMenuProperties = {
                'objFontFamilyMenu' : 'font-family',
                'objTextAlignMenu' : 'text-align',
                'objItalicMenu' : 'font-style',
                'objBoldMenu' : 'font-weight' // David May 9/17/20 Adding for bold font style
            };
            for (var textOptionMenu in textOptionMenuProperties) {
                $('#' + textOptionMenu + '_' + self.id + ' option[value=""]').remove();
            }

            listObjPivot(null);
            hideInspector();
            removeAllContentEditableObjs();
        }

        function deselectObjByObjNum(objNum) {
            var $graphic;
            var $graphic_outline;

            $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            if ($graphic.length > 0) { // object must exist to deselect that object
                $graphic_outline = $('#stepObjectOutline_' + self.id + '_' + objNum);
                $graphic_outline.hide();
                $graphic.attr('isSelected', 'false');
                $('#listObject_' + self.id + '_' + objNum).removeClass('labelSelected');
                if (!$('#objList_' + self.id).find('.labelSelected').length) {
                    listObjPivot(null);
                    hideInspector();
                } else {
                    // Check if selected objects are text, box, or combo of both types of objects
                    var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                    var $selectedTextObjects = $('#objList_' + self.id + ' .labelSelected[objtype="' + OBJECT_PROPERTIES.text.type + '"]');
                    if ($selectedTextObjects.length > 0
                        && $selectedTextObjects.length === $selectedObjects.length) {

                        $('#boxSpecificInspector_' + self.id).hide();
                        $('#textSpecificInspector_' + self.id).show();
                        showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedTextObjects();
                    } else {
                        $('#boxSpecificInspector_' + self.id).show();
                        $('#textSpecificInspector_' + self.id).hide();
                    }
                    showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedObjects();
                }
            }
        }

        function loadInspector(objNum) { // load the specific object's initial values into the inspector
            var $initObj = $('#stepObjectInit_' + self.id + '_' + objNum);
            var $graphicObj = $('#stepObjectGraphic_' + self.id + '_' + objNum);

            $('#objOpacitySpinner_' + self.id).val(roundCSSProperty(parseFloat($initObj.css('opacity')) * 100, 0));
            $('#objBorderRadiusSpinner_' + self.id).val(roundCSSProperty($initObj.css('border-radius'), 0));
            $('#objRotationSpinner_' + self.id).val(roundCSSProperty($initObj.attr('transformDeg'), 0));
            $('#objTopPosSpinner_' + self.id).val(roundCSSProperty($initObj.css('top'), 0));
            $('#objLeftPosSpinner_' + self.id).val(roundCSSProperty($initObj.css('left'), 0));
            $('#constrain-proportions-' + self.id).prop('checked', !!$graphicObj.data('useConstrainedProportions'));

            var googleDriveFileID = $graphicObj.data('googleDriveFileID') || '';
            $('#google-drive-file-id-' + self.id).text(googleDriveFileID);

            $('#backgroundColorContainer_' + self.id).show();
            $('#boxSpecificInspector_' + self.id).show();
            $('#borderColorContainer_' + self.id).show();
            $('#borderRadiusContiner_' + self.id).show();
            $('#textSpecificInspector_' + self.id).show();
            $('#constrain-portions-container-' + self.id).show();
            $('#image-object-inspector-' + self.id).show();

            var objectType = $graphicObj.attr('objType');
            if (isObjectTypeBoxImageOrGate(objectType)) {
                $('#objHeightSpinner_' + self.id).val(roundCSSProperty($initObj.css('height'), 0));
                $('#objWidthSpinner_' + self.id).val(roundCSSProperty($initObj.css('width'), 0));

                $('#textSpecificInspector_' + self.id).hide();

                if (objectType === OBJECT_PROPERTIES.image.type) {
                    $('#backgroundColorContainer_' + self.id).hide();
                }
                else {
                    $('#image-object-inspector-' + self.id).hide();
                }
            }
            else if (objectType === OBJECT_PROPERTIES.text.type) {
                $('#objFontSizeSpinner_' + self.id).val(roundCSSProperty($initObj.css('font-size'), 0));
                $('#objPaddingSpinner_' + self.id).val(roundCSSProperty($initObj.css('padding'), 0));
                $('#objFontFamilyMenu_' + self.id).val($initObj.css('font-family'));

                // David May 4/26/20 update italics button style when new object selected
                if ($graphicObj.css('font-style') == 'italic') {
                    $('#objItalicMenu_' + self.id).addClass('buttonSelected');
                } else {
                    $('#objItalicMenu_' + self.id).removeClass('buttonSelected');
                }

                // David May 9/17/20 update bold button style when new object selected
                if ($graphicObj.css('font-weight') > 400) {
                    $('#objBoldMenu_' + self.id).addClass('buttonSelected');
                } else {
                    $('#objBoldMenu_' + self.id).removeClass('buttonSelected');
                }

                // David May 4/26/20 update text align button style when new object selected
                if ($graphicObj.css('text-align') == 'left') {
                    $('#objTextAlignLeftMenu_' + self.id).addClass('buttonSelected');
                    $('#objTextAlignCenterMenu_' + self.id).removeClass('buttonSelected');
                    $('#objTextAlignRightMenu_' + self.id).removeClass('buttonSelected');
                } else if ($graphicObj.css('text-align') == 'center') {
                    $('#objTextAlignLeftMenu_' + self.id).removeClass('buttonSelected');
                    $('#objTextAlignCenterMenu_' + self.id).addClass('buttonSelected');
                    $('#objTextAlignRightMenu_' + self.id).removeClass('buttonSelected');
                } else {
                    $('#objTextAlignLeftMenu_' + self.id).removeClass('buttonSelected');
                    $('#objTextAlignCenterMenu_' + self.id).removeClass('buttonSelected');
                    $('#objTextAlignRightMenu_' + self.id).addClass('buttonSelected');
                }

                $('#boxSpecificInspector_' + self.id).hide();
                $('#constrain-portions-container-' + self.id).hide();
                $('#image-object-inspector-' + self.id).hide();
            }
            else if (objectType === OBJECT_PROPERTIES.triangle.type) {
                $('#boxSpecificInspector_' + self.id).hide();
                $('#textSpecificInspector_' + self.id).hide();
                $('#borderColorContainer_' + self.id).hide();
                $('#borderRadiusContiner_' + self.id).hide();
                $('#constrain-portions-container-' + self.id).hide();
                $('#image-object-inspector-' + self.id).hide();
            }

            $('#objInspector_' + self.id).show();
        }

        function hideInspector() {
            $('#objInspector_' + self.id).hide();
        }

        // Create a jQuery spinner with the id |id|. Make the spinner a child of |$parent|.
        // |spinnerType| is passed to the |updateFunction|, which is called whenever the
        // spinner value is changed.
        //
        // |id| is a string and required
        // |$parent| is a jQuery DOM object and required
        // |spinnerType| is a string and required
        // |updateFunction| is a function and required
        // |objNums| is an array of strings and not required
        // |instrNum| is a string and not required. If an instrNum is not passed in, then
        // the spinner will specifically modify selected objects.
        function createSpinner(id, $parent, spinnerType, updateFunction, objNums, instrNum) {
            objNums = objNums !== undefined ? objNums : [];
            var isInstruction = instrNum !== undefined ? true : false;
            var $spinner = $('<input>');
            $spinner.attr('id', id);
            $spinner.css('width', '40px');
            $spinner.css('font-size', '14px');
            $parent.append($spinner);
            if (canEdit) {
                function updateSpinnerDisplayValue(newValue) {
                    if (isInstruction) {
                        updateInstructionInteractiveElements(spinnerType, newValue, instrNum);
                    } else {
                        // Transform is the update for the rotation spinner, and if lumped
                        // into the updateInspectorInteractiveElements function, will cause
                        // input rotation values to be misinterpreted, and keyboard input
                        // becomes impossible.
                        //
                        // The update function for the rotation spinner calls the function
                        // updateRotationOnInspectorSpinner which calls the function
                        // updateRotationOfGraphicAndInitCSS which calls updateGraphicAndInitCSS
                        // which then finally calls updateInspectorInteractiveElements.
                        //
                        // So, if the 'transform' spinner is updated inside of the function
                        // updateInspectorInteractiveElements... it will be updated for every
                        // keyup event, which is undesired behavior.
                        if (spinnerType === 'transform') {
                            $('#objRotationSpinner_' + self.id).val(roundCSSProperty(newValue, ''));
                        } else {
                            updateInspectorInteractiveElements(spinnerType, newValue);
                        }
                    }
                }

                function determineObjectNumbers() {
                    if (!isInstruction) {
                        $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                        objNums = new Array($selectedObjects.length);
                        for (var i = 0; i < $selectedObjects.length; ++i) {
                            objNums[i] = $selectedObjects.eq(i).attr('objNum');
                        }
                    }
                }

                $spinner.spinner({
                    start: function(event, ui) {
                        // If the spinner is not in focus, then cancel the spin event.
                        if (!$(this).is(':focus')) {
                            event.preventDefault();
                        }
                    },
                    spin: function(event, ui) {
                        determineObjectNumbers();
                        for (var i = 0; i < objNums.length; ++i) {
                            updateFunction(objNums[i], spinnerType, ui.value);
                        }
                    },
                    stop: function(event, ui) {
                        takeSnapshot();
                    }
                });
                $spinner.keyup(function(e) {
                    determineObjectNumbers();
                    var newValue = Number($(this).val());
                    var maxValue = $(this).spinner('option', 'max');
                    var minValue = $(this).spinner('option', 'min');
                    if (newValue > maxValue) {
                        newValue = maxValue;
                        updateSpinnerDisplayValue(newValue);
                    } else if (newValue < minValue) {
                        newValue = minValue;
                        updateSpinnerDisplayValue(newValue);
                    }
                    for (var i = 0; i < objNums.length; ++i) {
                        updateFunction(objNums[i], spinnerType, roundCSSProperty(newValue, ''));
                    }
                    takeSnapshot();
                });
                $spinner.blur(function(e) {
                    determineObjectNumbers();
                    var val = Number($(this).val());
                    if (isNaN(val)) {
                        val = 0;
                    }
                    for (var i = 0; i < objNums.length; ++i) {
                        updateFunction(objNums[i], spinnerType, roundCSSProperty(val, ''));
                    }
                    updateSpinnerDisplayValue(val);
                    takeSnapshot();
                });
            }
            return $spinner;
        }

        /*
            Create a background-color selector for |color| and attached to |$parent|.
            |color| is required and a string.
            |$parent| is required and a jQuery object.
            |isAnInstruction| is optional and boolean. If true, then do not update initial object CSS.
            |instructionNumber| is optional (unless |isAnInstruction| is true) and a string.
            |objectNumberForInstruction| is optional (unless |isAnInstruction| is true) and a string.
        */
        function createBackgroundColorSelector(color, $parent, isAnInstruction, instructionNumber, objectNumberForInstruction) {
            isAnInstruction = isAnInstruction !== undefined ? isAnInstruction : false;
            instructionNumber = instructionNumber !== undefined ? instructionNumber : -1;
            objectNumberForInstruction = objectNumberForInstruction !== undefined ? objectNumberForInstruction : -1;
            var $bgColorSelector = $('<span>');
            if (color === 'transparent') {
                $bgColorSelector.html('&#x00D7;');
            }
            $bgColorSelector.addClass('colorSelector');
            $bgColorSelector.css('background-color', color);
            $bgColorSelector.click(function() {
                if (!isAnimationPlaying) {
                    if (isAnInstruction) {
                        updateGraphic(objectNumberForInstruction, 'background-color', color);
                        $('#instr_' + self.id + '_' + instructionNumber).attr('background-color', color);
                    }
                    else {
                        var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                        for (var i = 0; i < $selectedObjects.length; ++i) {
                            var objNum = $selectedObjects.eq(i).attr('objNum');

                            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objNum);
                            $graphic_init_props.css('background-color', color);

                            var $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('background-color', objNum);

                            if (!$instr) {
                                updateGraphic(objNum, 'background-color', color);
                            }
                        }
                    }
                    takeSnapshot();
                }
            });
            $parent.append($bgColorSelector);
        }

        // David May 8/31/20 Adding border color instruction
        function createBorderColorSelector(color, $parent, isAnInstruction, instructionNumber, objectNumberForInstruction) {
            isAnInstruction = isAnInstruction !== undefined ? isAnInstruction : false;
            instructionNumber = instructionNumber !== undefined ? instructionNumber : -1;
            objectNumberForInstruction = objectNumberForInstruction !== undefined ? objectNumberForInstruction : -1;
            var $initObj = $('#stepObjectInit_' + self.id + '_' + objectNumberForInstruction);

            var $borderColorSelector = $('<span>');
            if (color === 'transparent') {
                $borderColorSelector.html('&#x00D7;');
            }
            $borderColorSelector.addClass('colorSelector');
            $borderColorSelector.css('background-color', color);
            $borderColorSelector.click(function() {

                if (!isAnimationPlaying) {
                    if (isAnInstruction) {
                        if ($initObj.css('border-width') == '2px') { // David May 11/29/20 Check for initial border size to make sure animation will work.
                            updateGraphic(objectNumberForInstruction, 'border-color', color);
                            $('#instr_' + self.id + '_' + instructionNumber).attr('border-color', color);
                        } else {
                            alert('Please select an initial border color.');
                        }
                    }
                    takeSnapshot();
                }
            });
            $parent.append($borderColorSelector);
        }

        // David May 8/28/20 Create font color selector for instruction
        function createFontColorSelector(color, $parent, isAnInstruction, instructionNumber, objectNumberForInstruction) {
            isAnInstruction = isAnInstruction !== undefined ? isAnInstruction : false;
            instructionNumber = instructionNumber !== undefined ? instructionNumber : -1;
            objectNumberForInstruction = objectNumberForInstruction !== undefined ? objectNumberForInstruction : -1;

            var $fontColorSelector = $('<div>');
            $fontColorSelector.addClass('colorSelector');
            $fontColorSelector.css('background-color', color);
            $fontColorSelector.click(function() {
                if (!isAnimationPlaying) {
                    if (isAnInstruction) {
                        updateGraphic(objectNumberForInstruction, 'color', color);
                        $('#instr_' + self.id + '_' + instructionNumber).attr('color', color);
                    }
                    takeSnapshot();
                }
            });
            $parent.append($fontColorSelector);
        }

        function createInspector() {
            var $clearBothDiv; // AE 052714: This variable gets reused to create each clear:both div

            var $inspector = $('<div>');
            $inspector.attr('id', 'objInspector_' + self.id);
            $inspector.addClass('inspector');
            $('#inspector_' + self.id).append($inspector);

            var $titleDiv = $('<div>');
            $titleDiv.html('<b>Initial properties</b><br/>');
            $inspector.append($titleDiv);

            var $bgColorDiv = $('<div>');
            $bgColorDiv.attr('id', 'backgroundColorContainer_' + self.id);
            $bgColorDiv.html('Background color:<br/>');
            $inspector.append($bgColorDiv);

            createBackgroundColorSelector(COLORS[BLACK_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[GRAY_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[WHITE_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[YELLOW_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[GREEN_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[LIGHT_BLUE_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[BLUE_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[PURPLE_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[RED_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[ORANGE_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[BROWN_COLOR], $bgColorDiv);
            createBackgroundColorSelector(COLORS[LIGHT_ORANGE_COLOR], $bgColorDiv);
            createBackgroundColorSelector('transparent', $bgColorDiv);

            var $borderColorDiv = $('<div>');
            $borderColorDiv.attr('id', 'borderColorContainer_' + self.id);
            $borderColorDiv.html('Border color:<br/>');
            $inspector.append($borderColorDiv);
            function createBorderColorSelector(color) {
                var $borderColorSelector = $('<span>');
                if (color === 'transparent') {
                    $borderColorSelector.html('&#x00D7;');
                }
                $borderColorSelector.addClass('colorSelector');
                $borderColorSelector.css('background-color', color);
                $borderColorSelector.click(function() {
                    if (!isAnimationPlaying) {
                        var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                        for (var i = 0; i < $selectedObjects.length; ++i) {
                            var objNum = $selectedObjects.eq(i).attr('objNum'); // David May 9/6/20 Keep border even if transparent color selected unless gate type object (border color instr)
                            if (color === 'transparent'/* && (isObjectTypeGate($selectedObjects.eq(i).attr('objType'))/* || isObjectTypeBoxImageOrGate($selectedObjects.eq(i).attr('objType')))*/) {
                                updateGraphicAndInitCSS(objNum, 'border-width', '0px');
                                updateGraphicAndInitCSS(objNum, 'border-style', 'none');
                            } else {
                                updateGraphicAndInitCSS(objNum, 'border-width', '2px');
                                updateGraphicAndInitCSS(objNum, 'border-style', 'solid');
                                updateGraphicAndInitCSS(objNum, 'border-color', color);
                            }
                        }
                        takeSnapshot();
                    }
                });
                $borderColorDiv.append($borderColorSelector);
            }
            createBorderColorSelector(COLORS[BLACK_COLOR]);
            createBorderColorSelector(COLORS[GRAY_COLOR]);
            createBorderColorSelector(COLORS[WHITE_COLOR]);
            createBorderColorSelector(COLORS[YELLOW_COLOR]);
            createBorderColorSelector(COLORS[GREEN_COLOR]);
            createBorderColorSelector(COLORS[LIGHT_BLUE_COLOR]);
            createBorderColorSelector(COLORS[BLUE_COLOR]);
            createBorderColorSelector(COLORS[PURPLE_COLOR]);
            createBorderColorSelector(COLORS[RED_COLOR]);
            createBorderColorSelector(COLORS[ORANGE_COLOR]);
            createBorderColorSelector(COLORS[BROWN_COLOR]);
            createBorderColorSelector(COLORS[LIGHT_ORANGE_COLOR]);
            createBorderColorSelector('transparent');

            var $opacityDiv = $('<div>');
            $opacityDiv.attr('title', '(Invisible) 0 - 100 (Fully visible)');
            $opacityDiv.css('float', 'right');
            $opacityDiv.text('Opacity: ');
            $inspector.append($opacityDiv);
            var $opacitySpinner = createSpinner('objOpacitySpinner_' + self.id, $opacityDiv, 'opacity', updateOpacityOnInspectorSlider);
            $opacitySpinner.val(100);
            $opacitySpinner.spinner('option', 'min', 0);
            $opacitySpinner.spinner('option', 'max', 100);
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $inspector.append($clearBothDiv);

            var $borderRadDiv = $('<div>');
            $borderRadDiv.attr('id', 'borderRadiusContiner_' + self.id);
            $borderRadDiv.text('Border radius: ');
            $borderRadDiv.css('float', 'right');
            $inspector.append($borderRadDiv);
            var $borderRadiusSpinner = createSpinner('objBorderRadiusSpinner_' + self.id, $borderRadDiv, 'border-radius', updateBorderRadiusOnInspectorSpinner);
            $borderRadiusSpinner.val(0);
            $borderRadiusSpinner.spinner('option', 'min', 0);
            $borderRadiusSpinner.spinner('option', 'max', 999);
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $inspector.append($clearBothDiv);

            var $rotationDiv = $('<div>');
            $rotationDiv.text('Rotation: ');
            $rotationDiv.css('float', 'right');
            $inspector.append($rotationDiv);
            var $rotationSpinner = createSpinner('objRotationSpinner_' + self.id, $rotationDiv, 'transform', updateRotationOnInspectorSpinner);
            $rotationSpinner.val(0);
            $rotationSpinner.spinner('option', 'min', minRotationSpinnerDegree);
            $rotationSpinner.spinner('option', 'max', maxRotationSpinnerDegree);
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $inspector.append($clearBothDiv);

            var $topPosDiv = $('<div>');
            $topPosDiv.attr('title', 'Distance from top.');
            $topPosDiv.html('Top: ');
            $topPosDiv.css('float', 'left');
            $topPosDiv.css('margin-left', '18px');
            $inspector.append($topPosDiv);
            var $topPosSpinner = createSpinner('objTopPosSpinner_' + self.id, $topPosDiv, 'top', updateTopOrLeftOnInspectorSpinner);
            $topPosSpinner.val(0);
            $topPosSpinner.spinner('option', 'min', 0);
            $topPosSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('height')));

            var $leftPosDiv = $('<div>');
            $leftPosDiv.attr('title', 'Distance from left-side.');
            $leftPosDiv.text('Left: ');
            $leftPosDiv.css('float', 'right');
            $inspector.append($leftPosDiv);
            var $leftPosSpinner = createSpinner('objLeftPosSpinner_' + self.id, $leftPosDiv, 'left', updateTopOrLeftOnInspectorSpinner);
            $leftPosSpinner.val(0);
            $leftPosSpinner.spinner('option', 'min', 0);
            $leftPosSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('width')));
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $inspector.append($clearBothDiv);

            // Box object inspector code
            var $boxSpecificDiv = $('<div>');
            $boxSpecificDiv.attr('id', 'boxSpecificInspector_' + self.id);
            $inspector.append($boxSpecificDiv);

            var $heightDiv = $('<div>');
            $heightDiv.text('Height: ');
            $heightDiv.css('float', 'left');
            $boxSpecificDiv.append($heightDiv);
            var $heightSpinner = createSpinner('objHeightSpinner_' + self.id, $heightDiv, 'height', updateHeightOrWidthOnInspectorSpinner);
            $heightSpinner.val(0);
            $heightSpinner.spinner('option', 'min', 1);
            $heightSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('height')));

            var $widthDiv = $('<div>');
            $widthDiv.text('Width: ');
            $widthDiv.css('float', 'right');
            $boxSpecificDiv.append($widthDiv);
            var $widthSpinner = createSpinner('objWidthSpinner_' + self.id, $widthDiv, 'width', updateHeightOrWidthOnInspectorSpinner);
            $widthSpinner.val(0);
            $widthSpinner.spinner('option', 'min', 1);
            $widthSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('width')));

            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $boxSpecificDiv.append($clearBothDiv);

            // Add constrain proportions checkbox to inspector
            var constrainProportionsHTML = self[self.name]['constrainProportions']({
                id: self.id
            });
            $inspector.append(constrainProportionsHTML);
            $('#constrain-proportions-' + self.id).change(function() {
                // Update selected object's |useConstrainedProportions| value.
                var $selectedObject = $('#objList_' + self.id + ' .labelSelected');
                var objectNumber = $selectedObject.attr('objNum');
                var $graphicObject = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
                var useConstrainedProportions = $(this).prop('checked');
                $graphicObject.data('useConstrainedProportions', useConstrainedProportions);

                if (useConstrainedProportions) {
                    $graphicObject.data('constrainedProportions', {
                        height: $graphicObject.height(),
                        width:  $graphicObject.width()
                    });
                }

                takeSnapshot();
            });

            // Add image object-specific properties to inspector
            var imageObjectInspectorHTML = self[self.name]['imageObjectInspector']({
                id: self.id
            });
            $inspector.append(imageObjectInspectorHTML);
            $('#edit-url-' + self.id).click(function() {
                // Prompt user to edit URL
                var $selectedObject = $('#objList_' + self.id + ' .labelSelected');
                var objectNumber = $selectedObject.attr('objNum');
                promptUserToEditImageURL(objectNumber);
            });

            // Text object's inspector code
            var $textSpecificInspectorMenu = $('<div>');
            $textSpecificInspectorMenu.addClass('zyAhr');
            $textSpecificInspectorMenu.attr('id', 'textSpecificInspector_' + self.id);
            $inspector.append($textSpecificInspectorMenu);

            var $fontColorDiv = $('<div>');
            $fontColorDiv.html('Font color:<br/>');
            $textSpecificInspectorMenu.append($fontColorDiv);
            function createFontColorSelector(color) {
                var $fontColorSelector = $('<div>');
                $fontColorSelector.addClass('colorSelector');
                $fontColorSelector.css('background-color', color);
                $fontColorSelector.click(function() {
                    if (!isAnimationPlaying) {
                        var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                        for (var i = 0; i < $selectedObjects.length; ++i) {
                            var objNum = $selectedObjects.eq(i).attr('objNum');
                            updateGraphicAndInitCSS(objNum, 'color', color);
                        }
                        takeSnapshot();
                    }
                });
                $fontColorDiv.append($fontColorSelector);
            }
            createFontColorSelector(COLORS[BLACK_COLOR]);
            createFontColorSelector(COLORS[GRAY_COLOR]);
            createFontColorSelector(COLORS[WHITE_COLOR]);
            createFontColorSelector(COLORS[YELLOW_COLOR]);
            createFontColorSelector(COLORS[GREEN_COLOR]);
            createFontColorSelector(COLORS[LIGHT_BLUE_COLOR]);
            createFontColorSelector(COLORS[BLUE_COLOR]);
            createFontColorSelector(COLORS[PURPLE_COLOR]);
            createFontColorSelector(COLORS[RED_COLOR]);
            createFontColorSelector(COLORS[ORANGE_COLOR]);
            createFontColorSelector(COLORS[BROWN_COLOR]);
            createFontColorSelector(COLORS[LIGHT_ORANGE_COLOR]);

            var $fontSizeDiv = $('<div>');
            $fontSizeDiv.text('Font size: ');
            $fontSizeDiv.css('float', 'right');
            $textSpecificInspectorMenu.append($fontSizeDiv);
            var $fontSizeSpinner = createSpinner('objFontSizeSpinner_' + self.id, $fontSizeDiv, 'font-size', updateGraphicAndInitCSS);
            $fontSizeSpinner.val(14);
            $fontSizeSpinner.spinner('option', 'min', 1);
            $fontSizeSpinner.spinner('option', 'max', 999);
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $textSpecificInspectorMenu.append($clearBothDiv);

            var $paddingDiv = $('<div>');
            $paddingDiv.text('Padding: ');
            $paddingDiv.css('float', 'right');
            $textSpecificInspectorMenu.append($paddingDiv);
            var $paddingSpinner = createSpinner('objPaddingSpinner_' + self.id, $paddingDiv, 'padding', updateGraphicAndInitCSS);
            $paddingSpinner.val(2);
            $paddingSpinner.spinner('option', 'min', 0);
            $paddingSpinner.spinner('option', 'max', 999);
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $textSpecificInspectorMenu.append($clearBothDiv);

            var $fontFamilyDiv = $('<div>');
            $fontFamilyDiv.text('Font family: ');
            $fontFamilyDiv.css('float', 'right');
            $textSpecificInspectorMenu.append($fontFamilyDiv);
            var $fontFamilyMenu = $('<select>');
            $fontFamilyMenu.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            $fontFamilyMenu.attr('id', 'objFontFamilyMenu_' + self.id);
            $fontFamilyDiv.append($fontFamilyMenu);
            $fontFamilyMenu.change(function() {
                var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                $selectedObjects.each(function() {
                    var $selectedObject = $(this);
                    var objNum = $selectedObject.attr('objNum');
                    var newFontFamily = $fontFamilyMenu.val();
                    updateGraphicAndInitCSS(objNum, 'font-family', newFontFamily);

                    if (SPECIAL_LINE_HEIGHTS.hasOwnProperty(newFontFamily)) {
                        updateGraphicAndInitCSS(objNum, 'line-height', SPECIAL_LINE_HEIGHTS[newFontFamily]);
                    }
                    else {
                        updateGraphicAndInitCSS(objNum, 'line-height', DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['line-height']);
                    }
                });
                takeSnapshot();
            });
            function addOptionToFontFamilyMenu(value, text) {
                var $fontFamilyOption = $('<option>');
                $fontFamilyOption.val(value);
                $fontFamilyOption.text(text);
                $fontFamilyMenu.append($fontFamilyOption);
            }
            addOptionToFontFamilyMenu(ARIAL_FONT, 'Arial');
            addOptionToFontFamilyMenu('courier', 'Courier');
            addOptionToFontFamilyMenu('helvetica', 'Helvetica (old)');
            addOptionToFontFamilyMenu(COMIC_SANS_FONT, 'Comic sans (old)');
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $textSpecificInspectorMenu.append($clearBothDiv);

            // David May 4/19/20 replaced text alignment drop-down with 3 buttons
            var $textAlignDiv = $('<div>');
            $textAlignDiv.text('Text align: ');
            $textAlignDiv.css('float', 'right');
            $textSpecificInspectorMenu.append($textAlignDiv);
            var $textAlignLeft = $('<button/>');
            var $textAlignCenter = $('<button/>');
            var $textAlignRight = $('<button/>');
            $textAlignLeft.text('Left');
            $textAlignLeft.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            $textAlignLeft.attr('id', 'objTextAlignLeftMenu_' + self.id);
            $textAlignCenter.text('Center');
            $textAlignCenter.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            $textAlignCenter.attr('id', 'objTextAlignCenterMenu_' + self.id);
            $textAlignRight.text('Right');
            $textAlignRight.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            $textAlignRight.attr('id', 'objTextAlignRightMenu_' + self.id);
            $textAlignDiv.append($textAlignLeft);
            $textAlignDiv.append($textAlignCenter);
            $textAlignDiv.append($textAlignRight);

            $textAlignLeft.click(function() {
                var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                $selectedObjects.each(function() {
                    var $selectedObject = $(this);
                    var objNum = $selectedObject.attr('objNum');
                    updateGraphicAndInitCSS(objNum, 'text-align', 'left');
                    $textAlignLeft.addClass('buttonSelected');
                    $textAlignCenter.removeClass('buttonSelected');
                    $textAlignRight.removeClass('buttonSelected');
                });
                takeSnapshot();
            })

            $textAlignCenter.click(function() {
                var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                $selectedObjects.each(function() {
                    var $selectedObject = $(this);
                    var objNum = $selectedObject.attr('objNum');
                    updateGraphicAndInitCSS(objNum, 'text-align', 'center');
                    $textAlignLeft.removeClass('buttonSelected');
                    $textAlignCenter.addClass('buttonSelected');
                    $textAlignRight.removeClass('buttonSelected');
                });
                takeSnapshot();
            })

            $textAlignRight.click(function() {
                var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                $selectedObjects.each(function() {
                    var $selectedObject = $(this);
                    var objNum = $selectedObject.attr('objNum');
                    updateGraphicAndInitCSS(objNum, 'text-align', 'right');
                    $textAlignLeft.removeClass('buttonSelected');
                    $textAlignCenter.removeClass('buttonSelected');
                    $textAlignRight.addClass('buttonSelected');
                });
                takeSnapshot();
            })
            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $textSpecificInspectorMenu.append($clearBothDiv);

            // David May 4/19/20 replaced italics drop-down with toggle button
            // var $italicsDiv = $('<div>');
            // $italicsDiv.text('Italics: ');
            // $italicsDiv.css('float', 'right');
            // $textSpecificInspectorMenu.append($italicsDiv);
            // var $italicsMenu = $('<button/>');
            // $italicsMenu.text('I');
            // $italicsMenu.css('font-style', 'italic');
            // $italicsMenu.attr('id', 'objItalicMenu_' + self.id);
            // $italicsMenu.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            // $italicsDiv.append($italicsMenu);
            // $italicsMenu.click(function() {
            //     var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
            //     $selectedObjects.each(function() {
            //         var $selectedObject = $(this);
            //         var objNum = $selectedObject.attr('objNum');
            //         var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            //         if ($graphic.css('font-style') == 'italic') {
            //             updateGraphicAndInitCSS(objNum, 'font-style', 'normal');
            //             $italicsMenu.removeClass('buttonSelected');
            //         } else {
            //             updateGraphicAndInitCSS(objNum, 'font-style', 'italic');
            //             $italicsMenu.addClass('buttonSelected');
            //         }
            //     });
            //     takeSnapshot();
            // });
            // $clearBothDiv = $('<div>');
            // $clearBothDiv.css('clear', 'both');
            // $textSpecificInspectorMenu.append($clearBothDiv);

            // David May 9/17/20 Converting italicsDiv to fontStyleDiv - contains italics and bold style
            var $fontStyleDiv = $('<div>');
            $fontStyleDiv.text('Font style: ');
            $fontStyleDiv.css('float', 'right');
            $textSpecificInspectorMenu.append($fontStyleDiv);
            var $italicsMenu = $('<button/>');
            $italicsMenu.text('I');
            $italicsMenu.css('font-style', 'italic');
            $italicsMenu.attr('id', 'objItalicMenu_' + self.id);
            $italicsMenu.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            $fontStyleDiv.append($italicsMenu);
            $italicsMenu.click(function() {
                var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                $selectedObjects.each(function() {
                    var $selectedObject = $(this);
                    var objNum = $selectedObject.attr('objNum');
                    var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                    if ($graphic.css('font-style') == 'italic') {
                        updateGraphicAndInitCSS(objNum, 'font-style', 'normal');
                        $italicsMenu.removeClass('buttonSelected');
                    } else {
                        updateGraphicAndInitCSS(objNum, 'font-style', 'italic');
                        $italicsMenu.addClass('buttonSelected');
                    }
                });
                takeSnapshot();
            });

            // David May 9/17/20 Adding bold font style button
            var $boldMenu = $('<button/>');
            $boldMenu.text('B');
            $boldMenu.css('font-weight', 'bold');
            $boldMenu.attr('id', 'objBoldMenu_' + self.id);
            $boldMenu.addClass('ui-widget').addClass('ui-widget-content').addClass('ui-corner-all').css('font-size', '1em');
            $fontStyleDiv.append($boldMenu);
            $boldMenu.click(function() {
                var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                $selectedObjects.each(function() {
                    var $selectedObject = $(this);
                    var objNum = $selectedObject.attr('objNum');
                    var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                    if ($graphic.css('font-weight') > 400) {
                        updateGraphicAndInitCSS(objNum, 'font-weight', 'normal');
                        updateGraphicOutline(objNum, 'font-weight', 'normal'); // Bold font is wider, update outline to match new width
                        $boldMenu.removeClass('buttonSelected');
                    } else {
                        updateGraphicAndInitCSS(objNum, 'font-weight', 'bold');
                        updateGraphicOutline(objNum, 'font-weight', 'bold');
                        $boldMenu.addClass('buttonSelected');
                    }
                });
                takeSnapshot();
            });

            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $textSpecificInspectorMenu.append($clearBothDiv);
        }

        // Compares each general initial object property of the currently selected objects
        // and if a property is not the same among all selected objects, then the
        // corresponding displayed inspector property will be blank.
        // Must specify if a new object was selected using parameter |newObjectSelected|
        // otherwise function may have unexpected behavior.
        function showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedObjects(newObjectSelected) {
            newObjectSelected = newObjectSelected !== undefined ? newObjectSelected : false;
            var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
            var objNumArray = new Array($selectedObjects.length);

            if ($selectedObjects.length === 0) {
                return;
            } else if ($selectedObjects.length === 1) {
                // Ensure all inspector properties are displayed and not blank
                // by reloading the inspector
                loadInspector($selectedObjects.eq(0).attr('objNum'));
                return;
            }
            for (var i = 0; i < $selectedObjects.length; ++i) {
                objNumArray[i] = $selectedObjects.eq(i).attr('objNum');
            }

            var objectSpinnerProperties = {
                'objOpacitySpinner' : 'opacity',
                'objBorderRadiusSpinner' : 'border-radius',
                'objTopPosSpinner' : 'top',
                'objLeftPosSpinner' : 'left',
                'objHeightSpinner' : 'height',
                'objWidthSpinner' : 'width'
            };

            // Check all properties for mismatches
            for (var objectSpinner in objectSpinnerProperties) {
                if (!$('#' + objectSpinner + '_' + self.id).val().length && newObjectSelected) {
                    continue;
                }
                var allSpinnerValuesMatch = true;
                var spinnerValueToCompare = $('#stepObjectInit_' + self.id + '_' + objNumArray[0]).css(objectSpinnerProperties[objectSpinner]);
                for (var i = 1; i < objNumArray.length; ++i) {
                    var checkedSpinnerValue = $('#stepObjectInit_' + self.id + '_' + objNumArray[i]).css(objectSpinnerProperties[objectSpinner]);
                    if (spinnerValueToCompare !== checkedSpinnerValue) {
                        $('#' + objectSpinner + '_' + self.id).val('');
                        allSpinnerValuesMatch = false;
                        break;
                    }
                }
                if (allSpinnerValuesMatch) {
                    if (objectSpinnerProperties[objectSpinner] === 'opacity') {
                        $('#' + objectSpinner + '_' + self.id).val(100 * roundCSSProperty(spinnerValueToCompare, ''));
                    } else {
                        $('#' + objectSpinner + '_' + self.id).val(roundCSSProperty(spinnerValueToCompare, ''));
                    }
                }
            }

            // Check the rotation property separately since it is an attribute and not a css value
            if ($('#objRotationSpinner_' + self.id).val().length && newObjectSelected) {
                var allSpinnerValuesMatch = true;
                var spinnerValueToCompare = $('#stepObjectInit_' + self.id + '_' + objNumArray[0]).attr('transformdeg');
                for (var i = 1; i < objNumArray.length; ++i) {
                    var checkedSpinnerValue = $('#stepObjectInit_' + self.id + '_' + objNumArray[i]).attr('transformdeg');
                    if (spinnerValueToCompare !== checkedSpinnerValue) {
                        $('#objRotationSpinner_' + self.id).val('');
                        allSpinnerValuesMatch = false;
                        break;
                    }
                }
                if (allSpinnerValuesMatch) {
                    $('#objRotationSpinner_' + self.id).val(roundCSSProperty(spinnerValueToCompare, ''));
                }
            }
        }

        function showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedTextObjects(newObjectSelected) {
            newObjectSelected = newObjectSelected !== undefined ? newObjectSelected : false;
            var $selectedObjects = $('#objList_' + self.id + ' .labelSelected[objtype="' + OBJECT_PROPERTIES.text.type + '"]');
            var objNumArray = new Array($selectedObjects.length);

            if ($selectedObjects.length === 0) {
                return;
            } else if ($selectedObjects.length === 1) {
                // Ensure all inspector properties are displayed and not blank
                // by reloading the inspector
                loadInspector($selectedObjects.eq(0).attr('objNum'));
                return;
            }

            for (var i = 0; i < $selectedObjects.length; ++i) {
                objNumArray[i] = $selectedObjects.eq(i).attr('objNum');
            }

            var objectSpinnerProperties = {
                'objFontSizeSpinner' : 'font-size',
                'objPaddingSpinner' : 'padding',
            };

            // Check all basic text properties for mismatches
            for (var objectSpinner in objectSpinnerProperties) {
                if (!$('#' + objectSpinner + '_' + self.id).val().length && newObjectSelected) {
                    continue;
                }
                var allSpinnerValuesMatch = true;
                var spinnerValueToCompare = $('#stepObjectInit_' + self.id + '_' + objNumArray[0]).css(objectSpinnerProperties[objectSpinner]);
                for (var i = 1; i < objNumArray.length; ++i) {
                    var checkedSpinnerValue = $('#stepObjectInit_' + self.id + '_' + objNumArray[i]).css(objectSpinnerProperties[objectSpinner]);
                    if (spinnerValueToCompare !== checkedSpinnerValue) {
                        $('#' + objectSpinner + '_' + self.id).val('');
                        allSpinnerValuesMatch = false;
                        break;
                    }
                }
                if (allSpinnerValuesMatch) {
                    $('#' + objectSpinner + '_' + self.id).val(roundCSSProperty(spinnerValueToCompare, ''));
                }
            }

            // For the below option menu checks use:
            // $('#objFontFamilyMenu_' + self.id)
            // .prepend("<option value='' selected='selected'></option>"); // to make empty
            // $('#objFontFamilyMenu_1' + ' option[value=""]').remove() // to git rid of empty option

            var textOptionMenuProperties = {
                'objFontFamilyMenu' : 'font-family',
                // 'objTextAlignMenu' : 'text-align', // David May 3/26/20 Removed these two lines. See replacement below.
                // 'objItalicMenu' : 'font-style'
            };

            // Check text option menus for mismatches
            for (var textOptionMenu in textOptionMenuProperties) {
                if (!$('#' + textOptionMenu + '_' + self.id).val().length && newObjectSelected) {
                    continue;
                }
                var allOptionValuesMatch = true;
                var optionValueToCompare = $('#stepObjectInit_' + self.id + '_' + objNumArray[0]).css(textOptionMenuProperties[textOptionMenu]);
                for (var i = 1; i < objNumArray.length; ++i) {
                    var checkedOptionValue = $('#stepObjectInit_' + self.id + '_' + objNumArray[i]).css(textOptionMenuProperties[textOptionMenu]);
                    if (optionValueToCompare !== checkedOptionValue) {
                        $('#' + textOptionMenu + '_' + self.id).prepend('<option value=\'\' selected=\'selected\'></option>');
                        allOptionValuesMatch = false;
                        break;
                    }
                }
                if (allOptionValuesMatch) {
                    $('#' + textOptionMenu + '_' + self.id + ' option[value=""]').remove();
                }

                // David May 5/3/20 adding check for text-align and italics
                var italicValueToCompare = $('#stepObjectGraphic_' + self.id + '_' + objNumArray[0]).css('font-style');
                var boldValueToCompare = $('#stepObjectGraphic_' + self.id + '_' + objNumArray[0]).css('font-weight');
                var textAlignValueToCompare = $('#stepObjectGraphic_' + self.id + '_' + objNumArray[0]).css('text-align');
                for (var i = 1; i < objNumArray.length; ++i) {
                    var checkedItalicValue = $('#stepObjectGraphic_' + self.id + '_' + objNumArray[i]).css('font-style');
                    var checkedBoldValue = $('#stepObjectGraphic_' + self.id + '_' + objNumArray[i]).css('font-weight');
                    var checkedTextAlignValue = $('#stepObjectGraphic_' + self.id + '_' + objNumArray[i]).css('text-align');
                    if (italicValueToCompare !== checkedItalicValue) {
                        $('#objItalicMenu_' + self.id).removeClass('buttonSelected');
                    }
                    if (boldValueToCompare !== checkedBoldValue) { // David May 9/17/20 Add check for bold font style
                        $('#objBoldMenu_' + self.id).removeClass('buttonSelected');
                    }
                    if (textAlignValueToCompare !== checkedTextAlignValue) {
                        $('#objTextAlignLeftMenu_' + self.id).removeClass('buttonSelected');
                        $('#objTextAlignCenterMenu_' + self.id).removeClass('buttonSelected');
                        $('#objTextAlignRightMenu_' + self.id).removeClass('buttonSelected');
                    }
                }
            }
        }

        function selectObjByObjNum(objNum, useMultiSelectBehavior, preventScroll) {
            useMultiSelectBehavior = useMultiSelectBehavior !== undefined ? useMultiSelectBehavior : false;
            preventScroll = preventScroll !== undefined ? preventScroll : false;

            var $graphic;
            var $graphic_outline;
            var $container;
            var $listObj;
            var $selectedInstr;

            if (!useMultiSelectBehavior) {
                deselectAllObjs();
            }
            removeAllContentEditableObjs();

            $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);

            if ($graphic.length > 0) { // object must exist to select that object
                $graphic_outline = $('#stepObjectOutline_' + self.id + '_' + objNum);
                $graphic_outline.show();
                $graphic.attr('isSelected', 'true');

                updateGraphicOutline(objNum, 'top', $graphic.css('top'));
                updateGraphicOutline(objNum, 'left', $graphic.css('left'));
                updateGraphicOutline(objNum, 'height', $graphic.css('height'));
                updateGraphicOutline(objNum, 'width', $graphic.css('width'));

                var degrees = $graphic.attr('transformDeg');

                var $outline = $('#stepObjectOutline_' + self.id + '_' + objNum);
                updateStepObjectTransform($outline, degrees);

                $listObj = $('#listObject_' + self.id + '_' + objNum);
                $listObj.addClass('labelSelected');

                if (!useMultiSelectBehavior) {
                    loadInspector(objNum);
                    $selectedInstr = $('#instrList_' + self.id + ' .labelSelected');
                    if ($selectedInstr.attr('objNum') != objNum) {
                        $selectedInstr.find('.instrMenu').hide();
                        $selectedInstr.addClass('labelSelectedButNotObjNum');
                    } else {
                        $selectedInstr.find('.instrMenu').show();
                        $selectedInstr.removeClass('labelSelectedButNotObjNum');
                    }

                    if (!preventScroll) {
                        $container = $('#objList_' + self.id);
                        $container.stop().scrollTo($listObj, 400);
                    }

                    outlineInstrsByObjNum(); // David May 7/23/20 Outlines instructions connected to selected object
                } else {
                    // If the inspector is not shown, show the inspector
                    if ($('#objInspector_' + self.id).css('display') === 'none') {
                        loadInspector(objNum);
                    } else {
                        // Hide constrain proportions checkbox for multi-select
                        $('#constrain-portions-container-' + self.id).hide();
                        $('#image-object-inspector-' + self.id).hide();

                        // if text properties are shown, make sure all selected objects
                        // are text objects. Otherwise only show common properties.
                        var $selectedTextObjects = $('#objList_' + self.id + ' .labelSelected[objtype="' + OBJECT_PROPERTIES.text.type + '"]');
                        var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
                        if ($selectedTextObjects.length > 0
                            && $selectedTextObjects.length !== $selectedObjects.length) {

                            $('#boxSpecificInspector_' + self.id).hide();
                            $('#textSpecificInspector_' + self.id).hide();
                        } else { // All selected objects are text objects
                            showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedTextObjects(true);
                        }
                        showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedObjects(true);
                        outlineInstrsByObjNum(); // David May 7/29/20 Outline relevant instrs
                    }
                }
            }
            return;
        }

        // David May 7/23/20 Lightly outlines all instructions connected to the currently selected object
        function outlineInstrsByObjNum() {
            var $selectedObjs = $('#objList_' + self.id + ' .labelSelected');
            var $instrList = $('#instrList_' + self.id).children();
            var objNumsToSelect = [];

            // Create array of selected objnums
            $selectedObjs.each(function() {
                $currObj = $(this);
                objNumsToSelect.push($currObj.attr('objnum'));
            });

            // If instruction acts on objnum in array add outline, else remove outline
            $instrList.each(function() {
                $currInstr = $(this);
                if (jQuery.inArray($currInstr.attr('objnum'), objNumsToSelect) !== -1) {
                    $currInstr.addClass('labelObjInstr');
                } else {
                    $currInstr.removeClass('labelObjInstr');
                }
            });
        }

        // David May 7/25/20 Remove all outlines on instructions
        function removeAllInstrsOutline() {
            var $instrList = $('#instrList_' + self.id).children();

            $instrList.each(function() {
                $currChild = $(this);
                $currChild.removeClass('labelObjInstr');
            })
        }

        function removeObject(objNum) {
            $("#stepObjectGraphic_" + self.id + "_" + objNum).remove();
            $("#stepObjectInit_" + self.id + "_" + objNum).remove();
            $("#stepObjectOutline_" + self.id + "_" + objNum).remove();
            $('#listObject_' + self.id + '_' + objNum).remove();
            $('#listInstr_' + self.id + '_' + objNum).remove();
            hideInspector();
            $.contextMenu('destroy', "#stepObjectGraphic_" + self.id + "_" + objNum);

            $("#instrList_" + self.id).children().each(function() { // Remove all instructions for this object
                $this = $(this);
                if ($this.attr('objNum') == objNum) {
                    removeInstruction($this.attr('instrNum'));
                }
            });

            return;
        }

        function updateGraphicOutline(objNum, cssProp, cssVal) {
            var $graphic_outline = $('#stepObjectOutline_' + self.id + '_' + objNum);

            if ((cssProp === 'top') || (cssProp === 'left')) { // Outline needs to subtract 2 to these
                $graphic_outline.css(cssProp, roundCSSProperty(cssVal, '') - 2);
            }
            if ((cssProp === 'z-index') // Outline just copies graphic for these...
             || (cssProp === 'transform') || (cssProp === '-webkit-transform') || (cssProp === '-moz-transform')
             || (cssProp === '-o-transform') || (cssProp === '-ms-transform') || (cssProp === '-ms-filter')
             || (cssProp === 'filter')) {
                $graphic_outline.css(cssProp, cssVal);
            }
            else if ([ 'font-size', 'font-family', 'border', 'border-width', 'padding', 'font-weight' ].indexOf(cssProp) !== -1) { // David May 9/17/20 added 'font-weight' for bold style
                var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                var heightVal = $graphic.outerHeight() + 4;
                var widthVal = $graphic.outerWidth() + 4;
                $graphic_outline.css('height', heightVal);
                $graphic_outline.css('width', widthVal);
            }
            else if (cssProp == 'height') {
                var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                cssVal = $graphic.outerHeight() + 4;
                $graphic_outline.css(cssProp, cssVal);
            }
            else if (cssProp == 'width') {
                var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                cssVal = $graphic.outerWidth() + 4;
                $graphic_outline.css(cssProp, cssVal);
            }
            else if (cssProp === 'opacity') {
                // do nothing
            }
        }

        function updateGraphicAndInitCSS(objNum, cssProp, cssVal) {
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objNum);
            var objType = $graphic.attr('objType');

            // if graphic is a gate, then do not put border properties on the graphic
            if (isObjectTypeGate(objType) && ((cssProp === 'border-color') || (cssProp === 'border-width') || (cssProp === 'border-style'))) {
                // Apply the border-color to the children of the graphic. Ignore the border-width and border-style.
                if (cssProp === 'border-color') {
                    $graphic.children().css(cssProp, cssVal);
                }
            }
            // If graphic is a triangle, then put background-colors on the border-color
            else if ((cssProp === 'background-color') && (objType === OBJECT_PROPERTIES.triangle.type)) {
                $graphic.css('border-color', 'transparent ' + cssVal);
                $graphic.attr('background-color', cssVal);
            }
            else {
                $graphic.css(cssProp, cssVal);
            }

            $graphic_init_props.css(cssProp, cssVal);

            updateGraphicOutline(objNum, cssProp, cssVal);

            if (cssProp === 'opacity') {
                cssVal *= 100;
            }

            updateInspectorInteractiveElements(cssProp, cssVal);
        }

        function updateInspectorInteractiveElements(cssProp, cssVal) {
            if (cssProp === 'opacity') {
                $('#objOpacitySpinner_' + self.id).val(parseFloat(cssVal));
            } else if (cssProp === 'border-radius') {
                $('#objBorderRadiusSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            } else if (cssProp === 'font-size') {
                $('#objFontSizeSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            } else if (cssProp === 'padding') {
                $('#objPaddingSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            } else if (cssProp === 'font-family') {
                $('#objFontFamilyMenu_' + self.id).val(cssVal);
            } else if (cssProp === 'text-align') {
                $('#objTextAlignMenu_' + self.id).val(cssVal);
            } else if (cssProp === 'font-style') {
                $('#objItalicMenu_' + self.id).val(cssVal);
            } else if (cssProp === 'font-weight') {
                $('#objBoldMenu_' + self.id).val(cssVal);
            } else if (cssProp === 'height') {
                $('#objHeightSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            } else if (cssProp === 'width') {
                $('#objWidthSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            } else if (cssProp === 'top') {
                $('#objTopPosSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            } else if (cssProp === 'left') {
                $('#objLeftPosSpinner_' + self.id).val(roundCSSProperty(cssVal, ''));
            }
        }

        // Updates the instruction spinner with the specified |instrNum| for the |cssProp|
        // with the parameter value |cssVal|.
        // Parameters: |cssProp|, |cssVal|, and |instrNum| are required and expected to be strings.
        function updateInstructionInteractiveElements(cssProp, cssVal, instrNum) {
            if (cssProp === 'opacity') {
                $('#instrOpacitySpinner_' + self.id + '_' + instrNum).val(parseFloat(cssVal));
            }
            else if (cssProp === 'height') {
                $('#instrHeightSpinner_' + self.id + '_' + instrNum).val(roundCSSProperty(cssVal, ''));
            }
            else if (cssProp === 'width') {
                $('#instrWidthSpinner_' + self.id + '_' + instrNum).val(roundCSSProperty(cssVal, ''));
            }
            else if (cssProp === 'top') {
                $('#instrTopPosSpinner_' + self.id + '_' + instrNum).val(roundCSSProperty(cssVal, ''));
            }
            else if (cssProp === 'left') {
                $('#instrLeftPosSpinner_' + self.id + '_' + instrNum).val(roundCSSProperty(cssVal, ''));
            }
            else if (cssProp === 'transform') {
                $('#instrRotateSpinner_' + self.id + '_' + instrNum).val(roundCSSProperty(cssVal, ''));
            }
        }

        // Finds and returns the first instruction of a given type and object number before the selected instruction
        // Expects two string variables: instructionType and objNum
        // Returns a jQuery object of the found instruction
        function findTheFirstInstructionBeforeTheSelectedInstructionFound(instructionType, objNum) {
            var $instrsInReverse = $('#instrList_' + self.id).children().reverse();
            var foundSelected = false;
            var $this;
            var $instr;

            // Check if start instruction is the selected instruction
            if ($('#goToStartStepInstruction_' + self.id).hasClass('labelSelected')) {
                foundSelected = true;
            }

            $instrsInReverse.each(function() {
                $this = $(this);

                if ($this.hasClass('labelSelected')) {
                    foundSelected = true;
                }

                // Once the selected instruction is found, find the first specified instruction type for this object
                if (foundSelected) {
                    if (($this.attr('instrType') == instructionType) && ($this.attr('objNum') == objNum)) {
                        $instr = $this;
                        return false; // equivalent to break;
                    }
                }
            });

            return $instr;
        }

        function updateOpacityOnInspectorSlider(objNum, cssProp, opacity) {
            var $graphic;
            var $graphic_init_props = $("#stepObjectInit_" + self.id + "_" + objNum);
            var $instr;
            var instrNum;

            opacity = opacity / 100;

            $graphic_init_props.css('opacity', opacity);

            $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('fade', objNum);

            if (!$instr) {
                $graphic = $("#stepObjectGraphic_" + self.id + "_" + objNum);
                $graphic.css('opacity', opacity);
            }

            return;
        }

        function updateBorderRadiusOnInspectorSpinner(objNum, cssProp, val) {
            var $graphic;
            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objNum);
            var $instr;
            var instrNum;

            $graphic_init_props.css('border-radius', val);

            $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('changeRadius', objNum);

            if (!$instr) {
                $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                $graphic.css('border-radius', val);
            }
        }

        function updateRotationOnInspectorSpinner(objNum, cssProp, val) {
            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objNum);
            $graphic_init_props.attr('transformDeg', val);
            updateStepObjectTransform($graphic_init_props, val);

            var $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('rotate', objNum);

            if (!$instr) {
                var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                $graphic.attr('transformDeg', val);
                updateStepObjectTransform($graphic, val);

                var $outline = $('#stepObjectOutline_' + self.id + '_' + objNum);
                updateStepObjectTransform($outline, val);
            }
        }

        function updateTopOrLeftOnInspectorSpinner(objNum, topOrLeft, val) {
            var $graphic;
            var $graphic_init_props = $("#stepObjectInit_" + self.id + "_" + objNum);
            var $instr;
            var instrNum;

            $graphic_init_props.css(topOrLeft, val);

            $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('move', objNum);

            if (!$instr) {
                $graphic = $("#stepObjectGraphic_" + self.id + "_" + objNum);
                $graphic.css(topOrLeft, val);
                updateGraphicOutline(objNum, topOrLeft, val);
            }

            return;
        }

        /*
            |objectNumber|, |heigthOrWidth|, and |value| are required.
            |objectNumber| and |heigthOrWidth| are strings.
            |value| is a number.
        */
        function updateHeightOrWidthOnInspectorSpinner(objectNumber, heigthOrWidth, value) {
            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objectNumber);
            $graphic_init_props.css(heigthOrWidth, value);

            /*
                If a resize instruction is before the current instruction,
                then don't update the current graphic.
            */
            var $instruction = findTheFirstInstructionBeforeTheSelectedInstructionFound('resize', objectNumber);
            if (!$instruction) {
                var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
                $graphic.css(heigthOrWidth, value);
                updateGraphicOutline(objectNumber, heigthOrWidth, value);

                // If using constrained proportions, then both height and width
                if ($graphic.data('useConstrainedProportions')) {
                    var constrainedHeight = $graphic.data('constrainedProportions').height;
                    var constrainedWidth = $graphic.data('constrainedProportions').width;
                    var newValue = 0;
                    var oppositeOfHeightOrWidth = '';

                    if (heigthOrWidth === 'height') {
                        newValue = value * constrainedWidth / constrainedHeight;
                        oppositeOfHeightOrWidth = 'width';
                    }
                    else {
                        newValue = value * constrainedHeight / constrainedWidth;
                        oppositeOfHeightOrWidth = 'height';
                    }

                    updateGraphicAndInitCSS(objectNumber, oppositeOfHeightOrWidth, newValue);
                }
            }
        }

        function updateInitOrInstrPosition(objNum, top, left) {
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objNum);
            var $instr;
            var instrNum;

            $graphic.css('top', top);
            $graphic.css('left', left);
            updateGraphicOutline(objNum, 'top', top);
            updateGraphicOutline(objNum, 'left', left);

            $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('move', objNum);

            if ($instr) {
                instrNum = $instr.attr('instrNum');
                $('#instrTopPosSpinner_' + self.id + '_' + instrNum).val(top);
                $('#instrLeftPosSpinner_' + self.id + '_' + instrNum).val(left);
            } else {
                $graphic_init_props.css('top', top);
                $graphic_init_props.css('left', left);

                // The below conditions are placed to check if the Inspector spinner is
                // empty. If it is, then this means multiple objects have been selected
                // that do not share the same value. See the following function:
                // showBlanksOnlyForNonMatchingInitialPropertiesOfSelectedObjects
                if ($('#objTopPosSpinner_' + self.id).val().length) {
                    $('#objTopPosSpinner_' + self.id).val(top);
                }
                if ($('#objLeftPosSpinner_' + self.id).val().length) {
                    $('#objLeftPosSpinner_' + self.id).val(left);
                }
            }

            return;
        }

        function updateInitOrInstrHeightWidth(objNum, height, width) {
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $graphic_init_props = $('#stepObjectInit_' + self.id + '_' + objNum);
            var $instr;
            var instrNum;

            $graphic.css('height', height);
            $graphic.css('width', width);
            updateGraphicOutline(objNum, 'height', height);
            updateGraphicOutline(objNum, 'width', width);

            $instr = findTheFirstInstructionBeforeTheSelectedInstructionFound('resize', objNum);

            if ($instr) {
                instrNum = $instr.attr('instrNum');
                $('#instrHeightSpinner_' + self.id + '_' + instrNum).val(height);
                $('#instrWidthSpinner_' + self.id + '_' + instrNum).val(width);
            } else {
                $graphic_init_props.css('height', height);
                $graphic_init_props.css('width', width);
                $('#objHeightSpinner_' + self.id).val(height);
                $('#objWidthSpinner_' + self.id).val(width);
            }

            return;
        }

        /*
            Update an object and that object's initial CSS's rotation in |degrees|.
            |objNum| is required and a string. |objNum| is the object number of the object being rotated.
            |rotate| is a dummy parameter that is used to be consistent with the parameter list of updatedGraphicAndInitCSS
            |degrees| is required and a number.
        */
        function updateRotationOfGraphicAndInitCSS(objNum, rotate, degrees) {
            updateRotationOfGraphic(objNum, rotate, degrees);

            var $initialCSSObject = $('#stepObjectInit_' + self.id + '_' + objNum);
            updateStepObjectTransform($initialCSSObject, degrees);
            $initialCSSObject.attr('transformDeg', degrees);
        }

        /*
            Update an object's rotation in |degrees|.
            |objNum| is required and a string. |objNum| is the object number of the object being rotated.
            |rotate| is a dummy parameter that is used to be consistent with the parameter list of updatedGraphicAndInitCSS
            |degrees| is required and a number.
        */
        function updateRotationOfGraphic(objNum, rotate, degrees) {
            var $stepObject = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            updateStepObjectTransform($stepObject, degrees);
            $('#stepObjectGraphic_' + self.id + '_' + objNum).attr('transformDeg', degrees);

            var $outline = $('#stepObjectOutline_' + self.id + '_' + objNum);
            updateStepObjectTransform($outline, degrees);
        }

        function updateGraphic(objNum, css, val) {
            if (css === 'opacity') {
                val = val / 100;
            }

            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);

            // Triangle's background-color is actually handled by border-color
            if ((css === 'background-color') && ($graphic.attr('objType') === OBJECT_PROPERTIES.triangle.type)) {
                $graphic.css('border-color', 'transparent ' + val);
                $graphic.attr('background-color', val);
            }
            else {
                $graphic.css(css, val);
            }
            updateGraphicOutline(objNum, css, val);
        }

        function reorderObjectZIndex() {
            const $objInList = $(`#objList_${self.id}`).children();

            // re-order graphical object's z-index
            $objInList.each((index, element) => {
                updateGraphicAndInitCSS($(element).attr('objNum'), 'z-index', $objInList.length - index);
            });

            // controls are moved 1 z-index in front of all objects
            const zIndexControls = $objInList.length + 1;

            $(`#${self.id} .stepControls`).css('z-index', zIndexControls);
            $(`#startButton_${self.id}`).css('z-index', zIndexControls);
            $(`#goToStartStepButton_${self.id}`).css('z-index', zIndexControls);
            $(`#timeline_${self.id}`).css('z-index', zIndexControls);
            $(`#playButton_${self.id}`).css('z-index', zIndexControls);
        }

        // Limits passed in coordinates to the canvas height, width, and 0.
        // Returns an object with attached values 'top', 'left', and 'isSelectedObjectOnTheCanvasEdge'.
        // 'isSelectedObjectOnTheCanvasEdge' is a boolean that indicates whether or not the coordinates
        // are touching the edge.
        // If 'isSelectedObjectOnTheCanvasEdge' is false, then 'top' and 'left' are the same as the passed in
        // parameters |top| and |left|.
        function limitCoordinatesToCanvasSize(top, left, height, width) {
            var canvasHeight = parseInt($('#canvas_' + self.id).css('height'));
            var canvasWidth = parseInt($('#canvas_' + self.id).css('width'));
            var isSelectedObjectOnTheCanvasEdge = false;
            if ((top + height) > canvasHeight) {
                top = canvasHeight - height;
            } else if (top < 0) {
                top = 0;
            }
            if ((left + width) > canvasWidth) {
                left = canvasWidth - width;
            } else if (left < 0) {
                left = 0;
            }
            isSelectedObjectOnTheCanvasEdge = (left >= (canvasWidth - width))
                                            || (top >= (canvasHeight - height))
                                            || (left <= 0)
                                            || (top <= 0);
            var coordinates = {
                'top': top,
                'left': left,
                'isSelectedObjectOnTheCanvasEdge': isSelectedObjectOnTheCanvasEdge
            };
            return coordinates;
        }

        // Mainly for arrow key movement
        function changeObjPos(topChange, leftChange) {
            var $selectedGraphics = $('#canvas_' + self.id + ' .stepObjectGraphic[isSelected="true"]');

            var $nearestToEdgeGraphic = $selectedGraphics.eq(0);
            var closerToEdgeValue;

            // Determine what direction objects are moving in and grab the object
            // closest to the edge that is about to be hit.
            if (topChange > 0) { // Find the top most object
                closerToEdgeValue = parseInt($nearestToEdgeGraphic.css('top'));
                $selectedGraphics.each(function() {
                    $selectedGraphic = $(this);
                    var selectedGraphicTop = parseInt($selectedGraphic.css('top'));
                    if (selectedGraphicTop > closerToEdgeValue) {
                        closerToEdgeValue = selectedGraphicTop;
                        $nearestToEdgeGraphic = $selectedGraphic;
                    }
                });
            } else if (topChange < 0) { // Find the bottom most object
                closerToEdgeValue = parseInt($nearestToEdgeGraphic.css('top'));
                $selectedGraphics.each(function() {
                    $selectedGraphic = $(this);
                    var selectedGraphicTop = parseInt($selectedGraphic.css('top'));
                    if (selectedGraphicTop < closerToEdgeValue) {
                        closerToEdgeValue = selectedGraphicTop;
                        $nearestToEdgeGraphic = $selectedGraphic;
                    }
                });
            } else if (leftChange > 0) { // Find the left most object
                closerToEdgeValue = parseInt($nearestToEdgeGraphic.css('left'));
                $selectedGraphics.each(function() {
                    $selectedGraphic = $(this);
                    var selectedGraphicLeft = parseInt($selectedGraphic.css('left'));
                    if (selectedGraphicLeft > closerToEdgeValue) {
                        closerToEdgeValue = selectedGraphicLeft;
                        $nearestToEdgeGraphic = $selectedGraphic;
                    }
                });
            } else if (leftChange < 0) { // Find the right most object
                closerToEdgeValue = parseInt($nearestToEdgeGraphic.css('left'));
                $selectedGraphics.each(function() {
                    $selectedGraphic = $(this);
                    var selectedGraphicLeft = parseInt($selectedGraphic.css('left'));
                    if (selectedGraphicLeft < closerToEdgeValue) {
                        closerToEdgeValue = selectedGraphicLeft;
                        $nearestToEdgeGraphic = $selectedGraphic;
                    }
                });
            }

            // Check to see if we are about to go out of, or pushed further out of bounds of the canvas.
            // If so, adjust |topChange| and |leftChange| to align to the edge of the canvas.
            var top = roundCSSProperty($nearestToEdgeGraphic.css('top'), 0);
            var left = roundCSSProperty($nearestToEdgeGraphic.css('left'), 0);
            var height = roundCSSProperty($nearestToEdgeGraphic.css('height'), 0);
            var width = roundCSSProperty($nearestToEdgeGraphic.css('width'), 0);
            var newTop = top + topChange;
            var newLeft = left + leftChange;
            var newCoordinates = limitCoordinatesToCanvasSize(newTop, newLeft, height, width);
            if (newCoordinates.isSelectedObjectOnTheCanvasEdge) { // Adjust top and left changes
                if (newTop !== newCoordinates.top && topChange != 0) {
                    if (topChange > 0) {
                        topChange = newCoordinates.top - top;
                    } else if (newTop < 0) {
                        topChange = -top;
                    }
                }
                if (newLeft !== newCoordinates.left && leftChange != 0) {
                    if (leftChange > 0) {
                        leftChange = newCoordinates.left - left;
                    } else if (newLeft < 0) {
                        leftChange = -left;
                    }
                }
                if (leftChange === 0 && topChange === 0) { // If absolutely no movement
                    return;
                }
            }

            // Move all the selected objects
            $selectedGraphics.each(function() {
                $selectedGraphic = $(this);
                top = roundCSSProperty($selectedGraphic.css('top'), 0);
                left = roundCSSProperty($selectedGraphic.css('left'), 0);
                newTop = top + topChange;
                newLeft = left + leftChange;
                var objNum = $selectedGraphic.attr('objNum');
                updateInitOrInstrPosition(objNum, top + topChange, left + leftChange);
            });
        }

        function deselectAllInstrs() {
            var $instrContainer = $('#instrContainer_' + self.id);
            var $instrs = $('#instrList_' + self.id + ' .label');
            var $step1 = $('#step1_' + self.id);
            $instrContainer.find('.instrMenu').hide();
            $instrs.removeClass('labelSelected').removeClass('labelSelectedButNotObjNum');
            $step1.removeClass('labelSelected').removeClass('labelSelectedButNotObjNum');
            $('#goToStartStepInstruction_' + self.id).removeClass('labelSelected').removeClass('labelSelectedButNotObjNum');
            return;
        }

        function allObjectsToInitCSS() {
            var $this;
            var objNum;
            var $initObj;
            var $stepGraphics;

            $('#canvas_' + self.id + ' .stepObjectGraphic').each(function() {
                $this = $(this);
                objNum = $this.attr('objNum');
                $initObj = $('#stepObjectInit_' + self.id + '_' + objNum);

                $this.css('top', $initObj.css('top'));
                updateGraphicOutline(objNum, 'top', $initObj.css('top'));

                $this.css('left', $initObj.css('left'));
                updateGraphicOutline(objNum, 'left', $initObj.css('left'));

                $this.css('opacity', $initObj.css('opacity'));

                var objType = $this.attr('objType');
                if (isObjectTypeBoxImageOrGate(objType)) {
                    $this.css('height', $initObj.css('height'));
                    updateGraphicOutline(objNum, 'height', $initObj.css('height'));

                    $this.css('width', $initObj.css('width'));
                    updateGraphicOutline(objNum, 'width', $initObj.css('width'));
                }

                if (objType != OBJECT_PROPERTIES.triangle.type) { // Triangles only need background-color updated
                    updateGraphic(objNum, 'border-color', $initObj.css('border-color')); // David May 8/31/20 Adding to account for border color instr
                    updateGraphic(objNum, 'color', $initObj.css('color')); // David May 8/29/20 Adding to account for font color instr
                }

                updateRotationOfGraphic(objNum, '', $initObj.attr('transformDeg'));
                updateGraphic(objNum, 'background-color', $initObj.css('background-color'));
            });

            $stepGraphics = $('#timeline_' + self.id).children();
            $stepGraphics.children('div').removeClass('timelineNumSelected'); // clear highlighting of step numbering graphic
            $stepGraphics.first().children('div').addClass('timelineNumSelected');
        }

        function highlightGraphicStepByStepNum(stepNum) {
            var $stepGraphics = $("#timeline_" + self.id).children();
            $stepGraphics.children('div').removeClass('timelineNumSelected'); // clear highlighting of step numbering graphic
            var $stepGraphic = $("#timeline_" + self.id).children("[stepNum='" + stepNum+'\']');
            $stepGraphic.children('div').addClass('timelineNumSelected');

            $stepGraphics.removeClass('is-selected');
            $stepGraphic.addClass('is-selected');
            outlineInstrsByObjNum(); // David May 8/1/20 Remove instruction outlines when timelineNum selected
        }

        /**
            Set the given text in the animation's caption.
            @method setCaption
            @param {String} text The text to set.
            @return {void}
        */
        function setCaption(text) {
            const $caption = $(`#caption_${self.id}`);

            $caption.data('text', text);
            $caption.text(text);
            self.parentResource.latexChanged();
        }

        function runInstructionsUpToSelectedInstruction(skipTheCaptions) {
            skipTheCaptions = typeof skipTheCaptions !== 'undefined' ? skipTheCaptions : false;
            var $instrList = $('#instrList_' + self.id);
            var $instrs = $instrList.children();
            var $goToStartStepInstruction = $('#goToStartStepInstruction_' + self.id);
            var i;
            var opacity;
            var topVal;
            var leftVal;
            var $graphic;
            var $this;
            var $caption = $('#caption_' + self.id);
            var heightVal;
            var widthVal;
            var instrNum;

            allObjectsToInitCSS();
            if (!skipTheCaptions) {
                setCaption($(`#step1Caption_${self.id}`).val());
            }

            if (($instrs.hasClass('labelSelected')) || $goToStartStepInstruction.hasClass('labelSelected')) {
                $instrs.each(function() {
                    $this = $(this);

                    $graphic = $('#stepObjectGraphic_' + self.id + '_' + $this.attr('objNum'));
                    if ($this.attr('instrType') === 'move') {
                        topVal = $('#instrTopPosSpinner_' + self.id + '_' + $this.attr('instrNum')).val();
                        leftVal = $('#instrLeftPosSpinner_' + self.id + '_' + $this.attr('instrNum')).val();

                        $graphic.css('top', topVal + 'px');
                        $graphic.css('left', leftVal + 'px');

                        updateGraphicOutline($graphic.attr('objNum'), 'top', $graphic.css('top'));
                        updateGraphicOutline($graphic.attr('objNum'), 'left', $graphic.css('left'));
                    }
                    else if ($this.attr('instrType') === 'fade') {
                        opacity = $('#instrOpacitySpinner_' + self.id + '_' + $this.attr('instrNum')).val();
                        $graphic.css('opacity', (opacity / 100.0));
                    }
                    else if ($this.attr('instrType') === 'resize') {
                        heightVal = $('#instrHeightSpinner_' + self.id + '_' + $this.attr('instrNum')).val();
                        widthVal = $('#instrWidthSpinner_' + self.id + '_' + $this.attr('instrNum')).val();

                        $graphic.css('height', heightVal + 'px');
                        $graphic.css('width', widthVal + 'px');

                        updateGraphicOutline($graphic.attr('objNum'), 'height', $graphic.css('height'));
                        updateGraphicOutline($graphic.attr('objNum'), 'width', $graphic.css('width'));
                    }
                    else if ($this.attr('instrType') === 'rotate') {
                        var rotateVal = $('#instrRotateSpinner_' + self.id + '_' + $this.attr('instrNum')).val();
                        updateRotationOfGraphic($graphic.attr('objNum'), '', parseInt(rotateVal));
                    }
                    else if ($this.attr('instrType') === 'border-color') { // David May 8/31/20 Adding case for border color instrs
                        var borderColorVal = $('#instr_' + self.id + '_' + $this.attr('instrNum')).attr('border-color');
                        updateGraphic($this.attr('objNum'), 'border-color', borderColorVal);
                    }
                    else if ($this.attr('instrType') === 'background-color') {
                        var backgroundColorVal = $('#instr_' + self.id + '_' + $this.attr('instrNum')).attr('background-color');
                        updateGraphic($this.attr('objNum'), 'background-color', backgroundColorVal);
                    }
                    else if ($this.attr('instrType') === 'color') { // David May 8/28/20 Adding case for font color instrs
                        var fontColorVal = $('#instr_' + self.id + '_' + $this.attr('instrNum')).attr('color');
                        updateGraphic($this.attr('objNum'), 'color', fontColorVal);
                    }
                    else if ($this.attr('instrType') === 'step') {
                        highlightGraphicStepByStepNum($this.attr('stepNum'));
                        instrNum = $this.attr('instrNum');
                        if (!skipTheCaptions) {
                            setCaption($(`#instrCaption_${self.id}_${instrNum}`).val());
                        }
                    }

                    if ($this.hasClass('labelSelected')) { // stop when the selected instruction is reached
                        return false; // equivalent to break;
                    }
                });

                if ($goToStartStepInstruction.hasClass('labelSelected')) {
                    setCaption($(`#startStepCaption_${self.id}`).val());
                }
            }
        }

        function highlightInstructionByInstrNum(instrNum, doScroll) {
            doScroll = doScroll !== undefined ? doScroll : false;
            var $instr;
            var instrObjNum;

            if (instrNum === '0') {
                $instr = $("#step1_" + self.id);
            } else {
                $instr = $('#instr_' + self.id + '_' + instrNum);
            }

            $instr.addClass('labelSelected');

            instrObjNum = $instr.attr('objNum');
            $objsSelectedWithSameObjNumAsInstr = $('#objList_' + self.id + ' .labelSelected[objnum=\'' + instrObjNum + '\']');
            if ($objsSelectedWithSameObjNumAsInstr.length == 0) {
                $instr.addClass('labelSelectedButNotObjNum');
            }

            if (doScroll && $instr && $instr.length) {
                $("#instrContainer_" + self.id).stop().scrollTo($instr, 400);
            }

            return;
        }

        function selectInstrByInstrNum(instrNum, skipTheCaptions, doScroll) {
            doScroll = doScroll !== undefined ? doScroll : false;
            var $instr;
            var instrObjNum;
            var $objsSelectedWithSameObjNumAsInstr;

            deselectAllInstrs();

            if (instrNum == '0') { // Step 1 instruction
                $instr = $('#step1_' + self.id);
                $instr.children('.instrMenu').show();
            } else if (instrNum == 'goToStartStep') { // Go to start instruction
                $instr = $('#goToStartStepInstruction_' + self.id);
                $('#goToStartStepInstruction_' + self.id).find('.instrMenu').show();
                showStartButton();
            } else {
                $instr = $('#instr_' + self.id + '_' + instrNum);
                $instr.children('.instrMenu').show();

                if ($instr.attr('instrtype') !== 'step') { // if instruction is an action instruction (aka non-step instructions)
                    instrObjNum = $instr.attr('objNum');
                    $objsSelectedWithSameObjNumAsInstr = $('#objList_' + self.id + ' .labelSelected[objnum=\'' + instrObjNum + '\']');
                    if ($objsSelectedWithSameObjNumAsInstr.length === 0) {
                        $instr.children('.instrMenu').hide();
                        $instr.addClass('labelSelectedButNotObjNum');
                    } else {
                        $instr.children('.instrMenu').show();
                    }
                }
            }

            if ($instr.length > 0) { // instruction must exist to select it
                $instr.addClass('labelSelected');

                if (doScroll) {
                    $("#instrContainer_" + self.id).stop().scrollTo($instr, 400);
                }

                $("#playButton_" + self.id).finish().animateRotate(0);

                runInstructionsUpToSelectedInstruction(skipTheCaptions);
            }

            return;
        }

        function selectStepGraphicIfStepInstructionSelected() {
            var $stepGraphics = $("#timeline_" + self.id).children();
            $stepGraphics.children('div').removeClass('timelineNumSelected'); // clear highlighting of step numbering graphic

            var numOfStepInstr = 0;
            var i = 0;
            var $instrs = $("#instrList_" + self.id).children();
            var isStepInstrSelected = false;
            var $this;

            $instrs.each(function() {
                $this = $(this);
                if ($this.attr('instrType') == 'step') {
                    numOfStepInstr++; // count num of step instructions until we find selected step instruction

                    if ($this.hasClass('labelSelected')) {
                        isStepInstrSelected = true;
                        return false; // equivalent to break;
                    }
                }
            });

            if (isStepInstrSelected) {
                $stepGraphics.eq(numOfStepInstr).children('div').addClass('timelineNumSelected');
            }

            return;
        }

        function removeInstruction(instrNum) {
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var prevIndex;
            var prevInstr;
            var instrToRemoveIsSelected = $instr.hasClass('labelSelected');

            if (instrToRemoveIsSelected) { // If the instruction is selected, then highlight the previous instruction
                if ($instr.index() > 0) { // Select previous instruction in instrList
                    prevIndex = $instr.index() - 1;
                    prevInstr = $('#instrList_' + self.id).children()[prevIndex];
                    selectInstrByInstrNum($(prevInstr).attr('instrNum'));
                } else {                  // No previous instruction in instrList, so select Step 1
                    allObjectsToInitCSS();
                    $('#step1_' + self.id).addClass('labelSelected');
                }
            }

            $instr.remove();

            if (!instrToRemoveIsSelected) { // If the instruction to be removed was not selected, then play up to the selected instruction (in case the instruction removed was before the selected instruction)
                runInstructionsUpToSelectedInstruction();
            }

            if ($instr.attr('instrType') === 'step') {
                updateStepNumbering();
            }
        }

        function renameStepInstrs() {
            var $instrs = $("#instrList_" + self.id).children();
            var stepCntr = 2; // step 1 is already claimed... so start at 2
            var $this;
            var $instrLabelDiv;

            $instrs.each(function() {
                $this = $(this);
                if ($this.attr('instrType') == 'step') {
                    $instrLabelDiv = $this.children('.stepLabel');
                    $instrLabelDiv.text('Step ' + stepCntr);
                    $this.attr('stepNum', stepCntr);
                    stepCntr++;
                }
            });
            return;
        }

        function duplicateObject($graphicToDupe) {
            var objNumToDupe = $graphicToDupe.attr('objNum');
            var objTypeToDupe = $('#listObject_' + self.id + '_' + objNumToDupe).attr('objType');
            var $graphicInitToDupe = $('#stepObjectInit_' + self.id + '_' + objNumToDupe);
            var objName = $('#listObject_' + self.id + '_' + objNumToDupe).attr('objName');

            var objNum = null;
            if (isObjectBoxOrImage(objTypeToDupe)) {
                if (objTypeToDupe === OBJECT_PROPERTIES.box.type) {
                    objNum = addBoxObj(false, objName);
                }
                else if (objTypeToDupe === OBJECT_PROPERTIES.image.type) {
                    var googleDriveFileIDToDupe = $graphicToDupe.data('googleDriveFileID');

                    // Save the graphic's height and width to pass onto the duplicated image.
                    const width = $graphicToDupe.width();
                    const height = $graphicToDupe.height();

                    objNum = addImageObject(googleDriveFileIDToDupe, false, '', width, height);
                }

                CSS_PROPERTIES_USED_BY_BOX_OBJECTS.forEach(function(cssProperty) {

                    // Firefox does not support jQuery 'border-width', 'border-style', or 'border-color'.
                    const cssToDupe = $graphicToDupe.get(0).style[cssProperty];

                    updateGraphicAndInitCSS(objNum, cssProperty, cssToDupe);
                });
            }
            else if (objTypeToDupe === OBJECT_PROPERTIES.text.type) {
                objNum = addTextObj($graphicToDupe.html(), false, 'none', objName, true);

                var codeColorize = $graphicToDupe.data('codeColorize');
                $('#stepObjectGraphic_' + self.id + '_' + objNum).data({ 'codeColorize': codeColorize });

                CSS_PROPERTIES_USED_BY_TEXT_OBJECTS.forEach(function(cssProperty) {

                    // Firefox does not support jQuery 'border-width', 'border-style', or 'border-color'.
                    const cssToDupe = $graphicToDupe.get(0).style[cssProperty];

                    updateGraphicAndInitCSS(objNum, cssProperty, cssToDupe);
                });
            }
            else if (objTypeToDupe === OBJECT_PROPERTIES.triangle.type) {
                objNum = addTriangleObj(false, objName);
            }
            else if (isObjectTypeGate(objTypeToDupe)) {
                switch (objTypeToDupe) {
                    case OBJECT_PROPERTIES.ANDgate.type:
                        objNum = addANDObj(false, objName);
                        break;
                    case OBJECT_PROPERTIES.ORgate.type:
                        objNum = addORObj(false, objName);
                        break;
                    case OBJECT_PROPERTIES.XORgate.type:
                        objNum = addXORObj(false, objName);
                        break;
                    case OBJECT_PROPERTIES.NOTgate.type:
                        objNum = addNOTObj(false, objName);
                        break;
                    case OBJECT_PROPERTIES.NANDgate.type:
                        objNum = addNANDObj(false, objName);
                        break;
                    case OBJECT_PROPERTIES.NORgate.type:
                        objNum = addNORObj(false, objName);
                        break;
                    case OBJECT_PROPERTIES.XNORgate.type:
                        objNum = addXNORObj(false, objName);
                        break;
                }

                CSS_PROPERTIES_USED_BY_GATE_OBJECTS.forEach(function(cssProperty) {

                    /*
                        Get the border-color from init graphic b/c that's where the border-color is saved.
                        Firefox does not support jQuery 'border-width', 'border-style', or 'border-color'.
                    */
                    const cssToDupe = (cssProperty === 'border-color') ? $graphicInitToDupe.get(0).style[cssProperty] :
                                                                         $graphicToDupe.get(0).style[cssProperty];

                    updateGraphicAndInitCSS(objNum, cssProperty, cssToDupe);
                });
            }

            // If |objNum| is null, then the duplicate object failed to be created, so, throw an error.
            if (objNum === null) {
                throw 'Duplication of ' + objTypeToDupe + ' object failed.';
            }

            CSS_PROPERTIES_USED_BY_ALL_OBJECTS.forEach(function(cssProperty) {
                // Triangle's background-color is stored on the object, not in CSS.
                var objectIsTriangleCSSPropertyIsBackgroundColor = ((objTypeToDupe === OBJECT_PROPERTIES.triangle.type) && (cssProperty === 'background-color'));

                // Firefox does not support jQuery css of complex properties. Ex: 'border-width', 'border-style', or 'border-color'.
                let cssToDupe = objectIsTriangleCSSPropertyIsBackgroundColor ? $graphicToDupe.attr(cssProperty) :
                                                                               $graphicToDupe.get(0).style[cssProperty];

                var offsetDuplicateObjectLocationAmount = 12;
                if (cssProperty === 'top') {
                    cssToDupe = roundCSSProperty(cssToDupe, 0) + offsetDuplicateObjectLocationAmount;
                }
                else if (cssProperty === 'left') {
                    cssToDupe = roundCSSProperty(cssToDupe, 0) + offsetDuplicateObjectLocationAmount;
                }

                updateGraphicAndInitCSS(objNum, cssProperty, cssToDupe);
            });

            updateRotationOfGraphicAndInitCSS(objNum, 'transform', $graphicToDupe.attr('transformDeg'));

            if (objTypeToDupe == OBJECT_PROPERTIES.text.type) { // force text object height/width to be auto
                updateGraphicAndInitCSS(objNum, 'height', 'auto');
                updateGraphicAndInitCSS(objNum, 'width', 'auto');
            }

            return objNum;
        }

        function zyCodeTextCSSProperties(objNum) {
            updateGraphicAndInitCSS(objNum, 'font-size', '12px');
            updateGraphicAndInitCSS(objNum, 'line-height', '14.16px');
            updateGraphicAndInitCSS(objNum, 'font-family', 'courier');
            updateGraphicAndInitCSS(objNum, 'color', COLORS[BLACK_COLOR]);
            updateGraphicAndInitCSS(objNum, 'text-align', 'left');
            updateGraphicAndInitCSS(objNum, 'padding', '5px');
        }

        function updateStepNumbering() {
            var numStepsInstrs = $('#instrList_' + self.id).children('div[instrtype="step"]').length + 1; // Plus 1 for 'step 1' instruction not in instrList
            var $timeline = $('#timeline_' + self.id);
            var $stepGraphics = $timeline.children();
            var numStepGraphics = $stepGraphics.length;
            var $graphicStep;
            var $this;
            var $graphicStepSelected;
            var stepNum;
            var instrNum;
            var $instr;
            var $instrs;
            var i;

            if (numStepsInstrs === 1) { // Special case: when 1 instruction exists, then don't show step graphics
                $stepGraphics.each(function() {
                    $(this).remove();
                });
            } else if (numStepGraphics < numStepsInstrs) { // not enough step graphics
                while (numStepGraphics < numStepsInstrs) {
                    $graphicStep = $('<div>');
                    $graphicStep.addClass('timelineNum');
                    $graphicStep.text(numStepGraphics + 1);
                    $graphicStep.attr('stepNum', numStepGraphics + 1);
                    $timeline.append($graphicStep);

                    $graphicStepSelected = $('<div>');
                    $graphicStep.append($graphicStepSelected);

                    $graphicStep.click(function() {
                        $this = $(this);
                        stepNum = $this.attr('stepNum');
                        if (stepNum === '1') {
                            instrNum = '0';
                        } else {
                            // Find the instruction just before the desired step
                            $instr = $('#instrList_' + self.id).children('[stepNum=' + stepNum + ']'); // find instr with stepNum
                            $instrs = $('#instrList_' + self.id).children();
                            i = $instrs.index($instr) - 1; // get instruction before desired step
                            i = i >= 0 ? i : 0;
                            instrNum = $instrs.eq(i).attr('instrNum');
                            selectInstrByInstrNum(instrNum, true);
                        }

                        playInstructionsFromInstrNum(instrNum);

                        var event = {
                            part: 0,
                            complete: false,
                            metadata: {
                                event: 'step ' + stepNum + ' clicked.'
                            }
                        };
                        self.parentResource.postEvent(event);
                    });

                    numStepGraphics++;
                }
            } else if (numStepGraphics > numStepsInstrs) { // too many step graphics
                while (numStepGraphics > numStepsInstrs) {
                    $stepGraphics.last().remove();
                    numStepGraphics--;
                }
            }

            renameStepInstrs();
            selectStepGraphicIfStepInstructionSelected();
            setSpeedButtonPosition();

            return;
        }

        function addObj(objectName, objectType) {
            var $canvas;
            var top_pos;
            var left_pos;
            var objNum;
            var $graphic_init_props;
            var $graphic_outline;
            var $graphic;
            var $listItem;
            var $listItemName;
            var $listItemRemove;
            var $listItemClearFloat;
            var numObjects;
            var $selectedObjs;
            var $objList = $('#objList_' + self.id);
            var $selectedObjects = $('#objList_' + self.id + ' .labelSelected'); // David May 9/11/20 Adding for new duplicate order
            var $this;
            var objName;
            var objNameNum = 0;
            var objNameNumNotFound = true;
            var $instr;
            var defaultCSSProp;
            var selectedObjsInitPositions = [];
            var draggedObjsInitPosition = [];
            var topDiff;
            var leftDiff;

            var distFromTop = 10;
            var distFromRight = 200;
            var distGradient = 4;
            var randNumMaxVal = 20;

            $canvas = $('#canvas_' + self.id);
            top_pos = (distFromTop + (distGradient * Math.round(Math.random() * randNumMaxVal)));
            top_pos = top_pos % $('#canvas_' + self.id).outerHeight(); // top_pos shouldn't exceed height of canvas
            top_pos += 'px';

            left_pos = ($('#canvas_' + self.id).outerWidth() - distFromRight + (distGradient * Math.round(Math.random() * randNumMaxVal))) + 'px';
            objNum = String(++numObjs);

            // David May 12/28/20 Pick lowest available number for object naming
            var newNum = 1;
            while(objNameNumNotFound) {
                objNameNumNotFound = false;
                $objList.children().each(function() {
                    var $curr = $(this);
                    if ($curr.attr('objname') == `${objectType}` + ` ` + newNum.toString()) {
                        newNum++;
                        objNameNumNotFound = true;
                        return false;
                    }
                });
            }

            // objName = objectName || `Object ${objNum}: ${objectType}`;
            objName = objectName || `${objectType} ` + newNum.toString(); // David May 12/20/20 Simplifying object names

            // Object's hidden initial css values. Used storing object's initial CSS values.
            $graphic_init_props = $('<div>');
            $graphic_init_props.attr('id', "stepObjectInit_" + self.id + "_" + objNum);
            $graphic_init_props.attr('objNum', objNum);
            $graphic_init_props.attr('transformDeg', '0');
            $graphic_init_props.addClass('stepObject'); // AE 012314 In Opera&Safari, objects that have the CSS "position: relative" automatically force top&left to stay as "auto", instead of a specified top&left value.
            $graphic_init_props.addClass('stepObjectInit');
            $graphic_init_props.hide();
            $canvas.append($graphic_init_props);

            // Object's outline used to indicate that the object is selected
            $graphic_outline = $('<div>');
            $graphic_outline.attr('id', "stepObjectOutline_" + self.id + "_" + objNum);
            $graphic_outline.attr('objNum', objNum);
            $graphic_outline.addClass('stepObject');
            $graphic_outline.addClass('stepObjectOutline');
            $graphic_outline.css('box-sizing', 'border-box');
            $graphic_outline.css('-moz-box-sizing', 'border-box');
            $canvas.append($graphic_outline);

            // Object's displayed graphic on step
            $graphic = $('<div>');
            $graphic.attr('id', "stepObjectGraphic_" + self.id + "_" + objNum);
            $graphic.attr('objNum', objNum);
            $graphic.attr('transformDeg', '0');
            $graphic.attr('title', 'Drag to move.');
            $graphic.addClass('stepObject');
            $graphic.addClass('stepObjectGraphic');
            $canvas.append($graphic);
            updateGraphicAndInitCSS(objNum, 'top', top_pos);
            updateGraphicAndInitCSS(objNum, 'left', left_pos);

            for (defaultCSSProp in DEFAULT_CSS_PROPERTIES_USED_BY_ALL_OBJECTS) {
                updateGraphicAndInitCSS(objNum, defaultCSSProp, DEFAULT_CSS_PROPERTIES_USED_BY_ALL_OBJECTS[defaultCSSProp]);
            }

            if (canEdit) {
                $graphic.draggable({
                    grid: [ gridGranularity, gridGranularity ],
                    containment: 'parent',
                    start: function(event, ui) {
                        // store initial location of all selected so that drag can be a diff of start and current
                        selectedObjsInitPositions = [];
                        $selectedObjs = $("#canvas_" + self.id+' .stepObjectGraphic[isselected=\'true\']');

                        if ($selectedObjs.length > 1) {
                            $selectedObjs.each(function(index, value) {
                                selectedObjsInitPositions.push([ roundCSSProperty($(value).css('top'), 0), roundCSSProperty($(value).css('left'), 0) ]);
                                if ($(value).attr('objNum') === objNum) {
                                    draggedObjsInitPosition = [ roundCSSProperty($(value).css('top'), 0), roundCSSProperty($(value).css('left'), 0) ];
                                }
                            });
                        }

                        return;
                    },
                    drag: function(event, ui) {
                        ui.position.top = Math.floor(ui.position.top);
                        ui.position.left = Math.floor(ui.position.left);
                        updateInitOrInstrPosition(objNum, ui.position.top, ui.position.left);

                        $selectedObjs = $("#canvas_" + self.id+' .stepObjectGraphic[isselected=\'true\']');
                        if ($selectedObjs.length > 1) {
                            topDiff = ui.position.top - draggedObjsInitPosition[0];
                            leftDiff = ui.position.left - draggedObjsInitPosition[1];
                            $selectedObjs.each(function(index, value) {
                                if ($(value).attr('objNum') !== objNum) {
                                    var topLeft = selectedObjsInitPositions[index];
                                    var top = topLeft[0];
                                    var left = topLeft[1];
                                    updateInitOrInstrPosition($(value).attr('objNum'), (top + topDiff), (left + leftDiff)); // not updating instruction and not updating outline
                                }
                            });
                        }
                        return;
                    },
                    stop: function(event, ui) {
                        takeSnapshot();
                    }
                });

                $graphic.mousedown(function(e) {
                    if (e.ctrlKey && navigator.userAgent.indexOf('Mac')) {
                        // Do not select or deselect the object as the user is trying to
                        // bring up the context menu in this particular case.
                        return;
                    }

                    if (!isAnimationPlaying && isEditorShown) {
                        document.activeElement.blur();
                        if ($graphic.attr('contenteditable') == 'true') { // if clicked object is currently editable... then remain editable
                            // do nothing: remain editable
                        } else {
                            const isClickedElementAlreadySelected = $('#listObject_' + self.id + '_' + objNum).hasClass('labelSelected');

                            $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                            if (e.ctrlKey || e.metaKey) {
                                if (isClickedElementAlreadySelected) {
                                    deselectObjByObjNum(objNum);
                                }
                                else {
                                    selectObjByObjNum(objNum, true);
                                }
                            }
                            else if ($selectedObjs.length > 1) {
                                selectObjByObjNum(objNum, isClickedElementAlreadySelected);
                            }
                            else {
                                selectObjByObjNum(objNum);
                            }
                        }
                    }
                    return;
                });

                $graphic.data({ 'codeColorize': "none" });
            }

            // Add object's list item to list of objects
            $listItem = $('<div>');
            $listItem.attr('id', 'listObject_' + self.id + '_' + objNum);
            $listItem.attr('objName', objName);
            $listItem.attr('title', 'Drag to sort. Click to select. Double-click to rename.');
            $listItem.addClass('label');
            $listItem.attr('objNum', objNum);
            if (canEdit) {
                function handleListItemClick(e) {
                    if (!isAnimationPlaying) {
                        if ($listItem.find('.labelText').attr('contenteditable') !== 'true') {
                            if (e.shiftKey && $(listObjPivot()).length) {
                                var pivotIndex = $objList.children().index(listObjPivot());
                                var clickedIndex = $objList.children().index($listItem);
                                var selectedIndices = shiftSelectedIndices();
                                for (var i = selectedIndices.start; i <= selectedIndices.end; ++i) {
                                    deselectObjByObjNum($objList.children().eq(i).attr('objNum'));
                                }
                                listObjPivot($objList.children().eq(pivotIndex));
                                if (pivotIndex < clickedIndex) {
                                    selectedIndices.start = pivotIndex;
                                    selectedIndices.end = clickedIndex;
                                } else {
                                    selectedIndices.start = clickedIndex;
                                    selectedIndices.end = pivotIndex;
                                }
                                for (var i = selectedIndices.start; i <= selectedIndices.end; ++i) {
                                    selectObjByObjNum($objList.children().eq(i).attr('objNum'), true, true);
                                }
                                shiftSelectedIndices(selectedIndices);
                            } else {
                                var multiSelectOn = e.ctrlKey || e.metaKey;
                                var emptyIndices = { start: 0, end: -1 };
                                if ($listItem.hasClass('labelSelected') && multiSelectOn) {
                                    deselectObjByObjNum(objNum);
                                    if ($(listObjPivot()).length) {
                                        if (objNum === listObjPivot().attr('objNum')) {
                                            shiftSelectedIndices(emptyIndices);
                                            listObjPivot(null);
                                        }
                                    }
                                } else {
                                    selectObjByObjNum(objNum, multiSelectOn, true);
                                    shiftSelectedIndices(emptyIndices);
                                    listObjPivot($listItem);
                                }
                            }
                        }
                    }
                }
                $listItem.click(handleListItemClick);

                function handleListItemMouseDown(e) {
                    var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');

                    // If no objects are selected, ensure that a right click on the list
                    // selects an object.
                    if (isEventRightMouseButton(e) && $selectedObjects.length == 0) {
                        handleListItemClick(e);
                    }
                }
                $listItem.mousedown(handleListItemMouseDown);
            }
            // David May 9/11/20 Updating duplicate ordering
            if (objectName) {
                for (var i = 0; i < $objList.children().length; ++i) {
                    // If current object is selected and passed in objectName matches object's name, insert new obj immediately after
                    if (objectName === $objList.children().eq(i).attr('objname')) {
                        $objList.children().eq(i).after($listItem);
                        break;
                    }
                }
            } else {
                $objList.prepend($listItem); // If not duplicating, place new object at top of objList
            }

            reorderObjectZIndex();

            $listItemName = $('<div>');
            $listItemName.text(objName);
            $listItemName.addClass('labelText');
            $listItem.append($listItemName);

            $listItemRemove = $('<div>');
            $listItemRemove.text('x');
            $listItemRemove.addClass('labelRemove');
            if (canEdit) {
                $listItemRemove.click(function() {
                    if (!isAnimationPlaying) {
                        if ($("#listObject_" + self.id + "_" + objNum).hasClass('labelSelected')) {
                            $selectedObjs = $("#canvas_" + self.id+' .stepObjectGraphic[isselected=\'true\']');
                            $selectedObjs.each(function(index, value) {
                                removeObject($(value).attr('objNum'));
                            });
                        } else {
                            removeObject(objNum);
                        }
                        takeSnapshot();
                    }
                    return;
                });
            }
            $listItem.append($listItemRemove);

            $listItemClearFloat = $('<div>');
            $listItemClearFloat.css('clear', 'both');
            $listItem.append($listItemClearFloat);

            if (canEdit) {
                function updateInstrObjectName() {
                    $("#instrContainer_" + self.id).find('.label').each(function() {
                        var $instr = $(this);
                        if ($instr.attr('objNum') === $listItem.attr('objNum')) {
                            $("#instrObjName_" + self.id + "_" + $instr.attr('instrNum')).text($this.text());
                        }
                    });
                    return;
                }
                function handleKeyDownForEditingObjectName(event) {
                    $this = $(this);
                    if (event.keyCode == 13) { // pressed enter
                        event.preventDefault();
                        tearDownObjectNameEditor();
                    }

                    return;
                }
                function tearDownObjectNameEditor() {
                    $this = $listItem.find('.labelText');

                    $objList.sortable('enable');
                    $this.attr('contenteditable', 'false');
                    $this.parent().css('background-color', '');

                    if ($this.text().length === 0) { // if new object name is empty
                        $this.text($listItem.attr('objName')); // revert back to previous object name
                    } else {
                        $listItem.attr('objName', $this.text()); // keep new object name
                        updateInstrObjectName();
                    }

                    $listItem.find('.labelText').unbind('keydown', handleKeyDownForEditingObjectName);
                    $listItem.find('.labelText').unbind('keyup', updateInstrObjectName);
                    $listItem.find('.labelText').unbind('blur', tearDownObjectNameEditor);
                    $listItem.unbind('mousedown', listItemMouseDown);

                    takeSnapshot();

                    return;
                }
                function listItemMouseDown(e) { // AE 020814 Necessary, otherwise the animator can't highlight the object name while editing because the parent fires the blur event
                    if (!isAnimationPlaying && isEditorShown) {
                        e.stopPropagation();
                    }
                    return;
                }

                $listItem.dblclick(function() {
                    if (!isAnimationPlaying && isEditorShown) {
                        $this = $(this).find('.labelText');
                        $objList.sortable('disable');
                        $this.attr('contenteditable', true);
                        $this.parent().css('background-color', 'rgb(140, 140, 140)');
                        $this.focus();
                        $this.selectText();

                        $this.keydown(handleKeyDownForEditingObjectName).keyup(updateInstrObjectName);

                        $listItem.data('hasBeenMousedowned', false);
                        $this.blur(tearDownObjectNameEditor);
                        $listItem.mousedown(listItemMouseDown);
                    }
                    return;
                });
            }

            return objNum;
        }

        // (optional) |isLoading| is expected to be a boolean. If |isLoading| is false, then select this object once created. Otherwise, do not select the object. |isLoading| is defaulted to false.
        //     When loading an animation, the created object should not be selected.
        function addGateObj(isLoading, objectName, objectType = 'Generic Gate') {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = objectType;

            var objNum = addObj(objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);

            if (canEdit) {
                $graphic.attr('title', $graphic.attr('title') + ' Drag from right-side or bottom to resize.');
                addResizableToObject($graphic);
            }

            // Remove arrow drawing added by resizable from object graphic
            $graphic.children('.ui-resizable-se').removeClass('ui-icon-gripsmall-diagonal-se').removeClass('ui-icon');

            return objNum;
        }

        // Apply the default CSS properties to the gate object with |objNum|
        // |objNum| is a string and required
        function applyDefaultCSSToGateObject(objNum) {
            for (var defaultCSSProp in DEFAULT_CSS_PROPERTIES_USED_BY_GATE_OBJECTS) {
                updateGraphicAndInitCSS(objNum, defaultCSSProp, DEFAULT_CSS_PROPERTIES_USED_BY_GATE_OBJECTS[defaultCSSProp]);
            }
        }

        /*
            If an animation is not |isLoading|, then deselect other objects and select |objectNumber|.
            |isLoading| is required and a bool.
            |objectNumber| is required and a string.
        */
        function selectObjectIfNotCurrentlyLoading(isLoading, objectNumber) {
            if (!isLoading) {
                deselectAllObjs();
                selectObjByObjNum(objectNumber);
                listObjPivot($('#listObject_' + self.id + '_' + objectNumber));
            }
        }

        function addANDObj(isLoading, objectName, objectType) {
            isLoading = isLoading !== undefined ? isLoading : false;
            objectType = objectType || OBJECT_PROPERTIES.ANDgate.name;

            var objNum = addGateObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.ANDgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.ANDgate.type);

            var $ANDgateLeftHalf = $('<div>');
            $ANDgateLeftHalf.addClass('and-gate-left-half');
            $graphic.append($ANDgateLeftHalf);

            var $ANDgateRightHalf = $('<div>');
            $ANDgateRightHalf.addClass('and-gate-right-half');
            $graphic.append($ANDgateRightHalf);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addORObj(isLoading, objectName, objectType) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = objectType || OBJECT_PROPERTIES.ORgate.name;

            var objNum = addGateObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.ORgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.ORgate.type);

            var $ORgateLeftCorners = $('<div>');
            $ORgateLeftCorners.addClass('or-gate-left-corners');
            $graphic.append($ORgateLeftCorners);

            var $ORgateBottomRight = $('<div>');
            $ORgateBottomRight.addClass('or-gate-bottom-right');
            $graphic.append($ORgateBottomRight);

            var $ORgateTopRight = $('<div>');
            $ORgateTopRight.addClass('or-gate-top-right');
            $graphic.append($ORgateTopRight);

            var $ORgateLeftCurve = $('<div>');
            $ORgateLeftCurve.addClass('or-gate-left-curve');
            $graphic.append($ORgateLeftCurve);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addXORObj(isLoading, objectName, objectType) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = objectType || OBJECT_PROPERTIES.XORgate.name;

            var objNum = addORObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.XORgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.XORgate.type);

            var $XORgateLeftCurve = $('<div>');
            $XORgateLeftCurve.addClass('xor-gate-left-curve');
            $graphic.append($XORgateLeftCurve);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addNOTObj(isLoading, objectName) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = OBJECT_PROPERTIES.NOTgate.name;

            var objNum = addGateObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.NOTgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.NOTgate.type);

            var $notSymbol = $('<div>');
            $notSymbol.addClass('not-symbol');
            $graphic.append($notSymbol);

            var $NOTgateLeftSide = $('<div>');
            $NOTgateLeftSide.addClass('not-gate-left-side');
            $graphic.append($NOTgateLeftSide);

            var $NOTgateTopSide = $('<div>');
            $NOTgateTopSide.addClass('not-gate-top-side');
            $graphic.append($NOTgateTopSide);

            var $NOTgateBottomSide = $('<div>');
            $NOTgateBottomSide.addClass('not-gate-bottom-side');
            $graphic.append($NOTgateBottomSide);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addNANDObj(isLoading, objectName) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = OBJECT_PROPERTIES.NANDgate.name;

            var objNum = addANDObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.NANDgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.NANDgate.type);

            var $notSymbol = $('<div>');
            $notSymbol.addClass('not-symbol');
            $graphic.append($notSymbol);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addNORObj(isLoading, objectName) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = OBJECT_PROPERTIES.NORgate.name;

            var objNum = addORObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.NORgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.NORgate.type);

            var $notSymbol = $('<div>');
            $notSymbol.addClass('not-symbol');
            $graphic.append($notSymbol);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addXNORObj(isLoading, objectName) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = OBJECT_PROPERTIES.XNORgate.name;

            var objNum = addXORObj(isLoading, objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.XNORgate.type);
            $listItem.attr('objType', OBJECT_PROPERTIES.XNORgate.type);

            var $notSymbol = $('<div>');
            $notSymbol.addClass('not-symbol');
            $graphic.append($notSymbol);

            applyDefaultCSSToGateObject(objNum);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addTriangleObj(isLoading, objectName) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            objectType = OBJECT_PROPERTIES.triangle.name;

            var objNum = addObj(objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            $graphic.attr('objType', OBJECT_PROPERTIES.triangle.type);

            $graphic.addClass('triangle-step-object');

            updateGraphicAndInitCSS(objNum, 'background-color', COLORS[BLACK_COLOR]);

            updateGraphicOutline(objNum, 'top', $graphic.css('top'));
            updateGraphicOutline(objNum, 'left', $graphic.css('left'));
            updateGraphicOutline(objNum, 'height', $graphic.css('height'));
            updateGraphicOutline(objNum, 'width', $graphic.css('width'));

            var $listItem = $('#listObject_' + self.id + '_' + objNum);
            $listItem.attr('objType', OBJECT_PROPERTIES.triangle.type);

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        /*
            Add a resizable listener to |$graphic|.
            |$graphic| is required and a jQuery object.
        */
        function addResizableToObject($graphic) {
            var objectNumber = $graphic.attr('objNum');
            var oldHeight = 0;
            var oldWidth = 0;
            $graphic.resizable({
                grid: [
                    gridGranularity,
                    gridGranularity
                ],
                /*
                    Exclude nw because north/west changes graphic's height/width instead of top/left,
                    resulting in an inaccurate object location.
                */
                handles:   'e, s, se',
                minHeight: 1,
                minWidth:  1,
                start: function(event, ui) {
                    // Store the object size before the resizing starts
                    oldHeight = roundCSSProperty($graphic.css('height'), 0);
                    oldWidth = roundCSSProperty($graphic.css('width'), 0);
                },
                resize: function(event, ui) {
                    var newHeight = Math.floor(ui.size.height);
                    var newWidth = Math.floor(ui.size.width);

                    // Constrain object's proportions
                    if ($graphic.data('useConstrainedProportions')) {
                        var proportions = $graphic.data('constrainedProportions');

                        /*
                            If |heightChange| is larger than |widthChange|,
                            then use proportion based on height
                        */
                        var heightChange = Math.abs(oldHeight - newHeight);
                        var widthChange = Math.abs(oldWidth - newWidth);
                        if (heightChange > widthChange) {
                            newWidth = Math.round(newHeight * proportions.width / proportions.height);
                        }
                        // Otherwise, use a proportion based on width.
                        else {
                            newHeight = Math.round(newWidth * proportions.height / proportions.width);
                        }
                    }

                    updateInitOrInstrHeightWidth(objectNumber, newHeight, newWidth);
                },
                stop: takeSnapshot
            });

            // Remove arrow drawing added by resizable
            $graphic.children('.ui-resizable-se').removeClass('ui-icon-gripsmall-diagonal-se').removeClass('ui-icon');
        }

        // David May 7/25/20 Function to add a "line" object. Creates a box object, but with different default CSS props.
        function addLineObj(isLoading, objectName) {
            isLoading = isLoading || false;
            objectType = OBJECT_PROPERTIES.box.name;

            var objNum = addObj(objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.box.type);
            $graphic.data('useConstrainedProportions', false);
            $listItem.attr('objType', OBJECT_PROPERTIES.box.type);

            for (var defaultCSSProp in DEFAULT_CSS_PROPERTIES_USED_BY_LINE_OBJECTS) {
                updateGraphicAndInitCSS(objNum, defaultCSSProp, DEFAULT_CSS_PROPERTIES_USED_BY_LINE_OBJECTS[defaultCSSProp]);
            }

            if (canEdit) {
                $graphic.attr('title', $graphic.attr('title') + ' Drag from right-side or bottom to resize.');
                addResizableToObject($graphic);
            }

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        function addBoxObj(isLoading, objectName) {
            isLoading = isLoading || false;
            objectType = OBJECT_PROPERTIES.box.name;

            var objNum = addObj(objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $graphic.attr('objType', OBJECT_PROPERTIES.box.type);
            $graphic.data('useConstrainedProportions', false);
            $listItem.attr('objType', OBJECT_PROPERTIES.box.type);

            for (var defaultCSSProp in DEFAULT_CSS_PROPERTIES_USED_BY_BOX_OBJECTS) {
                updateGraphicAndInitCSS(objNum, defaultCSSProp, DEFAULT_CSS_PROPERTIES_USED_BY_BOX_OBJECTS[defaultCSSProp]);
            }

            if (canEdit) {
                $graphic.attr('title', $graphic.attr('title') + ' Drag from right-side or bottom to resize.');
                addResizableToObject($graphic);
            }

            selectObjectIfNotCurrentlyLoading(isLoading, objNum);

            return objNum;
        }

        /**
            Return whether the text object's language is zyCode.
            @method isTextObjectCode
            @param {String} language The language of the text object.
            @return {Boolean} Whether the language is zyCode.
        */
        function isTextObjectZyCode(language) {
            var lowercaseLanguage = language.toLowerCase();

            return ([ 'none', 'latex' ].indexOf(lowercaseLanguage) === -1);
        }

        /**
            Set the given text to the text object.
            @method setTextOnTextObject
            @param {String} text The text to set.
            @param {Object} $graphic The jQuery object reference to the text object.
            @return {void}
        */
        function setTextOnTextObject(text, $graphic) {
            $graphic.data('text', text);

            let renderedText = text;

            // If latex and in editor mode, convert $..$ -> \\(..\\) in text, then paste back to html.
            if (($graphic.data('codeColorize') === 'latex') && isEditorShown) {
                renderedText = text.replace(/\$(.+)\$/g, '\\($1\\)');
            }

            $graphic.html(renderedText);
        }

        var updateObjNum; // Global, stores most recently edited text object number
        var initText; // Stores value of text object on double click (before editing)
        function addTextObj(txt, isLoading, zyCodeType, objectName, isDuplicating) {
            isLoading = (isLoading !== undefined) ? isLoading : false;
            zyCodeType = zyCodeType !== undefined ? zyCodeType : 'none';
            objectType = OBJECT_PROPERTIES.text.name;
            isDuplicating = Boolean(isDuplicating);

            var objNum = addObj(objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);
            initText = $graphic.text(); // David May 7/3/20 Will determine if we need to update object title
            updateObjNum = objNum; // David May 7/18/20 update objNum's title rather than the currently selected obj's title
            var $fontFamilyOption;
            var defaultCSSProp;

            $graphic.attr('objType', OBJECT_PROPERTIES.text.type);
            $graphic.data({ codeColorize: zyCodeType });

            if (canEdit) {
                $graphic.attr('title', '');
                $graphic.tooltip({ content: 'Drag to move.<br>Double-click to edit.' }); // AE 050314: Current version of toolTip plugin in jQuery UI has bug with adding <br> to title. This is a temp hack to make text look pretty.
                decideWhetherToShowToolTip();
            }

            $listItem.attr('objType', OBJECT_PROPERTIES.text.type);
            updateGraphicAndInitCSS(objNum, 'width', 'auto');
            updateGraphicAndInitCSS(objNum, 'height', 'auto');

            /*
                When loading an animation, use |DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS|.
                Otherwise, use |INITIAL_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS|.
            */
            var propertiesToLoad = isLoading ? DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS : INITIAL_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS;
            for (cssProperty in propertiesToLoad) {
                updateGraphicAndInitCSS(objNum, cssProperty, propertiesToLoad[cssProperty]);
            }

            function enableContentEdit() {
                if (!isAnimationPlaying && isEditorShown) {
                    selectObjByObjNum(objNum);
                    listObjPivot($('#listObject_' + self.id + '_' + objNum));

                    $graphic.draggable('disable');
                    $graphic.attr('contenteditable', true);
                    $graphic.focus();

                    $graphic.keyup(function() {
                        updateGraphicOutline(objNum, 'height', $graphic.css('height'));
                        updateGraphicOutline(objNum, 'width', $graphic.css('width'));

                        if ($graphic.data('uiTooltipTitle') !== '') {
                            $graphic.data('title_tmp', $graphic.data('uiTooltipTitle'));
                            $graphic.data('uiTooltipTitle', '');
                            disableTooltip();
                            enableTooltip();
                        }

                    });
                }
            }

            if(txt !== undefined) {
                $graphic.attr('contenteditable', false);
                setTextOnTextObject(txt, $graphic);
            } else {
                if (canEdit) {
                    $graphic.data('shouldChangeObjName', !isLoading);
                    enableContentEdit();
                    setTextOnTextObject('add text', $graphic);
                    $graphic.selectText();
                    updateGraphicOutline(objNum, 'height', $graphic.css('height'));
                    updateGraphicOutline(objNum, 'width', $graphic.css('width'));
                }
            }

            if (canEdit) {
                function clearFormattingAndRemoveEventListeners() {
                    $graphic.text($graphic.text());
                    updateGraphicOutline(objNum, 'height', $graphic.css('height'));
                    updateGraphicOutline(objNum, 'width', $graphic.css('width'));
                    $(document).off('touchend');
                    $graphic.off('keyup');
                    $graphic.off('blur');
                }

                $graphic.bind('paste', function() {
                    $graphic.keyup(function() {
                        clearFormattingAndRemoveEventListeners();
                    });
                    $graphic.blur(function() {
                        clearFormattingAndRemoveEventListeners();
                    });
                    $(document).on('touchend', $graphic, function(e) {
                        clearFormattingAndRemoveEventListeners();
                    });
                });

                $graphic.dblclick(function() {
                    updateObjNum = objNum;
                    initText = $graphic.text(); // David May 6/27/20 Store initial graphic text to compare with title
                    if ($graphic.attr('contenteditable') === 'false') {
                        const text = $graphic.data('text');

                        $graphic.html(text);
                        enableContentEdit();
                    }
                });

                // David May 6/27/20 Compares var initText with object title and updates title if condition is met.
                $graphic.on('click blur', function() {
                    $updateGraphicObj = $('#stepObjectGraphic_' + self.id + '_' + updateObjNum);
                    $updateListObj = $('#listObject_' + self.id + '_' + updateObjNum);

                    if (initText.substr(0, 20) == $updateListObj.attr('objname').substr(0, 20) || (initText == 'add text' && initText != $updateGraphicObj.data('text'))) {
                        $updateListObj.attr('objname', $updateGraphicObj.data('text').substring(0, 20));
                        $updateListObj.children('.labelText').text($updateGraphicObj.data('text').substring(0, 20));
                    }
                });
            }

            // Add CSS properties for zyCode objects.
            if (isTextObjectZyCode(zyCodeType)) {
                zyCodeTextCSSProperties(objNum);
            }

            if (isDuplicating) {
                selectObjectIfNotCurrentlyLoading(isLoading, objNum);
            }

            return objNum;
        }

        /*
            Set |$imageObject| with default CSS.
            |$imageObject| is required and a jQuery object.
        */
        function setImageObjectWithDefaultCSS($imageObject) {
            var objectNumber = $imageObject.attr('objNum');
            for (var cssProperty in DEFAULT_CSS_PROPERTIES_USED_BY_IMAGE_OBJECTS) {
                updateGraphicAndInitCSS(objectNumber, cssProperty, DEFAULT_CSS_PROPERTIES_USED_BY_IMAGE_OBJECTS[cssProperty]);
            }
        }

        /*
            Update the image URL in the inspector with the new URL.
            |$imageObject| is required and a jQuery object.
        */
        function updateInspectorWithNewImageURL($imageObject) {
            // If the object is the only selected object, then also update the inspector
            var $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
            if ($selectedObjects.length === 1) {
                var selectedObjectNumber = $selectedObjects.attr('objNum');
                var objectNumber = $imageObject.attr('objNum');
                if (selectedObjectNumber === objectNumber) {
                    var googleDriveFileID = $imageObject.data('googleDriveFileID');
                    $('#google-drive-file-id-' + self.id).text(googleDriveFileID);
                }
            }
        }

        /*
            Update the image of |$imageObject|.
            |$imageObject| is required and a jQuery object.
            |isLoading| is required and a bool.
            |downloadFromGoogle| is required and a bool.
        */
        function updateImageURL($imageObject, isLoading, downloadFromGoogle, width, height) {
            downloadFromGoogle = downloadFromGoogle || false;

            updateInspectorWithNewImageURL($imageObject);

            // Remove pre-existing img HTML
            $imageObject.find('img').remove();

            // Append new img HTML
            var alternateText = canEdit ? 'Image not found. Double-click to edit.' : 'Image loading...';
            var googleDriveFileID = $imageObject.data('googleDriveFileID');
            const getResource = self.parentResource.getStaticResource || self.parentResource.getDependencyURL;
            let imageURL = getResource.call(self.parentResource, `gdrive_images/${googleDriveFileID}`); // eslint-disable-line prefer-reflect

            if (downloadFromGoogle) {
                imageURL = 'https://drive.google.com/uc?export=download&id=' + googleDriveFileID;
            }
            var imageHTML = self[self.name]['imageObject']({
                source:        imageURL,
                alternateText: alternateText
            });
            $imageObject.append(imageHTML);

            // Handle image loading
            var $newImgHTML = $imageObject.find('img');
            $newImgHTML.one('load', function() {
                if (!isLoading) {
                    const heightToUse = height || this.naturalHeight;
                    const widthToUse = width || this.naturalWidth;

                    // Set height/width to the image's natural height/width
                    const objectNumber = $imageObject.attr('objnum');

                    updateGraphicAndInitCSS(objectNumber, 'height', heightToUse);
                    updateGraphicAndInitCSS(objectNumber, 'width', widthToUse);

                    $imageObject.data('constrainedProportions', {
                        height: this.naturalHeight,
                        width: this.naturalWidth,
                    });

                    // Set width and height for duplicated image
                    $imageObject.height(heightToUse);
                    $imageObject.width(widthToUse);
                }
            }).each(function() {
                if (this.complete) {
                    $(this).on('load');
                }
            }).on('error', () => {

                /*
                    Downloading from S3 failed, so try downloading from GDrive by calling this
                    function again.
                */
                if (downloadFromGoogle) {
                    setImageObjectWithDefaultCSS($imageObject);
                    // If the animation is not editable, then the user needs directions.
                    if (!canEdit) {
                        $newImgHTML.prop('alt', 'Image did not load. Try refreshing.');
                    }
                }
                else {
                    updateImageURL($imageObject, isLoading, true);
                }
            });
        }

        /*
            Prompt the user to edit the image's URL for object number |objectNumber|.
            Return the user-entered URL.
            |objectNumber| is required and a string.
        */
        function promptUserToEditImageURL(objectNumber) {
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
            var newImageURL = window.prompt('Enter Google Drive file ID:', $graphic.data('googleDriveFileID'));
            if (!!newImageURL) {
                $graphic.data('googleDriveFileID', newImageURL);
                updateImageURL($graphic, false);
            }
            return newImageURL;
        }

        /*
            |googleDriveFileID| is optional and a string.
            |isLoading| is optional and a bool.
            |objectName| is optional and a string.
        */
        function addImageObject(googleDriveFileID, isLoading, objectName, width = 0, height = 0) {
            googleDriveFileID = googleDriveFileID || '';
            isLoading = isLoading || false;
            objectType = OBJECT_PROPERTIES.image.name;

            var objectNumber = addObj(objectName, objectType);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
            var $listItem = $('#listObject_' + self.id + '_' + objectNumber);

            $graphic.attr('objType', OBJECT_PROPERTIES.image.type);
            $graphic.data('googleDriveFileID', googleDriveFileID);
            $graphic.data('useConstrainedProportions', true);
            $listItem.attr('objType', OBJECT_PROPERTIES.image.type);

            setImageObjectWithDefaultCSS($graphic);

            $graphic.data('constrainedProportions', {
                height: $graphic.height(),
                width:  $graphic.width()
            });

            updateImageURL($graphic, isLoading, false, width, height);

            if (!isLoading && !googleDriveFileID) {
                // User did not add a URL, so remove the object.
                if (promptUserToEditImageURL(objectNumber) == null) {
                    removeObject(objectNumber);
                    return;
                }
            }

            if (canEdit) {
                // Add tooltip to image object
                $graphic.attr('title', '');
                $graphic.tooltip({
                    content: 'Drag to move.<br>Double-click to edit.'
                });
                decideWhetherToShowToolTip();

                // Double-click to edit image URL
                $graphic.dblclick(function() {
                    promptUserToEditImageURL(objectNumber);
                });

                addResizableToObject($graphic);
            }

            selectObjectIfNotCurrentlyLoading(isLoading, objectNumber);

            return objectNumber;
        }

        function addInstr(isLoading) { // Abstract instruction creator for all instructions
            var instrNum = ++numInstrs;
            var $instrList = $("#instrList_" + self.id);
            var $selectedInstr = $instrList.children('.labelSelected');
            var $instr = $('<div>');
            var $removeLabelDiv;
            var $instrLabelDiv;

            $instr.attr('id', 'instr_' + self.id + '_' + instrNum);
            $instr.attr('title', 'Drag to sort. Click to select.');

            if ($selectedInstr.length > 0) { // If a selected instruction exists
                $selectedInstr.after($instr); // add the new instruction after the selected instruction
            } else if ($('#step1_' + self.id).hasClass('labelSelected')) { // If Step 1 is selected
                $instrList.prepend($instr); // add to the top of the instruction list
            } else {
                $instrList.append($instr); // otherwise, add the instruction to the end of the list
            }

            $instr.attr('instrNum', instrNum);

            $instr.addClass('label');
            if (canEdit) {
                $instr.click(function(e) {
                    if (!isAnimationPlaying) {
                        hideStartButton();
                        selectInstrByInstrNum(instrNum);
                    }
                    return;
                });
            }

            $removeLabelDiv = $('<div>');
            $removeLabelDiv.text('x');
            $removeLabelDiv.addClass('labelRemove');
            if (canEdit) {
                $removeLabelDiv.click(function() {
                    if (!isAnimationPlaying) {
                        removeInstruction(instrNum);
                        takeSnapshot();
                    }
                    return;
                });
            }
            $instr.append($removeLabelDiv);

            $instrLabelDiv = $('<div>');
            $instrLabelDiv.attr('id', "instrLabelText_" + self.id + "_" + instrNum);
            $instr.append($instrLabelDiv);

            hideStartButton();

            return instrNum;
        }

        /**
            Add caption listeners to the given caption textarea.
            @method addCaptionListeners
            @param {Object} $captionTextarea The textarea on which to add the listeners.
            @return {void}
        */
        function addCaptionListeners($captionTextarea) {

            // Adding keyup/keydown yields MathJax errors b/c the content is changing to quickly.
            $captionTextarea.keyup(event => { // David May 7/13/20 Dynamically update caption. Will ask Alex about the above comment b/c can't repeat.
                const $caption = $(`#caption_${self.id}`);
                const text = $(event.target).val();

                if (text !== $caption.data('text')) {
                    setCaption(text);
                }

                takeSnapshot();
            });
        }

        function addStepInstr(caption, isLoading) {
            isLoading = typeof isLoading !== 'undefined' ? isLoading : false;
            caption = caption !== undefined ? caption : INSTR_STEP_PLACEHOLDER_TEXT;

            var instrNum = addInstr(isLoading);
            var $instr = $("#instr_" + self.id + "_" + instrNum);
            var $instrLabelDiv = $("#instrLabelText_" + self.id + "_" + instrNum);
            var $clearBothDiv;
            var $instrMenuDiv;
            var $captionTextarea;
            var $caption = $("#caption_" + self.id);

            $instrLabelDiv.addClass('stepLabel');
            $instrLabelDiv.css('padding-left', '10px');
            $instr.attr('instrType', 'step');

            if (!isLoading) {
                updateStepNumbering();
            }

            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $instr.append($clearBothDiv);

            $instrMenuDiv = $('<div>');
            $instrMenuDiv.addClass('instrMenu');
            $instr.append($instrMenuDiv);

            $captionTextarea = $('<textarea>');
            $captionTextarea.attr('id', "instrCaption_" + self.id + "_" + instrNum);
            $captionTextarea.attr('placeholder', INSTR_STEP_PLACEHOLDER_TEXT);
            $captionTextarea.attr('rows', '4');
            $captionTextarea.attr('cols', '26');
            $captionTextarea.css('resize', 'none');
            if (caption !== INSTR_STEP_PLACEHOLDER_TEXT) {
                setCaption(caption);
                $captionTextarea.val(caption);
            }
            $instrMenuDiv.append($captionTextarea);

            if (canEdit) {
                addCaptionListeners($captionTextarea);
            }

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        /*
            Abstract action instruction creator, such as for move or fade instructions.
            |objNum| is required and a string.
            |isLoading| and |isGrouped| are not required and are boolean.
        */
        function addActionInstr(objNum, isLoading, isGrouped) {
            var instrNum = addInstr(isLoading);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $listItem = $('#listObject_' + self.id + '_' + objNum);

            $instr.attr('objNum', objNum);
            $instr.attr('title', $instr.attr('title') + ' Double-click to select object.');
            $instrLabelDiv.addClass('labelText');

            function selectThisInstruction() {
                if (!isAnimationPlaying) {
                    selectObjByObjNum(objNum);
                    $instr.click();
                }
            }

            if (canEdit) {
                $instr.dblclick(function() {
                    if ($instr.hasClass('labelSelectedButNotObjNum')) {
                        selectThisInstruction();
                        outlineInstrsByObjNum(); // David May 7/25/20 outline relevant instrs when object is selected
                    }
                });
            }

            var $instrImg = $('<img>');
            $instrLabelDiv.append($instrImg);

            var $instrObjName = $('<span>');
            $instrObjName.css('margin-left', '5px');
            $instrObjName.attr('id', 'instrObjName_' + self.id + '_' + instrNum);
            $instrObjName.text($listItem.attr('objName'));
            $instrLabelDiv.append($instrObjName);

            var $timeLabelDiv = $('<div>');
            $timeLabelDiv.text(isGrouped ? '-' : '0s');
            $timeLabelDiv.addClass('timeLabel');
            $instr.append($timeLabelDiv);

            if (canEdit) {
                $timeLabelDiv.click(function() {
                    if (!isAnimationPlaying) {
                        selectThisInstruction();

                        var previousTime = $timeLabelDiv.text();
                        var previousTimeAsNumber = (previousTime !== '-') ? parseFloat(previousTime) : previousTime;

                        // Get new time from user.
                        var userInputTime = prompt('Enter seconds after previous (- for at the same time)', previousTimeAsNumber);
                        userInputTime = (userInputTime !== null) ? userInputTime.trim() : userInputTime;

                        // Update time based on user input time.
                        var userInputTimeIsDash = userInputTime === '-';
                        var userInputTimeAsFloat = parseFloat(userInputTime);
                        var userInputTimeIsNaN = isNaN(userInputTimeAsFloat);
                        var userInputTimeIsNegative = userInputTimeAsFloat < 0;

                        // If user inputs '-', then new time is '-'.
                        var newTime = '';
                        if (userInputTimeIsDash) {
                            newTime = userInputTime;
                        }
                        // If user input is NaN or a negative number, then use the previous time.
                        else if (userInputTimeIsNaN || userInputTimeIsNegative) {
                            newTime = previousTime;
                        }
                        // Otherwise, the time is a positive number, so just append an 's'.
                        else {
                            newTime = userInputTimeAsFloat + 's';
                        }
                        $timeLabelDiv.text(newTime);

                        // Take a snapshot if the time changed.
                        if (newTime !== previousTime) {
                            takeSnapshot();
                        }
                    }
                });
            }

            var $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $instr.append($clearBothDiv);

            var $instrMenuDiv = $('<div>');
            $instrMenuDiv.addClass('instrMenu');
            $instr.append($instrMenuDiv);

            return instrNum;
        }

        /*
            Update |$instruction| to use the easing |easing|.
            |$instruction| is required and a jQuery object.
            |easing| is required and a string.
        */
        function updateEasing($instruction, easing) {
            $instruction.data('easing', easing);

            // Select option in easing dropdown with |defaultEasing| value
            $instruction.find('select.easing-dropdown').find('option').filter(function() {
                return ($(this).val() === easing);
            }).prop('selected', true);
        }

        /*
            Add an easing dropdown to |$instructionMenu| and set the easing on |$instruction|.
            If |canEdit| is true, then add a change listener to the dropdown.
            |$instructionMenu| and |$instruction| are required and jQuery objects.
        */
        function addEasingDropdown($instructionMenu, $instruction) {
            // Add easing dropdown HTML
            var easingDropdownHTML = self[self.name]['easingDropdown']();
            $instructionMenu.append(easingDropdownHTML);
            updateEasing($instruction, 'swing');

            // Update |$instruction|'s easing when the user changes the selected easing
            if (canEdit) {
                $instructionMenu.find('select.easing-dropdown').change(function(event) {
                    var easingSelected = $(this).find(':selected').val();
                    $instruction.data('easing', easingSelected);
                });
            }
        }

        function addMoveInstr(objNum, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objNum, isLoading, isGrouped);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $topPosDiv;
            var $topPosSpinner;
            var $leftPosDiv;
            var $leftPosSpinner;
            var $clearBothDiv;
            var $instrImg = $instrLabelDiv.children('img');

            $instr.attr('instrType', 'move');
            $instrImg.css('height', '13px');
            $instrImg.css('width', '13px');
            $instrImg.attr('src', self.parentResource.getResourceURL('move.png', self.name));

            $topPosDiv = $('<div>');
            $topPosDiv.attr('title', 'Distance from top');
            $topPosDiv.text('Top: ');
            $topPosDiv.css('float', 'left');
            $instrMenuDiv.append($topPosDiv);
            $topPosSpinner = createSpinner('instrTopPosSpinner_' + self.id + '_' + instrNum, $topPosDiv, 'top', updateGraphic, [ objNum ], instrNum);
            $topPosSpinner.val(roundCSSProperty($graphic.css('top'), 0));
            if (canEdit) {
                $topPosSpinner.spinner('option', 'min', 0);
                $topPosSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('height')));
            }

            $leftPosDiv = $('<div>');
            $leftPosDiv.attr('title', 'Distance from left');
            $leftPosDiv.text('Left: ');
            $leftPosDiv.css('float', 'right');
            $instrMenuDiv.append($leftPosDiv);
            $leftPosSpinner = createSpinner('instrLeftPosSpinner_' + self.id + '_' + instrNum, $leftPosDiv, 'left', updateGraphic, [ objNum ], instrNum);
            $leftPosSpinner.val(roundCSSProperty($graphic.css('left'), 0));
            if (canEdit) {
                $leftPosSpinner.spinner('option', 'min', 0);
                $leftPosSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('width')));
            }

            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $instrMenuDiv.append($clearBothDiv);

            addEasingDropdown($instrMenuDiv, $instr);

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        function addResizeInstr(objNum, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objNum, isLoading, isGrouped);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $heightDiv;
            var $heightSpinner;
            var $clearBothDiv;
            var $instrImg = $instrLabelDiv.children('img');

            $instr.attr('instrType', 'resize');
            $instrImg.css('height', '15px');
            $instrImg.css('width', '16px');
            $instrImg.attr('src', self.parentResource.getResourceURL('resize.png', self.name));

            $heightDiv = $('<div>');
            $heightDiv.text('Height: ');
            $heightDiv.css('float', 'left');
            $instrMenuDiv.append($heightDiv);
            $heightSpinner = createSpinner('instrHeightSpinner_' + self.id + '_' + instrNum, $heightDiv, 'height', updateGraphic, [ objNum ], instrNum);
            $heightSpinner.val(roundCSSProperty($graphic.css('height'), 0));
            if (canEdit) {
                $heightSpinner.spinner('option', 'min', 1);
                $heightSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('height')));
            }

            $widthDiv = $('<div>');
            $widthDiv.text('Width: ');
            $widthDiv.css('float', 'right');
            $instrMenuDiv.append($widthDiv);
            $widthSpinner = createSpinner('instrWidthSpinner_' + self.id + '_' + instrNum, $widthDiv, 'width', updateGraphic, [ objNum ], instrNum);
            $widthSpinner.val(roundCSSProperty($graphic.css('width'), 0));
            if (canEdit) {
                $widthSpinner.spinner('option', 'min', 1);
                $widthSpinner.spinner('option', 'max', parseInt($('#canvas_' + self.id).css('width')));
            }

            $clearBothDiv = $('<div>');
            $clearBothDiv.css('clear', 'both');
            $instrMenuDiv.append($clearBothDiv);

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        function addFadeInstr(objNum, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objNum, isLoading, isGrouped);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $opacityDiv;
            var $opacitySpinner;
            var $instrImg = $instrLabelDiv.children('img');

            $instr.attr('instrType', 'fade');
            $instrImg.css('height', '12px');
            $instrImg.css('width', '12px');
            $instrImg.attr('src', self.parentResource.getResourceURL('fade.png', self.name));

            $opacityDiv = $('<div>');
            $opacityDiv.attr('title', '(Invisible) 0 - 100 (Fully visible)');
            $opacityDiv.text('Opacity: ');
            $instrMenuDiv.append($opacityDiv);
            $opacitySpinner = createSpinner('instrOpacitySpinner_' + self.id + '_' + instrNum, $opacityDiv, 'opacity', updateGraphic, [ objNum ], instrNum);
            $opacitySpinner.val($graphic.css('opacity') * 100);
            if (canEdit) {
                $opacitySpinner.spinner('option', 'min', 0);
                $opacitySpinner.spinner('option', 'max', 100);
            }

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        function addRotateInstr(objectNumber, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objectNumber, isLoading, isGrouped);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $instrImg = $instrLabelDiv.children('img');

            $instrImg.css('height', '12px');
            $instrImg.css('width', '12px');
            $instrImg.attr('src', self.parentResource.getResourceURL('rotate.png', self.name));

            $instr.attr('instrType', 'rotate');

            var $rotateDiv = $('<div>');
            $rotateDiv.text('Rotate: ');
            $instrMenuDiv.append($rotateDiv);

            var $rotateSpinner = createSpinner('instrRotateSpinner_' + self.id + '_' + instrNum, $rotateDiv, 'transform', updateRotationOfGraphic, [ objectNumber ], instrNum);
            $rotateSpinner.val($graphic.attr('transformDeg'));
            if (canEdit) {
                $rotateSpinner.spinner('option', 'min', minRotationSpinnerDegree);
                $rotateSpinner.spinner('option', 'max', maxRotationSpinnerDegree);
            }

            addEasingDropdown($instrMenuDiv, $instr);

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        function addBackgroundColorInstr(objectNumber, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objectNumber, isLoading, isGrouped);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $instrImg = $instrLabelDiv.children('img');

            $instrImg.css('height', '12px');
            $instrImg.css('width', '12px');
            $instrImg.attr('src', self.parentResource.getResourceURL('backgroundColor.png', self.name));

            $instr.attr('instrType', 'background-color');

            var color;
            // Triangle objects use border-color CSS for background color, so the background-color is stored as an attribute
            if ($graphic.attr('objType') === OBJECT_PROPERTIES.triangle.type) {
                color = $graphic.attr('background-color');
            }
            // Other objcts use just background-color CSS
            else {
                color = $graphic.css('background-color');
            }
            $instr.attr('background-color', color);

            var $backgroundColorDiv = $('<div>');
            $backgroundColorDiv.html('Background color:<br/>');
            $instrMenuDiv.append($backgroundColorDiv);

            var colorsToAdd = [ BLACK_COLOR, GRAY_COLOR, WHITE_COLOR, YELLOW_COLOR,
                               GREEN_COLOR, LIGHT_BLUE_COLOR, BLUE_COLOR, PURPLE_COLOR, RED_COLOR,
                               ORANGE_COLOR, BROWN_COLOR, LIGHT_ORANGE_COLOR ];
            colorsToAdd.forEach(function(colorToAdd) {
                createBackgroundColorSelector(COLORS[colorToAdd], $backgroundColorDiv, true, instrNum, objectNumber);
            });
            createBackgroundColorSelector('transparent', $backgroundColorDiv, true, instrNum, objectNumber);

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        // David May 8/31/20 Adding border color instruction
        function addBorderColorInstr(objectNumber, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objectNumber, isLoading, isGrouped);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $instrImg = $instrLabelDiv.children('img');

            $instrImg.css('height', '12px');
            $instrImg.css('width', '12px');
            $instrImg.attr('src', self.parentResource.getResourceURL('borderColor.png', self.name));

            $instr.attr('instrType', 'border-color');

            var color = $graphic.css('border-color');
            $instr.attr('border-color', color);

            var $borderColorDiv = $('<div>');
            $borderColorDiv.html('Border color:<br/>');
            $instrMenuDiv.append($borderColorDiv);

            var colorsToAdd = [ BLACK_COLOR, GRAY_COLOR, WHITE_COLOR, YELLOW_COLOR,
                               GREEN_COLOR, LIGHT_BLUE_COLOR, BLUE_COLOR, PURPLE_COLOR, RED_COLOR,
                               ORANGE_COLOR, BROWN_COLOR, LIGHT_ORANGE_COLOR ];
            colorsToAdd.forEach(function(colorToAdd) {
                createBorderColorSelector(COLORS[colorToAdd], $borderColorDiv, true, instrNum, objectNumber);
            });

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        // // David May 8/28/20 Creates a font color instruction
        function addFontColorInstr(objectNumber, isLoading, isGrouped) {
            isLoading = isLoading !== undefined ? isLoading : false;
            isGrouped = isGrouped !== undefined ? isGrouped : false;
            var instrNum = addActionInstr(objectNumber, isLoading, isGrouped);
            var $instr = $('#instr_' + self.id + '_' + instrNum);
            var $instrLabelDiv = $('#instrLabelText_' + self.id + '_' + instrNum);
            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objectNumber);
            var $instrMenuDiv = $instr.children('.instrMenu');
            var $instrImg = $instrLabelDiv.children('img');

            $instrImg.css('height', '12px');
            $instrImg.css('width', '12px');
            $instrImg.attr('src', self.parentResource.getResourceURL('fontColor.png', self.name));

            $instr.attr('instrType', 'color');

            var color = $graphic.css('color');
            $instr.attr('color', color);

            var $fontColorDiv = $('<div>');
            $fontColorDiv.html('Font color:<br/>');
            $instrMenuDiv.append($fontColorDiv);

            var colorsToAdd = [ BLACK_COLOR, GRAY_COLOR, WHITE_COLOR, YELLOW_COLOR,
                               GREEN_COLOR, LIGHT_BLUE_COLOR, BLUE_COLOR, PURPLE_COLOR, RED_COLOR,
                               ORANGE_COLOR, BROWN_COLOR, LIGHT_ORANGE_COLOR ];
            colorsToAdd.forEach(function(colorToAdd) {
                createFontColorSelector(COLORS[colorToAdd], $fontColorDiv, true, instrNum, objectNumber);
            });
            createFontColorSelector('transparent', $fontColorDiv, true, instrNum, objectNumber);

            if (!isLoading) {
                selectInstrByInstrNum(instrNum, false, true);
            }

            return instrNum;
        }

        function goToStartStep() {
            stopAllAnimations();
            animationStopPlaying();
            selectInstrByInstrNum('goToStartStep');
            $('#playButton_' + self.id).finish().animateRotate(0);
            showStartButton();
            setCaption($(`#startStepCaption_${self.id}`).val());
            outlineInstrsByObjNum(); // David May 8/1/20 Remove all instruction outlines
        }

        function stopAllAnimations() {
            $("#canvas_" + self.id+' .stepObject').stop(true);
            return;
        }

        function disableInteractiveEditorElements() {
            var $inspector = $('#inspector_' + self.id);
            var $instrList = $('#instrList_' + self.id);
            var $canvas = $('#canvas_' + self.id);

            //  object list sortable
            $('#objList_' + self.id).sortable('disable');

            //  instruction list sortable
            $instrList.sortable('disable');

            //  inspector opacity sliders
            $inspector.find('.ui-slider').slider('disable');

            //  inspector border radius spinner
            //  inspector font size spinner
            $inspector.find('.ui-spinner-input').spinner('disable');

            //  fade instruction slider
            $instrList.find('.ui-slider').slider('disable');

            //  move instruction top spinnner
            //  move instruction left spinnner
            $instrList.find('.ui-spinner-input').spinner('disable');

            //  graphic draggable
            $canvas.find('.ui-draggable').draggable('disable');

            // graphic resizable
            $canvas.find('.ui-resizable').resizable('disable');
            $canvas.find('.ui-resizable').children().css('cursor', 'default');
            $canvas.children('.ui-resizable').children('.ui-resizable-handle').hide(); // AE 020314 Hide resizable elements due to conflict with pytutor tool in authoring tools

            // disable selectable
            $canvas.selectable('disable');

            // step resizable
            $canvas.resizable('disable');
            $canvas.children('.ui-resizable-handle').hide(); // AE 020314 Hide resizable elements due to conflict with pytutor tool in authoring tools
            $canvas.removeClass('ui-state-disabled').removeClass('ui-resizable-disabled'); // AE 020314 Disable state causes canvas to have opacity 0.35

            if (canEdit) {
                // disable contextMenus
                $canvas.find('.stepObject').contextMenu(false);
            }

            if (!canEdit) {
                $canvas.find('.stepObjectGraphic').addClass('ui-state-disabled'); // AE 052614: disable the graphic element hover-over
            }

            // disable tooltips
            disableTooltip();
        }

        function enableInteractiveEditorElements() {
            var $inspector = $("#inspector_" + self.id);
            var $instrList = $("#instrList_" + self.id);
            var $canvas = $("#canvas_" + self.id);

            if (isEditorShown) { // Do not enable interactive elements if the editor is not shown
                //  object list sortable
                $("#objList_" + self.id).sortable('enable');

                //  instruction list sortable
                $instrList.sortable('enable');

                //  inspector opacity sliders
                $inspector.find('.ui-slider').slider('enable');

                //  inspector border radius spinner
                //  inspector font size spinner
                $inspector.find('.ui-spinner-input').spinner('enable');

                //  fade instruction slider
                $instrList.find('.ui-slider').slider('enable');

                //  move instruction top spinnner
                //  move instruction left spinnner
                $instrList.find('.ui-spinner-input').spinner('enable');

                //  graphic draggable
                $canvas.find('.ui-draggable').draggable('enable');

                // enable selectable
                $canvas.selectable('enable');

                // graphic resizable
                $canvas.find('.ui-resizable').resizable('enable');
                $canvas.find('.ui-resizable').children().css('cursor', '');
                $canvas.children('.ui-resizable').children('.ui-resizable-handle').show(); // AE 020314 Hide resizable elements due to conflict with pytutor tool in authoring tools

                // step resizable
                $canvas.resizable('enable');
                $canvas.children('.ui-resizable-handle').show(); // AE 020314 Hide resizable elements due to conflict with pytutor tool in authoring tools

                // enable contextmenus
                $canvas.find('.stepObject').contextMenu(true);

                // enable tooltips if user wants them enabled
                decideWhetherToShowToolTip();
            }
        }

        function animationStartPlaying() {
            isAnimationPlaying = true;
            $('#playButton_' + self.id).finish().animate({ opacity: 0.5 }, 200);
            disableInteractiveEditorElements();
        }

        function animationStopPlaying() {
            isAnimationPlaying = false;
            $("#playButton_" + self.id).finish().animate({ opacity: 1.0 }, 200);
            enableInteractiveEditorElements();
            return;
        }

        // Keeps an array of which animation steps have been completely watched.
        // Whatever value is passed in is pushed onto |watchedSteps.watchedList|
        // If no value is passed, then the array is returned.
        function watchedSteps(newlyWatchedStep) {
            watchedSteps.watchedList = watchedSteps.watchedList === undefined ? [] : watchedSteps.watchedList;
            if (newlyWatchedStep !== undefined) {
                watchedSteps.watchedList.push(newlyWatchedStep);
            } else {
                return watchedSteps.watchedList;
            }
        }

        function playInstructionsFromInstrNum(instrNum) {
            stopAllAnimations();
            animationStartPlaying();
            deselectAllObjs();
            deselectAllInstrs();

            var i = 0;
            var $instrs = $('#instrList_' + self.id).children();
            var $instr;
            var $this;
            var $caption = $('#caption_' + self.id);
            var $timeline = $('#timeline_' + self.id);
            var playThisCaption = '';
            var instrNumToHighlight;
            var stopAnimation = false;

            function animateByConcurrentBatches() { // Batch concurrently executing instructions
                function recordCompletedStep() {
                    var lastStepNumber = 0;
                    // Find the last step number
                    for (var j = $instrs.length - 1; j >= 0; --j) {
                        if ($instrs.eq(j).attr('instrType') === 'step') {
                            lastStepNumber = Number($instrs.eq(j).attr('stepNum'));
                            break;
                        }
                    }

                    var watchedStepNum;
                    if (i < $instrs.length) {
                        watchedStepNum = Number($instrs.eq(i).attr('stepNum')) - 1;
                    } else {
                        watchedStepNum = lastStepNumber;
                    }

                    // If a step hasn't been watched, then add the step to the watchedList
                    if (watchedSteps().indexOf(watchedStepNum) === -1) {
                        watchedSteps(watchedStepNum);
                        // If all steps have been watched, then report activity is complete
                        if (watchedSteps().length >= lastStepNumber) {
                            var event = {
                                part: 0,
                                complete: true,
                                metadata: {
                                    event: 'animation completely watched'
                                }
                            };
                            self.parentResource.postEvent(event);
                        }
                        $('#' + self.id + ' .timelineNum[stepNum=' + watchedStepNum + ']').addClass('timeline-number-been-watched');
                    }
                }

                deselectAllInstrs();

                if (i >= $instrs.length) { // No more instructions to process
                    recordCompletedStep();
                    $('#playButton_' + self.id).finish().animateRotate(180, function() {
                        animationStopPlaying();
                    });
                    highlightInstructionByInstrNum($instrs.last().attr('instrNum'), true);
                } else if (stopAnimation) {
                    recordCompletedStep();
                    highlightInstructionByInstrNum($instrs.eq(i - 1).attr('instrNum'), true);
                    $('#playButton_' + self.id).finish().animate({ marginLeft: '+=8px' }, 100).animate({ marginLeft: '-=8px' }, 100, function() {
                        animationStopPlaying();
                    });
                } else if (($instrs.eq(i).attr('instrType') === 'step') || (i === -1)) { // Step instruction encountered
                    if (i === -1) {
                        highlightInstructionByInstrNum('0', true);
                        playThisCaption = $('#step1Caption_' + self.id).val();
                    } else {
                        highlightInstructionByInstrNum($instrs.eq(i).attr('instrNum'), true);
                        highlightGraphicStepByStepNum($instrs.eq(i).attr('stepNum'));
                        playThisCaption = $('#instrCaption_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();
                    }

                    i++;

                    if ($caption.data('text') === playThisCaption) {
                        animateByConcurrentBatches();
                    }
                    else {
                        $caption.finish().fadeOut(250, () => { // eslint-disable-line no-magic-numbers
                            setCaption(playThisCaption);
                            $caption.fadeIn(250).delay(500).queue(animateByConcurrentBatches); // eslint-disable-line no-magic-numbers
                        });
                    }
                } else {
                    var endOfBatchFound = false;
                    var objNumThisBatch = {};
                    var thisBatchesDelay = null;

                    // Pick-up i where we left off then build next batch of animations
                    for (i; i < $instrs.length; i++) {
                        highlightInstructionByInstrNum($instrs.eq(i).attr('instrNum'), true);
                        var objNum = $instrs.eq(i).attr('objNum');

                        if (!thisBatchesDelay) {
                            var timeText = $instrs.eq(i).children('.timeLabel').text();
                            thisBatchesDelay = 0;
                            if (timeText !== '-') {
                                thisBatchesDelay = executionSpeedFactor * (1000 * parseFloat(timeText));
                            }
                        }

                        // first time this batch seeing this object number
                        if (!objNumThisBatch[objNum]) {
                            objNumThisBatch[objNum] = [];
                            var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                            objNumThisBatch[objNum].top = $graphic.css('top');
                            objNumThisBatch[objNum].left = $graphic.css('left');
                            objNumThisBatch[objNum].opacity = $graphic.css('opacity');
                            objNumThisBatch[objNum].height = $graphic.css('height');
                            objNumThisBatch[objNum].width = $graphic.css('width');
                            objNumThisBatch[objNum].degrees = $graphic.attr('transformDeg');
                            objNumThisBatch[objNum].backgroundColor = $graphic.css('background-color');
                            objNumThisBatch[objNum].borderColor = $graphic.css('border-color'); // David May 8/31/20 Adding for border color instr
                            objNumThisBatch[objNum].color = $graphic.css('color'); // David May 8/29/20 For font color instr

                            // Triangle stores background-color CSS as an attribute since border-color CSS is actually used
                            if ($graphic.attr('objType') === OBJECT_PROPERTIES.triangle.type) {
                                objNumThisBatch[objNum].backgroundColor = $graphic.attr('background-color');
                            }
                        }

                        objNumThisBatch[objNum].easing = $instrs.eq(i).data('easing');

                        if ($instrs.eq(i).attr('instrType') === 'move') {
                            var topVal = $('#instrTopPosSpinner_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();
                            var leftVal = $('#instrLeftPosSpinner_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();

                            objNumThisBatch[objNum].top = topVal;
                            objNumThisBatch[objNum].left = leftVal;
                        }
                        else if ($instrs.eq(i).attr('instrType') === 'fade') {
                            var opacityVal = $('#instrOpacitySpinner_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();
                            objNumThisBatch[objNum].opacity = (opacityVal / 100);
                        }
                        else if ($instrs.eq(i).attr('instrType') === 'resize') {
                            var heightVal = $('#instrHeightSpinner_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();
                            var widthVal = $('#instrWidthSpinner_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();
                            objNumThisBatch[objNum].height = heightVal;
                            objNumThisBatch[objNum].width = widthVal;
                        }
                        else if ($instrs.eq(i).attr('instrType') === 'rotate') {
                            objNumThisBatch[objNum].degrees = $('#instrRotateSpinner_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).val();
                        }
                        else if ($instrs.eq(i).attr('instrType') === 'background-color') {
                            objNumThisBatch[objNum].backgroundColor = $('#instr_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).attr('background-color');
                        }
                        else if ($instrs.eq(i).attr('instrType') === 'border-color') { // David May 8/31/20 Adding check for border color instr
                            // objNumThisBatch[objNum].borderWidth = $('#instr_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).attr('border-width');
                            objNumThisBatch[objNum].borderColor = $('#instr_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).attr('border-color');
                        }
                        else if ($instrs.eq(i).attr('instrType') === 'color') { // David May 8/28/20 Adding check for font color instr
                            objNumThisBatch[objNum].color = $('#instr_' + self.id + '_' + $instrs.eq(i).attr('instrNum')).attr('color');
                        }

                        if ($instrs.eq(i).attr('instrType') === 'step') {
                            endOfBatchFound = true;
                        }
                        else {
                            var nextTimeText = $instrs.eq(i + 1).children('.timeLabel').text();
                            if (nextTimeText !== '-') {
                                endOfBatchFound = true;
                            }
                        }

                        if (endOfBatchFound) {
                            i++;
                            break;
                        }
                    }

                    if (($instrs.eq(i).attr('instrType') === 'step') || (i === $instrs.length)) {
                        stopAnimation = true;
                    }

                    var firstAnimation = true;
                    // Run batch of instructions
                    for (var objNum in objNumThisBatch) {
                        var $graphic = $('#stepObjectGraphic_' + self.id + '_' + objNum);
                        var topVal = objNumThisBatch[objNum].top;
                        var leftVal = objNumThisBatch[objNum].left;
                        var opacityVal = objNumThisBatch[objNum].opacity;
                        var heightVal = objNumThisBatch[objNum].height;
                        var widthVal = objNumThisBatch[objNum].width;
                        var degrees = objNumThisBatch[objNum].degrees;
                        var backgroundColor = objNumThisBatch[objNum].backgroundColor;
                        var borderColor = objNumThisBatch[objNum].borderColor; // David May 8/31/20 Adding border color instr
                        var easing = objNumThisBatch[objNum].easing || 'swing';

                        var cssToAnimate = {
                            top:     topVal,
                            left:    leftVal,
                            opacity: opacityVal
                        };

                        // Text objects should not get height or width value changes.
                        if ($graphic.attr('objType') !== OBJECT_PROPERTIES.text.type) {
                            cssToAnimate.height = heightVal;
                            cssToAnimate.width = widthVal;
                        }

                        // Triangles animate background-color via border-right&left-color
                        if ($graphic.attr('objType') === OBJECT_PROPERTIES.triangle.type) {
                            cssToAnimate['border-right-color'] = backgroundColor;
                            cssToAnimate['border-left-color'] = backgroundColor;
                            $graphic.attr('background-color', backgroundColor);
                        }
                        // Other objects animate background-color with just background-color
                        else {
                            cssToAnimate['background-color'] = objNumThisBatch[objNum].backgroundColor;
                            cssToAnimate['border-color'] = objNumThisBatch[objNum].borderColor; // David May 8/31/20 Adding border color instr
                            cssToAnimate['color'] = objNumThisBatch[objNum].color; // David May 8/28/20 Text objects may have a font color instr
                        }

                        // First animation should have a callback function
                        var callbackFunction = null;
                        if (firstAnimation) {
                            firstAnimation = false;
                            callbackFunction = animateByConcurrentBatches;
                        }

                        const executionTime = executionSpeedFactor * instrExecTimeLength;

                        $graphic.delay(thisBatchesDelay).animate(cssToAnimate, {
                            duration: executionTime,
                            complete: callbackFunction,
                            easing,
                        });

                        $graphic.animateRotate(degrees, executionTime, easing, null, thisBatchesDelay);
                        $graphic.attr('transformDeg', degrees);
                    }
                }
            }

            $('#playButton_' + self.id).finish().animateRotate(0);

            if (instrNum === '0') {
                allObjectsToInitCSS();
                i = -1;
            }
            else {
                $instrs.each(function() { // Find the instruction with the specified instrNum
                    i++;
                    if ($(this).attr('instrNum') === instrNum) {
                        return false; // equivalent to break;
                    }
                });
            }

            animateByConcurrentBatches();
        }

        var XML_CHAR_MAP = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            '\'': '&apos;'
        };

        function escapeXml(s) {
            return s.replace(/[<>&"']/g, function(ch) {
                return XML_CHAR_MAP[ch];
            });
        }

        // By passing a 0 to parameter |preferredConcatToEnd|, nothing is concatenated.
        // Otherwise, if left empty, 'px', '%', and 'pt' will be concatenated if found
        // inside parameter |val|.
        function roundCSSProperty(val, preferredConcatToEnd) {
            function checkIfNaN(num) {
                if (!isNaN(num)) { // If a num is a number...
                    return num;
                } else {
                    return 0;
                }
            }

            if ((val === undefined) || (val === '')) { // val is empty
                var addToEnd = preferredConcatToEnd !== undefined ? preferredConcatToEnd : 'px';
                return 0 + addToEnd;
            } else if (typeof val === 'number') { // val is a number
                return Math.round(parseFloat(val));
            } else if (val.indexOf('px') !== -1) { // val contains 'px', so treat like px
                var addToEnd = preferredConcatToEnd !== undefined ? preferredConcatToEnd : 'px';
                return checkIfNaN(Math.round(parseFloat(val))) + addToEnd;
            } else if (val.indexOf('%') !== -1) { // val contains '%', so treat like %
                var addToEnd = preferredConcatToEnd !== undefined ? preferredConcatToEnd : '%';
                return checkIfNaN(Math.round(parseFloat(val))) + addToEnd;
            } else if (val.indexOf('pt') !== -1) { // val contains 'pt', so treat like pt
                var addToEnd = preferredConcatToEnd !== undefined ? preferredConcatToEnd : 'pt';
                return checkIfNaN(Math.round(parseFloat(val))) + addToEnd;
            } else { // val is not a number, px, %, or pt. So just return val.
                return val;
            }
        }

        // Handle unusual CSS properties and return CSS property value of an object
        // Requires three parameters:
        // |objNum| - a number
        // |cssPropName| - a string
        // |$graphicInit| - jQuery object of graphic
        function handleUnusualCSSPropsOfObjNum(objNum, cssPropName, $graphicInit) {
            if (cssPropName === 'border-width') {
                var boxObjBorderWidth = document.getElementById('stepObjectInit_' + self.id + '_' + objNum).style.borderWidth; // AE 030314: Firefox w/ jQuery does not support shorthand CSS, e.g. 'border'. http://stackoverflow.com/questions/12226073/getting-css-border-value-with-jquery-in-firefox-14-0-1
                cssPropVal = roundCSSProperty(boxObjBorderWidth, 'px');
            } else if (cssPropName === 'border-style') {
                cssPropVal = document.getElementById('stepObjectInit_' + self.id + '_' + objNum).style.borderStyle; // AE 030314: Firefox w/ jQuery does not support shorthand CSS, e.g. 'border'. http://stackoverflow.com/questions/12226073/getting-css-border-value-with-jquery-in-firefox-14-0-1
            } else if (cssPropName === 'border-color') {
                cssPropVal = document.getElementById('stepObjectInit_' + self.id + '_' + objNum).style.borderColor; // AE 030314: Firefox w/ jQuery does not support shorthand CSS, e.g. 'border'. http://stackoverflow.com/questions/12226073/getting-css-border-value-with-jquery-in-firefox-14-0-1
            } else if (cssPropName === 'border-radius') { // AE 030314: Firefox w/ jQuery does not support shorthand CSS, e.g. 'border-radius'
                cssPropVal = document.getElementById('stepObjectInit_' + self.id + '_' + objNum).style.borderRadius;
            } else {
                cssPropVal = $graphicInit.css(cssPropName);
            }

            return cssPropVal;
        }

        // Return the beautified CSS property value of an object
        // Requires two parameters:
        // |cssPropName| - a string
        // |cssPropVal| - a string
        function beautifyCSSPropValueOfObjNum(cssPropName, cssPropVal) {
            if (cssPropName === 'opacity') { // sometimes opacity displays rounded values that are very long
                cssPropVal = Math.round(cssPropVal * 100);
            } else if ((cssPropName === 'top') || (cssPropName === 'left') || (cssPropName === 'border-radius')
                    || (cssPropName === 'height') || (cssPropName === 'width')) {
                cssPropVal = roundCSSProperty(cssPropVal, 'px');
            } else if (cssPropName === 'background-color'
                    || cssPropName === 'border-color'
                    || cssPropName === 'color') {
                // Convert |cssPropVal| from rgb value to the color's name
                for (var color in COLORS) {
                    if (cssPropVal === COLORS[color]) {
                        cssPropVal = color;
                        break;
                    }
                }
            }

            return cssPropVal;
        }

        /**
            Alert the user if a caption is too long.
            @method catchLongCaptions
            @param {String} caption The caption to test.
            @return {void}
        */
        function catchLongCaptions(caption) {
            if (isEditorShown) {
                let captionTooTall = false;

                // LaTex is typically in \(...\) or $...$. Ex: \(x = y^2\) and $x = y^2$
                const usesLatex = (/\(.*\)/).test(caption) || (/\$.*\$/).test(caption);

                if (usesLatex) {
                    const maxNumberOfRows = 2;

                    captionTooTall = caption.split('\n').length > maxNumberOfRows;
                }
                else {
                    const $caption = $(`#caption_${self.id}`);
                    const shownCaption = $caption.html();

                    $caption.html(caption);

                    // Caption height over 40px is too tall.
                    const maxHeightOfAcceptableCaption = 40;

                    if (parseInt($caption.height(), 10) > maxHeightOfAcceptableCaption) {
                        captionTooTall = true;
                    }

                    $caption.html(shownCaption);
                }

                // Caption is too tall, so give a warning.
                if (captionTooTall) {
                    const newline = '<br>';
                    const message = `Caption length of 1 or 2 lines preferred.${newline}${newline}Offending caption:${newline}${caption.replace(/\n/g, newline)}`; // eslint-disable-line max-len

                    self.parentResource.alert('Error: Caption too long.', message);
                }
            }
        }

        /**
            Wrap the given XML in large font HTML.
            @method makeLargeFontHTML
            @param {String} xml The XML to wrap in large font HTML.
            @return {String} The XML wrapped in large font HTML.
        */
        function makeLargeFontHTML(xml) {
            return self[self.name].largeFont({ xml });
        }

        /**
            Return the current animation's XML.
            @method getAnimationXML
            @return {Object} Object has two {String} properties: xml and htmlOfRichXML.
        */
        function getAnimationXML() {
            var i = 0;
            var $canvas = $('#canvas_' + self.id);
            var $selectedInstr = $('#instrList_' + self.id + ' .labelSelected');
            var selectedInstrNum = 'none';
            var $selectedObjects;
            var selectedObjectNum;
            var $objLabels;
            var $label;
            var objNum;
            var objType;
            var objName;
            var $graphic;
            var $graphicInit;
            var $this;
            var codeColorize;
            var $instrs;
            var instrType;
            var instrNum;
            var timeLabel;
            var cssPropName;
            var cssPropVal;
            var isZyCode;
            zyAnimationID = document.getElementById('GUID').value;
            zyAnimationCaption = document.getElementById('caption').value;

            if ($selectedInstr.length > 0) {
                selectedInstrNum = $selectedInstr.attr('instrNum');
            } else {
                if ($('#step1_' + self.id).hasClass('labelSelected')) {
                    selectedInstrNum = '0';
                } else {
                    selectedInstrNum = 'none';
                }
            }

            $selectedObjects = $('#objList_' + self.id + ' .labelSelected');
            selectedObjectNum = 'none';
            if ($selectedObjects.length > 0) {
                selectedObjectNum = '';
                $selectedObjects.each(function() {
                    selectedObjectNum += $(this).attr('objNum') + ' ';
                });
                selectedObjectNum = selectedObjectNum.substr(0, selectedObjectNum.length - 1); // remove trailing space
            } else {
                selectedObjectNum = 'none';
            }

            // David May 3/24/20 Changed order to list date/version before actual code
            // David May 4/12/20 Added newlines after XML comment
            // Build comment for documenting build date and animator version.
            let htmlOfRichXML = makeLargeFontHTML(`<!-- Last modified ${new Date()} with version ${zyAnimatorVersion} -->\n`);

            // Build zyAnimator's opening tag.
            let zyAnimatorTagOpeningXML = `<zyAnimator id="${zyAnimationID}"`;
            zyAnimatorTagOpeningXML += ` caption="${zyAnimationCaption}"`;
            zyAnimatorTagOpeningXML += ` height="${roundCSSProperty($canvas.css('height'), 'px')}"`;
            zyAnimatorTagOpeningXML += ` width="${roundCSSProperty($canvas.css('width'), 'px')}"`;
            zyAnimatorTagOpeningXML += ` selectedInstr="${selectedInstrNum}"`;
            zyAnimatorTagOpeningXML += ` selectedObj="${selectedObjectNum}"`;
            zyAnimatorTagOpeningXML += ` numObjsEverCreated="${numObjs}"`;
            zyAnimatorTagOpeningXML += ` loadOnDemand="${String(zyAnimationLoadOnDemand)}"`;
            zyAnimatorTagOpeningXML += '>\n';

            htmlOfRichXML += makeLargeFontHTML(zyAnimatorTagOpeningXML);



            // Build objects XML.
            let objectsXML = '<zyObjects>';

            $objLabels = $("#objList_" + self.id+' .label');
            $objLabels.reverse().each(function() { // store objects
                $label = $(this);
                objNum = $label.attr('objNum');
                objType = $label.attr('objType');
                objName = escapeXml($label.attr('objName'));
                $graphic = $("#stepObjectGraphic_" + self.id + "_" + objNum);
                $graphicInit = $("#stepObjectInit_" + self.id + "_" + objNum);
                codeColorize = $graphic.data('codeColorize') || '';
                isZyCode = isTextObjectZyCode(codeColorize);

                objectsXML += `<zyObject objNum="${objNum}" objType="${objType}" objName="${objName}"`;

                for(i = 0; i < CSS_PROPERTIES_USED_BY_ALL_OBJECTS.length; i++) {
                    cssPropName = CSS_PROPERTIES_USED_BY_ALL_OBJECTS[i];
                    cssPropVal = handleUnusualCSSPropsOfObjNum(objNum, cssPropName, $graphicInit);

                    if (DEFAULT_CSS_PROPERTIES_USED_BY_ALL_OBJECTS[cssPropName] !== cssPropVal) {
                        cssPropVal = beautifyCSSPropValueOfObjNum(cssPropName, cssPropVal);
                        objectsXML += ` ${cssPropName}="${cssPropVal}"`;
                    }
                }

                // Output |useConstrainedProportions| if it's defined
                var useConstrainedProportions = $graphic.data('useConstrainedProportions');
                if (typeof useConstrainedProportions === 'boolean') {
                    objectsXML += ` useConstrainedProportions="${useConstrainedProportions}"`;

                    // If |useConstrainedProportions|, then output |constrainedProportions| if it's defined
                    if (useConstrainedProportions) {
                        var constrainedProportions = $graphic.data('constrainedProportions');
                        if (typeof constrainedProportions === 'object') {
                            objectsXML += ` constrainedProportionsHeight="${constrainedProportions.height}"`;
                            objectsXML += ` constrainedProportionsWidth="${constrainedProportions.width}"`;
                        }
                    }
                }

                if (objType === OBJECT_PROPERTIES.image.type) {
                    objectsXML += ` googleDriveFileID="${$graphic.data('googleDriveFileID')}"`;

                    for (i = 0; i < CSS_PROPERTIES_USED_BY_BOX_OBJECTS.length; i++) {
                        cssPropName = CSS_PROPERTIES_USED_BY_BOX_OBJECTS[i];
                        cssPropVal = handleUnusualCSSPropsOfObjNum(objNum, cssPropName, $graphicInit);

                        if (DEFAULT_CSS_PROPERTIES_USED_BY_IMAGE_OBJECTS[cssPropName] !== cssPropVal) {
                            cssPropVal = beautifyCSSPropValueOfObjNum(cssPropName, cssPropVal);
                            objectsXML += ` ${cssPropName}="${cssPropVal}"`;
                        }
                    }
                }
                else if (objType === OBJECT_PROPERTIES.box.type) {
                    for (i = 0; i < CSS_PROPERTIES_USED_BY_BOX_OBJECTS.length; i++) {
                        cssPropName = CSS_PROPERTIES_USED_BY_BOX_OBJECTS[i];
                        cssPropVal = handleUnusualCSSPropsOfObjNum(objNum, cssPropName, $graphicInit);

                        if (DEFAULT_CSS_PROPERTIES_USED_BY_BOX_OBJECTS[cssPropName] !== cssPropVal) {
                            cssPropVal = beautifyCSSPropValueOfObjNum(cssPropName, cssPropVal);
                            objectsXML += ` ${cssPropName}="${cssPropVal}"`;
                        }
                    }
                } else if (objType === OBJECT_PROPERTIES.text.type) {
                    for(i = 0; i < CSS_PROPERTIES_USED_BY_TEXT_OBJECTS.length; i++) {
                        cssPropName = CSS_PROPERTIES_USED_BY_TEXT_OBJECTS[i];
                        cssPropVal = handleUnusualCSSPropsOfObjNum(objNum, cssPropName, $graphicInit);

                        if ((cssPropName === 'font-size') || (cssPropName === 'line-height') || (cssPropName === 'padding-left') || (cssPropName === 'padding-right') || (cssPropName === 'padding-top') || (cssPropName === 'padding-bottom')) {
                            cssPropVal = roundCSSProperty(cssPropVal, 'px');
                        }

                        if (isZyCode && ((cssPropName === 'padding') || (cssPropName === 'line-height') || (cssPropName === 'font-size') || (cssPropName === 'font-family'))) {
                            // do nothing because zyCode has a specific padding/line-height/font-size/font-family combination during loading
                        } else if (DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS[cssPropName] !== cssPropVal) {
                            cssPropVal = beautifyCSSPropValueOfObjNum(cssPropName, cssPropVal);
                            objectsXML += ` ${cssPropName}='${cssPropVal}'`;
                        }
                    }
                } else if (isObjectTypeGate(objType)) {
                    for(i = 0; i < CSS_PROPERTIES_USED_BY_GATE_OBJECTS.length; i++) {
                        cssPropName = CSS_PROPERTIES_USED_BY_BOX_OBJECTS[i];
                        cssPropVal = handleUnusualCSSPropsOfObjNum(objNum, cssPropName, $graphicInit);

                        if (DEFAULT_CSS_PROPERTIES_USED_BY_GATE_OBJECTS[cssPropName] !== cssPropVal) {
                            cssPropVal = beautifyCSSPropValueOfObjNum(cssPropName, cssPropVal);
                            objectsXML += ` ${cssPropName}="${cssPropVal}"`;
                        }
                    }
                }

                if ($graphicInit.attr('transformDeg') !== undefined && $graphicInit.attr('transformDeg') !== '0') {
                    objectsXML += ` transformDeg="${$graphicInit.attr('transformDeg')}"`;
                }

                objectsXML += '>';

                var isText = ($graphic.attr('objtype') === OBJECT_PROPERTIES.text.type);
                var codeLanguage = codeColorize.toLowerCase();

                if (isText) {
                    if (isZyCode) {
                        var zyAuthorSupportedCodeColorizing = [
                            'c', 'cpp', 'java', 'matlab', 'python', 'verilog', 'vhdl', 'html', 'css', 'js', 'xml', 'php', 'sql', 'kotlin'
                        ];

                        objectsXML += '<zyCode';
                        if (zyAuthorSupportedCodeColorizing.indexOf(codeLanguage) === -1) {
                            objectsXML += ` unsupported-language="${codeLanguage}"`;
                        }
                        else {
                            objectsXML += ` language="${codeLanguage}" snippet="true"`;
                        }
                        objectsXML += ' nobox="true" zyanimator="true">';
                    }
                    else {
                        objectsXML += '<text';
                        if (codeLanguage === 'latex') {
                            objectsXML += ` language="${codeLanguage}"`;
                        }
                        objectsXML += '>';
                    }

                    const text = $graphic.data('text') || '';

                    objectsXML += text;

                    if (isZyCode) {
                        objectsXML += '</zyCode>';
                    }
                    else {
                        objectsXML += '</text>';
                    }
                }

                objectsXML += '</zyObject>';
            });
            objectsXML += '</zyObjects>';
            htmlOfRichXML += escapeXml(objectsXML);

            //////////// Start instruction exporting
            const firstCaption = escapeXml($('#step1Caption_' + self.id).val());

            catchLongCaptions(firstCaption);

            htmlOfRichXML += escapeXml('<zyInstructions>\n<zyInstruction instrType="step1">');
            htmlOfRichXML += makeLargeFontHTML(`<text>${firstCaption}</text>`);
            htmlOfRichXML += escapeXml('</zyInstruction>\n');

            $instrs = $('#instrList_' + self.id + ' .label');
            $instrs.each(function() { // store instructions
                let instructionXML = '';

                $this = $(this);
                objNum = $this.attr('objNum');
                instrType = $this.attr('instrType');
                instrNum = $this.attr('instrNum');

                const isStepInstruction = (instrType === 'step');

                if (isStepInstruction) {
                    instructionXML += '\n';
                }

                instructionXML += `<zyInstruction instrType="${instrType}"`;

                if (!!$this.data('easing')) {
                    instructionXML += ` easing="${$this.data('easing')}"`;
                }

                if (!isStepInstruction) {
                    instructionXML += ` objNum="${objNum}"`;
                    timeLabel = $this.children('.timeLabel').text();
                    if (timeLabel != '-') {
                        timeLabel = parseFloat(timeLabel);
                    }
                    instructionXML += ` timeLabel="${timeLabel}"`;

                    if (instrType === 'move') {
                        instructionXML += ` top="${$('#instrTopPosSpinner_' + self.id + '_' + instrNum).val()}"`;
                        instructionXML += ` left="${$('#instrLeftPosSpinner_' + self.id + '_' + instrNum).val()}"`;
                    }
                    else if (instrType === 'fade') {
                        instructionXML += ` opacity="${$('#instrOpacitySpinner_' + self.id + '_' + instrNum).val()}"`;
                    }
                    else if (instrType === 'resize') {
                        instructionXML += ` height="${$('#instrHeightSpinner_' + self.id + '_' + instrNum).val()}"`;
                        instructionXML += ` width="${$('#instrWidthSpinner_' + self.id + '_' + instrNum).val()}"`;
                    }
                    else if (instrType === 'rotate') {
                        instructionXML += ` transformDeg="${$('#instrRotateSpinner_' + self.id + '_' + instrNum).val()}"`;
                    }
                    else if (instrType === 'background-color') {
                        var backgroundColorWithRGB = $('#instr_' + self.id + '_' + instrNum).attr('background-color');
                        var backgroundColor = beautifyCSSPropValueOfObjNum('background-color', backgroundColorWithRGB);
                        instructionXML += ` background-color="${backgroundColor}"`;
                    }
                    else if (instrType === 'border-color') {
                        var borderColorWithRGB = $('#instr_' + self.id + '_' + instrNum).attr('border-color');
                        var borderColor = beautifyCSSPropValueOfObjNum('border-color', borderColorWithRGB);
                        instructionXML += ` border-color="${borderColor}"`;
                    }
                    else if (instrType === 'color') { // David May 8/29/20 Add export for font color instrs
                        var fontColorWithRGB = $('#instr_' + self.id + '_' + instrNum).attr('color');
                        var fontColor = beautifyCSSPropValueOfObjNum('color', fontColorWithRGB);
                        instructionXML += ` color="${fontColor}"`;
                    }
                }
                instructionXML += '>';

                htmlOfRichXML += escapeXml(instructionXML);

                if (isStepInstruction) {
                    const caption = escapeXml($('#instrCaption_' + self.id + '_' + instrNum).val());

                    htmlOfRichXML += makeLargeFontHTML(`<text>${caption}</text>`);

                    catchLongCaptions(caption);
                }

                htmlOfRichXML += escapeXml('</zyInstruction>');

                if (isStepInstruction) {
                    htmlOfRichXML += '\n';
                }
            });

            const startStepCaption = escapeXml($(`#startStepCaption_${self.id}`).val());

            catchLongCaptions(startStepCaption);

            htmlOfRichXML += escapeXml('\n<zyInstruction instrType="startStep">');
            htmlOfRichXML += makeLargeFontHTML(`<text>${startStepCaption}</text>`);
            htmlOfRichXML += escapeXml('</zyInstruction>\n</zyInstructions>\n');
            htmlOfRichXML += makeLargeFontHTML(`<zyAltDescription>${zyAltDescription}</zyAltDescription>`);
            htmlOfRichXML += escapeXml('\n</zyAnimator>');

            const xml = $('<div>').html(htmlOfRichXML).text();

            return { xml, htmlOfRichXML };
        }

        function setAnimationXML(xml, shouldNotClearXML) {
            shouldNotClearXML = shouldNotClearXML !== undefined ? shouldNotClearXML : false;

            var objNum;
            var instrNum;
            var objNumHash = {};
            var allObjectData = [];
            var allInstrData = [];
            var canvasData = {};
            var objectData;
            var instrData;
            var attrs;
            var i;
            var j;
            var $canvas = $('#canvas_' + self.id);
            var instrToSelect = 'none';
            var objectToSelect = 'none';
            var $tmp;
            var zyAnimatorTag;
            var canvases;
            var objs;
            var instrs;
            var top;
            var left;
            var transformDeg;
            var padding;
            var opacity;
            var $graphic;
            var $objList = $('#objList_' + self.id);
            var $stepControls;
            var $canvasResizable;
            var $caption = $('#caption_' + self.id);
            var zyAnimatorAlreadyRemovedFromDOM = $('#' + self.id).css('display') === 'none';
            var hadErrorWhileLoading = false;
            var tmpArrOfObjectNums;

            if (!zyAnimatorAlreadyRemovedFromDOM) {
                $('#' + self.id).hide(); // AE 012514 Hiding zyAnimator to prevent re-rendering of each new element removed/added to the webpage
            }

            stopAllAnimations();
            animationStopPlaying();
            // Clear existing animation elements
            $objList.children().each(function() {
                objNum = $(this).attr('objNum');
                $.contextMenu('destroy', '#stepObjectGraphic_' + self.id + '_' + objNum);
            });
            $objList.empty(); // Empty object list
            $('#instrList_' + self.id).empty(); // Empty instruction list
            $('#step1Caption_' + self.id).val(INSTR_STEP_PLACEHOLDER_TEXT);
            $('#startStepCaption_' + self.id).val(INSTR_STEP_PLACEHOLDER_TEXT);
            hideInspector();

            $stepControls = $canvas.children('.stepControls').detach(); // Save the stepControls
            $canvasResizable = $canvas.children('.ui-resizable-handle').detach(); // Save the resizable element
            $caption.detach(); // Save the caption element
            $canvas.empty();
            $stepControls.appendTo($canvas); // Add the stepControls back to the canvas
            $canvasResizable.appendTo($canvas); // Add resizable element back to canvas
            $caption.appendTo($canvas); // Add the caption element back to canvas
            $('#samples_' + self.id).val('default');
            $('#samplesSandy_' + self.id).val('default');

            $stepControls.children('.timeline').empty(); // Empty the timeline

            $canvas.css('height', '350px');
            $canvas.css('width', '600px');
            $caption.css('top', '310px');
            numObjs = 0;
            numInstrs = 0;

            $tmp = $('<div>');
            $tmp.html(xml);

            zyAnimatorTag = $tmp.find('zyAnimator');
            canvases = $tmp.find('zyCanvas');
            objs = $tmp.find('zyObject');
            instrs = $tmp.find('zyInstruction');

            // Store the alt description if it exists.
            const $zyAltDescription = zyAnimatorTag.find('zyAltDescription');

            zyAltDescription = $zyAltDescription.html();

            zyAnimationID = utilities.generateGUID();
            document.getElementById("GUID").value = zyAnimationID; // David May 3/25/20 updates displayed GUID
            zyAnimationCaption = document.getElementById("caption").value;
            zyAnimationLoadOnDemand = false;
            if (zyAnimatorTag.length > 0) {
                attrs = zyAnimatorTag[0].attributes;
                for(j = 0; j < attrs.length; j++) { // gather attributes
                    if (attrs[j].name === 'id') {
                        zyAnimationID = attrs[j].nodeValue;
                        document.getElementById("GUID").value = zyAnimationID; // David May 3/25/20 update displayed GUID
                    } else if (attrs[j].name === 'caption') {
                        zyAnimationCaption = attrs[j].nodeValue;
                        document.getElementById("caption").value = zyAnimationCaption;
                    } else if (attrs[j].name === 'selectedinstr') {
                        instrToSelect = attrs[j].nodeValue;
                    } else if (attrs[j].name === 'selectedobj') {
                        objectToSelect = attrs[j].nodeValue;
                    } else if (attrs[j].name === 'numobjsevercreated') {
                        numObjs = attrs[j].nodeValue - objs.length;
                    } else if (attrs[j].name === 'loadondemand') {
                        zyAnimationLoadOnDemand = attrs[j].nodeValue;
                    }
                    else {
                        canvasData[attrs[j].name] = attrs[j].nodeValue;
                    }
                    // make sure critical attributes exist... AE 051514: none exist at this time.
                }
            } else {
                zyAnimationCaption = document.getElementById("caption").value;
                zyAnimationLoadOnDemand = false;
            }

            if (canvases.length > 0) { // AE 51514: zyCanvas no longer exported. This code is just for legacy animation imports.
                for(i = 0; i < canvases.length; i++) { // parse canvas attributes
                    attrs = canvases[i].attributes;
                    for(j = 0; j < attrs.length; j++) { // gather attributes
                        if (attrs[j].name == 'selectedinstr') {
                            instrToSelect = attrs[j].nodeValue;
                        } else if (attrs[j].name == 'selectedobj') {
                            objectToSelect = attrs[j].nodeValue;
                        } else {
                            canvasData[attrs[j].name] = attrs[j].nodeValue;
                        }
                    }
                    // make sure critical attributes exist... AE 011614: none exist at this time.
                }
            }

            for(i = 0; i < objs.length; i++) { // parse objects attributes
                objectData = {};
                objectData['css'] = {};
                attrs = objs[i].attributes;

                // If the object has <text> children, then store the <text> children's contents
                // Otherwise if the object has <zyCode> children, then store the <zyCode> children's contents, including the code language
                var $object = $(objs[i]);

                if ($object.children('text').length > 0) {
                    objectData.text = $object.children('text').html();
                    objectData.zyCodeLanguage = $object.children('text').attr('language') || 'none';
                }
                else if ($object.children('zyCode').length > 0) {
                    objectData.zyCode = $object.children('zyCode').html();

                    var codeLanguage = $object.children('zyCode').attr('language');
                    var unsupportedLanguage = $object.children('zyCode').attr('unsupported-language');

                    // If a language is specified, then use that language.
                    objectData.zyCodeLanguage = codeLanguage || unsupportedLanguage || null;
                }

                // Gather attributes from object
                for (j = 0; j < attrs.length; j++) {
                    switch (attrs[j].name) {
                        case 'objnum':
                            objectData.objNum = attrs[j].nodeValue;
                            break;
                        case 'objtype':
                            objectData.objType = attrs[j].nodeValue;
                            break;
                        case 'objname':
                            objectData.objName = attrs[j].nodeValue;
                            break;
                        case 'googledrivefileid':
                            objectData.googleDriveFileID = attrs[j].nodeValue;
                            break;
                        case 'useconstrainedproportions':
                            objectData.useConstrainedProportions = attrs[j].nodeValue;
                            break;
                        case 'constrainedproportionsheight':
                            objectData.constrainedProportionsHeight = attrs[j].nodeValue;
                            break;
                        case 'constrainedproportionswidth':
                            objectData.constrainedProportionsWidth = attrs[j].nodeValue;
                            break;
                        default:
                            objectData.css[attrs[j].name] = attrs[j].nodeValue;
                    }
                }

                if (!objectData['objNum']) { // make sure critical attributes exist (object's need objnum and objtype)
                    errorHint = 'A zyObject is missing the objNum property.';
                    hadErrorWhileLoading = true;
                } else if (!objectData['objType']) {
                    errorHint = 'A zyObject is missing the objType property.';
                    hadErrorWhileLoading = true;
                }

                allObjectData.push(jQuery.extend(true, {}, objectData));
            }

            for(i = 0; i < instrs.length; i++) { // parse instructions attributes
                instrData = {};
                attrs = instrs[i].attributes;

                if ($(instrs[i]).children('text').length > 0) {
                    instrData['text'] = $(instrs[i]).children('text').text();
                }

                for(j = 0; j < attrs.length; j++) { // gather attributes
                    if (attrs[j].name == 'objnum') {
                        instrData['objNum'] = attrs[j].nodeValue;
                    } else {
                        instrData[attrs[j].name] = attrs[j].nodeValue;
                    }
                }

                // make sure critical attributes exist (instruction's need objnum and instrtype)
                if (!instrData['instrtype']) {
                    errorHint = 'A zyInstruction is missing the instrType property.';
                    hadErrorWhileLoading = true;
                }
                if ([ 'move', 'fade', 'resize', 'rotate', 'background-color', 'color' ].indexOf(instrData.instrType) !== -1) {
                    if (!instrData.objNum) {
                        errorHint = 'A zyInstruction is missing the objNum property.';
                        hadErrorWhileLoading = true;
                    }
                }

                allInstrData.push(jQuery.extend(true, {}, instrData));
            }

            if (!hadErrorWhileLoading) {
                // update step properties
                for(canvasProp in canvasData) {
                    $canvas.css(canvasProp, canvasData[canvasProp]);
                    if (canvasProp === 'height') {
                        $caption.css('top', roundCSSProperty(canvasData[canvasProp], 0) - 43);
                    } else if (canvasProp === 'width') {
                        $caption.css('width', roundCSSProperty(canvasData[canvasProp], 0) - 20);
                    }
                }
                updateSpinnersForNewCanvasHeightWidth($canvas.height(), $canvas.width());

                // generate objects
                for (i = 0; i < allObjectData.length; i++) {
                    objectData = allObjectData[i];
                    oldObjNum = objectData.objNum;
                    if (objectData.objType === OBJECT_PROPERTIES.box.type) {
                        newObjNum = addBoxObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.image.type) {
                        var googleDriveFileID = objectData.googleDriveFileID || '';
                        newObjNum = addImageObject(googleDriveFileID, true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.text.type) {
                        var text = objectData.text || objectData.zyCode || '';
                        var language = objectData.zyCodeLanguage;

                        newObjNum = addTextObj(text, true, language);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.ANDgate.type) {
                        newObjNum = addANDObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.ORgate.type) {
                        newObjNum = addORObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.XORgate.type) {
                        newObjNum = addXORObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.NOTgate.type) {
                        newObjNum = addNOTObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.NANDgate.type) {
                        newObjNum = addNANDObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.NORgate.type) {
                        newObjNum = addNORObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.XNORgate.type) {
                        newObjNum = addXNORObj(true);
                    }
                    else if (objectData.objType === OBJECT_PROPERTIES.triangle.type) {
                        newObjNum = addTriangleObj(true);
                    }

                    if (objectData.objName) {
                        var $listObject = $('#listObject_' + self.id + '_' + newObjNum);
                        $listObject.attr('objName', objectData.objName);
                        $listObject.find('.labelText').text(objectData.objName);
                    }

                    // Add |useConstrainedProportions| if it exists
                    var $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);
                    if (typeof objectData.useConstrainedProportions !== 'undefined') {
                        var isTrueSet = objectData.useConstrainedProportions === 'true';
                        $graphic.data('useConstrainedProportions', isTrueSet);
                    }

                    // Add constrained proportions if they exist
                    if (typeof objectData.constrainedProportionsHeight !== 'undefined') {
                        if (typeof objectData.constrainedProportionsWidth !== 'undefined') {
                            $graphic.data('constrainedProportions', {
                                height: Number(objectData.constrainedProportionsHeight),
                                width:  Number(objectData.constrainedProportionsWidth)
                            });
                        }
                    }

                    for (cssProp in objectData.css) {
                        // Text objects ignore height and width attributes
                        if (objectData.objType === OBJECT_PROPERTIES.text.type) {
                            if ((cssProp === 'height') || (cssProp === 'width')) {
                                continue;
                            }
                        }

                        if (cssProp == 'top') {
                            top = roundCSSProperty(objectData['css'][cssProp], 0);
                            if (!isNaN(top)) {
                                updateGraphicAndInitCSS(newObjNum, cssProp, objectData['css'][cssProp]);
                            }
                        } else if (cssProp == 'left') {
                            left = roundCSSProperty(objectData['css'][cssProp], 0);
                            if (!isNaN(left)) {
                                updateGraphicAndInitCSS(newObjNum, cssProp, objectData['css'][cssProp]);
                            }
                        } else if (cssProp == 'transformdeg') {
                            transformDeg = roundCSSProperty(objectData['css'][cssProp], 0);
                            if (!isNaN(transformDeg)) {
                                updateRotationOfGraphicAndInitCSS(newObjNum, cssProp, objectData['css'][cssProp]);
                            }
                        } else if (cssProp == 'padding') {
                            padding = roundCSSProperty(objectData['css'][cssProp], 0);
                            if (!isNaN(padding)) {
                                updateGraphicAndInitCSS(newObjNum, cssProp, objectData['css'][cssProp]);
                            }
                        } else if (cssProp === 'opacity') {
                            opacity = roundCSSProperty(objectData['css'][cssProp], 0);
                            if (!isNaN(opacity)) {
                                opacity = opacity / 100.0;
                                updateGraphicAndInitCSS(newObjNum, cssProp, opacity);
                            }
                        }
                        // Convert the old zyAnimator colors to the new zyAnimator colors
                        // The old colors were export as rgb values, e.g., rgb(51, 51, 51)
                        // The new colors are exported as color names, e.g., dark-gray
                        else if (cssProp === 'background-color'
                                || cssProp === 'border-color'
                                || cssProp === 'color') {
                            var dataPropVal = objectData['css'][cssProp];
                            if (dataPropVal in OLD_RGB_TO_NEW_COLOR_NAME) {
                                dataPropVal = OLD_RGB_TO_NEW_COLOR_NAME[dataPropVal];
                            }
                            if (dataPropVal in COLORS_NAME_TO_RGB) {
                                dataPropVal = COLORS_NAME_TO_RGB[dataPropVal];
                            }
                            else {
                                // WARNING: not a zyAnimator color! Show warning...
                                // Message something like: Please select from the color picker in the UI
                            }
                            updateGraphicAndInitCSS(newObjNum, cssProp, dataPropVal);
                        }
                        else {
                            var propertyValue = objectData.css[cssProp];
                            if ((cssProp === 'font-family') && SPECIAL_LINE_HEIGHTS.hasOwnProperty(propertyValue)) {
                                updateGraphicAndInitCSS(newObjNum, 'line-height', SPECIAL_LINE_HEIGHTS[propertyValue]);
                            }

                            updateGraphicAndInitCSS(newObjNum, cssProp, propertyValue);
                        }
                    }

                    if (objectData['objType'] == OBJECT_PROPERTIES.text.type) {
                        $("#stepObjectGraphic_" + self.id + "_" + newObjNum).css('height', 'auto').css('width', 'auto');
                    }

                    objNumHash[oldObjNum] = newObjNum;
                }

                // generate instructions
                for(i = 0; i < allInstrData.length; i++) {
                    instrData = allInstrData[i];

                    if ([ 'move', 'fade', 'resize', 'rotate', 'background-color', 'border-color', 'color' ].indexOf(instrData.instrtype) !== -1) { // David May 8/29/20 Add font color instr 8/31/20 Add border color instr
                        oldObjNum = instrData['objNum'];
                        newObjNum = objNumHash[oldObjNum];

                        var instrNum = '';
                        switch (instrData.instrtype) {
                            case 'move':
                                instrNum = addMoveInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                $graphic.css('top', instrData.top + 'px');
                                $('#instrTopPosSpinner_' + self.id + '_' + instrNum).val(instrData['top']);

                                $graphic.css('left', instrData.left + 'px');
                                $('#instrLeftPosSpinner_' + self.id + '_' + instrNum).val(instrData['left']);
                                break;
                            case 'fade':
                                instrNum = addFadeInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                opacity = roundCSSProperty(instrData.opacity, 0);
                                if (!isNaN(opacity)) {
                                    $graphic.css('opacity', opacity / 100.0);
                                    $('#instrOpacitySpinner_' + self.id + '_' + instrNum).val(opacity);
                                }
                                break;
                            case 'resize':
                                instrNum = addResizeInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                $graphic.css('height', instrData.height + 'px');
                                $('#instrHeightSpinner_' + self.id + '_' + instrNum).val(instrData['height']);

                                $graphic.css('width', instrData.width + 'px');
                                $('#instrWidthSpinner_' + self.id + '_' + instrNum).val(instrData['width']);
                                break;
                            case 'rotate':
                                instrNum = addRotateInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                updateStepObjectTransform($graphic, instrData.transformdeg);
                                $('#instrRotateSpinner_' + self.id + '_' + instrNum).val(instrData.transformdeg);
                                break;
                            case 'background-color':
                                instrNum = addBackgroundColorInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                var color = instrData['background-color'];

                                // If the color is a color name (e.g., zyanimator-yellow), then convert to RGB value.
                                if (color in COLORS_NAME_TO_RGB) {
                                    color = COLORS_NAME_TO_RGB[color];
                                }

                                updateGraphic(newObjNum, 'background-color', color);
                                $('#instr_' + self.id + '_' + instrNum).attr('background-color', color);
                                break;
                            case 'border-color': // David May 8/31/20 Adding border color instr
                                instrNum = addBorderColorInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                var color = instrData['border-color'];

                                // If the color is a color name (e.g., zyanimator-yellow), then convert to RGB value.
                                if (color in COLORS_NAME_TO_RGB) {
                                    color = COLORS_NAME_TO_RGB[color];
                                }

                                updateGraphic(newObjNum, 'border-color', color);
                                $('#instr_' + self.id + '_' + instrNum).attr('border-color', color);
                                break;
                            case 'color': // David May 8/29/20 Import font color instr
                                instrNum = addFontColorInstr(newObjNum, true);
                                $graphic = $('#stepObjectGraphic_' + self.id + '_' + newObjNum);

                                var color = instrData['color'];

                                // If the color is a color name (e.g., zyanimator-yellow), then convert to RGB value.
                                if (color in COLORS_NAME_TO_RGB) {
                                    color = COLORS_NAME_TO_RGB[color];
                                }

                                updateGraphic(newObjNum, 'color', color);
                                $('#instr_' + self.id + '_' + instrNum).attr('color', color);
                                break;
                        }

                        var $instruction = $('#instr_' + self.id + '_' + instrNum);

                        // Update easing if easing was defined
                        if (!!instrData.easing) {
                            updateEasing($instruction, instrData.easing);
                        }

                        // Update time label if one was defined
                        if (!!instrData.timelabel) {
                            if (instrData.timelabel !== '-') {
                                instrData.timelabel = instrData.timelabel + 's';
                            }
                            $instruction.find('.timeLabel').text(instrData.timelabel);
                        }
                    }
                    else if ((instrData['instrtype'] === 'step')
                                || (instrData['instrtype'] == 'scene')) { // Backwards compatibility for old keyword 'scene'
                        addStepInstr(instrData['text'], true);
                    }
                    else if ((instrData['instrtype'] === 'step1')
                                || (instrData['instrtype'] == 'scene1')) { // Backwards compatibility for old keyword 'scene'
                        $('#step1Caption_' + self.id).val(instrData['text']);
                    }
                    else if ((instrData['instrtype'] === 'startStep')
                                || (instrData['instrtype'] == 'startScene')) { // Backwards compatibility for old keyword 'scene'
                        $('#startStepCaption_' + self.id).val(instrData['text']);
                    }
                }
                updateStepNumbering();

                $("#warning_" + self.id).text('');

                if (!shouldNotClearXML) {
                    $("#exportImportTextarea_" + self.id).val('');
                }
            } else {
                $("#warning_" + self.id).text('Error while loading: ' + errorHint);
            }

            deselectAllObjs();

            $('#' + self.id).show(); // AE 012514 Showing zyAnimator now that loading has finished.
                                     // AE 020714 This show allows objects to render so that the following text object selection renders the outline's height/width properly

            if (isEditorShown) { // Select pre-defined instruction and object
                if (!isNaN(instrToSelect)) {
                    selectInstrByInstrNum(instrToSelect);
                } else {
                    selectInstrByInstrNum('goToStartStep');
                }

                tmpArrOfObjectNums = objectToSelect.split(' ');
                if (tmpArrOfObjectNums.length > 1) {
                    for (i = 0; i < tmpArrOfObjectNums.length; i++) {
                        if (!isNaN(tmpArrOfObjectNums[i])) {
                            selectObjByObjNum(tmpArrOfObjectNums[i], true);
                        }
                    }
                    outlineInstrsByObjNum(); // David May 7/29/20 Outline relevant instrs after selecting all objects
                } else if (tmpArrOfObjectNums.length === 1) {
                    if (!isNaN(tmpArrOfObjectNums[0])) {
                        selectObjByObjNum(tmpArrOfObjectNums[0]);
                        outlineInstrsByObjNum(); // David May 7/25/20 Outline relevant instrs
                    }
                }
            } else {
                goToStartStep();
            }

            if (zyAnimatorAlreadyRemovedFromDOM) {
                $('#' + self.id).hide();
            }

            self.parentResource.latexChanged();

            return hadErrorWhileLoading;
        }

        function askUserIfOKToLoadXML(xml, shouldNotClearXML) {
            shouldNotClearXML = shouldNotClearXML !== undefined ? shouldNotClearXML : false;
            var shouldLoad = false;
            var hasNewObj = $("#objList_" + self.id).children().length > 0;
            var hasNewInstr = $("#instrList_" + self.id).children().length > 0;
            var step1HasNewCaption = $("#step1Caption_" + self.id).val() !== INSTR_STEP_PLACEHOLDER_TEXT;
            var startInstrHasNewCaption = $("#startStepCaption_" + self.id).val() !== INSTR_STEP_PLACEHOLDER_TEXT;
            if (!hasNewObj && !hasNewInstr && !step1HasNewCaption && !startInstrHasNewCaption) { // Don't ask to load since no content to loose anyways
                shouldLoad = true;
            } else {
                shouldLoad = confirm('Loading will overwrite current animation. Load anyway?');
            }

            if (shouldLoad) {
                $('#' + self.id).fadeOut(200, function() {
                    // var startTime = new Date().getTime();
                    setAnimationXML(xml, shouldNotClearXML);
                    // var endTime = new Date().getTime();
                    // alert(endTime - startTime);

                    goToStartStep();

                    $('#' + self.id).fadeIn(200);
                    takeSnapshot();
                });
            }
            return;
        }

        function showEditor() {
            var $caption = $("#caption_" + self.id);
            $caption.attr('title', $caption.data('title'));
            $("#rightSideBar_" + self.id).show();
            $("#leftSideBar_" + self.id).show();
            $("#importExport_" + self.id).show();
            $("#editorButtonsSet1_" + self.id).show();
            $(`#new-animation-${self.id}`).show();
            $("#editorButtonsSet2_" + self.id).show();
            $("#sampleAnim4_" + self.id).show();
            $("#sampleAnim5_" + self.id).show();
            enableInteractiveEditorElements();
            return;
        }

        function hideEditor() {
            var $caption = $("#caption_" + self.id);
            $caption.data('title', $caption.attr('title'));
            $caption.attr('title', '');
            $("#rightSideBar_" + self.id).hide();
            $("#leftSideBar_" + self.id).hide();
            $("#importExport_" + self.id).hide();
            $("#editorButtonsSet1_" + self.id).hide();
            $(`#new-animation-${self.id}`).hide();
            $("#editorButtonsSet2_" + self.id).hide();
            $("#sampleAnim4_" + self.id).hide();
            $("#sampleAnim5_" + self.id).hide();
            deselectAllObjs();
            disableInteractiveEditorElements();

            return;
        }

        // David May 3/24/20 Removed "Toggle editor"
        // function invisibleEditor() {
        //     var $caption = $("#caption_" + self.id);
        //     $caption.attr('title', $caption.data('title'));
        //     $("#rightSideBar_" + self.id).css('visibility', 'hidden');
        //     $("#leftSideBar_" + self.id).css('visibility', 'hidden');
        //     $("#importExport_" + self.id).css('visibility', 'hidden');
        //     $("#editorButtonsSet1_" + self.id).css('visibility', 'hidden');
        //     $(`#new-animation-${self.id}`).css('visibility', 'hidden');
        //     $("#editorButtonsSet2_" + self.id).css('visibility', 'hidden');
        //     $("#sampleAnim4_" + self.id).css('visibility', 'hidden');
        //     $("#sampleAnim5_" + self.id).css('visibility', 'hidden');
        //     disableInteractiveEditorElements();
        // }

        // function visibleEditor() {
        //     var $caption = $("#caption_" + self.id);
        //     $caption.attr('title', $caption.data('title'));
        //     $("#rightSideBar_" + self.id).css('visibility', 'visible');
        //     $("#leftSideBar_" + self.id).css('visibility', 'visible');
        //     $("#importExport_" + self.id).css('visibility', 'visible');
        //     $("#editorButtonsSet1_" + self.id).css('visibility', 'visible');
        //     $(`#new-animation-${self.id}`).css('visibility', 'visible');
        //     $("#editorButtonsSet2_" + self.id).css('visibility', 'visible');
        //     $("#sampleAnim4_" + self.id).css('visibility', 'visible');
        //     $("#sampleAnim5_" + self.id).css('visibility', 'visible');
        //     enableInteractiveEditorElements();
        // }

        /**
            Set the speed button's position based on the play button's position.
            @method setSpeedButtonPosition
            @return {void}
        */
        function setSpeedButtonPosition() {
            const $playButton = $(`#playButton_${self.id}`);
            const playButtonLeft = $playButton.offset().left;
            const playButtonBorderWidth = parseInt($playButton.css('border-left-width'), 10);
            const playButtonParentLeft = $playButton.parent().offset().left;
            const doubleSpeedMarginLeft = 15;
            const doubleSpeedLeft = playButtonLeft - playButtonParentLeft + playButtonBorderWidth + doubleSpeedMarginLeft;

            $doubleSpeed.css('left', doubleSpeedLeft);
        }

        function hideStartButton() {
            $("#startButton_" + self.id).hide();
            $("#timeline_" + self.id).show();
            $("#playButton_" + self.id).show();
            $doubleSpeed.show();

            // Homepage does not show the back-to-start button.
            if (self.useHomePageBehavior) {
                $("#goToStartStepButton_" + self.id).hide();
            }
            else {
                $("#goToStartStepButton_" + self.id).show();
            }

            setSpeedButtonPosition();
        }

        function showStartButton() {
            // Homepage does not show the start button.
            if (!self.useHomePageBehavior) {
                $("#startButton_" + self.id).show();
                $("#timeline_" + self.id).hide();
                $("#goToStartStepButton_" + self.id).hide();
                $("#playButton_" + self.id).hide();
                $doubleSpeed.hide();
            }
        }

        function checkIfNewBehaviorIsUsed(firedEvent) {
            let newBehaviorUsed = false;

            if (zyAnimatorActive) {
                const $target = $(firedEvent.target);

                // If selected dom object is textarea or an input (other than a button), then don't use arrow-keys to move the selected object
                if ($target.is('textarea') || ($target.is('input') && ($target.attr('type') !== 'button'))) {
                    newBehaviorUsed = false;
                }

                // Selected area is an editable DOM object.
                else if ($target.attr('contenteditable') === 'true') {
                    newBehaviorUsed = false;
                }
                else {

                    // Left: 37, Up: 38, Right: 39, Down: 40
                    const arrowKeys = [ 37, 38, 39, 40 ]; // eslint-disable-line no-magic-numbers

                    newBehaviorUsed = arrowKeys.includes(firedEvent.which);
                }
            }

            if (newBehaviorUsed) {
                firedEvent.preventDefault();
            }

            return newBehaviorUsed;
        }

        function isEventRightMouseButton(event) {
            // Determine whether right mouse button was clicked
            event = event || window.event;
            if ('which' in event) {  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                return event.which == 3;
            }
            else if ('button' in event) { // IE, Opera
                return event.button == 2;
            }
            return false;
        }

        function decideWhetherToShowToolTip() {
            var userWantsToolTipsDisabled = $('#tooltipToggle_' + self.id).data('isDisabled');
            if (userWantsToolTipsDisabled) {
                disableTooltip();
            }
            else {
                enableTooltip();
            }
        }

        function getGraphicObjectsWithTooltip() {
            return $('#' + self.id + ' .stepObjectGraphic').filter(function() {
                return !!$(this).data('ui-tooltip');
            });
        }

        function enableTooltip() {
            $('#' + self.id).tooltip('enable');
            getGraphicObjectsWithTooltip().tooltip('enable');

            // Save tool tip enabled value in localstore.
            self.parentResource.setLocalStore('areTooltipsDisabled', false);
        }

        function disableTooltip() {
            $('#' + self.id).tooltip('disable');
            getGraphicObjectsWithTooltip().tooltip('disable');

            // Save tool tip disabled value in localstore.
            self.parentResource.setLocalStore('areTooltipsDisabled', true);
        }

        /*
            Update inspector and instruction spinners to for new canvas' |height| and |width|.
            |height| and |width| are required and a number.
        */
        function updateSpinnersForNewCanvasHeightWidth(height, width) {

            /*
                Update top, left, height, and width inspector spinner's maximum to be the canvas's
                height and width.
            */
            $(`#objTopPosSpinner_${self.id}`).spinner('option', 'max', height);
            $(`#objLeftPosSpinner_${self.id}`).spinner('option', 'max', width);
            $(`#objHeightSpinner_${self.id}`).spinner('option', 'max', height);
            $(`#objWidthSpinner_${self.id}`).spinner('option', 'max', width);

            // Update maximums for each instruction's spinners.
            $(`#instrList_${self.id}`).children().each(function() {
                const $instruction = $(this);
                const instructionType = $instruction.attr('instrType');
                const instructionNumber = $instruction.attr('instrNum');

                if (instructionType === 'move') {
                    $(`#instrTopPosSpinner_${self.id}_${instructionNumber}`).spinner('option', 'max', height);
                    $(`#instrLeftPosSpinner_${self.id}_${instructionNumber}`).spinner('option', 'max', width);
                }
                else if (instructionType === 'resize') {
                    $(`#instrHeightSpinner_${self.id}_${instructionNumber}`).spinner('option', 'max', height);
                    $(`#instrWidthSpinner_${self.id}_${instructionNumber}`).spinner('option', 'max', width);
                }
            });
        }

        function initZyAnimatorInteractiveElements() {
            $('#' + self.id).tooltip({
                tooltipClass: 'zyAtooltip',
                position: {
                    my: 'center top',
                    at: 'center bottom+20'
                },
                show: {
                    delay: 400
                }
            });

            // Check localstore for tooltip enabled or disabled info.
            const areTooltipsDisabled = self.parentResource.getLocalStore('areTooltipsDisabled');
            const $tooltipToggle = $(`#tooltipToggle_${self.id}`);

            $tooltipToggle.data('isDisabled', areTooltipsDisabled);
            if (areTooltipsDisabled) {
                $tooltipToggle.val('Show tooltips');
            }

            $('#tooltipToggle_' + self.id).click(function() {
                var isDisabled = $('#tooltipToggle_' + self.id).data('isDisabled');
                if (isDisabled) {
                    $('#tooltipToggle_' + self.id).val('Hide tooltips').data('isDisabled', false);
                    enableTooltip();
                }
                else {
                    $('#tooltipToggle_' + self.id).val('Show tooltips').data('isDisabled', true);
                    disableTooltip();
                }
            });

            $(`#new-animation-${self.id}`).click(() => {
                if (confirm('Creating a new animation will erase existing work. Proceed anyway?')) {
                    const emptyAnimation = `<zyAnimator id="${utilities.generateGUID()}" caption="" height="350px" width="600px" selectedInstr="none"` +
                    ' selectedObj="none" numObjsEverCreated="0" loadOnDemand="false">' +
                    '<zyObjects></zyObjects><zyInstructions><zyInstruction instrType="step1"><text></text>' +
                    '</zyInstruction><zyInstruction instrType="startStep"><text></text></zyInstruction></zyInstructions></zyAnimator>';
                    setAnimationXML(emptyAnimation);
                }
            });

            // David May 3/25/20 Added refresh GUID function
            $(`#new-GUID-${self.id}`).click(() => {
                zyAnimationID = utilities.generateGUID();
                document.getElementById("GUID").value = zyAnimationID;
            });

            // David May 5/3/20 Clears all instructions and sets 0% initial-opacity objects to 100%
            $(`#clearInstr`).off('click').click(() => {
                if (confirm('Clear all instructions? (Note: 0% initial-opacity objects become 100%)')) {
                    $('#step1Caption_1').val('');

                    var $timeline = $('#timeline_' + self.id);
                    var $stepGraphics = $timeline.children();
                    $stepGraphics.each(function() {
                        $(this).remove();
                    });

                    var $instrList = $('#instrList_' + self.id).children();
                    $instrList.each(function() {
                        $currChild = $(this);

                        removeInstruction($currChild.attr('instrNum'));
                        $('#instr_1_' + $currChild.attr('instrNum')).remove();
                    });

                    if ($('#objOpacitySpinner_1').val() == 0) { // If selected object has opacity value 0, set spinner to 100
                        $('#objOpacitySpinner_1').val(100);
                    }

                    var $objList = $('#objList_' + self.id).children();
                    $objList.each(function() {
                        $currObj = $(this);
                        if ($('#stepObjectInit_1_' + $currObj.attr('objNum')).css('opacity') == 0) {
                            updateGraphic($currObj.attr('objNum'), 'opacity', 100);
                            var $currGraphicObj = $('#stepObjectGraphic_1_' + $currObj.attr('objNum'));
                            var $currStepObj = $('#stepObjectInit_1_' + $currObj.attr('objNum'));
                            $currGraphicObj.css('opacity', 1);
                            $currStepObj.css('opacity', 1);
                        }
                    });

                    selectInstrByInstrNum(0);
                    runInstructionsUpToSelectedInstruction(true);
                    updateStepNumbering();
                    goToStartStep();
                }
            });

            $('#specialCharacters_' + self.id).click(() => {
                window.open('https://static-resources.zybooks.com/browserSafeUnicode.html', '_blank');
            });

            $('#specificationTool_' + self.id).click(() => {
                window.open('https://static-resources.zybooks.com/convertSpecToAnimationXML.html', '_blank');
            });

            $('#canvas_' + self.id).mousedown(function(e) {
                var $objsEditable;
                var $objLabelsEditable;
                var $caption;
                var didRemoveEditable = false;

                if (!isAnimationPlaying && !e.ctrlKey && !e.metaKey && !isEventRightMouseButton(e)) {
                    if ($(e.target).attr('id') === 'canvas_' + self.id) {
                        $objsEditable = $('#canvas_' + self.id + ' .stepObject[contenteditable=true]');
                        if ($objsEditable.length > 0) { // if an object is editable, then just remove editable
                            removeAllContentEditableObjs();
                            didRemoveEditable = true;
                        }

                        $caption = $('#caption_' + self.id);
                        if ($caption.attr('contenteditable') === 'true') { // if caption is editable, then just remove editable
                            $caption.attr('contenteditable', 'false');
                            didRemoveEditable = true;
                        }

                        $objLabelsEditable = $('#objList_' + self.id + ' .label .labelText[contenteditable=true]'); // if object label is editable, then remove editable
                        if ($objLabelsEditable.length > 0) {
                            $objLabelsEditable.blur();
                            didRemoveEditable = true;
                        }

                        if (!didRemoveEditable) {                       // if nothing was editable, then deselect all objects
                            $('#instrList_' + self.id + ' .labelSelected').find('.instrMenu').hide(); // hide menu of selected instruction
                            deselectAllObjs();
                            removeAllInstrsOutline(); // David May 7/25/20 Remove all instruction outlines
                        }
                    }
                }
                return;
            });

            $('#canvas_' + self.id).resizable({
                grid: [ gridGranularity, gridGranularity ],
                handles: 's, e',
                minHeight: 150,
                maxHeight: 600,
                minWidth: 300,
                maxWidth: 725,
                resize: function(event, ui) {
                    $('#caption_' + self.id).css('top', ui.size.height - 43);
                    $('#caption_' + self.id).css('width', ui.size.width - 20);
                },
                stop: function(event, ui) {
                    updateSpinnersForNewCanvasHeightWidth(ui.size.height, ui.size.width);
                    takeSnapshot();
                }
            });

            $('#canvas_' + self.id).selectable({
                cancel: `#startButton_${self.id}, #goToStartStepButton_${self.id}, #playButton_${self.id}, #caption_${self.id}, .timelineNum, .stepObjectGraphic, label.speed-control`,
                filter: '.stepObjectGraphic',
                selecting: function(event, ui) {
                    var selected = $(ui.selecting);

                    if ($('#canvas_' + self.id + ' .stepObjectGraphic[isselected="true"]').length === 0) { // First selected object
                        selectObjByObjNum(selected.attr('objNum'));
                    } else {
                        $('#instrList_' + self.id + ' .labelSelected').find('.instrMenu').hide(); // hide menu of selected instruction
                        selectObjByObjNum(selected.attr('objNum'), true);
                    }
                },
                unselecting: function(event, ui) {
                    var unselected = $(ui.unselecting);
                    var objNum = unselected.attr('objNum');

                    deselectObjByObjNum(objNum);

                    var $selectObjects = $('#canvas_' + self.id + ' .stepObjectGraphic[isselected="true"]');
                    if ($selectObjects.length === 1) { // Last selected object
                        selectObjByObjNum($selectObjects.attr('objNum'));
                    } else if ($selectObjects.length === 0) {
                        hideInspector();
                    }
                }
            });

            // David May 4/25/20 Added "More"/"Less" button to display logic gates
            $('#moreobj').off('click').click(function() {
                if ($('#logic-gate-div').is(':hidden')) {
                    $('#logic-gate-div').show();
                    $('#moreobj').text('Less');
                } else {
                    $('#logic-gate-div').hide();
                    $('#moreobj').text('More');
                }
            });

            // David May 7/19/20 Add line object function
            $('#addLineObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addLineObj();
                    takeSnapshot();
                }
            });

            $('#addBoxObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addBoxObj();
                    takeSnapshot();
                }
            });

            $('#addTextObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addTextObj();
                    takeSnapshot();
                }
            });

            $('#addImageObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addImageObject();
                    takeSnapshot();
                }
            });

            $('#addANDObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addANDObj();
                    takeSnapshot();
                }
            });

            $('#addORObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addORObj();
                    takeSnapshot();
                }
            });

            $('#addXORObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addXORObj();
                    takeSnapshot();
                }
            });

            $('#addNOTObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addNOTObj();
                    takeSnapshot();
                }
            });

            $('#addNANDObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addNANDObj();
                    takeSnapshot();
                }
            });

            $('#addNORObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addNORObj();
                    takeSnapshot();
                }
            });

            $('#addXNORObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addXNORObj();
                    takeSnapshot();
                }
            });

            $('#addTriangleObj_' + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addTriangleObj();
                    takeSnapshot();
                }
            });

            // David May 8/31/20 Multi-sort, allows several objects to be dragged at once
            $("#objList_" + self.id).sortable({
                helper: function(event, item) {
                    var useMultiSelectBehavior = item.hasClass('labelSelected');

                    if (useMultiSelectBehavior) {
                        // Clone all list objects with .labelSelected class
                        var $selectedObjs = item.parent().children('.labelSelected').clone(true, true);
                        // Add data 'multidrag' to elements being dragged
                        // Hide .labelSelected elements in the objList b/c they will be appended to the object being dragged
                        item.data('multidrag', $selectedObjs).siblings('.labelSelected').hide();
                        // Attach selectedObjs to a helper div
                        var $helper = $('<div>');
                        return $helper.append($selectedObjs);
                    } else {
                        return item;
                    }
                },
                stop: function(event, ui) {
                    var useMultiSelectBehavior = $(ui.item).hasClass('labelSelected');
                    var $objList = $('#objList_' + self.id);

                    if (useMultiSelectBehavior) {
                        var numSelectedObjs = $(ui.item).siblings('.labelSelected').length;
                        var targetIndex;
                        var highestObjNum;

                        // Put dragged elements into array selectedObjs
                        var $selectedObjs = $(ui.item).data('multidrag');
                        // Remove .labelSelected items because they have been duplicated
                        $(ui.item).data('multidrag', $selectedObjs).siblings('.labelSelected').remove();
                        // Assign targetIndex to the dropped index after removing duplicates
                        targetIndex = $(ui.item).index();
                        // Append selectedObjs to the objList, remove $(ui.item)
                        $(ui.item).after($selectedObjs).remove();
                        // Store scroll position because setAnimationXML() changes location
                        var scrollPosition = $(document).scrollTop();
                        localStorage.setItem("scrollPosition", scrollPosition);
                        // Refresh XML so objList elements are recognized
                        setAnimationXML(getAnimationXML().xml);
                        // Set scroll position to whatever it was before setAnimationXML()
                        $(document).scrollTop(localStorage.getItem("scrollPosition"));
                        // objNums have changed due to setAnimXML, assign highestObjNum to the objNum at index 0
                        highestObjNum = $objList.children().eq(0).attr('objNum');
                        deselectAllObjs();

                        // Select list items at their new positions
                        if (numSelectedObjs < 1) {
                            selectObjByObjNum(highestObjNum - targetIndex, true);
                        } else {
                            for (var i = 0; i <= numSelectedObjs; ++i) {
                                selectObjByObjNum(highestObjNum - targetIndex - i, true);
                            }
                        }
                    }
                    reorderObjectZIndex();
                    takeSnapshot();
                    return;
                }
            });
            $("#objList_" + self.id).mousedown(function() {
                document.activeElement.blur();
            });

            $("#instrList_" + self.id).sortable({
                update: function(event, ui) {
                    runInstructionsUpToSelectedInstruction();
                    renameStepInstrs();
                    takeSnapshot();
                    return;
                }
            });
            $("#instrList_" + self.id).mousedown(function() {
                document.activeElement.blur();
            });

            // David May 5/28/20 "Advanced" button toggles "Clear all" button
            $('#advObj').off('click').click(function() {
                if ($('#clearInstr').is(':hidden')) {
                    $('#clearInstr').show();
                } else {
                    $('#clearInstr').hide();
                }
            });

            $('#startButton_' + self.id).click(function() {
                hideStartButton();
                playInstructionsFromInstrNum('0');
                outlineInstrsByObjNum(); // David May 8/1/20 Remove outline from all instr when animation is played

                var event = {
                    part: 0,
                    complete: false,
                    metadata: {
                        event: 'start clicked.'
                    }
                };
                self.parentResource.postEvent(event);
            });

            $('#goToStartStepButton_' + self.id).click(function() {
                goToStartStep();

                var event = {
                    part: 0,
                    complete: false,
                    metadata: {
                        event: 'go to start clicked.'
                    }
                };
                self.parentResource.postEvent(event);
                outlineInstrsByObjNum();
            });

            $("#goToStartStepInstruction_" + self.id).click(function() {
                if (!isAnimationPlaying) {
                    goToStartStep();
                }
                return;
            });

            $('#playButton_' + self.id).click(function() {
                var $selectedInstr;
                var $lastInstruction;
                var $instrs;
                var $this;
                var $instrList;
                var selectedInstrNum;
                var stepNum;
                var i;

                if (!isAnimationPlaying) {
                    $instrList = $('#instrList_' + self.id);
                    $selectedInstr = $instrList.children('.labelSelected');
                    $lastInstruction = $instrList.children().last();

                    if ($selectedInstr.length == 0) { // if step 1 or start step is selected, then start from first instruction
                        selectedInstrNum = '0';
                        stepNum = 1;
                    } else if ($selectedInstr.attr('instrNum') == $lastInstruction.attr('instrNum')) { // if last instruction is selected, then start from first instruction
                        selectedInstrNum = '0';
                        stepNum = 1;
                    } else {
                        selectedInstrNum = $selectedInstr.attr('instrNum');
                        stepNum = $instrList.children().eq(selectedInstrNum).attr('stepNum');
                    }
                    playInstructionsFromInstrNum(selectedInstrNum);

                    var event = {
                        part: 0,
                        complete: false,
                        metadata: {
                            event: 'Play button clicked. Step ' + stepNum + ' started.'
                        }
                    };
                    self.parentResource.postEvent(event);
                }
                outlineInstrsByObjNum(); // David May 8/1/20 Remove all instruction outlines when playing animation
            });

            $('#addMoveInstr_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select at least one object.');
                    }
                    else {
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);
                            if (index === 0) {
                                addMoveInstr($selectedObj.attr('objNum'));
                            }
                            else {
                                addMoveInstr($selectedObj.attr('objNum'), false, true);
                            }
                        });
                        outlineInstrsByObjNum(); // David May 7/30/20 Add outline to newest instruction
                        takeSnapshot();
                    }
                }
            });

            $('#addFadeInstr_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select an object.');
                    }
                    else {
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);
                            if (index === 0) {
                                addFadeInstr($selectedObj.attr('objNum'));
                            }
                            else {
                                addFadeInstr($selectedObj.attr('objNum'), false, true);
                            }
                        });
                        outlineInstrsByObjNum(); // David May 7/30/20 Add outline to newest instruction
                        takeSnapshot();
                    }
                }
            });

            $('#addResizeInstr_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select a box, gate, or line object.');
                    }
                    else {
                        var haveShownTheErrorMessage = false;
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);

                            if (!isObjectTypeBoxImageOrGate($selectedObj.attr('objType')) && $selectedObj.attr('objType') !== OBJECT_PROPERTIES.line.type) {
                                if (!haveShownTheErrorMessage) {
                                    haveShownTheErrorMessage = true;
                                    alert('Resize is for box, gate, and line objects only.');
                                }
                            }
                            else {
                                if (index === 0) {
                                    addResizeInstr($selectedObj.attr('objNum'));
                                }
                                else {
                                    addResizeInstr($selectedObj.attr('objNum'), false, true);
                                }
                            }
                        });
                        outlineInstrsByObjNum(); // David May 7/30/20 Add outline to newest instruction
                        takeSnapshot();
                    }
                }
            });

            $('#addRotate_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select an object.');
                    }
                    else {
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);
                            if (index === 0) {
                                addRotateInstr($selectedObj.attr('objNum'));
                            }
                            else {
                                addRotateInstr($selectedObj.attr('objNum'), false, true);
                            }
                        });
                        outlineInstrsByObjNum(); // David May 7/30/20 Add outline to newest instruction
                        takeSnapshot();
                    }
                }
            });

            $('#addBackgroundColor_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select an object.');
                    }
                    else {
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);
                            if (index === 0) {
                                addBackgroundColorInstr($selectedObj.attr('objNum'));
                            }
                            else {
                                addBackgroundColorInstr($selectedObj.attr('objNum'), false, true);
                            }
                        });
                        outlineInstrsByObjNum(); // David May 7/30/20 Add outline to newest instruction
                        takeSnapshot();
                    }
                }
            });

            // David May 8/31/20 Adding border color instruction
            $('#addBorderColor_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select an object.');
                    }
                    else {
                        var haveShownTheErrorMessage = false;
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);
                            if ($selectedObj.attr('objType') != OBJECT_PROPERTIES.box.type && $selectedObj.attr('objType') != OBJECT_PROPERTIES.text.type) {
                                if (!haveShownTheErrorMessage) {
                                    haveShownTheErrorMessage = true;
                                    alert('Border color is for box, line, and text objects only.');
                                }
                            } else {
                                if (index === 0) {
                                    addBorderColorInstr($selectedObj.attr('objNum'));
                                } else {
                                    addBorderColorInstr($selectedObj.attr('objNum'), false, true);
                                }
                            }
                        });
                        outlineInstrsByObjNum();
                        takeSnapshot();
                    }
                }
            });

            // David May 8/27/20 Adding font color instruction
            $('#addFontColor_' + self.id).click(function() {
                var $selectedObjs;
                if (!isAnimationPlaying) {
                    $selectedObjs = $('#objList_' + self.id).children('.labelSelected');
                    if ($selectedObjs.length < 1) {
                        alert('Please select a text object.');
                    }
                    else {
                        var haveShownTheErrorMessage = false;
                        $selectedObjs.each(function(index) {
                            $selectedObj = $(this);
                            if ($selectedObj.attr('objType') !== OBJECT_PROPERTIES.text.type) {
                                if (!haveShownTheErrorMessage) {
                                    haveShownTheErrorMessage = true;
                                    alert('Font color instructions are for text objects only.');
                                }
                            } else {
                                if (index === 0) {
                                    addFontColorInstr($selectedObj.attr('objNum'));
                                } else {
                                    addFontColorInstr($selectedObj.attr('objNum'), false, true);
                                }
                            }
                        });
                        outlineInstrsByObjNum();
                        takeSnapshot();
                    }
                }
            });

            $("#addStepInstr_" + self.id).click(function() {
                if (!isAnimationPlaying) {
                    addStepInstr();
                    takeSnapshot();
                }
                return;
            });

            $("#step1_" + self.id).click(function() {
                if (!isAnimationPlaying) {
                    hideStartButton();
                    selectInstrByInstrNum('0');
                }
                return;
            });

            addCaptionListeners($(`#step1Caption_${self.id}`));
            addCaptionListeners($(`#startStepCaption_${self.id}`));

            var $textareaForStepInstruction;
            function captionKeyup() {
                $textareaForStepInstruction.val($(this).text());
                return;
            }
            function captionKeydown() {
                $textareaForStepInstruction.val($(this).text());
                return;
            }
            function captionUnfocus() {
                var $this = $(this);
                $this.removeClass('tex2jax_ignore').addClass('tex2jax_process');
                $this.attr('contenteditable', 'false');
                $this.unbind('blur', captionUnfocus);
                $this.unbind('keyup', captionKeyup);
                $this.unbind('keydown', captionKeydown);
                setCaption($this.text());
                takeSnapshot();
                return;
            }

            $("#caption_" + self.id).click(function() {
                var $this;
                var $thisInstr;
                var $instrsInReverse;
                var foundSelected = false;
                var $instr;
                var instrNum;
                const captionIsFocusedAlready = this === document.activeElement;

                if (!isAnimationPlaying && isEditorShown && !captionIsFocusedAlready) {
                    $this = $(this);

                    if ($("#step1_" + self.id).hasClass('labelSelected')) { // Step 1 is displayed caption
                        instrNum = '0';
                        $instr = $("#step1_" + self.id);
                    } else if ($("#goToStartStepInstruction_" + self.id).hasClass('labelSelected')) { // Start instruction is displayed caption
                        instrNum = 'goToStartStep';
                        $instr = $("#goToStartStepInstruction_" + self.id);
                    } else {
                        $instrsInReverse = $("#instrList_" + self.id).children().reverse();
                        $instrsInReverse.each(function() {
                            $thisInstr = $(this);

                            if ($thisInstr.hasClass('labelSelected')) {
                                foundSelected = true;
                            }

                            if (foundSelected) { // Once the selected instruction is found, find the first fade instruction for this object
                                if (($thisInstr.attr('instrType') == 'step')) {
                                    $instr = $thisInstr;
                                    return false; // equivalent to break;
                                }
                            }
                        });

                        if ($instr) {
                            instrNum = $instr.attr('instrNum');
                        } else {
                            instrNum = '0';
                            $instr = $("#step1_" + self.id);
                        }
                    }

                    $textareaForStepInstruction = $instr.find('.instrMenu').children('textarea').eq(0);

                    $this.addClass('tex2jax_ignore').removeClass('tex2jax_process');
                    $this.text($this.data('text'));
                    $this.attr('contenteditable', 'true');
                    $this.focus();
                    $this.blur(captionUnfocus);
                    $this.keyup(captionKeyup);
                    $this.keydown(captionKeydown);
                }

                return;
            });

            // Initialize the rich text area.
            const $richTextXML = $(`#${self.id} .rich-text-xml`);
            const $richTextButton = $(`#${self.id} .rich-text-button`);
            const showTextWording = 'Show export as rich text';
            const hideTextWording = 'Hide rich text';

            // Toggle the showing of the rich text.
            $richTextButton.val(showTextWording).click(() => {
                $richTextXML.toggle();

                const textWording = $richTextXML.is(':visible') ? hideTextWording : showTextWording;

                $richTextButton.val(textWording);
            });

            // When user hovers on the rich text XML, auto-select that XML.
            $richTextXML.hover(() => {
                $richTextXML.selectText();
            });

            // David May 12/27/20 Separating rich/plain text export
            $(`#exportrich_${self.id}`).click(() => {
                const animationXMLObject = getAnimationXML();

                $(`#exportImportTextarea_${self.id}`).val(animationXMLObject.xml);

                // Replace newlines with br's b/c gdocs doesn't read the newlines properly.
                const richText = animationXMLObject.htmlOfRichXML.replace(new RegExp('\\n', 'g'), '<br>');

                $richTextXML.html(richText);
                $(`#${self.id} .rich-text-area-container`).show();
                $richTextButton.val(hideTextWording);
                $richTextXML.show();
                $richTextXML.selectText();
            });

            $("#import_" + self.id).click(function() {
                askUserIfOKToLoadXML($("#exportImportTextarea_" + self.id).val(), true);
                return;
            });

            // David May 3/24/20 Removed "Toggle editor" button
            // $('#editorToggle_' + self.id).click(function() {
            //     if (canEdit) {
            //         if (isEditorShown) {
            //             isEditorShown = false;
            //             invisibleEditor();
            //             if (window.numberOfzyAnimatorEditorsOpen !== 0) {
            //                 window.numberOfzyAnimatorEditorsOpen--;
            //             }
            //         } else {
            //             isEditorShown = true;
            //             visibleEditor();
            //             window.numberOfzyAnimatorEditorsOpen++;
            //         }
            //     }
            //     return;
            // });

            $("#animatorUndo_" + self.id).click(function() {
                if (undoSnapshots.length > 0) {
                    redoSnapshots.push(currSnapshot);
                    $("#animatorRedo_" + self.id).removeClass('ui-state-disabled');
                    if (redoSnapshots.length > redoSnapshots_maxSize) {
                        redoSnapshots.shift();
                    }
                    currSnapshot = undoSnapshots.pop();

                    if (undoSnapshots.length == 0) {
                        $("#animatorUndo_" + self.id).addClass('ui-state-disabled');
                    }
                    setAnimationXML(currSnapshot);
                }

                return;
            });

            $("#animatorRedo_" + self.id).click(function() {
                if (redoSnapshots.length > 0) {
                    undoSnapshots.push(currSnapshot);
                    $("#animatorUndo_" + self.id).removeClass('ui-state-disabled');
                    if (undoSnapshots.length > undoSnapshots_maxSize) {
                        undoSnapshots.shift();
                    }
                    currSnapshot = redoSnapshots.pop();
                    setAnimationXML(currSnapshot);

                    if (redoSnapshots.length == 0) {
                        $("#animatorRedo_" + self.id).addClass('ui-state-disabled');
                    }
                }

                return;
            });

            $("#samples_" + self.id).change(function() {
                const $selectedOptionValue = $(this).children('option:selected').val();
                const gdocsByOptionValue = {
                    sample1: 'https://docs.google.com/document/d/1VJ3dRtejTom6cshT4ol0pZmjpEin7Tt94USfSiuXm94/edit',
                    sample2: 'https://docs.google.com/document/d/1nbT6McUjJYqj5tLfkRnHVwJKk4_l8oBpO-8xOmMjeYs/edit',
                    smSample: 'https://docs.google.com/document/d/16ONRftvCDjW3Bx9Neu7-gbxQClQfYEQNko1AV5ommFU/edit',
                    codeSample: 'https://docs.google.com/document/d/1rxgP7XMkkF1-G559n76jAtKxQaeuwwaYEtpT8Jb0ahc/edit',
                    'flowchart-template': 'https://docs.google.com/document/d/1hOwjPmFpC8BrqTrh0K1w2FJeQLp5pBOfVT1gyRuIFrc/edit',
                };

                window.open(gdocsByOptionValue[$selectedOptionValue]);
            });
        }

        $('#' + self.id).hide(); // Hide then show zyAnimator once everything is loaded
        initZyAnimatorInteractiveElements();
        goToStartStep();
        $('#animatorUndo_' + self.id).addClass('ui-state-disabled');
        $('#animatorRedo_' + self.id).addClass('ui-state-disabled');

        if (canEdit) {
            $('#' + this.id + ' .zyanCanvas').css('border', '1px solid grey');

            // The first instance to load that canEdit will manage the calling of the onBeforeUnload function
            if (window.numberOfzyAnimatorEditorsOpen === undefined) {
                window.numberOfzyAnimatorEditorsOpen = 0;
            }

            $(document).mousedown(event => {
                if (!isAnimationPlaying) {
                    const animationElement = document.getElementById(self.id);

                    zyAnimatorActive = (animationElement && $.contains(animationElement, event.target));
                }
            });

            // |arrowKeyCount| is used in the following keyup and keydown functions
            var arrowKeyCount = 0;

            $(document).keydown(function(e) {
                // Number of times this function needs to get called before moving to the
                // next speed in |movementSpeeds|
                var keyCountThresholds = [ 4, 12, 28 ];

                // Movement in pixels of the selected objects position.
                var movementSpeeds = [ gridGranularity / 4, gridGranularity, gridGranularity * 2, gridGranularity * 4 ];

                function incrementArrowKeyCountAndConvertToSpeed() {
                    arrowKeyCount++;
                    if (arrowKeyCount > keyCountThresholds[2]) {
                        return movementSpeeds[3];
                    } else if (arrowKeyCount > keyCountThresholds[1]) {
                        return movementSpeeds[2];
                    } else if (arrowKeyCount > keyCountThresholds[0]) {
                        return movementSpeeds[1];
                    } else {
                        return movementSpeeds[0];
                    }
                }

                if (!isAnimationPlaying) {
                    if (checkIfNewBehaviorIsUsed(e)) {
                        switch(e.which) {
                            case 37: // left
                                var movementSpeed = incrementArrowKeyCountAndConvertToSpeed();
                                changeObjPos(0, -movementSpeed);
                                break;
                            case 38: // up
                                var movementSpeed = incrementArrowKeyCountAndConvertToSpeed();
                                changeObjPos(-movementSpeed, 0);
                                break;
                            case 39: // right
                                var movementSpeed = incrementArrowKeyCountAndConvertToSpeed();
                                changeObjPos(0, movementSpeed);
                                break;
                            case 40: // down
                                var movementSpeed = incrementArrowKeyCountAndConvertToSpeed();
                                changeObjPos(movementSpeed, 0);
                                break;
                        }
                    }
                }

                return;
            });

            $(document).keyup(function(e) {
                // reset |arrowKeyCount| here. Since it is here, any key that is lifted
                // from being held down will reset the |arrowKeyCount|, and thereby
                // reset the arrow speed to the initial |speed[0]| in above function:
                // $(document).keydown()
                arrowKeyCount = 0;
                if (!isAnimationPlaying) {
                    if (checkIfNewBehaviorIsUsed(e)) {
                        takeSnapshot();
                    }
                }

                return;
            });

            let contextMenuActionTookPlaceSoSave = false;

            $.contextMenu({
                selector: `#canvas_${self.id}, #objList_${self.id}`,
                className: 'data-title',
                callback: function(key) {
                    const $selectedObjects = $(`#${self.id} div[isselected=true]`);

                    zyAnimatorActive = true;

                    if (key === 'duplicate') {
                        const newObjNumsToSelect = [];

                        $selectedObjects.each(function() {
                            newObjNumsToSelect.push(duplicateObject($(this)));
                        });

                        for (let index = 0; index < newObjNumsToSelect.length; index++) {
                            selectObjByObjNum(newObjNumsToSelect[index], true);
                        }

                        contextMenuActionTookPlaceSoSave = true;
                    }
                    else if (key === 'bringToFront' || key === 'sendToBack') {
                        const $container = $(`#objList_${self.id}`);
                        const listObjects = $selectedObjects.map(index => {
                            const objNum = $selectedObjects.eq(index).attr('objNum');

                            return $(`#listObject_${self.id}_${objNum}`).detach()[0];
                        });

                        let scrollToIndex = 0;

                        listObjects.reverse();
                        if (key === 'bringToFront') {
                            $container.prepend(listObjects);
                        }
                        else {
                            $container.append(listObjects);
                            scrollToIndex = listObjects.length - 1;
                        }

                        $container.stop().scrollTo(listObjects[scrollToIndex], 400); // eslint-disable-line no-magic-numbers

                        reorderObjectZIndex();
                        contextMenuActionTookPlaceSoSave = true;
                    }
                },
                items: {
                    duplicate: {
                        name:     'Duplicate',
                        icon:     'copy',
                        disabled: true
                    },
                    sep1: '---------',
                    bringToFront: {
                        name:     'Bring to front',
                        disabled: true
                    },
                    sendToBack: {
                        name:     'Send to back',
                        disabled: true
                    },
                    sep2: '---------',
                    codeColorize: {
                        name: 'Colorize and stylize?',
                        type: 'select',
                        options: {
                            none: 'No',
                            c:          'C',
                            cpp:        'C++',
                            java:       'Java',
                            python:     'Python',
                            matlab:     'Matlab',
                            verilog:    'Verilog',
                            vhdl:       'VHDL',
                            latex:      'LaTex',
                            html:       'HTML',
                            css:        'CSS',
                            js:         'JavaScript',
                            xml:        'XML',
                            pseudocode: 'Pseudocode',
                            php: 'PHP',
                            sql: 'SQL',
                            kotlin: 'Kotlin'
                        },
                        events: {
                            change: function(e) {
                                var objNum = $('#' + self.id + ' div[isselected=true]').eq(0).attr('objNum');
                                var selection = $(this).val();

                                $('#stepObjectGraphic_' + self.id + '_' + objNum).data('codeColorize', selection);

                                // If the code is to be colorized, then store the language selected and change the CSS to match colorized code
                                if (isTextObjectZyCode(selection)) {
                                    zyCodeTextCSSProperties(objNum);
                                }
                                // Otherwise, revert the CSS to default text properties
                                else {
                                    updateGraphicAndInitCSS(objNum, 'font-size', DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['font-size']);
                                    updateGraphicAndInitCSS(objNum, 'line-height', DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['line-height']);
                                    updateGraphicAndInitCSS(objNum, 'font-family', INITIAL_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['font-family']);
                                    updateGraphicAndInitCSS(objNum, 'text-align', DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['text-align']);
                                    updateGraphicAndInitCSS(objNum, 'padding', DEFAULT_CSS_PROPERTIES_USED_BY_TEXT_OBJECTS['padding']);
                                }

                                loadInspector(objNum);

                                contextMenuActionTookPlaceSoSave = true;
                                if ($('#canvas_' + self.id).data('contextMenu') !== undefined) {
                                    $('#canvas_' + self.id).contextMenu('hide');
                                }
                                else {
                                    $('#objList_' + self.id).contextMenu('hide');
                                }

                                // Re-render text.
                                const $graphic = $(`#stepObjectGraphic_${self.id}_${objNum}`);
                                const text = $graphic.data('text');

                                setTextOnTextObject(text, $graphic);
                                self.parentResource.latexChanged();
                            }
                        },
                        disabled: true
                    }
                },
                events: {
                    show: function(opt) {
                        const $selectedObjs = $(`#canvas_${self.id} .stepObjectGraphic[isselected="true"]`);

                        $.contextMenu.setInputValues(opt, $selectedObjs.data());

                        if ($selectedObjs.length === 1) {
                            const $graphic = $selectedObjs.eq(0);

                            opt.commands.duplicate.disabled = false;
                            opt.commands.bringToFront.disabled = false;
                            opt.commands.sendToBack.disabled = false;
                            opt.inputs.codeColorize.disabled = ($graphic.attr('objType') !== OBJECT_PROPERTIES.text.type);

                            const graphicName = $(`#listObject_${self.id}_${$graphic.attr('objNum')} .labelText`).text();

                            $('.data-title').attr('data-menutitle', graphicName);
                        }
                        else if ($selectedObjs.length > 1) {
                            opt.commands.duplicate.disabled = false;
                            opt.commands.bringToFront.disabled = false;
                            opt.commands.sendToBack.disabled = false;
                            opt.inputs.codeColorize.disabled = true;

                            $('.data-title').attr('data-menutitle', `Selected objects (${$selectedObjs.length})`);
                        }
                        else {
                            opt.commands.duplicate.disabled = true;
                            opt.commands.bringToFront.disabled = true;
                            opt.commands.sendToBack.disabled = true;
                            opt.inputs.codeColorize.disabled = true;

                            $('.data-title').attr('data-menutitle', 'No object selected');
                        }
                        const numObjects = $(`#canvas_${self.id} .stepObject`).length;

                        // Pull context menu in front of ALL objects
                        opt.zIndex = numObjects;
                    },
                    hide: function(opt) {
                        $.contextMenu.getInputValues(opt, this.data());

                        if (contextMenuActionTookPlaceSoSave) {
                            takeSnapshot();
                            contextMenuActionTookPlaceSoSave = false;
                        }
                    }
                }
            });

            $(window).resize(function(event) {
                updateInstructionListHeight();
                updateObjectListHeight();
            });

            createInspector();
            hideInspector();
        } else {
            $('#editorToggle_' + self.id).hide();
        }

        if (isEditorShown) {
            showEditor();
            window.numberOfzyAnimatorEditorsOpen++;

            // Try to load the last saved animation from XML.
            const animationXML = self.parentResource.getLocalStore('animationXML');

            if (animationXML) {
                setAnimationXML(animationXML);
                goToStartStep();
            }

            // Remove MathJax context menu.
            MathJax.Hub.Config({showMathMenu: false});
        } else {
            if (animXMLToLoad) {
                setAnimationXML(animXMLToLoad);
                // Homepage behavior shows animation from first instruction.
                if (self.useHomePageBehavior) {
                    allObjectsToInitCSS();
                    highlightGraphicStepByStepNum('1');
                }
            }
            hideEditor();
        }

        currSnapshot = getAnimationXML().xml;

        $('#' + self.id).show(); // show zyAnimator once everything is loaded

        updateInstructionListHeight();
        updateObjectListHeight();
    };

    <%= grunt.file.read(hbs_output) %>
}

module.exports = {
    create: function() {
        return new zyAnimator();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
