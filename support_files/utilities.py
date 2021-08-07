from subprocess import check_output
import os, json


def replace_given_pairs_in_string(pairs, given_string):
    '''
    Replace the given key, value pairs in the given string.
    '''
    for to_replace, replace_with in pairs.items():
        given_string = given_string.replace(to_replace, replace_with)

    return given_string


def get_dependencies(tool_name):
    '''
    Return the tool and vendor dependencies for the given tool. Repeat recursively.
    '''
    tool_dependencies = set()
    vendor_dependencies = set()
    dependencies_file_path = os.path.join('tools', tool_name, 'dependencies.js')

    try:
        with open(dependencies_file_path) as dependencies_file:
            try:
                dependencies = json.loads(dependencies_file.read())
            except ValueError:
                print('%s contains invalid JSON' % dependencies_file_path)
                sys.exit(1)

            # Get the tool dependencies and recursively get the dependencies of the dependencies.
            tools = dependencies.get('tools', [])
            for tool in tools:
                tool_dependencies.add(tool)
                more_tool_dependencies, more_vendor_dependencies = get_dependencies(tool)
                tool_dependencies.update(more_tool_dependencies)
                vendor_dependencies.update(more_vendor_dependencies)

            # Get the vendor dependencies.
            vendorJS = dependencies.get('vendorJS', [])
            vendorCSS = dependencies.get('vendorCSS', [])
            vendors = vendorJS + vendorCSS
            for vendor in vendors:
                vendor_dependencies.add(vendor)
    except IOError:
        # Dependency file doesn't exist.
        pass

    return tool_dependencies, vendor_dependencies


def set_to_stringified_array(given_set):
    '''
    Convert the given set of strings to a stringified array.
    Ex: Convert the set ('utilities', 'progressionTool') to the string: "[ 'utilities', 'progressionTool' ]"
    '''
    return json.dumps(list(given_set))


def run_command(command):
    '''
    Run the given command and return the output.
    '''
    return check_output(command.split(), text=True)


def build_tools(tools_set):
    '''
    Build the set of given tools via grunt.
    '''
    for tool_name in tools_set:
        try:
            run_command('grunt production --tool=%s' % tool_name)
        except Exception:
            print('Failed to grunt %s. Aborting.' % tool_name)
            sys.exit(1)
