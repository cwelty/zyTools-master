#!/usr/bin/python

import os
import shutil
import sys

def push_zyAnimator():
    '''
    This function pushes zyAnimator to zyanteapps.com/zyAnimator
    '''

    # Create a new directory that will be transferred to the remote server.
    TRANSFER_DIRECTORY = 'transfer'
    if os.path.exists(TRANSFER_DIRECTORY):
        shutil.rmtree(TRANSFER_DIRECTORY)
    os.makedirs(TRANSFER_DIRECTORY)

    # Copy zyAnimator from public
    shutil.copytree(os.path.join('..', '..', 'public', 'zyAnimator'), os.path.join(TRANSFER_DIRECTORY, 'zyAnimator'))
    shutil.rmtree(os.path.join(TRANSFER_DIRECTORY, 'zyAnimator', 'resource'))
    
    # Copy contents of 'zyanteapps_index.html' to os.path.join('transfer', 'zyAnimator', 'index.html')
    shutil.copyfile('zyanteapps_index.html', os.path.join('transfer', 'zyAnimator', 'index.html'))
    
    # Copy the vendor files into the transfer directory.
    shutil.copytree(os.path.join('..', '..', 'vendor'), 
                    os.path.join(TRANSFER_DIRECTORY, 'vendor'))
    
    # Copy zyWeb files to transfer directory.
    filesToCopyToTransferDirectory = ['zyWebErrorManager.js', 'zyWebEventManager.js', 'zyWebParentResource.js', 'zyWebResourceManager.js']
    for file in filesToCopyToTransferDirectory:
        shutil.copyfile(os.path.join('..', '..', 'public', 'vendor', file), 
                        os.path.join(TRANSFER_DIRECTORY, 'vendor', file))
    
    # Copy resources
    if os.path.exists('resource'):
        shutil.copytree('resource', os.path.join(TRANSFER_DIRECTORY, 'site', 'resource'))
    
    user = 'smibak'
    hostname = 'zyanteapps.com'
    filepath = '~/zyanteapps.com'

    # Push the public/ directory to the remote server.
    os.system('scp -r %s/* %s@%s:%s' % (TRANSFER_DIRECTORY, user, hostname, filepath))

    # Remove the transfer directory.
    shutil.rmtree(TRANSFER_DIRECTORY)

if __name__ == '__main__':
    if len(sys.argv) == 1:
        os.system('grunt --tool=zyAnimator')
        push_zyAnimator()