# pywurfl - Wireless Universal Resource File Tools in Python
# Copyright (C) 2006-2011 Armand Lynch
#
# This library is free software; you can redistribute it and/or modify it
# under the terms of the GNU Lesser General Public License as published by the
# Free Software Foundation; either version 2.1 of the License, or (at your
# option) any later version.
#
# This library is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this library; if not, write to the Free Software Foundation, Inc.,
# 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
#
# Armand Lynch <lyncha@users.sourceforge.net>

__doc__ = """
This module contains the supporting classes for the Two Step Analysis user agent
algorithm that is used as the primary way to match user agents with the Java API
for the WURFL.

A description of the way the following source is intended to work can be found
within the source for the original Java API implementation here:
http://sourceforge.net/projects/wurfl/files/WURFL Java API/

The original Java code is GPLd and Copyright (c) WURFL-Pro srl
"""

__author__ = "Armand Lynch <lyncha@users.sourceforge.net>"
__copyright__ = "Copyright 2011, Armand Lynch"
__license__ = "LGPL"
__url__ = "http://celljam.net/"
__version__ = "1.2.1"

import Levenshtein

def ris_match(candidates, needle, tolerance):
	# Searches for the string which has the longest common substring with the
	# given needle. If there is not candidates within given tolerance, it
	# returns the empty string.
    match = u""
    needle_length = len(needle)

    best_distance = -1
    best_match_index = -1
    low = 0
    high = len(candidates) - 1

    # Perfect match: best_distance == needle length()
    # Best match: best_distance >= tolerance
    # First match: best_distance == tolerance

    while (low <= high and best_distance < needle_length):
        mid = (low + high) / 2
        mid_candidate = candidates[mid]

        distance = longest_common_prefix(needle, mid_candidate)

        if distance > best_distance:
            best_match_index = mid
            best_distance = distance

        # Calculate low and high
        if mid_candidate < needle:
            low = mid + 1
        elif mid_candidate > needle:
            high = mid - 1
        else:
            break

    # Candidate is found
    if best_distance >= tolerance:
        match = first_of_best_matches(needle, candidates, best_match_index,
                                      best_distance)

    return match


def longest_common_prefix(t1, t2):
    i = 0
    t = min(len(t1), len(t2))

    for j in xrange(0, t):
        if t1[j] == t2[j]:
            i += 1
        else:
            break
    return i


def first_of_best_matches(needle, candidates, best_match_index, best_distance):
    best_match = candidates[best_match_index]
    for candidate in reversed(candidates[:best_match_index-1]):
        if best_distance == longest_common_prefix(needle, candidate):
            best_match = candidate
        else:
            break
    return best_match


def ld_match(candidates, needle, tolerance):
    needle_length = len(needle)
    user_agent = u""
    matches = [(Levenshtein.distance(needle, c), c) for c in candidates if
               abs(needle_length - len(c)) <= tolerance]
    if matches:
        score, user_agent = min(matches)
        if score > tolerance:
            user_agent = u""
    return user_agent


