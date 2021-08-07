function EventManager() {
    // Input is the event (subject to event API).
    this.postEvent = function(event) {
        // Stringify the metadata if it's present.
        if (event.metadata) {
            event.metadata = JSON.stringify(event.metadata);
        }

        console.log('Posting event:')
        console.log(event)
    }

    // Tool's view state has changed. Re-run MathJax.
    this.latexChanged = function() {
        MathJax.Hub.Queue([ 'Typeset', MathJax.Hub ]);
    }

    // Copy of the MathJax configuration on zyWeb.
    MathJax.Hub.Config({
        extensions: ["tex2jax.js"],
        tex2jax: {
            skipTags: ["script","noscript","style","textarea"],
            ignoreClass: 'ace_editor',
        }
    });
    MathJax.Hub.setRenderer('SVG');
}

var manager = new EventManager();
module.exports = manager;
