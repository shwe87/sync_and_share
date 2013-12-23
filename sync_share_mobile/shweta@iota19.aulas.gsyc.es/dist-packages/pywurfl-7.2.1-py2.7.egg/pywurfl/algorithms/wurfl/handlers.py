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

import re

from pywurfl.algorithms.wurfl.utils import (first_semi_colon, first_slash,
                                            first_space, is_mobile_browser,
                                            second_slash, third_space)
from pywurfl.algorithms.wurfl.utils import indexof_or_length as iol
from pywurfl.algorithms.wurfl import normalizers
from pywurfl.algorithms.wurfl.strategies import ld_match, ris_match


class AbstractMatcher(object):
    user_agent_map = {}

    def __init__(self, normalizer=normalizers.generic):
        self.normalizer = normalizer
        self.known_user_agents = set()

    def add(self, user_agent, wurfl_id):
        self.known_user_agents.add(user_agent)
        self.user_agent_map[user_agent] = wurfl_id

    @property
    def user_agents(self):
        return sorted(self.known_user_agents)

    def can_handle(self, user_agent):
        raise NotImplementedError

    def __call__(self, user_agent):
        normalized_user_agent = self.normalizer(user_agent)
        devid = self.conclusive_match(normalized_user_agent)
        if not devid or devid == u"generic":
            devid = self.recovery_match(normalized_user_agent)
        if not devid or devid == u"generic":
            devid = self.catch_all_recovery_match(user_agent)
        return devid

    def conclusive_match(self, user_agent):
        match = self.find_matching_ua(user_agent)
        #print "%s -> conclusive_match -> %s" % (user_agent, match)
        devid = self.user_agent_map.get(match, u"generic")
        return devid

    def find_matching_ua(self, user_agent):
        tolerance = first_slash(user_agent)
        match = self.ris_matcher(user_agent, tolerance)
        #print "AbstractMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        return u"generic"

    recovery_map = (
        # Openwave
        (u"UP.Browser/7.2", u"opwv_v72_generic"),
        (u"UP.Browser/7", u"opwv_v7_generic"),
        (u"UP.Browser/6.2", u"opwv_v62_generic"),
        (u"UP.Browser/6", u"opwv_v6_generic"),
        (u"UP.Browser/5", u"upgui_generic"),
        (u"UP.Browser/4", u"uptext_generic"),
        (u"UP.Browser/3", u"uptext_generic"),

        # Series 60
        (u"Series60", u"nokia_generic_series60"),

        # Access/Net Front
        (u"NetFront/3.0", u"generic_netfront_ver3"),
        (u"ACS-NF/3.0", u"generic_netfront_ver3"),
        (u"NetFront/3.1", u"generic_netfront_ver3_1"),
        (u"ACS-NF/3.1", u"generic_netfront_ver3_1"),
        (u"NetFront/3.2", u"generic_netfront_ver3_2"),
        (u"ACS-NF/3.2", u"generic_netfront_ver3_2"),
        (u"NetFront/3.3", u"generic_netfront_ver3_3"),
        (u"ACS-NF/3.3", u"generic_netfront_ver3_3"),
        (u"NetFront/3.4", u"generic_netfront_ver3_4"),
        (u"NetFront/3.5", u"generic_netfront_ver3_5"),
        (u"NetFront/4.0", u"generic_netfront_ver4"),
        (u"NetFront/4.1", u"generic_netfront_ver4_1"),

        # Windows CE
        (u"Windows CE", u"generic_ms_mobile_browser_ver1"),

        # web browsers?
        (u"Mozilla/4.0", u"generic_web_browser"),
        (u"Mozilla/5.0", u"generic_web_browser"),
        (u"Mozilla/6.0", u"generic_web_browser"),

        # Generic XHTML
        (u"Mozilla/", u"generic_xhtml"),
        (u"ObigoInternetBrowser/Q03C", u"generic_xhtml"),
        (u"AU-MIC/2", u"generic_xhtml"),
        (u"AU-MIC-", u"generic_xhtml"),
        (u"AU-OBIGO/", u"generic_xhtml"),
        (u"Obigo/Q03", u"generic_xhtml"),
        (u"Obigo/Q04", u"generic_xhtml"),
        (u"ObigoInternetBrowser/2", u"generic_xhtml"),
        (u"Teleca Q03B1", u"generic_xhtml"),

        # Opera Mini
        (u"Opera Mini/1", u"browser_opera_mini_release1"),
        (u"Opera Mini/2", u"browser_opera_mini_release2"),
        (u"Opera Mini/3", u"browser_opera_mini_release3"),
        (u"Opera Mini/4", u"browser_opera_mini_release4"),
        (u"Opera Mini/5", u"browser_opera_mini_release5"),

        # DoCoMo
        (u"DoCoMo", u"docomo_generic_jap_ver1"),
        (u"KDDI", u"docomo_generic_jap_ver1"))

    def catch_all_recovery_match(self, user_agent):

        match = u"generic"
        for partial_agent, wdevice in self.recovery_map:
            if partial_agent in user_agent:
                match = wdevice
                break
        return match

    def ris_matcher(self, user_agent, tolerance):
        return ris_match(self.user_agents, user_agent, tolerance)

    def ld_matcher(self, user_agent, tolerance):
        return ld_match(self.user_agents, user_agent, tolerance)


class AlcatelMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Alcatel") or
                user_agent.startswith(u"ALCATEL"))


class AndroidMatcher(AbstractMatcher):

    androids = {}
    androids[u""] = u"generic_android"
    androids[u"1_5"] = u"generic_android_ver1_5"
    androids[u"1_6"] = u"generic_android_ver1_6"
    androids[u"2_0"] = u"generic_android_ver2"
    androids[u"2_1"] = u"generic_android_ver2_1"
    androids[u"2_2"] = u"generic_android_ver2_2"

    android_os_re = re.compile(r".*Android[\s/](\d)\.(\d)")

    def can_handle(self, user_agent):
        return user_agent.startswith(u"Mozilla") and u"Android" in user_agent

    def find_matching_ua(self, user_agent):
        tolerance = iol(user_agent, u" ",
                        start_index=iol(user_agent, u"Android"))
        match = self.ris_matcher(user_agent, tolerance)
        #print "AndroidMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        if u"Froyo" in user_agent:
            return u"generic_android_ver2_2"
        return self.androids.get(self.android_os_version(user_agent),
                                 u"generic_android")

    def android_os_version(self, user_agent):
        match = self.android_os_re.match(user_agent)
        if match:
            return u"%s_%s" % (match.group(1), match.group(2))


class AOLMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return not is_mobile_browser(user_agent) and u"AOL" in user_agent


class AppleMatcher(AbstractMatcher):
    APPLE_LD_TOLERANCE = 5

    def can_handle(self, user_agent):
        return (u"iPhone" in user_agent or u"iPod" in user_agent or u"iPad" in
                user_agent)

    def find_matching_ua(self, user_agent):
        if user_agent.startswith(u"Apple"):
            tolerance = third_space(user_agent)
        else:
            tolerance = first_semi_colon(user_agent)
        match = self.ris_matcher(user_agent, tolerance)
        #print "AppleMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        if u"iPad" in user_agent:
            return "apple_ipad_ver1"
        if u"iPod" in user_agent:
            return u"apple_ipod_touch_ver1"
        return u"apple_iphone_ver1"


class BenQMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"BENQ") or user_agent.startswith(u"BenQ")


class BlackberryMatcher(AbstractMatcher):
    blackberries = {}
    blackberries[u"2."] = u"blackberry_generic_ver2"
    blackberries[u"3.2"] = u"blackberry_generic_ver3_sub2"
    blackberries[u"3.3"] = u"blackberry_generic_ver3_sub30"
    blackberries[u"3.5"] = u"blackberry_generic_ver3_sub50"
    blackberries[u"3.6"] = u"blackberry_generic_ver3_sub60"
    blackberries[u"3.7"] = u"blackberry_generic_ver3_sub70"
    blackberries[u"4.1"] = u"blackberry_generic_ver4_sub10"
    blackberries[u"4.2"] = u"blackberry_generic_ver4_sub20"
    blackberries[u"4.3"] = u"blackberry_generic_ver4_sub30"
    blackberries[u"4.5"] = u"blackberry_generic_ver4_sub50"
    blackberries[u"4.6"] = u"blackberry_generic_ver4_sub60"
    blackberries[u"4.7"] = u"blackberry_generic_ver4_sub70"
    blackberries[u"4."] = u"blackberry_generic_ver4"
    blackberries[u"5."] = u"blackberry_generic_ver5"
    blackberries[u"6."] = u"blackberry_generic_ver6"

    blackberry_os_re = re.compile(r".*Black[Bb]erry[^/\s]+/(\d\.\d)")

    def can_handle(self, user_agent):
        return u"BlackBerry" in user_agent or u"Blackberry" in user_agent

    def recovery_match(self, user_agent):
        match = u"generic"
        version = self.blackberry_os_version(user_agent)
        if version:
            match = self.blackberries.get(version, u"generic")
            if match == u"generic":
                match = self.blackberries.get(version[:-1], u"generic")
        return match

    def blackberry_os_version(self, user_agent):
        match = self.blackberry_os_re.match(user_agent)
        if match:
            return match.group(1)


class BotMatcher(AbstractMatcher):
    bots = (u"bot", u"crawler", u"spider", u"novarra", u"transcoder",
            u"yahoo! searchmonkey", u"yahoo! slurp", u"feedfetcher-google",
            u"toolbar", u"mowser", u"mediapartners-google", u"azureus",
            u"inquisitor", u"baiduspider", u"baidumobaider", u"indy library",
            u"slurp", u"crawl", u"wget", u"ucweblient", u"snoopy",
            u"mozfdsilla", u"ask jeeves", u"jeeves/teoma", u"mechanize",
            u"http client", u"servicemonitor", u"httpunit", u"hatena",
            u"ichiro")

    BOT_TOLERANCE = 4

    def can_handle(self, user_agent):
        user_agent = user_agent.lower()
        for bot in self.bots:
            if bot in user_agent:
                return True
        return False

    def find_matching_ua(self, user_agent):
        match = self.ld_matcher(user_agent, self.BOT_TOLERANCE)
        return match

    def recovery_match(self, user_agent):
        return u"generic_web_crawler"


class CatchAllMatcher(AbstractMatcher):
    MOZILLA_LD_TOLERANCE = 4

    def can_handle(self, user_agent):
        return True

    def find_matching_ua(self, user_agent):
        if user_agent.startswith(u"Mozilla"):
            if user_agent.startswith(u"Mozilla/4"):
                match = ld_match(self.extract_uas(u"Mozilla/4"), user_agent,
                                 self.MOZILLA_LD_TOLERANCE)
            elif user_agent.startswith(u"Mozilla/5"):
                match = ld_match(self.extract_uas(u"Mozilla/5"), user_agent,
                                 self.MOZILLA_LD_TOLERANCE)
            else:
                match = ld_match(self.extract_uas(u"Mozilla"), user_agent,
                                 self.MOZILLA_LD_TOLERANCE)
        else:
            match = super(CatchAllMatcher, self).find_matching_ua(user_agent)
        #print "CatchAllMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def extract_uas(self, start):
        return (x for x in self.user_agents if x.startswith(start))


class ChromeMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return not is_mobile_browser(user_agent) and u"Chrome" in user_agent


class DoCoMoMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"DoCoMo")

    def find_matching_ua(self, user_agent):
        return u""

    def recovery_match(self, user_agent):
        if user_agent.startswith(u"DoCoMo/2"):
            return u"docomo_generic_jap_ver2"
        return u"docomo_generic_jap_ver1"


class FirefoxMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return not is_mobile_browser(user_agent) and u"Firefox" in user_agent


class GrundigMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Grundig") or
                user_agent.startswith(u"GRUNDIG"))


class HTCMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"HTC") or u"XV6875.1" in user_agent


class KDDIMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return u"KDDI" in user_agent

    def find_matching_ua(self, user_agent):
        if user_agent.startswith(u"KDDI/"):
            tolerance = second_slash(user_agent)
        elif user_agent.startswith(u"KDDI"):
            tolerance = first_slash(user_agent)
        else:
            tolerance = iol(user_agent, ")")
        match = self.ris_matcher(user_agent, tolerance)
        #print "KDDIMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        if u"Opera" in user_agent:
            return u"opera"
        return u"opwv_v62_generic"


class KonquerorMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return not is_mobile_browser(user_agent) and u"Konqueror" in user_agent


class KyoceraMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"kyocera") or
                user_agent.startswith(u"QC-") or
                user_agent.startswith(u"KWC-"))


class LGMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"lg") or u"LG-" in user_agent or
                u"LGE" in user_agent)

    def find_matching_ua(self, user_agent):
        tolerance = iol(user_agent, u"/",
                        start_index=user_agent.upper().index(u"LG"))
        match = self.ris_matcher(user_agent, tolerance)
        return match


class LGUPLUSMatcher(AbstractMatcher):
    lgpluses = (
        (u"generic_lguplus_rexos_facebook_browser",
            (u"Windows NT 5", u"POLARIS")),
        (u"generic_lguplus_rexos_webviewer_browser",
            (u"Windows NT 5",)),
        (u"generic_lguplus_winmo_facebook_browser",
            (u"Windows CE", u"POLARIS")),
        (u"generic_lguplus_android_webkit_browser",
            (u"Android", u"AppleWebKit")))

    def can_handle(self, user_agent):
        return u"lgtelecom" in user_agent or u"LGUPLUS" in user_agent

    def conclusive_match(self, user_agent):
        return u"generic"

    def recovery_match(self, user_agent):
        for wid, searches in self.lgpluses:
            for search in searches:
                if search not in user_agent:
                    break
            else:
                return wid
        return u"generic_lguplus"


class MaemoMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return u"Maemo " in user_agent

    def find_matching_ua(self, user_agent):
        tolerance = first_space(user_agent)
        match = self.ris_matcher(user_agent, tolerance)
        return match


class MitsubishiMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"Mitsu")


class MotorolaMatcher(AbstractMatcher):
    MOTOROLA_TOLERANCE = 5

    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Mot-") or
                u"MOT-" in user_agent or
                u"Motorola" in user_agent)

    def find_matching_ua(self, user_agent):
        if (user_agent.startswith(u"Mot-") or user_agent.startswith(u"MOT-") or
            user_agent.startswith(u"Motorola")):
            match = super(MotorolaMatcher, self).find_matching_ua(user_agent)
        else:
            match = self.ld_matcher(user_agent, self.MOTOROLA_TOLERANCE)
        #print "MotorolaMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        match = u"generic"
        if u"MIB/2.2" in user_agent or u"MIB/BER2.2" in user_agent:
            match = u"mot_mib22_generic"
        return match


class MSIEMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (not is_mobile_browser(user_agent) and
                user_agent.startswith(u"Mozilla") and
                u"MSIE" in user_agent)


class NecMatcher(AbstractMatcher):
    NEC_LD_TOLERANCE = 2

    def can_handle(self, user_agent):
        return user_agent.startswith(u"NEC") or user_agent.startswith(u"KGT")

    def find_matching_ua(self, user_agent):
        if user_agent.startswith(u"NEC"):
            match = super(NecMatcher, self).find_matching_ua(user_agent)
        else:
            match = self.ld_matcher(user_agent, self.NEC_LD_TOLERANCE)
        #print "NecMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match


class NokiaMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return u"Nokia" in user_agent

    def find_matching_ua(self, user_agent):
        tol1 = iol(user_agent, u"/", start_index=user_agent.index(u"Nokia"))
        tol2 = iol(user_agent, u" ", start_index=user_agent.index(u"Nokia"))
        tolerance = tol1 if tol1 < tol2 else tol2
        #print "NokiaMatcher tolerance %s" % tolerance
        match = self.ris_matcher(user_agent, tolerance)
        #print "NokiaMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        match = u"generic"
        if u"Series60" in user_agent:
            match = u"nokia_generic_series60"
        elif u"Series80" in user_agent:
            match = u"nokia_generic_series80"
        return match


class OperaMatcher(AbstractMatcher):
    OPERA_TOLERANCE = 1

    operas = {}
    operas["7"] = u"opera_7"
    operas["8"] = u"opera_8"
    operas["9"] = u"opera_9"
    operas["10"] = u"opera_10"

    opera_re = re.compile(r".*Opera[\s/](\d+).*")

    def can_handle(self, user_agent):
        return not is_mobile_browser(user_agent) and u"Opera" in user_agent

    def find_matching_ua(self, user_agent):
        match = self.ld_matcher(user_agent, self.OPERA_TOLERANCE)
        #print "OperaMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match

    def recovery_match(self, user_agent):
        match = self.opera_re.match(user_agent)
        if match:
            return self.operas.get(match.group(1), u"opera")
        return u"opera"


class OperaMiniMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return u"Opera Mini" in user_agent

    def recovery_match(self, user_agent):
        match = u""
        if u"Opera Mini/1" in user_agent:
            match = u"browser_opera_mini_release1"
        elif u"Opera Mini/2" in user_agent:
            match = u"browser_opera_mini_release2"
        elif u"Opera Mini/3" in user_agent:
            match = u"browser_opera_mini_release3"
        elif u"Opera Mini/4" in user_agent:
            match = u"browser_opera_mini_release4"
        elif u"Opera Mini/5" in user_agent:
            match = u"browser_opera_mini_release5"
        return match


class PanasonicMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"Panasonic")


class PantechMatcher(AbstractMatcher):
    PANTECH_LD_TOLERANCE = 4

    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Pantech") or
                user_agent.startswith(u"PT-") or
                user_agent.startswith(u"PANTECH") or
                user_agent.startswith(u"PG-"))

    def find_matching_ua(self, user_agent):
        if user_agent.startswith(u"Pantech"):
            match = self.ld_matcher(user_agent, self.PANTECH_LD_TOLERANCE)
        else:
            match = super(PantechMatcher, self).find_matching_ua(user_agent)
        #print "PantechMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match


class PhilipsMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Philips") or
                user_agent.startswith(u"PHILIPS"))


class PortalmmmMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"portalmmm")

    def find_matching_ua(self, user_agent):
        return u""


class QtekMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"Qtek")


class SafariMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (not is_mobile_browser(user_agent) and
                user_agent.startswith(u"Mozilla") and
                u"Safari" in user_agent)

    def recovery_match(self, user_agent):
        if u"Macintosh" in user_agent or u"Windows" in user_agent:
            match =  u"generic_web_browser"
        else:
            match = u"generic"
        return match


class SagemMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Sagem") or
                user_agent.startswith(u"SAGEM"))


class SamsungMatcher(AbstractMatcher):
    SAMSUNGS = [u"SEC-", u"SAMSUNG-", u"SCH", u"Samsung", u"SPH", u"SGH",
                u"SAMSUNG/"]

    def can_handle(self, user_agent):
        return (u"Samsung/SGH" in user_agent or
                u"Samsung" in user_agent or
                user_agent.startswith(u"SEC-") or
                user_agent.startswith(u"SAMSUNG") or
                user_agent.startswith(u"SPH") or
                user_agent.startswith(u"SGH") or
                user_agent.startswith(u"SCH"))

    def find_matching_ua(self, user_agent):
        for sams in self.SAMSUNGS:
            if sams in user_agent:
                tol1 = iol(user_agent, u"/", start_index=user_agent.index(sams))
                tol2 = iol(user_agent, u" ", start_index=user_agent.index(sams))
                tolerance = tol1 if tol1 < tol2 else tol2
                break
        else:
            tolerance = len(user_agent)

        match = self.ris_matcher(user_agent, tolerance)
        #print "SamsungMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match


class SanyoMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Sanyo") or
                user_agent.startswith(u"SANYO"))


class SharpMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return (user_agent.startswith(u"Sharp") or
                user_agent.startswith(u"SHARP"))


class SiemensMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"SIE-")


class SonyEricssonMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return u"SonyEricsson" in user_agent

    def find_matching_ua(self, user_agent):
        if user_agent.startswith(u"SonyEricsson"):
            match = super(SonyEricssonMatcher, self).find_matching_ua(user_agent)
        else:
            tolerance = second_slash(user_agent)
            match = self.ris_matcher(user_agent, tolerance)
        #print "SonyEricssonMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match


class SPVMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return u"SPV" in user_agent

    def find_matching_ua(self, user_agent):
        tolerance = iol(user_agent, u";", start_index=iol(user_agent, u"SPV"))
        match = self.ris_matcher(user_agent, tolerance)
        return match


class ToshibaMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"Toshiba")


class VodafoneMatcher(AbstractMatcher):
    def can_handle(self, user_agent):
        return user_agent.startswith(u"Vodafone")

    def find_matching_ua(self, user_agent):
        tolerance = iol(user_agent, u"/", 3)
        match = self.ris_matcher(user_agent, tolerance)
        #print "VodafoneMatcher %s -> f_m_ua -> %s" % (user_agent, match)
        return match


class WindowsCEMatcher(AbstractMatcher):
    WINDOWS_CE_TOLERANCE = 3

    def can_handle(self, user_agent):
        return (u"Mozilla/" in user_agent and (u"Windows CE" in user_agent or
                                               u"WindowsCE" in user_agent or
                                               u"ZuneWP7" in user_agent))

    def find_matching_ua(self, user_agent):
        match = self.ld_matcher(user_agent, self.WINDOWS_CE_TOLERANCE)
        return match

    def recovery_match(self, user_agent):
        return u"generic_ms_mobile_browser_ver1"


handlers = [NokiaMatcher(),
            LGUPLUSMatcher(),
            AndroidMatcher(normalizers.android),
            SonyEricssonMatcher(),
            MotorolaMatcher(),
            BlackberryMatcher(),
            SiemensMatcher(),
            SagemMatcher(),
            SamsungMatcher(),
            PanasonicMatcher(),
            NecMatcher(),
            QtekMatcher(),
            MitsubishiMatcher(),
            PhilipsMatcher(),
            LGMatcher(normalizers.lg),
            AppleMatcher(),
            KyoceraMatcher(),
            AlcatelMatcher(),
            SharpMatcher(),
            SanyoMatcher(),
            BenQMatcher(),
            PantechMatcher(),
            ToshibaMatcher(),
            GrundigMatcher(),
            HTCMatcher(),
            BotMatcher(),
            SPVMatcher(),
            WindowsCEMatcher(),
            PortalmmmMatcher(),
            DoCoMoMatcher(),
            KDDIMatcher(),
            VodafoneMatcher(),
            OperaMiniMatcher(),
            MaemoMatcher(normalizers.maemo),
            ChromeMatcher(normalizers.chrome),
            AOLMatcher(),
            OperaMatcher(),
            KonquerorMatcher(normalizers.konqueror),
            SafariMatcher(normalizers.safari),
            FirefoxMatcher(normalizers.firefox),
            MSIEMatcher(normalizers.msie),
            CatchAllMatcher()]

