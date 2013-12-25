#!/usr/bin/env python
#
# main program of regtest runner.  
#

# import Python modules that we need
import os, os.path, sys, time, string, getopt, tempfile, shutil
import platform
import traceback

# import PyRAF and IRAF
import pyraf, iraf

# import the rest of the Regression Test modules
import configuration, task
from comparison import Comparison

# import some PyRAF and IRAF modules and basic packages
from pyraf.irafpar import makeIrafPar, IrafParList
from pyraf.irafglobals import *
from pyraf.iraf import tables, stsdas, images
from pyraf.iraf import fitsio

# turn on test probes in pyraf, so the test report says some stuff
# about what we are doing
import pyraf.irafexecute
pyraf.irafexecute.test_probe = True

# REGRESS -- Top level driver for regression testing
#
# NOTES:
#   os.chdir()
#       use iraf.chdir() instead; something about pyraf gets confused if
#       you use os.chdir()
#

#######
# trap SIGTERM and throw a signal - this may cause us to make a better
# report if we get killed something outside the process (e.g. pdkrun
# detecting a timeout.)
class pdk_stsci_regtest_killed(Exception):
    pass

killed = False

def killed_func(sig,stk):
    global killed 
    killed = True
    print "KILLED"
    raise pdk_stsci_regtest_killed

import signal
signal.signal(signal.SIGTERM, killed_func)

#######


import pdk_report
pdkr = pdk_report.report()

class Regress:

    #------------------------------------------------------------------
    # INIT -- Initialize the regression test driver class
    #
    # self     [u]  This object
    #
    # returns       None
    #------------------------------------------------------------------
    def __init__ (self ):

        self.err     = 0

        # Here is a prefix to put on the test name.  The pdk meta-runner
        # sets this environment variable for us.
        if "PDK_TESTPREFIX" in os.environ :
            self.test_name_prefix = os.environ["PDK_TESTPREFIX"] + "/"
        else :
            self.test_name_prefix = ""

        # but we don't want the prefix to end //
        if self.test_name_prefix.endswith("//") :
                self.test_name_prefix = self.test_name_prefix[:-1]

        # Create log file for output messages
        self.log = sys.stdout

    #------------------------------------------------------------------
    # RUN -- Run the regression testing framework
    #
    # self     [u]  This object
    # files    [i]  List of files to test
    #
    # returns       1 if error occurred, 0 if not
    #------------------------------------------------------------------
    def run (self ):

        file = os.environ['PDK_FILE']

        # split up the file name
        root, ext = os.path.splitext (file)

        # if it ends in .xml, it is a test definition
        if ext != ".xml":
            print "ERROR: ",file," is not .xml file"
            return

        # in pandokia, we know that the current directory is always 
        # the same directory as where the file is.

        # The test name is derived from the file name.
        test_name = self.test_name_prefix + os.path.basename(file[:-4])

        pdkr.set("test_name",test_name)

        # status will be error unless we get far enought to pass or fail
        pdkr.set("status","E")

        pdkr.start_time()

        try :
            # run the test
            #
            self.runtest(file, pdkr)

        except Exception, e:
            xstr=traceback.format_exc()
            pdkr.set("status","E")
            pdkr.set_tra('exception',str(e))
            print "Exception running test:",e
            print xstr

        pdkr.end_time()

        # write out the pandokia report.
        pdkr.write()

        return self.err


    #------------------------------------------------------------------
    # RUNTEST -- Run a single regression test
    #
    # self     [i]  This object
    # file     [i]  Regression test configuration file
    #
    # returns       None
    #------------------------------------------------------------------

    def runtest (self, file, pdkr ):

        okfile = file
        if okfile.endswith(".xml") :
            okfile = okfile[:-4]
        okfile = okfile + ".okfile"
        okfile = os.path.join(os.getcwd(),okfile)

        try :
            os.unlink(okfile)
        except OSError :
            pass

        # Read the configuration file
        try:
            config = configuration.regtest_read (file)
        except:
            xstr=traceback.format_exc()
            print "can't read configuration file",file
            print xstr
            self.writelog ("?", "Couldn't read configuration file", file)
            return

        if config.has_key("attributes") :
            for x in config["attributes"] :
                pdkr.set_tda(x,value)

        crash = False

        try :
            if 'title' in config :
                pdkr.set_tda('title',config["title"])
                msg = "Test title: %s" % (config["title"])
                self.writelog (".", msg, "")

            # purge all the output files before starting the test
            # (otherwise, a test that fails to create the output file at all might appear
            # to pass because the old output file is still there)
            for output in config["output"] :
                if os.path.exists (output["fname"]):
                    self.writelog(".","removing output file %s before starting test" % output['fname'],'')
                    os.unlink (output["fname"])

            # Run any pre-execution commands in the configuration file
            if config.has_key ("pre-exec"):
                print ".begin pre-exec"
                sys.stdout.flush()

                for code in config["pre-exec"]:

                    if code[0] == '@':
                        efile = open (code[1:], 'r')
                        try:
                            exec efile
                        except Exception, e:
                            xstr=traceback.format_exc()
                            self.writelog ("?", str(e))
                            self.writelog ("?", xstr)
                            self.writelog ("?", "Couldn't run pre-execution file",
                                           code[1:])
                            crash=True
                        efile.close()

                    else:
                        try:
                            exec code
                        except Exception, e:
                            xstr=traceback.format_exc()
                            self.writelog ("?", str(e))
                            self.writelog ("?", xstr)
                            self.writelog ("?", "Couldn't run pre-execution code",
                                           code)
                            crash=True

                print ".end pre-exec"
                sys.stdout.flush()


            # Run the task with the specified parameter file
            # taskname is optional.  If absent, we assume that the <pre-exec>
            # implemented the test in python.  Now that we are using nose,
            # that is less important, but we have it for compatibility with
            # old tests.
            if ( not killed ) and ( not crash ) and ( config.has_key("taskname") and config['taskname'].strip() != '' ) :

                msg = "Executing task: %s" % (config["taskname"])
                self.writelog (".", msg, "")
                err = 0
                if not 'pfile' in config :
                    self.writelog ("?", "no pfile in config")

                # this is the command to execute
                taskname=config["taskname"]
                pfile=config['pfile']

                ## enter our test definition attributes
                pdkr.set_tda('taskname', taskname)
                pdkr.set_tda('pfile',    pfile)

                # fetch tda values from the par file
                parobj=pyraf.irafpar.IrafParList(taskname, pfile)
                parlist=parobj.getParList()

                # ignore some especially uninteresting clutter in the par files
                # (you have to understand IRAF to understand why)
                tdaIgnoreNames = ['mode','$nargs']
                tdaIgnoreValues = ['none','no','','indef']

                for k in parlist:
                    if (k.name not in tdaIgnoreNames and
                        str(k.value).strip().lower() not in tdaIgnoreValues):
                        pdkr.set_tda(k.name,k.value)

                try:
                    # now we actally run the task
                    command=getattr(iraf,taskname)
                    err = task.run (taskname, pfile, config["output"], self.log)

                except AttributeError:
                    print traceback.format_exc()
                    #Not an iraf task; try it again as vanilla python
                    print "VANILLA PYTHON"
                    pdkr.set_tda("vanilla_python", "T")

                    for out in config["output"]:
                        if out["file"] == 'STDOUT':
                            print "setting stdout to %s"%out["fname"]
                            sys.stdout=open(out["fname"],'w')
                    try:
                        err=eval("%s('%s')"%(config['taskname'],config['pfile']))
                    except Exception, e:
                        xstr=traceback.format_exc()
                        self.writelog("?","EXCEPTION: " + str(e))
                        self.writelog("?", xstr)
                        err=None
                    sys.stdout=sys.__stdout__

                if not err:
                    msg = "Completed task: %s" % (config["taskname"])
                    self.writelog (".", msg, "")
                else :
                    self.writelog ("?", "Error running regression test (%s)"%repr(err),
                               config["title"])
                    crash = 1

            # end: if config.has_key("taskname") and config['taskname'].strip() != '' :

            # Run any post-execution commands in the configuration file
            # This happens whether earlier stuff worked or not
            if ( not killed ) and ( config.has_key ("post-exec") ):

                print ".begin post-exec"
                sys.stdout.flush()

                for code in config["post-exec"]:

                    if code[0] == '@':
                        efile = open (code[1:], 'r')
                        try:
                            exec efile
                        except StandardError, e:
                            xstr=traceback.format_exc()
                            self.writelog ("?", str(e))
                            self.writelog ("?", xstr)
                            self.writelog ("?", "Couldn't run post-execution file",
                                           code[1:])
                            crash=True
                        efile.close()

                    else:
                        try:
                            exec code
                        except StandardError, e:
                            xstr=traceback.format_exc()
                            self.writelog ("?", str(e))
                            self.writelog ("?", xstr)
                            self.writelog ("?", "Couldn't run post-execution code",
                                           code)
                            crash=True

                print ".end post-exec"
                sys.stdout.flush()

            if ( killed ) or ( crash ) :
                error = 1
                ok = 0

            else :
                # Compare the output files

                # Assume everything is ok unless one of the comparisons says otherwise.
                ok = 1
                error = 0

                # Keep a list of all the comparison objects.  We delete the test output
                # files at the end.
                all_pairs = [ ]

                for output in config["output"]:

                    if not output.has_key ("maxdiff"):
                        output["maxdiff"] = 2.e-7

                    # Set ignorekeys to blank if not included in xml file
                    if not output.has_key ("ignorekeys"):
                        output["ignorekeys"] = ""

                    # Set ignorecomm to blank if not included in xml file
                    if not output.has_key("ignorecomm"):
                        output["ignorecomm"] = ""

                    # Split the ascii_ignore items on commas
                    for k in ["ignore_wstart","ignore_wend"]:
                        if output.has_key(k):
                            output[k] = output.get(k).split(',')
                        else:
                            output[k] = []

                    if not "reference" in output :
                        output["reference"] = "ref/" + output["fname"]

                    # Create the comparison for this set of outputs
                    pair=Comparison(output["comparator"],
                                              output["fname"],
                                              output["reference"],
                                    ignorekeys=output["ignorekeys"],
                                    ignorecomm=output["ignorecomm"],
                                    maxdiff=output["maxdiff"],
                                    ignore_wstart=output.get("ignore_wstart",[]),
                                    ignore_wend=output.get("ignore_wend",[]),
                                    ignore_date=output.get("ignore_date",[]),
                                    ignore_regexp=output.get("ignore_regexp",[]))

                    # Run the comparison
                    try:
                        pair.compare()
                    except:
                        xstr=traceback.format_exc()
                        self.writelog ("?", "Error running comparison",
                                       output["comparator"])
                        ok=0
                        error=1
                    else :
                        #Handle the results
                        if pair.failed:
                            pair.writeheader(self.log)
                            pair.writeresults(self.log)
                        pair.writestatus(self.log)

                        # do not delete the output files here - I want to keep all of
                        # them around if a test fails
                        all_pairs.append(pair)

                        #Update overall status of test
                        if pair.failed:
                            ok=0

                if ok :
                    # delete temp files used by comparison; if pair.failed is set,
                    # then cleanup() only deletes temp files.  if pair.failed is false,
                    # it deletes temp files and output files.
                    for pair in all_pairs :
                        pair.cleanup()

                if 1 :
                    pdkr.set_tda("_okfile", okfile)

                    f=open(okfile,"w")
                    f.write('# %s\n'%file)
                    for output in config["output"]:
                        f.write("%s %s\n"%(output['fname'],output['reference'] ))
                    f.close()

            # Write final message on success of entire test
            if not error :
                if ok:
                    pdkr.set("status","P")
                    self.writelog (".", "Regression test completed successfully",
                                   config["title"])
                else:
                    pdkr.set("status","F")
                    self.writelog ("!", "Regression test failed",
                                   config["title"])
            else :
                    pdkr.set("status","E")
                    self.writelog ("!", "Regression test ERROR",
                                   config["title"])

        except Exception, e :
            # there should be no exception to catch.  If we get one, we want to
            # declare the test a failure and collect some useful information about
            # what happened.
            #
            # traceback.format_exc() creates a string just like what python would
            # print if you did not catch the exception.  It always acts on the
            # most recently thrown exception, so we don't actually use the value of
            # e in this call.
            xstr=traceback.format_exc()
            self.writelog("!", "Regression test aborted with exception:\n" + xstr,"")



    #------------------------------------------------------------------
    # WRITELOG -- Write a message to the log file
    #
    # self     [i]  This object
    # code     [i]  Symbolic code indicating message type
    # msg      [i]  Text of messgage
    # args     [i]  Other arguments indicating what went wrong
    #
    # returns       None
    #------------------------------------------------------------------
    def writelog (self, code, msg, *args) :

        # Format log file message

        other = string.join (map (str, args), ",")
        if other != "":
            line = "%s %s (%s)" % (code, msg, other)
        else:
            line = "%s %s" % (code, msg)

        # Set a flag when an error is detected

        if code == "!" :
            self.err = 1

        # Write message to logfile
        # Flush after write to log file to make sure output gets to disk

        self.log.write (line + "\n")
        self.log.flush ()

        # display the log entry stdout too, for use when trying to
        # analyze problems
        # print "log:  ",line


#----------------------------------------------------------------------
# The main procedure for calling the regression analysis
#
# returns exit status
#----------------------------------------------------------------------
def main ():
    """
This is the pandokia-enabled regtest runner.  It has everything stripped
out except what is necessary to use it with the pandokia meta-runner,
so you can't use it directly.

    """

    # Create regression object and run the test cases
    regress = Regress ( )
    err = regress.run ( )

    # Exit with the error status from the regression test
    sys.exit (err)


if __name__ == "__main__":
    main()

