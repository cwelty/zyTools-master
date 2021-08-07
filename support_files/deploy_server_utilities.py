import getpass, requests, json, sys

# Globals for this script.
server_url = None
headers = {
    'Content-type': 'application/json',
}
auth_token = None

def sign_in(email, password):
    '''
    Signs in the specified user and returns an auth token. If sign in fails, raise exception.
    '''
    if not email:
        email = input("Username for 'https:zybooks.com': ")
    if not password:
        password = getpass.getpass('Password for ' + email + ': ')
    payload = {
        'email': email,
        'password': password
    }
    json_response = server_post('\nSigning in...', 'signin', payload)

    if json_response is None:
        return False

    # Successful login.
    if json_response['success']:
        global auth_token
        auth_token = json_response['session']['auth_token']
        return True

    return False


def server_post(message, endpoint, payload):
    '''
    Posts the given payload to the given endpoint. Returns the post's response as JSON.
    '''
    url = server_url + endpoint
    return server_interaction('post', message, url, payload)


def server_put(message, endpoint, payload):
    '''
    Puts the given payload to the given endpoint. Returns the post's response as JSON.
    '''
    url = server_url + endpoint
    return server_interaction('put', message, url, payload)


def server_interaction(interaction_type, message, url, payload):
    '''
    Perform a PUT or POST request. Return the response as JSON.
    '''
    payload['auth_token'] = auth_token

    # Figure out which request to make.
    if interaction_type == 'post':
        request_to_make = requests.post
    elif interaction_type == 'put':
        request_to_make = requests.put
    else:
        raise Exception('Unsupported interaction type: %s' % interaction_type)

    print(message, end='', flush=True)

    try:
        json_response = request_to_make(url, headers=headers, data=json.dumps(payload)).json()
    except requests.exceptions.ConnectionError:
        print('Connection to server failed.')
        return None

    if json_response is None:
        print('failed. No response from server.')
    elif not json_response['success']:
        print('failed: %s' % json_response['error']['message'])
    else:
        print('done')

    return json_response


def server_get(endpoint):
    payload = {
        'auth_token': auth_token
    }

    try:
        json_response = requests.get(server_url + endpoint, params=payload).json()
    except requests.exceptions.ConnectionError:
        print('Connection to server failed.')
        return None

    if json_response is None:
        print('No response from server.')
        return None
    elif not json_response['success']:
        print('Error: %s' % json_response['error']['message'])
        return None

    return json_response


def get_fingerprints(list_type, tool_or_commit):
    '''
    Get all entries for given tool or commit by the list type.
    list_type can be either tool or commit.
    '''
    endpoint = 'zytools/%s/%s' % (list_type, tool_or_commit)
    response = server_get(endpoint)

    if response is None:
        return response

    return response['tool_entries']


def get_live_fingerprints():
    '''
    Get the live fingerprints for each silo.
    '''
    endpoint = 'zytools'
    response = server_get(endpoint)

    if response is None:
        return response

    return response['tools']
