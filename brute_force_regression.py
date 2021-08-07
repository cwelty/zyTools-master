import sys, os, click, json
from support_files.utilities import replace_given_pairs_in_string, get_dependencies, build_tools


def get_sets_of_dependencies(tool_names):
    tool_dependencies = set()
    vendor_dependencies = set()
    for tool_name in tool_names:
        td, vd = get_dependencies(tool_name)
        tool_dependencies = tool_dependencies.union(td)
        vendor_dependencies = vendor_dependencies.union(vd)
    return tool_dependencies, vendor_dependencies


@click.command()
@click.option('-t', '--tools', 'tools', required=True, prompt='Tools to be tested (comma separated)',
              help='Name of the tools to be tested.')
def run(tools):
    brute_force_folder = os.path.join('public', 'brute_force')
    if not os.path.exists(brute_force_folder):
        os.makedirs(brute_force_folder)

    tool_names = set([name.strip() for name in tools.split(',')])
    tool_dependencies, vendor_dependencies = get_sets_of_dependencies(tool_names)
    all_tools = tool_names.union(tool_dependencies)
    print('Building tools: {}'.format(', '.join(all_tools)))
    build_tools(all_tools)

    replace_pairs = {
        'TOOL_NAMES': str(list(tool_names)),
        'TOOL_DEPENDENCIES': str(list(all_tools)),
        'VENDOR_DEPENDENCIES': str(list(vendor_dependencies))
    }

    # Read the templates, replace values, then write the files.
    file_paths = {
        'html': os.path.join(brute_force_folder, 'index.html'),
        'js': os.path.join(brute_force_folder, 'brute_force.js'),
        'css': os.path.join(brute_force_folder, 'style.css')
    }
    file_contents = {
        'html': None,
        'js': None,
        'css': None
    }
    for key in file_contents.keys():
        with open(os.path.join('support_files', 'brute_force_regression.template.' + key)) as brute_force_template:
            file_content = brute_force_template.read()
            file_contents[key] = replace_given_pairs_in_string(replace_pairs, file_content)

    for key in file_contents.keys():
        with open(file_paths[key], 'w') as write_file:
            write_file.write(file_contents[key])

    print('Test can be run from: file://{}/{}'.format(os.getcwd(), file_paths['html']))


if __name__ == '__main__':
    run()
