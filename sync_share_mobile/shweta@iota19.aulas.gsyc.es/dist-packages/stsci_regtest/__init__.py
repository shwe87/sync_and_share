#
# If you are part of the STScI Science Software Branch:
#
# I took a hatchet to the old regtest code and didn't stop chopping until
# removed everything that wasn't absolutely necessary for pandokia to run
# a regtest.  regtest was already making pandokia-compatible reports, but
# I hacked that up too.
#
# See the development wiki for information about how to use pdkrun instead
# of regress.py to run your tests.
#
#
# If you are not at STScI:
#
# You are not expected to use or understand this code.  It is only here as
# a compatiblity feature for a legacy test system that we use at STScI. 
# Unless you are actively developing IRAF tasks, you should stay away.
#
# If you like the file comparison features, see the module pandokia.helpers.
# We have copied much of the comparison capabilities over there.

