from glob import glob
from uuid import uuid4
from datetime import datetime
import click, os, sys, json, shutil
from support_files.utilities import replace_given_pairs_in_string, get_dependencies, set_to_stringified_array, run_command, build_tools

def find_tools_that_depend_on_given_sets(tools_set, vendors_set):
    '''
    Return a set of tools that depend on the given tool and vendor sets.
    '''
    tools_that_depend_on_given_sets = set()

    # Walk across tool folders.
    tool_folders = next(os.walk('tools'))[1]
    for tool_folder in tool_folders:
        tool_dependencies, vendor_dependencies = get_dependencies(tool_folder)

        # Check if dependencies include any tool in the given set. Same for vendor.
        tool_intersection = tools_set & tool_dependencies
        vendor_intersection = vendors_set & vendor_dependencies

        if tool_intersection or vendor_intersection:
            tools_that_depend_on_given_sets.add(tool_folder)

    return tools_that_depend_on_given_sets


def print_tools_vendors(tools_set, vendors_set):
    '''
    Print what is going to be generated.
    '''
    print('Generating regression for:')
    print('    * Tools: ', end='')
    for tool_name in tools_set:
        print(tool_name, end=' ')
    print()
    if vendors_set:
        print('    * Vendors: ', end='')
        for vendor in vendors_set:
            print(vendor, end=' ')
        print()


def csv_to_set_remove_whitespace(csv):
    '''
    Convert the given CSV to a set. Also, strip whitespace from each element of set and remove empty elements.
    '''
    # Convert CSV to set and remove whitespace from each element. Remove empty elements.
    stripped_nonempty_list = [e.strip() for e in csv.split(',') if e.strip() != '']

    return set(stripped_nonempty_list)


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


tools_help_message = 'The list of tools to test in a comma separated list. Ex: MIPSSDK,progressionTool'
vendors_help_message = 'The list of vendors to test in a comma separated list. Ex: math.min.js,jquery-ui/jquery-ui.css'

@click.command()
@click.option('--tools', required=True, prompt='Tools to test (comma separated)', help=tools_help_message)
@click.option('--vendors', required=False, default='', help=vendors_help_message)
def run(tools, vendors):
    # Convert tools and vendors to sets.
    tools_set = csv_to_set_remove_whitespace(tools)
    vendors_set = csv_to_set_remove_whitespace(vendors)

    # Print and build given tools.
    print_tools_vendors(tools_set, vendors_set)
    build_tools(tools_set)

    # Build set of all tools that depend on the given tools and vendors, including the given tools.
    tools_that_depend_on_given_sets = find_tools_that_depend_on_given_sets(tools_set, vendors_set)
    tools_to_test = tools_set.union(tools_that_depend_on_given_sets)

    # Get regression templates.
    with open('support_files/regression_test.html.template') as regression_test:
        regression_test_template = regression_test.read()
    with open('support_files/regression_test_tool.html.template') as regression_test_tool:
        regression_test_tool_template = regression_test_tool.read()

    # Build tool HTML for each tool that needs to be tested, including each option of each tool.
    tool_test_HTMLs = ''
    for tool_name in tools_to_test:
        option_path = os.path.join('tools', tool_name, 'options*.js')
        option_file_paths = glob(option_path)
        options = []
        for option_file_path in option_file_paths:
            with open(option_file_path) as option_file:
                options.append({
                    'options': option_file.read(),
                    'option_path': option_file_path
                })

        # If no options files found, then add a blank option.
        if not options:
            options.append({
                'options': '{}',
                'option_path': 'None'
            })

        # Build regression test for each option.
        for index, option in enumerate(options):
            replace_pairs = {
                'IDENTIFIER': tool_name + str(index),
                'OPTIONS': option['options'],
                'OPTION_PATH': option['option_path'],
                'TOOL_NAME': tool_name,
            }
            tool_test_HTMLs = tool_test_HTMLs + replace_given_pairs_in_string(replace_pairs, regression_test_tool_template)

    # Create regression test folder.
    regression_test_folder = os.path.join('public', 'regression_test')
    if not os.path.exists(regression_test_folder):
        os.makedirs(regression_test_folder)

    # Generate regression test page.
    replace_pairs = {
        'BRANCH_NAME': run_command('git rev-parse --abbrev-ref HEAD')[:-1],
        'COMMIT_HASH': run_command('git rev-parse HEAD')[:-1],
        'DATE_TIME_CREATED': datetime.utcnow().strftime('%m/%d/%Y %H:%M GMT'),
        'HAS_STAGED_COMMITS': 'No' if run_command('git status --short') == '' else 'Yes',
        'TOOLS_HTML': tool_test_HTMLs,
        'TOOLS_CHANGED': set_to_stringified_array(tools_set),
        'TOOLS_TESTED': set_to_stringified_array(tools_to_test),
        'VENDORS_CHANGED': set_to_stringified_array(vendors_set),
    }
    regression_test_HTML = replace_given_pairs_in_string(replace_pairs, regression_test_template)
    with open('public/regression_test/index.html', 'w') as regression_test:
        regression_test.write(regression_test_HTML)

    # Generate 32-character alphanumeric fingerprint.
    fingerprint = str(uuid4())

    # Clear the transfers folder.
    shutil.rmtree('transfers', ignore_errors=True)
    os.makedirs('transfers')

    # Create fingerprinted folder inside transfers folder.
    fingerprint_path = os.path.join('transfers', fingerprint)
    os.makedirs(fingerprint_path)

    # Copy in the general dependency files and files in |vendors|.
    vendor_files_to_copy = [
        'common.js', 'handlebars.runtime.js', 'require.js', 'rsvp.js', 'zyWebErrorManager.js',
        'zyWebEventManager.js', 'zyWebParentResource.js', 'zyWebResourceManager.js', 'zyWebUtilities.js',
        'core.min.js', 'md5.min.js', 'skulpt-stdlib.js', 'skulpt.min.js'
    ]
    vendor_files_to_copy.extend(vendors_set)
    copy_from_public('vendor', fingerprint_path, vendor_files_to_copy)

    # Copy in regression_test, assets, and CSS from public folder.
    copy_from_public('regression_test', fingerprint_path)
    copy_from_public('assets', fingerprint_path)
    copy_from_public('css', fingerprint_path)

    # Copy each tool in tools_set from public/tool to transfers folder.
    for tool_name in tools_set:
        old_tool_path = os.path.join('public', tool_name)
        new_tool_path = os.path.join(fingerprint_path, tool_name)
        shutil.copytree(old_tool_path, new_tool_path)

    # Upload page to S3.
    os.system('aws --region us-west-2 s3 mv transfers/ s3://zytools-regression-tests/ --acl=public-read --recursive')

    path_to_local_regression = os.path.join(os.getcwd(), 'public', 'regression_test', 'index.html')

    print()
    print('Regression test page generated:')
    print('  file://%s' % path_to_local_regression)
    print('  https://s3-us-west-2.amazonaws.com/zytools-regression-tests/%s/regression_test/index.html' % fingerprint)
    print()


if __name__ == '__main__':
    run()
