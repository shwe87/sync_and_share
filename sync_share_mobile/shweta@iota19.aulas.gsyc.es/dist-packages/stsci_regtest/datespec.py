"""This module assembles regular expressions for many of the common
date specification formats we find in our data files. It includes
the pieces from which such dates are constructed for easy expansion.

Created by RIJ, Jan 26 2006
Modified for use with the regtest software by VGL, Jun 1 2006

"""
import re

#String specifications of the pieces
Dow = '(Sun|Mon|Tue|Wed|Thu|Fri|Sat)'
Mon ='(Jan|Feb|Mar|Apr|May|Jun' + \
          '|Jul|Aug|Sep|Oct|Nov|Dec)'
#Numeric specifications of the pieces
MN = '(0[1-9]|1[0-2])'
DD = '([ 0][1-9]|[12][0-9]|3[01])'
HH = '([01][0-9]|2[0-3])'
MM = '([0-5][0-9])'
SS = '([0-5][0-9])'
TZ = '(HS|E[SD]T)'
YYYY = '(19|20[0-9][0-9])'
#Specification of separators
sep = '( |:|-)'


#Date specifications constructed from the pieces
Date1 = Dow+sep+Mon+sep+DD+sep+HH+sep+MM+sep+SS+sep+TZ+sep+YYYY
Date2 = Dow+sep+HH+sep+MM+sep+SS+sep+DD+sep+Mon+sep+YYYY
Date3 = Mon+sep+DD+sep+HH+sep+MM
Kdate = '^#K DATE       = '+YYYY+sep+MN+sep+DD
Ktime = '^#K TIME       = '+HH+sep+MM+sep+SS

#Any common datespec
#(Sorry, Kdate/Ktime are not included because it overflows the
#named-group limit of 100)
timestamp = "%s|%s|%s"%(Date1,Date2,Date3)
