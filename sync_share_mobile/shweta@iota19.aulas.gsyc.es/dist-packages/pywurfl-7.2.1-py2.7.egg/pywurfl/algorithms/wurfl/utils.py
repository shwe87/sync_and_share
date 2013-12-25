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

from functools import partial

mobile_browsers = [u"cldc", u"symbian", u"midp", u"j2me", u"mobile",
                   u"wireless", u"palm", u"phone", u"pocket pc",
                   u"pocketpc", u"netfront", u"bolt", u"iris", u"brew",
                   u"openwave", u"windows ce", u"wap2", u"android",
                   u"opera mini", u"opera mobi", u"maemo", u"fennec",
                   u"blazer", u"160x160", u"tablet", u"webos", u"sony",
                   u"nintendo", u"480x640", u"aspen simulator",
                   u"up.browser", u"up.link", u"embider", u"danger hiptop",
                   u"obigo", u"foma"]

desktop_browsers = [u"slcc1", u".net clr", u"trident/4", u"media center pc",
                    u"funwebproducts", u"macintosh", u"wow64", u"aol 9.",
                    u"america online browser", u"googletoolbar"]


def is_typeof_browser(user_agent, browsers=None):
    if browsers is None:
        return False

    user_agent = user_agent.lower()

    for b in browsers:
        if b in user_agent:
            return True
    return False


is_mobile_browser = partial(is_typeof_browser, browsers=mobile_browsers)
is_desktop_browser = partial(is_typeof_browser, browsers=desktop_browsers)


def ordinal_index(target, needle=u" ", ordinal=1, start_index=0):
    index = -1

    working_target = target[start_index+1:]

    if needle in working_target:
        i = 0
        for i, x in enumerate(working_target.split(needle)):
            if ordinal < 1:
                break
            index += len(x)
            ordinal -= 1
        index += (i * len(needle)) + start_index + 1
        index = index - (len(needle) - 1)
    if ordinal != 0:
        index = -1
    return index


def find_or_length(func, user_agent):
    value = func(user_agent)
    if value == -1:
        value = len(user_agent)
    return value


def indexof_or_length(target, needle=u" ", position=1, start_index=0):
    value = ordinal_index(target, needle, position, start_index)
    if value == -1:
        value = len(target)
    return value


first_space = indexof_or_length
first_slash = partial(indexof_or_length, needle=u"/")
second_slash = partial(indexof_or_length, needle=u"/", position=2)
first_semi_colon = partial(indexof_or_length, needle=u";")
third_space = partial(indexof_or_length, position=3)


