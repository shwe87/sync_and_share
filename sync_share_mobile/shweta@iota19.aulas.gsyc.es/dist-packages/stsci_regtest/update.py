# update the regtest

import os.path
import os

import stsci_regtest.configuration

import shutil


def op_update( output, ref ) :

    # make sure the directory for the reference file exists.
    # makedirs() creates all the necessary directories, but
    # raises an exception if too many of them already exist.
    # go figure.
    try :
        os.makedirs( os.path.dirname(ref) )
    except os.error :
        pass

    # copy the file
    try :
        shutil.copyfile( output, ref )
    except Exception, e:
        print "copy",output,ref,e
    else :
        print "updated",ref
        try :
            os.unlink( output )
        except Exception, e :
            print "    cannot delete",output

def op_list_ref( output, ref ) :
    print ref

def main(args) :
    if args[0] == '-u' :
        args = args[1:]
        op = op_update
    else :
        op = op_list_ref

    for x in args :
        config = stsci_regtest.configuration.regtest_read (x)
        dir = os.path.dirname(x)
        if dir == '' :
            dir = '.'
        x = config['output']
        for y in x :
            output  = dir + '/' + y['fname']
            if 'reference' in y :
                ref = dir + "/" + y['reference']
            else :
                ref = dir + '/ref/' + y['fname']
            op(output,ref)


