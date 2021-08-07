from subprocess import check_output
from colorama import Style

vendor_usage_message = "Note: tool_name of 'vendor' will specify the vendor folder, not a zyTool."

usage_messages = {
    'list': '''list [tool <tool_name> (--all) | commit <commit_hash>]
    List deployed tool entries that were deployed from master.
    If tool specified, show the last 5 deployed commits.
    If commit specified, show all the tools on that commit.
    Optional: With tool, --all lists all deployed, not just master.
    ''' + vendor_usage_message,

    'push': '''push <silo_name> <commit_hash> (<tool_name1> <tool_name2>...)
    Push the given commit to development, beta, or production.
    Valid silo_name values: dev, beta, and prod.
    Optional: Push only the specified tool name(s).
    ''' + vendor_usage_message,

    'pop': '''pop <silo_name> <commit_hash> (<tool_name> <tool_name2> ...)
    Inverse of push. See push.''',

    'deploy': '''deploy <tool_name1> (<tool_name2> ...)
    Deploy the specified tools to development. Optional: Include vendor folder in deploy.
    ''' + vendor_usage_message,

    'quit': '''quit
    Quits this awesomeness.''',
}

def did_user_confirm_action(action_description, silo_name, commit_hash, tool_names, current_branch=None):
    '''
    Return whether the user confirmed the given action.
    '''
    # Build a string of the given tool_names in a list. Ex: utilities, progressionTool, and ProgressionBuilder
    tool_names_string = ''
    tool_names_length = len(tool_names)
    if tool_names_length == 1:
        tool_names_string = tool_names[0]
    elif tool_names_length == 2:
        tool_names_string = '%s and %s' % (tool_names[0], tool_names[1])
    elif tool_names_length > 2:
        all_but_last = ', '.join(tool_names[:-1])
        tool_names_string = '%s, and %s' % (all_but_last, tool_names[-1])

    # Confirm with user on the action.
    silo_name_confirmation = ' %s' % silo_name if silo_name != '' else ''
    current_branch_confirmation = ' from %s' % current_branch if current_branch else ''
    tool_names_confirmation = '\n    Tools: %s' % tool_names_string if tool_names_length > 0 else ''
    confirmation_message = '%s%s%s:%s\n    Commit: %s\nProceed? Y/n: ' % (action_description, silo_name_confirmation, current_branch_confirmation, tool_names_confirmation, commit_hash)
    user_confirmed = input(confirmation_message) in ['y', 'Y']
    if not user_confirmed:
        print('Aborted.')
    return user_confirmed

def run_command(command):
    '''
    Run the given command and return the output.
    '''
    return check_output(command.split(' '), text=True)

class ColumnProperties():
    '''Store properties of a column'''
    def __init__(self, name, style=Style.RESET_ALL, width=0):
        '''
        Set the initial column properties.
        '''
        self.name = name
        self.style = style
        self.width = width

def is_live_tool(tool_name, silo_name, tool_fingerprint, live_fingerprints):
    '''
    Return whether the given tool is the live tool for the given silo.
    '''
    silo_fp = live_fingerprints[silo_name]
    live_fp = silo_fp[tool_name] if tool_name in silo_fp else None

    return live_fp == tool_fingerprint
