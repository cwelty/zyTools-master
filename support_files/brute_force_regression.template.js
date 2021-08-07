/**
    A dictionary containing the tools prepared to load the resources.
    @property toolsDict
    @type {Object}
    @default {}
*/
const toolsDict = {};

/**
    The ID of the interval loading each level.
    @property intervalId
    @type {Integer}
    @default null
*/
let intervalId = null;

/**
    The remaining resource payloads to load.
    @property {Array} payloadsRemaining
    @type {Array} of {Object}
    @default null
*/
let payloadsRemaining = null;

/**
    The number of the current iteration.
    @property iterationNumber
    @type {Integer}
    @default 0
*/
let iterationNumber = 0;

/**
    The code of the zyBook that contains the currently loaded resource.
    @property zybookCode
    @type {String}
    @default null
*/
let zybookCode = null;

/**
    The chapter number in which the currently loaded resource appears in the zyBook.
    @property chapter
    @type {Integer}
    @default null
*/
let chapter = null;

/**
    The section number in which the currently loaded resource appears in the zyBook.
    @property section
    @type {Integer}
    @default null
*/
let section = null;

/**
    The content resource ID of the currently loaded resource.
    @property crid
    @type {Integer}
    @default null
*/
let crid = null;

/**
    jQuery reference to the start/pause button.
    @property $start
    @type {jQuery}
*/
const $start = $('#start-loading');

/**
    Stores a list of errors.
    @property savedErrors
    @type {Array} of {Object}
    @default []
*/
const savedErrors = [];

/**
    The payloads file to load. Selected in the page.
    @property payloadsFile
    @type {File}
    @default null
*/
let payloadsFile = null;

/**
    A FileReader object to read |payloadsFile|.
    @property reader
    @type {FileReader}
    @default null;
*/
let reader = new FileReader();

function loadFromHash() {
    const hash = location.hash;

    crid = parseInt(hash.replace('#crid=', ''), 10);
    const resource = payloadsData.find(data => data.crid === crid);

    loadResource(resource);
}

function loadResource(resource) {
    zybookCode = resource.zybook_code;
    chapter = resource.chapter;
    section = resource.section;
    crid = resource.crid;

    const toolName = resource.payload.tool;
    const options = resource.payload.options;

    toolsDict[toolName].init(0, parentResource.create(0, toolName), options);
    $('.zyante-progression-start-button').click();
}

function isLastLevel() {
    const $levelButtons = $('.zyante-progression-status-bar div');

    return getCurrentLevelIndex() === ($levelButtons.length - 1);
}

function getCurrentLevelIndex() {
    const $levelButtons = $('.zyante-progression-status-bar div');
    const $filled = $('.zyante-progression-status-bar .highlighted');

    return $levelButtons.index($filled);
}

function loadNext() {
    try {

        // If there's nothing, or it's the last level, load the next resource.
        if (!$('#0').html() || isLastLevel()) {
            const resource = payloadsRemaining.shift();

            loadResource(resource);
            $('.remaining').text(payloadsRemaining.length);
        }

        // Start progression before clicking the next level. If "Check" is disabled, we didn't start yet.
        else {
            if ($('.zyante-progression-check-button').prop('disabled')) {
                $('.zyante-progression-start-button').click();
            }
            $('.zyante-progression-status-bar div').eq(getCurrentLevelIndex() + 1).click();
        }
    }
    catch (error) {
        postError(error);
    }
}

function postError(error) {
    const $crashedTools = $('.crashed-tools');
    let $errorForCrid = $crashedTools.find(`.${crid}`);
    const resourceUrl = `https://learn.zybooks.com/zybook/${zybookCode}/chapter/${chapter}/section/${section}?content_resource_id=${crid}`;

    if (!$errorForCrid.length) {
        const localATag = `<a href='#crid=${crid}'>local ${crid}</a>`;
        const learnATag = `<a href='${resourceUrl}' target='_blank'>${crid} on learn</a>`;
        const html = `<div class='${crid}'>Load ${localATag}, load ${learnATag}:</div>`;

        $crashedTools.append(html);
        $errorForCrid = $crashedTools.find(`.${crid}`);
    }
    const levelNumber = getCurrentLevelIndex() + 1;

    $errorForCrid.append(`<pre class='error'>Level ${levelNumber}: ${error}</pre>`);
    savedErrors.push({crid, level: levelNumber, error: error, url: resourceUrl});
}

function start() {
    intervalId = setInterval(() => {
        const $iterations = $('#iterations');
        const numIterations = parseInt($iterations.val(), 10);

        // If all iterations have finished. Stop.
        if (iterationNumber > numIterations) {
            iterationNumber = 1;
            pause();
            $start.text('Restart');
            $iterations.prop('disabled', false);
            $('#download-button').prop('disabled', false)
                .click(downloadErrors);
        }

        // If this isn't the last level of the last resource. Load the next level/resource.
        else if (!((payloadsRemaining.length === 0) && isLastLevel)) {
            loadNext();
        }

        // If FileReader is ready. Reload the payloads.
        else if (reader.readyState === FileReader.DONE) {
            reader.readAsText(payloadsFile);
        }
    }, 1);
}

function pause() {
    clearInterval(intervalId);
    $('#start-loading').text('Start');
}

function downloadErrors() {
    const csvRows = savedErrors.map(error => `${error.crid},${error.level},${error.error},${error.url}`);

    csvRows.unshift(`CRID,Level number,Error,URL`);
    const csvContent = csvRows.join('\n');
    const element = document.createElement('a');

    element.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', 'tool-errors.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Override alert function so alerts are posted as errors.
window.alert = postError;

$(window).on('hashchange', () => {
    pause();
    loadFromHash();
});

$start.click(() => {
    if ($start.text() === 'Pause') {
        pause();
        $start.text('Start');
    }
    else {
        start();
        $start.text('Pause');
        $('#iterations').prop('disabled', true);
        $('span.iteration').text(iterationNumber);
    }
});
$('#hide-tool').change(() => {
    $('.custom-resource-payload').toggle();
});

const dependencies = {
    tools: TOOL_DEPENDENCIES,
};

resourceManager.getDependencies(dependencies).then(function() {
    const toolNames = TOOL_NAMES;

    try {
        toolNames.forEach(toolName => {
            toolsDict[toolName] = require(toolName).create();
        });
    }
    catch (error) {
        console.error(`Crashed loading tool: ${error}`);
    }

    if (location.hash) {
        loadFromHash();
    }

    $('#payloads-json').change(event => {
        payloadsFile = event.target.files[0];

        reader.addEventListener('load', event => {
            payloadsRemaining = JSON.parse(event.target.result);
            iterationNumber++;
            $start.prop('disabled', false);
            $('.total').text(payloadsRemaining.length);
            $('.remaining').text(payloadsRemaining.length);
            $('span.iteration').text(iterationNumber);
        });
        reader.readAsText(payloadsFile);
    });
});
