zyTools
==========================

This repository holds all Custom Content Resources, aka zyTools.

Setup
============
* Install npm, Python3, and pip3
* Run
```
npm install -g grunt-cli
npm install
pip3 install -r requirements.txt
```

Note: May need to run `npm install npm@latest -g` rather than `npm install`.

The grunting process tries to get some files from a local `zybooks-platform` folder. If grunt fails to find those files it will fallback to an older version stored in `zyWeb/fallbackResources`.
Grunt assumes that your `zyTools` folder is in the same folder as your `zybooks-platform` folder. To clone the repo and generate those files:
```
cd ..
git clone git@github.com:zyBooks/zybooks-platform.git
cd zybooks-platform/zybooks-web
npm install
ember build
```

Development
============
1. Run `grunt --tool=<zyTool_name> --options=tools/<zyTool_name>/<options_file>` (note `--options` is optional)
2. Open `zyTools/public/<zyTool_name>/index.html`

Regression testing
=============
When a zyTool or vendor file changes, we need to test that the change does not break any zyTool that depends on that zyTool or vendor file.

To build a regression test page, run: `python3 regression_test.py`. You will be prompted for which tools to regression test.

Optional command line arguments:
* Specify tools to regression test. Ex: `python3 regression_test.py --tools=utilities`
* Specify vendor files to regression test. Ex: `python3 regression_test.py --vendors=Long.min.js,skulpt.min.js`

Authoring tool testing
=============

1. Install `aws` command line tool: https://aws.amazon.com/cli/
2. Put AWS credentials in `~/.aws/credentials`:
```
[default]
aws_access_key_id=yyy
aws_secret_access_key=xxx
```
(ask Bailey for these credentials)
3. Run `python3 authoring_tool_test.py`

Brute force testing
===================
The `brute_force_regression.py` file is a script that helps us test that all instances of a particular tool are still working.

1. Get all the payloads of the resources to be tested: For this, there's a script in the [`internal-tools`](https://github.com/zyBooks/internal-tools/) repository. There, go to the [`database` folder](https://github.com/zyBooks/internal-tools/tree/master/database), and run the `get_tool_payloads.py` script (usage is described in the README of the `database` folder.
2. Run this script: `python brute_force_regression.py --tools="<tool_names>"`, where `<tool_names>` are the names of the tools to be tested (comma separated).
3. The script will create a webpage that can be found in `zyTools/public/brute_force/index.html`. Step 2 will output the path for easy access.

In the webpage, you will need to load the payloads file generated in step 1, then you can click "Start". Each level in each resource in the payloads file will load. Errors will appear in the "Summary" section.

There's a "Hide tool" checkbox that allows to hide the resources while the page is loading them, and "Start" becomes "Pause" while the tool is loading resources.

There's also an "Iterations per resource" option that allows you to indicate how many times to load each level in each resource. This automatically restarts the process as many times as iterations you indicated.

The summary of errors includes a link to load the resource in the same page, and another to the resource in the zyBook using it. Once the process finishes, the "Download errors as CSV file" button becomes available, clicking it will download a CSV with the summary of errors.

zyTool Structure
=====================

All zyTools should have the following directory structure:
```
tools/
  mytool/
    js/
    less/
    templates/
    img/
```

Parent resource
================

The parent resource includes API functions for communicating with the platform. See zyTools/zyWeb/zyWebParentResource.js.
