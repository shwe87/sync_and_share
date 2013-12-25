import os
import string

from pyraf import iraf

import traceback

# TASK: Runs a requested IRAF/PyRAF task
#
#==========================================================================
# Version 1.1: H.Bushouse 2001/05/04: Initial configured version.
# Version 1.2: H.Bushouse 2001/08/06: Added log to list of arguments
#              passed in. Added traping of Exceptions and writing
#              IRAF error messages to log. Added write_exc_to_log and
#              write_err_to_log functions.
# Version 1.3: H.Bushouse 2002/02/12: Added trapping and dumping of IRAF
#              stderr to log.
# Version 1.4: H.Bushouse 2002/03/13: Added documentation.
# Version 1.5: V.Laidler 2005/03/15: Streamline and expand comparison of
#              task error output: send STDOUT and STDERR to the same file
#              in the iraf.taskname() call. Removes check against raised
#              error status so as to catch all STDERR text and send it to
#              the same file as stdout. As a consequence, however, it
#              also loses the ability to send the STDERR text to the logfile.
#              Thus errors won't be recorded in the logfile, only in the
#              test's stdout output file.
#==========================================================================


#----------------------------------------------------------------------
# RUN -- Run a task
#
# taskname      [i]     Task name
# pfile         [i]     Parameter file name
# output        [i]     Output list
# log           [i]     Log file
#
# Returns 0 if task executed successfully or 1 if there was an error
#----------------------------------------------------------------------
def run (taskname, pfile, output, log):

    # Construct Pyraf command for IRAF task
    command = getattr(iraf,taskname)

    # Check whether we need to trap STDOUT
    trap = 0
    for out in output:
        if out["file"] == 'STDOUT':
            trap = 1
            fname = out["fname"]

    # Initialize task execution status
    status = 0

    # Run IRAF task with Stdout and Stderr trapped to files
    if trap:

        # Try running the IRAF task
        try:
            #This syntax sends *both* STDOUT and STDERR to the file
            err = command(ParList=pfile,Stderr=fname)

        # If an error or exception occurs, write error messages to log
            if err:
                status = 1

        except Exception, exc:
            xstr = traceback.format_exc()
            write_exc_to_log (xstr, log)
            status = 1

    # Run IRAF task without Stdout trapped to file
    else:
        try:
            command(ParList=pfile)

        except Exception, exc:
            xstr = traceback.format_exc()
            write_exc_to_log (xstr, log)
            status = 1


    return status



#----------------------------------------------------------------------
# WRITE_EXC_TO_LOG -- Write exception messages to log file
#
# exc           [i]     Exception message strings
# log           [i]     Log file
#
# Returns       None
#----------------------------------------------------------------------
def write_exc_to_log (exc, log):

    log.write("? Exception in task.run():\n")
    exc=string.split(str(exc),"\n")
    for i in range(len(exc)):
        log.write ("? "+exc[i]+"\n")

    return



#----------------------------------------------------------------------
# WRITE_ERR_TO_LOG -- Write IRAF stderr messages to log file
#
# fname         [i]     Name of file containing stderr output
# log           [i]     Log file
#
# Returns       None
#----------------------------------------------------------------------
def write_err_to_log (fname, log):

    log.write ("? Error running IRAF task\n")
    fd = open(fname,'r')
    lines = fd.readlines()
    fd.close()
    for i in range(len(lines)):
        log.write ("? "+lines[i])

    return
