# segmentedControl

This tool is actually a control to be used in other tools. It is not a 
standalone tool. 

This tool creates and manages a segmented control. 

To initialize the tool, first require it and call `create`:

```javascript
var segmentedControl = require('segmentedControl').create();
```

Then call the `init` function. The `init` function accepts 3 arguments:
* `segments` - A list of strings to be used as the titles for the segments.
* `containerId` - The id of an element *already in the DOM* where this segmented control should display itself.
* `segmentSelectedCallback` - A callback function that is invoked when a new tab is pressed. 
  * This function will be passed two arguments:
    * The index of the selected segment
    * The title of the selected segment

```javascript
segmentedControl.init(['Segment 1', 'Segment 2'], 'segmented-control-container', function(index, title) {
  // Do something with |index| and/or |title|...
})
```

The control also provides two mechanisms for selecting a segment programmatically:
* `selectSegmentByIndex(segmentIndex)`
* `selectSegmentByTitle(segmentTitle)`
