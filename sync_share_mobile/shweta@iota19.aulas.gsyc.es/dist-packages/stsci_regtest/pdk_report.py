#
# simple interface for appending to PDK_LOG files
#

import os
import time
import socket
import re

class report(object) :

    def __init__(this, dict = None ) :
        if dict is None :
            dict = { }
        this.dict = dict
        this.pdk_fd = open(os.environ['PDK_LOG'],"a+")

    def set(this, name, value) :
        this.dict[name] = value

    def set_tda(this, name, value) :
        this.dict["tda_"+name] = str(value)

    def set_tra(this, name, value) :
        this.dict["tra_"+name] = str(value)

    def write(this) :
        l = [ ]
        for x in this.dict :
            v=this.dict[x]
            if v.find("\n") >= 0:
                this.pdk_fd.write(x+":\n")
                v = re.sub("\n","\n.",v)
                if v.find("\0") >= 0 :
                    v = re.sub("\0"," ",v)
                this.pdk_fd.write("."+v[:-1]+"\n")
            else :
                this.pdk_fd.write(x+"="+v+"\n")
            l.append(x)

        for x in l :
            del this.dict[x]

    def start_time(this) :
        this.set("start_time",str(int(time.time())))

    def end_time(this) :
        this.set("end_time",str(int(time.time())))

    def end(this) :
        this.pdk_fd.write("END\n")
        this.pdk_fd.flush()

if __name__ == "__main__" :
    import sys
    n = report()
    n.start()
    n.set("test_name","1")
    n.set("status","P")
    n.set_tda("arf","yes")
    n.set_tra("narf","no")
    n.set("log","""This is a log
file with \0
line breaks in
it
""")
    n.end()
    n.write(sys.stdout)
