'use strict';

function zyWebResourceManager() {
    // The zyTools commit hash table.
    this.zyToolsTable = null;

    /**
        Retrieve the zyTools commit hash table.
        @method retrieveZyToolsTable
        @return {Promise} The promise to retrieve the zyTools table.
    */
    this.retrieveZyToolsTable = function() {
        var self = this;

        return new RSVP.Promise(function(resolve, reject) {

            // zyToolsTable already retrieved. Or, don't download resources from live.
            if (self.zyToolsTable || !self.downloadResourcesFromLive) {
                resolve();
            }
            else {
                self.promisesToRetrieveZyToolsTable.push({
                    resolve: resolve,
                    reject: reject,
                });

                // This is the first request for retrieval, so make a server request.
                if (self.promisesToRetrieveZyToolsTable.length === 1) {
                    $.get('https://zyserver.zybooks.com/v1/zytools', function(response) {
                        if (response.success) {
                            self.zyToolsTable = response.tools;

                            self.promisesToRetrieveZyToolsTable.forEach(function(promiseFunctions) {
                                promiseFunctions.resolve();
                            });
                        }
                        else {
                            self.promisesToRetrieveZyToolsTable.forEach(function(promiseFunctions) {
                                promiseFunctions.reject('Commit table failed to load');
                            });
                        }

                        self.promisesToRetrieveZyToolsTable.length = 0;
                    });
                }
            }
        });
    }

    // Stores the promises to retrieve the zyToolsTable.
    this.promisesToRetrieveZyToolsTable = [];

    // Whether to download resources from live or locally.
    this.downloadResourcesFromLive = false;

    // List of tools and vendors that should override the |downloadResourcesFromLive| and download from local.
    this.localTools = [];
    this.localVendors = [];

    // The live resource URLs.
    this.baseLiveUrl = 'https://zytools.zybooks.com/zyBooks2/';
    this.liveUrl = this.baseLiveUrl + '54/';
    this.liveVendorUrl = this.liveUrl + 'vendor/';

    /**
        Get the production commit hash for the given resource.
        @method getToolProductionCommitHash
        @param {String} resourceName The resource for which to get the production commit hash.
        @return {String} The production commit hash for the given resource.
    */
    this.getToolProductionCommitHash = function(resourceName) {
        return (this.zyToolsTable ? this.zyToolsTable.production[resourceName] : null);
    }

    /**
        Return whether to load the tool from local.
        @method shouldLoadToolFromLocal
        @param {String} toolName
        @return {Boolean} Whether to load the tool from local.
    */
    this.shouldLoadToolFromLocal = function(toolName) {
        return this.localTools.some(function(localTool) {
            return localTool === toolName;
        });
    }

    // These differ between zyTool's and zyWeb's implementation.
    this.baseUrl = '../';
    this.staticResourceUrl = 'http://static-resources.zybooks.com/';
    this.resourceUrl = '../vendor/';
    this.getDependencyURL = function(dependencyPath) {
        var dependencyURL = (this.resourceUrl + dependencyPath);

        // If we're supposed to download from live, then check to see if the given resource overrides that and should be downloaded from local.
        if (this.downloadResourcesFromLive) {
            var loadResourceFromLocal = this.localVendors.some(function(localVendor) {
                return localVendor === dependencyPath;
            });

            if (!loadResourceFromLocal) {
                var toolCommitHash = this.getToolProductionCommitHash('vendor');
                var resourceUrlWithCommit = (this.baseLiveUrl + 'fingerprinted/' + toolCommitHash + '/vendor/' + dependencyPath);
                var resourceUrlWithoutCommit = (this.liveVendorUrl + dependencyPath);

                dependencyURL = (toolCommitHash ? resourceUrlWithCommit : resourceUrlWithoutCommit);
            }
        }
        return dependencyURL;
    }
    this.getStaticResource = function(dependency) {
        return (this.staticResourceUrl + dependency);
    }
    this.getVersionedImage = function(imageID) {
        return imageID;
    }
    // Legacy support: |getImageURL| should not be called by zyTools.
    this.getImageURL = function(imagePath, toolName) {
        console.error('getImageURL should not be called by zyTools. Instead, use getResourceURL. Also, instead of an img folder, use a folder named resource.');
    }
    this.getResourceURL = function(resourcePath, toolName) {
        var resourceUrl = (this.baseUrl + toolName);

        // If we're supposed to download from live, then check to see if the given resource overrides that and should be downloaded from local.
        if (this.downloadResourcesFromLive && !this.shouldLoadToolFromLocal(toolName)) {
            var toolCommitHash = this.getToolProductionCommitHash(toolName);
            var resourceUrlWithCommit = (this.baseLiveUrl + 'fingerprinted/' + toolCommitHash + '/' + toolName);
            var resourceUrlWithoutCommit = (this.liveUrl + toolName);

            resourceUrl = (toolCommitHash ? resourceUrlWithCommit : resourceUrlWithoutCommit);
        }
        return (resourceUrl + '/resource/' + resourcePath);
    }
    this.getPathToToolJS = function(resourceName) {
        var resourceUrl = (this.baseUrl + resourceName + '/js');

        // If we're supposed to download from live, then check to see if the given resource overrides that and should be downloaded from local.
        if (this.downloadResourcesFromLive && !this.shouldLoadToolFromLocal(resourceName)) {
            var toolCommitHash = this.getToolProductionCommitHash(resourceName);
            var resourceUrlWithCommit = (this.baseLiveUrl + 'fingerprinted/' + toolCommitHash + '/' + resourceName + '/js');
            var resourceUrlWithoutCommit = (this.liveUrl + resourceName);

            resourceUrl = (toolCommitHash ? resourceUrlWithCommit : resourceUrlWithoutCommit);
        }

        return (resourceUrl + '/' + resourceName + '.js');
    }
    this.getZydeHost = function() {
        return '';
    }
    this.getImageContentResourceUrl = function(subject, filename) {
        return '';
    }

    // Legacy support: |functionUsed| should not be called by zyTools.
    this.legacySupportErrorForDependencies = function(functionUsed) {
        console.error(functionUsed + ' should not be called by zyTools. Instead, use a dependencies.js file to declare dependencies.');
    }
    this.getResource = function(tool) {
        this.legacySupportErrorForDependencies('getResource');
    }

    // "Sets" to prevent reloading of resources.
    this.toolsCache     = {};
    this.vendorJSCache  = {};
    this.vendorCSSCache = {};

    /*
        Add |dependencies| that haven't loaded yet to |toolsToLoad|, |vendorJSToLoad|, and |vendorCSSToLoad|.
        |dependencies| is an object containing:
            * |tools| is an array of tool names.
            * |vendorJS| is an array of vendor Javascript file paths.
            * |vendorCSS| is an array of vendor CSS files.
        |toolsToLoad| is an array of tool names.
        |vendorJSToLoad| is an array of vendor Javascript file paths.
        |vendorCSSToLoad| is an array of vendor CSS files.
    */
    this.addDependenciesToLoad = function(dependencies, toolsToLoad, vendorJSToLoad, vendorCSSToLoad) {
        // If dependencies exist, then add them to be loaded.
        if (dependencies) {
            var tools     = dependencies.tools;
            var vendorJS  = dependencies.vendorJS;
            var vendorCSS = dependencies.vendorCSS;

            var self = this;
            if (tools) {
                tools.forEach(function(tool) {
                    // If the tool has not been loaded, then add tool to respective set.
                    if (!(tool in self.toolsCache)) {
                        toolsToLoad.push(tool);
                    }
                });
            }

            if (vendorJS) {
                vendorJS.forEach(function(js) {
                    // If the js has not been loaded, then add js to respective set.
                    if (!(js in self.vendorJSCache)) {
                        vendorJSToLoad.push(js);
                    }
                });
            }

            if (vendorCSS) {
                vendorCSS.forEach(function(css) {
                    // If the tool has not been loaded, then add tool to respective set.
                    if (!(css in self.vendorCSSCache)) {
                        vendorCSSToLoad.push(css);
                    }
                });
            }
        }
    }

    /**
        Queue of the dependencies to get.
        @property dependenciesQueue
        @type Array
        @default []
    */
    this.dependenciesQueue = [];

    /**
        Whether dependencies are actively being gotten.
        @property areDependenciesBeingGotten
        @type Boolean
        @default false
    */
    this.areDependenciesBeingGotten = false;

    /**
        Recursively download dependencies from the |dependenciesQueue|.
        @method _dependencyGetter
        @private
        @return {void}
    */
    this._dependencyGetter = function() {

        // Base case: There are no dependencies to be gotten.
        if (this.dependenciesQueue.length === 0) {
            this.areDependenciesBeingGotten = false;
            return;
        }

        // Setup the next dependency getting.
        var nextDependenciesToGet = this.dependenciesQueue.shift();
        var toolsToLoad = nextDependenciesToGet.toolsToLoad;
        var vendorJSToLoad = nextDependenciesToGet.vendorJSToLoad;
        var vendorCSSToLoad = nextDependenciesToGet.vendorCSSToLoad;
        var resolve = nextDependenciesToGet.resolve;
        var reject = nextDependenciesToGet.reject;

        var self = this;

        function loadTool() {
            // If no tools to load, then move on to loading |loadVendorCSS|.
            if (toolsToLoad.length === 0) {
                loadVendorCSS();
            }
            // Otherwise, load the next tool.
            else {
                var tool = toolsToLoad.shift();
                zyRequireJS([self.getPathToToolJS(tool)],
                    function() {
                        var moreDependenciesToLoad = require(tool).dependencies;
                        self.addDependenciesToLoad(moreDependenciesToLoad, toolsToLoad, vendorJSToLoad, vendorCSSToLoad);

                        // Add loaded tool to cache.
                        self.toolsCache[tool] = true;

                        loadTool();
                    },
                    function(error) {
                        reject(error);
                        self._dependencyGetter();
                    }
                );
            }
        }

        function loadVendorCSS() {
            if (vendorCSSToLoad) {
                vendorCSSToLoad.forEach(function(css) {
                    // Add the stylesheet to the page.
                    $('head').append('<link rel="stylesheet" type="text/css" href="' + self.getDependencyURL(css) + '">');

                    // Add loaded css to cache.
                    self.vendorCSSCache[css] = true;
                });
            }

            loadVendorJS();
        }

        function loadVendorJS() {
            // If no vendorJS to load, then we're done.
            if (vendorJSToLoad.length === 0) {
                resolve();
                self._dependencyGetter();
            }
            else {
                var js = vendorJSToLoad.shift();
                var fullPath = self.getDependencyURL(js);
                zyRequireJS([fullPath],
                    function() {

                        // Add loaded js to cache.
                        self.vendorJSCache[js] = true;

                        loadVendorJS();
                    },
                    function(error) {
                        reject(error);
                        self._dependencyGetter();
                    }
                );
            }
        }

        this.retrieveZyToolsTable().then(function() {
            loadTool();
        });
    }

    /*
        Load vendor scripts, vendor style sheets, and tool resources stored in |dependencies|.
        |dependencies| is a required object containing optional properties:
            * |tools| is an array of tool names. Ex: ['progressionTool', 'utilities'].
            * |vendorJS| is an array of vendor Javascript file paths. Ex: ['jquery.mousewheel.js', 'jquery-ui/jquery-ui.min.js'].
            * |vendorCSS| is an array of vendor CSS files. Ex: ['normalize.css', 'jquery-ui/jquery-ui.css'].

        The dependency types load in sequence, from |tools| -> |vendorCSS| -> |vendorJS|.
        A queue for each dependency type is maintained.
        The tools queue is loaded first in order to collect all needed |tools|, |vendorCSS|, and |vendorJS| dependencies.
        The vendor CSS queue is loaded second b/c there is no way to get a callback after a CSS file has loaded.
        So, a zyTool may be rendered before a dependency vendor CSS file has downloaded, causing the zyTool to be in an unstyled initial state.
    */
    this.getDependencies = function(dependencies) {
        // Legacy support: getDependencies should not be called by zyTools.
        if (arguments.length > 1) {
            this.legacySupportErrorForDependencies('getDependencies');
        }

        var toolsToLoad     = [];
        var vendorJSToLoad  = [];
        var vendorCSSToLoad = [];

        this.addDependenciesToLoad(dependencies, toolsToLoad, vendorJSToLoad, vendorCSSToLoad);

        /*
            Create a promise that the dependencies will be gotten.
            Return this promise to the requesting tool instance.
            Store the resolve and reject from the promise for use in |_dependencyGetter|.
        */
        var resolvePromise = null;
        var rejectPromise = null;
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
            resolvePromise = resolve;
            rejectPromise = reject;
        });

        this.dependenciesQueue.push({
            toolsToLoad: toolsToLoad,
            vendorJSToLoad: vendorJSToLoad,
            vendorCSSToLoad: vendorCSSToLoad,
            resolve: resolvePromise,
            reject: rejectPromise
        });

        // Start the recursive dependency getter if not already started.
        if (!this.areDependenciesBeingGotten) {
            this.areDependenciesBeingGotten = true;
            this._dependencyGetter();
        }

        return promise;
    }
}

var manager = new zyWebResourceManager();

module.exports = manager;
