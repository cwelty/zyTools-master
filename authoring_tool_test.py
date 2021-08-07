from datetime import datetime
from subprocess import check_output
import os, sys, shutil
from distutils.dir_util import copy_tree
from support_files.utilities import get_dependencies, set_to_stringified_array

def replace_given_pairs_in_string(pairs, given_string):
    '''
    Replace the given key, value pairs in the given string.
    '''
    for to_replace, replace_with in pairs.items():
        given_string = given_string.replace(to_replace, replace_with)

    return given_string


def run_command(command):
    '''
    Run the given command and return the output.
    '''
    return check_output(command.split(), text=True)


def get_tool_name():
    '''
    Get which tool to deploy via user input.
    '''
    tool_names = [ 'zyAnimator', 'QuestionGenerator', 'ProgressionBuilder', 'CodeOutputBuilder', 'ProgressionPlayerExamSubmissionViewer' ]
    tool_strings = [ '%d. %s' % (index + 1, tool_name) for index, tool_name in enumerate(tool_names) ]
    options_string = '\n'.join(tool_strings)
    prompt = '''%s
Deploy which tool? ''' % options_string

    # Get the name of the tool to deploy.
    tool_number = int(input(prompt))
    while not((tool_number > 0) and (tool_number <= len(tool_names))):
        print()
        tool_number = int(input(prompt))
    print()
    return tool_names[tool_number - 1]


def get_version():
    '''
    Get which version of the tool to deploy via user input.
    '''
    prompt = '''1: Frank/Roman
2: Internal authors
3: All authors (David, this is for you, buddy. Be careful!)
Which version? '''
    version = int(input(prompt))
    while (version < 1) or (version > 3):
        print()
        version = int(input(prompt))
    print()
    return version


def copy_from_public(sub_folder, tool_path, specific_files=[]):
    '''
    Copy public/<sub_folder> to <tool_path>/<sub_folder>.
    '''
    old_path = os.path.join('public', sub_folder)
    new_path = os.path.join(tool_path, sub_folder)

    if specific_files:

        # Only copy particular files from the sub_folder.
        os.makedirs(new_path)
        for file_name in specific_files:
            old_file = os.path.join(old_path, file_name)
            new_file = os.path.join(new_path, file_name)
            shutil.copyfile(old_file, new_file)
    else:

        # Copy the entire sub_folder.
        shutil.copytree(old_path, new_path)


def build_tool(tool_name):

    # Print and build given tools.
    print('Building %s...' % tool_name),
    try:
        run_command('grunt deploy_dev --tool=%s' % tool_name)
    except Exception:
        print('Failed to grunt %s. Aborting.' % tool_name)
        sys.exit(1)
    print('Done')


def run():
    '''
    Intended workflow:
    1. David May updates zyAnimator or QuestionGenerator
    2. Frank/Roman test David's updates
    3. Internal authors test David's updates
    4. Alex/Arián review code, looking for potential unintended consequences (light code style review)
    5. Merge and release
    '''

    # Verify no staged commits.
    if run_command('git status --short') != '':
        print('You have staged changes. Please commit before deploying.')
        sys.exit(1)

    tool_name = get_tool_name()
    version = get_version()

    # Build the tool and tool's dependencies.
    changed_tools, _ = get_dependencies(tool_name)
    changed_tools.add(tool_name)
    for name in changed_tools:
        build_tool(name)

    # Get HTML template.
    with open(os.path.join('support_files', 'authoring_tool_test.template.html')) as template:
        authoring_tool_test_template = template.read()

    # Build the options for the tool.
    options = '{}'
    if tool_name == 'zyAnimator':
        option_path = os.path.join('tools', tool_name, 'options_loadEditorOptions.js')
        with open(option_path) as option_file:
            options = option_file.read()

    # Clear the transfers folder.
    shutil.rmtree('transfers', ignore_errors=True)
    os.makedirs('transfers')

    # Create version folder inside tool folder.
    version_folder_name = str(version)
    version_path = os.path.join('transfers', version_folder_name)
    os.makedirs(version_path)

    # Create tool folder inside transfers folder.
    tool_path = os.path.join(version_path, tool_name)
    os.makedirs(tool_path)

    # Copy tools to transfers folder.
    for name in changed_tools:
        old_tool_path = os.path.join('public', name)
        new_tool_path = os.path.join(version_path, name)
        copy_tree(old_tool_path, new_tool_path)

    # Generate tool test page.
    replace_pairs = {
        'BRANCH_NAME': run_command('git rev-parse --abbrev-ref HEAD')[:-1],
        'COMMIT_HASH': run_command('git rev-parse HEAD')[:-1],
        'DATE_TIME_CREATED': datetime.utcnow().strftime('%m/%d/%Y %H:%M GMT'),
        'LOCAL_TOOLS': set_to_stringified_array(changed_tools),
        'OPTIONS': options,
        'TOOL_NAME': tool_name,
    }
    tool_HTML = replace_given_pairs_in_string(replace_pairs, authoring_tool_test_template)
    index_file_path = os.path.join(tool_path, 'index.html')
    with open(index_file_path, 'w') as index_file:
        index_file.write(tool_HTML)

    # Copy in vendor, assets, and CSS from public folder.
    copy_from_public(
        'vendor', tool_path,
        [
            'common.js', 'handlebars.runtime.js', 'require.js', 'rsvp.js', 'zyWebErrorManager.js',
            'zyWebEventManager.js', 'zyWebParentResource.js', 'zyWebResourceManager.js', 'zyWebUtilities.js',
            'core.min.js', 'md5.min.js', 'skulpt-stdlib.js', 'skulpt.min.js'
        ]
    )
    copy_from_public('assets', tool_path)
    copy_from_public('css', tool_path)

    # Upload page to S3.
    os.system('aws --region us-west-2 s3 mv transfers/ s3://zytools-qa/ --acl=public-read --recursive')

    print()
    print('Authoring tool test page generated:')
    print('  https://zytools-qa.s3-us-west-1.amazonaws.com/%s/%s/index.html' % (version_folder_name, tool_name))
    print()


if __name__ == '__main__':
    run()
