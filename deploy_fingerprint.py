#!/usr/bin/python

import sys, os, shutil, subprocess, readline, click
from support_files import deploy_server_utilities
from support_files.deploy_utilities import ColumnProperties, did_user_confirm_action, is_live_tool, run_command, usage_messages
from uuid import uuid4
from colorama import Back, Fore, Style

def print_list(user_input):
    '''
    List deployed tool entries that were deployed from master for the given user_input.
    '''
    if len(user_input) < 3:
        print('Expected more input.\n%s' % usage_messages['list'])
        return

    list_type = user_input[1]
    tool_or_commit = user_input[2]

    if list_type not in ['tool', 'commit']:
        print('Expected tool or commit. Found: %s\n%s' % (list_type, usage_messages['list']), end='')
        return

    show_only_master = True

    # Support showing all deploys, not just master.
    if len(user_input) == 4:
        all_option = user_input[3]
        if all_option == '--all':
            if list_type == 'commit':
                print('--all only supported for tool listing.\n%s' % usage_messages['list'])
                return
            show_only_master = False
        else:
            print('Unexpected option: %s\n%s' % (all_option, usage_messages['list']), end='')
            return

    # Get fingerprints from server.
    fingerprints = deploy_server_utilities.get_fingerprints(list_type, tool_or_commit)

    # Error occurred.
    if fingerprints is None:
        return

    # Filter for pushes from master
    if show_only_master:
        fingerprints = [fp for fp in fingerprints if fp['master']]

    if len(fingerprints) == 0:
        master_message = ' from master' if show_only_master else ''
        print("No fingerprints for '%s' deployed%s." % (tool_or_commit, master_message), end='')
        return

    # Get live fingerprints.
    live_fingerprints = deploy_server_utilities.get_live_fingerprints()

    # If tool specified and only showing master, then print only last 5 commits.
    if list_type == 'tool' and show_only_master:
        fingerprints = fingerprints[-5:]

    # Build columns to print.
    column_properties = [
        ColumnProperties('Tool'),
        ColumnProperties('Last updated'),
        ColumnProperties('Master'),
        ColumnProperties('Dev', Fore.YELLOW),
        ColumnProperties('Beta'),
        ColumnProperties('Prod', Fore.BLUE),
        ColumnProperties('Commit'),
        ColumnProperties('Fingerprint'),
        ColumnProperties('Message'),
    ]
    COLUMN_INDICES = {
        'tool': 0,
        'dev': 3,
        'beta': 4,
        'production': 5,
        'fingerprint': 7
    }
    column_names = [properties.name for properties in column_properties]

    # Build rows to print.
    rows = [column_names]
    for fp in fingerprints:
        rows.append([fp['tool_name'], fp['timestamp'], fp['master'], fp['development'], fp['beta'], fp['production'], fp['commit_hash'], fp['fingerprint'], fp['message']])

    # Find max width needed for each column.
    max_allowed_column_width = 50
    for index, column in enumerate(column_names):
        widths_this_column = [ len(str(row[index])) for row in rows ]
        column_properties[index].width = min(max(widths_this_column), max_allowed_column_width)
    total_column_widths = sum([properties.width for properties in column_properties])

    live_cell_style = Back.MAGENTA

    # Print the table.
    print()
    for row_index, row in enumerate(rows):
        is_header_row = row_index == 0

        for cell_index, cell in enumerate(row):
            cell_properties = column_properties[cell_index]
            cell_width = cell_properties.width
            cell_style = cell_properties.style

            # Add special background if current cell is the live fingerprint on any silo.
            if not is_header_row:
                silo_name = None
                for name in ['dev', 'beta', 'production']:
                    if cell_index == COLUMN_INDICES[name]:
                        silo_name = name
                if silo_name is not None:
                    tool_name = row[COLUMN_INDICES['tool']]
                    tool_fingerprint = row[COLUMN_INDICES['fingerprint']]
                    if is_live_tool(tool_name, silo_name, tool_fingerprint, live_fingerprints):
                        cell_style = cell_style + live_cell_style

            # Create specifier with left-alignment and exact cell width.
            cell_specifier = ('%-' + str(cell_width) + '.' + str(cell_width) + 's ')

            print(cell_style + (cell_specifier % cell) + Style.RESET_ALL + '|', end= ' ')
        print()

        # Print demarcation below column headers.
        if is_header_row:
            print('=' * (total_column_widths + (3 * len(column_properties)) - 1))

    # Print legend.
    print()
    print(live_cell_style + 'live' + Style.RESET_ALL + ' tools are highlighted')

def push_or_pop_tools(user_input, usage_message, action_confirm, new_value, action_doing):
    '''
    Perform a push or pop, depending on the given parameters.
    '''
    if len(user_input) < 3:
        print('Usage: %s' % usage_message)
        return

    silo_name = user_input[1]
    commit_hash = user_input[2]
    tool_names = user_input[3:]

    if silo_name not in ['beta', 'dev', 'prod']:
        print('Expected dev, beta, or prod. Found: %s\n%s' % (silo_name, usage_message), end='')
        return

    # If user is pushing to production, then verify the regression testing has been done.
    if (user_input[0] == 'push') and (silo_name == 'prod'):
        print('Have you verified no regression via regression_test.py?')
        print('If not, exit this script and do so.')
        confirmation_input = input('If you have, enter "Yes, I have": ')

        if not(confirmation_input == 'Yes, I have'):
            print('Aborted.')
            return

    if not did_user_confirm_action(action_confirm, silo_name, commit_hash, tool_names):
        return

    endpoint = 'zytools/%s' % commit_hash

    # Build payload by setting only necessary parameters.
    payload = {}

    if silo_name == 'beta':
        payload['beta'] = new_value
    elif silo_name == 'dev':
        payload['development'] = new_value
    elif silo_name == 'prod':
        payload['production'] = new_value

    if len(tool_names) > 0:
        payload['tools'] = tool_names

    deploy_server_utilities.server_put(action_doing, endpoint, payload)

def pop_tools(user_input):
    '''
    Pop the last production or beta deploy for the given user input. Optionally, only pop specified tools.
    '''
    push_or_pop_tools(user_input, usage_messages['pop'], 'Pop from', False, 'Popping...')

def push_tools(user_input):
    '''
    Deploy the given commit hash to the given silo name. Optional: Deploy only specified tool name(s).
    '''
    push_or_pop_tools(user_input, usage_messages['push'], 'Push to', True, 'Pushing...')

def deploy_tools(user_input):
    '''
    Deploy the given tool names to dev. Optional: Include the vendor folder.
    '''
    if len(user_input) < 2:
        print('Expected tool names\n%s' % usage_messages['deploy'])
        return

    # Build list of tools to deploy. Check whether to include vendor folder in deploy.
    user_listed_tool_names = user_input[1:]
    include_vendor = 'vendor' in user_listed_tool_names
    tool_names = [tool_name for tool_name in user_listed_tool_names if tool_name != 'vendor']

    print('Sanity testing...', end='', flush=True)

    # Check no duplicate tool names.
    if len(tool_names) != len(set(tool_names)):
        print('failed. There are duplicate tool names.')
        return

    # Check that each tool actually exists.
    for tool_name in tool_names:
        if not os.path.exists(os.path.join('tools', tool_name)):
            print("failed. Tool named '%s' does not exist" % tool_name)
            return

    # Check vendor exists if including vendor.
    if include_vendor:
        if not os.path.exists(os.path.join('vendor')):
            print('failed. vendor folder not found.')
            return

    # Prevent deploy if there are staged commits.
    staged_changes = run_command('git status --short')
    if staged_changes != '':
        print('failed. There are staged changes on this branch.')
        return
    print('done')

    # Get commit hash and current branch. Strip ending newline.
    commit_hash = run_command('git rev-parse HEAD')[:-1]
    current_branch = run_command('git rev-parse --abbrev-ref HEAD')[:-1]

    if not did_user_confirm_action('Deploy', '', commit_hash, user_listed_tool_names, current_branch):
        return

    # User can enter a message. If on master, then user must enter a message
    is_master_branch = current_branch == 'master'
    message = ''
    if is_master_branch:
        while message == '':
            message = input('Describe this deploy: ')
    else:
        message = input('(optional) Describe this deploy: ')

    # Build given tools.
    for tool_name in tool_names:
        print('Grunting %s...' % tool_name, end='', flush=True)

        grunt_option = 'production' if is_master_branch else 'deploy_dev'
        try:
            run_command('grunt %s --tool=%s' % (grunt_option, tool_name))
        except Exception:
            print('failed. Aborting deploy.')
            return
        print('done')

    # Generate 32-character alphanumeric fingerprint.
    fingerprint = str(uuid4())

    # Clear the transfer folder.
    shutil.rmtree('transfers', ignore_errors=True)
    os.makedirs('transfers')

    # Create fingerprinted folder inside transfer folder.
    os.makedirs(os.path.join('transfers', fingerprint))

    # Copy tools to transfer folder.
    for tool_name in tool_names:
        # Move tool to fingerprinted folder.
        old_path = os.path.join('public', tool_name)
        new_path = os.path.join('transfers', fingerprint, tool_name)
        shutil.copytree(old_path, new_path)

        # Remove tool's index.html.
        index_path = os.path.join(new_path, 'index.html')
        if os.path.exists(index_path):
            os.remove(index_path)

    # Copy vendor folder to transfer folder if including vendor.
    if include_vendor:
        old_path = os.path.join('vendor')
        new_path = os.path.join('transfers', fingerprint, 'vendor')
        shutil.copytree(old_path, new_path)

    # Transfer files to S3.
    had_transfer_error = False
    transfer_command = 'aws --region us-west-2 s3 mv transfers/ s3://zyante-zytools/zyBooks2/fingerprinted/ --acl=public-read --recursive'.split(' ')
    try:
        error_code = subprocess.call(transfer_command)
    except:
        had_transfer_error = True
    if error_code != 0:
        had_transfer_error = True
    if had_transfer_error:
        print('Transfer to S3 failed. Might need to exit vagrant, then: vagrant reload')
        return

    # Remove transfers folder.
    shutil.rmtree('transfers', ignore_errors=True)

    # Inform server of new fingerprint.
    endpoint = 'zytools/%s' % commit_hash
    payload = {
        'fingerprint': fingerprint,
        'master': is_master_branch,
        'message': message,
        'tools': user_listed_tool_names,
    }
    deploy_server_utilities.server_post('\nFingerprinting tools...', endpoint, payload)

def run_loop():
    '''
    Gets user input and pass to appropriate functions.
    '''
    invalid_command_message = 'Invalid command. Try entering: help'

    while True:
        user_input = input('\n>>> ').split(' ')
        command = user_input[0]

        if command == 'help':
            order_of_messages = ['list', 'deploy', 'push', 'pop', 'quit']
            for message in order_of_messages:
                print('%s\n' % usage_messages[message])
        elif command == 'deploy':
            deploy_tools(user_input)
        elif command == 'push':
            push_tools(user_input)
        elif command == 'pop':
            pop_tools(user_input)
        elif command == 'list':
            print_list(user_input)
        elif command in ['q', 'quit', 'exit']:
            break
        else:
            print(invalid_command_message)

@click.command()
@click.option('--email', help='Admin email for zybooks.com', default=None)
@click.option('--password', help='Admin password for zybooks.com', default=None)
@click.option('--host', help='The server host to hit', default='https://zyserver.zybooks.com/v1/')
def initialize(email, password, host):
    '''
    Gets user email and password, sign in, then start run loop.
    '''
    deploy_server_utilities.server_url = host

    while not deploy_server_utilities.sign_in(email, password):
        email = None
        password = None
        print()

    run_loop()

if __name__ == '__main__':
    initialize()
