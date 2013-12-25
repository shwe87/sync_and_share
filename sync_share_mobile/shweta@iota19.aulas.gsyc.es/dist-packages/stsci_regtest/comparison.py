#
# bug: should change this to use pandokia.helpers.filecomp
#

"""Refactored the Compare class (originally written by Bushouse) to make
use of more OO concepts such as subclassing. The new AsciiComparison
subclass was made smarter by using regular expressions to permit
ignoring certain patterns.

V. Laidler, 2 June 2006

Added maxdiff tag for FITS comparison

R. Jedrzejewski, 3 October 2007
                 (Repeat)
"""

import re, os
import datespec  # for ascii comparisons
import tempfile  #}

import sys

from pyraf import iraf      #}
from iraf import images     #} for the iraf.imdelete task

__version__ = 0.1
__vdate__ = '2006-06-02'

def Comparison(comparator, testfile, reffile, **kwds):
    """Factory function to return the right sort of ComparisonClass object"""
    cmethod=comparator.lower()
    if cmethod == 'ascii' or cmethod == 'stdout':
        return AsciiComparison(testfile, reffile, **kwds)
    elif cmethod == 'diff':
        return DifflibComparison(testfile, reffile, **kwds)
    elif cmethod == 'image' or cmethod == 'table' or cmethod == 'fits':
        return FitsComparison(testfile, reffile, **kwds)
    elif cmethod == 'binary':
        return BinaryComparison(testfile, reffile, **kwds)
    else:
        raise ValueError,"Sorry, %s comparator is not supported"%comparator


class ComparisonClass:
    """ Base class for comparisons. Define common methods & attributes here."""
    def __init__(self, testfile, reffile, **kwds):
        self.testfile=testfile
        self.reffile=reffile
        self.diffs=[]
        self.failed=None
        self.ignore_raw={}
        self.ignore=[]

    def writeheader(self,fh):
        fh.write("? \n")
        fh.write("? Ascii Comparison\n")
        fh.write("? Test: %s\n"%self.testfile)
        fh.write("? Ref : %s\n"%self.reffile)
        fh.write("? \n")
        if len(self.ignore_raw) > 0:
            fh.write("? Patterns to ignore: \n")
            for k in self.ignore_raw:
                fh.write('?   %s: %s\n'%(k,self.ignore_raw[k]))
            fh.write('?\n')
        fh.flush()


    def writeresults(self, fh):

        if self.failed:
            for tup in self.diffs:
                # tup is (tline, rline, <optional line num>)
                if len(tup) > 2:
                    fh.write("? line %d,\n" % tup[2])
                fh.write("? T: %s\n"%tup[0].rstrip() )
                fh.write("? R: %s\n"%tup[1].rstrip() )
                fh.write("? \n")
                fh.flush()


    def writestatus(self, fh, prefix="!"):
        """ Write a status message to the filehandle """
        passfail={True:"FAILED",False:"passed"}
        punct={True:"!",False:"."}
        msg= "%s %s comparison %s for %s and %s"%(punct[self.failed],
                                               self.type,
                                               passfail[self.failed],
                                               self.reffile,
                                               self.testfile)

        fh.write(msg+'\n')
        fh.flush()

    def cleanup(self):
        if not self.failed:
            os.unlink(self.testfile)

class BinaryComparison(ComparisonClass):
    """ Override methods for binary comparisons """

    def __init__(self,testfile,reffile,**kwds):
        ComparisonClass.__init__(self,testfile,reffile)
        self.type='binary'

    def cleanup(self):
        if not self.failed:
            iraf.imdelete(self.testfile,verify=iraf.no)

class FitsComparison(ComparisonClass):
    """ Override methods for FITS comparisons (image or table) """
    def __init__(self,testfile, reffile, **kwds):
        ComparisonClass.__init__(self,testfile,reffile)
        self.type='fits'
        self.fitsdiff_output='fitsdiff.tmp'
        self.keylist=kwds.get('ignorekeys','')
        self.commlist=kwds.get('ignorecomm','')
        self.maxdiff=float(kwds.get('maxdiff',2.e-7))

    def compare(self,**kwds):
        """Call Fitsdiff with the appropriate things set"""
        status = 0

        #
        try :
            os.unlink(self.fitsdiff_output)
        except OSError :
            pass

        # remove extra spaces from keywords
        self.commlist = self.commlist.strip()
        command = "fitsdiff -c '%s' -k '%s' -d %g -o %s %s %s" % \
                  (
                   self.commlist,   #change
                   self.keylist,    #change
                   self.maxdiff,
                   self.fitsdiff_output,
                   self.reffile,
                   self.testfile)

        try:
            status = os.system (command)

            fd=open(self.fitsdiff_output)
            sys.stdout.write(fd.read())
            fd.close()

            if status == 0 :
                self.failed=False
            else:
                self.failed=True

        except Exception, e:
            raise OSError, "? Error running FITSDIFF: %s"%str(e)

        # This unlink should work, or there is a problem
        os.unlink(self.fitsdiff_output)


    def writeheader(self,fh):
        """ Since the FITS comparison is performed by invoking fitsdiff,
        and its "header" is printed out at the top of the files, this
        is a null function, to avoid duplication. This is not really
        desirable...

        """
        pass

    def writeresults(self,fh):
        # we wrote the results already
        pass

    def cleanup(self):
        if not self.failed:
            iraf.imdelete(self.testfile,verify=iraf.no)

class AsciiComparison(ComparisonClass):
    """Override methods for Ascii Comparison. Ignore keywords include:

       <ignore_date> True </ignore_date>
       <ignore_wstart> nref, mtab </ignore_wstart>
       <ignore_wend> .fits, .dat </ignore_wend>
       <ignore_regexp> r'\sbla.*' </ignore_regexp>
       """

    def __init__(self,testfile,reffile,**kwds):
        ComparisonClass.__init__(self,testfile,reffile)
        self.type='ascii'

        #Set all the ignore flags that are present
        for val in kwds.get('ignore_wstart',[]):
            if self.ignore_raw.has_key('wstart'):
                self.ignore_raw['wstart'].append(val)
            else:
                self.ignore_raw['wstart']=[val]
            pattern=r'\s%s\S*\s'%val
            self.ignore.append(pattern)

        for val in kwds.get('ignore_wend',[]):
            if self.ignore_raw.has_key('wend'):
                self.ignore_raw['wend'].append(val)
            else:
                self.ignore_raw['wend']=[val]
            pattern=r'\s\S*%s\s'%val
            self.ignore.append(pattern)

        for val in kwds.get('ignore_regexp',[]):
            self.ignore_raw['regexp']=val
            self.ignore.append(val)

        if kwds.get('ignore_date',False):
            self.ignore_raw['date']=True
            self.ignore.append(datespec.timestamp)

        #Compile them all into a regular expression
        if len(self.ignore) != 0:
            self.ignorep=re.compile('|'.join(self.ignore))
        else:
            self.ignorep = None

    def bytediff(self):
        """This preserves the old, brute-force kind of comparison"""
        th=open(self.testfile)
        rh=open(self.reffile)

        if (th.readlines() == rh.readlines()):
            self.failed = False
        else:
            self.failed = True

        th.close()
        rh.close()
        return self.failed

    def compare(self):
        """Be smarter, use regexp to ignore keys"""
        try :
            th=open(self.testfile)
        except :
            print "ERROR: cannot open test file ",self.testfile
            print sys.exc_info[1]
            raise

        try :
            rh=open(self.reffile)
        except :
            print "ERROR: cannot open ref file ",self.reffile
            print sys.exc_info[1]
            raise

        test=th.readlines()
        ref=rh.readlines()

        th.close()
        rh.close()


        if len(test) != len(ref):
            #Files of different sizes cannot be identical
            self.diffs=[('%d lines'%len(test),'%d lines'%len(ref))]
            self.failed=True

        else:
            for i in range(len(ref)):
                #This may be slow, but it's clean
                if self.ignorep is not None:
                    tline=self.ignorep.sub(' IGNORE ', test[i])
                    rline=self.ignorep.sub(' IGNORE ', ref[i])
                else:
                    tline=test[i]
                    rline=ref[i]
                if tline != rline:
                    self.diffs.append((tline,rline,i+1))

        if len(self.diffs) != 0:
            self.failed=True
        else:
            self.failed=False

class DifflibComparison(ComparisonClass):
    """Override methods for difflib comparison. No ignore keywords yet. """

    def __init__(self, testfile, reffile, **kwds):
        ComparisonClass.__init__(self, testfile, reffile)
        self.type='diff'

    def writeresults(self, fh):
        """ just dump every line """
        if self.failed:
            fh.write("? unified diff: %s %s\n"%(self.reffile,self.testfile))
            for line in self.diffs:
                fh.write("? "+line+"\n")
                fh.flush()

    def compare(self):
        """ Use difflib to compare lines """
        import difflib
        try :
            th=open(self.testfile)
        except :
            print "ERROR: cannot open test file ",self.testfile
            print sys.exc_info[1]
            raise

        try :
            rh=open(self.reffile)
        except :
            print "ERROR: cannot open ref file ",self.reffile
            print sys.exc_info[1]
            raise

        test=th.readlines()
        ref=rh.readlines()

        th.close()
        rh.close()

        # rstrip as well as use lineterm - sometimes lineterm doesn't work
        self.diffs = [l.rstrip() for l in \
                      difflib.unified_diff(ref, test, lineterm='', n=3)]

        if len(self.diffs) != 0:
            self.failed=True
        else:
            self.failed=False
