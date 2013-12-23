#
# This reads a subset of XML into a hierarchical record structure.
#
import os
import types
import string
import os.path

xml_symbol = ("<", ">", "&")
xml_name = ("&lt;", "&gt;", "&amp;")

# CONFIGURATION: Contains functions to read and write configuration files.
#==============================================================================
# Version 1.1: H.Bushouse 2001/05/04: Initial configured version. Written
#              by B. Simon.
# Version 1.2: H.Bushouse 2002/03/13: Added documentation.
#==============================================================================

#-----------------------------------------------------------------
# Functional interface that calls configuration file classes
#-----------------------------------------------------------------

def regtest_read(file):
    """
    Read a config file and pre-process it to be suitable for the
    regtest system.
    """
    config = read(file)

    # ?
    if len(config) == 1 :
        config = config[0]

    # Setup output file names
    for output in config["output"]:
        if string.upper(output["file"]) == 'STDOUT':
            output["file"] = "STDOUT"
            fname = file + ".stdout"
        else:
            fname = output["file"]
        output["fname"] = fname
    return config


def read (filename):

    # Read and parse config file

    reader = Config_reader (filename)
    return reader.data

def write (filename, config):

    # Write configuration file

    writer = Config_writer (filename, config)

class Config_reader:

    #-----------------------------------------------------------------
    # Create an object to parse a configuration file
    #-----------------------------------------------------------------
    def __init__ (self, filename):

        # Open the file and initialize state

        fd = open (filename, "r")

        self.xcode  = Transcoder (xml_name, xml_symbol)
        self.buffer = string.join (fd.readlines (), "")
        self.length = len (self.buffer)
        self.pos = 0

        fd.close ()

        # Call recursive procedure to parse xml

        self.data = self.get_value ()

    #-----------------------------------------------------------------
    # Parse a tag delimeted section of an xml file
    #-----------------------------------------------------------------
    def get_value (self):

        list = []
        while self.pos < self.length:
            # Mark the start of the search for a tag

            start = self.pos

            # Get tag delimeters

            tag_start = string.find (self.buffer, "<", self.pos)
            if tag_start == -1:
                return self.transmogrify (list)

            #tag_end = string.find (self.buffer, ">", self.pos)
            tag_end = string.find (self.buffer, ">", tag_start)
            if tag_end == -1:
                tag_end = self.length

            self.pos = tag_end + 1
            tag = self.buffer[tag_start+1:tag_end]

            # Parse tag

            if tag[0] == "?":
                # Ignore starting tag

                continue

            elif tag[0] == "!":
                # Ignore declaration tags

                continue

            elif tag[0] == "/":
                # Return contents of list if ending tag found

                if not list:
                    return self.xcode.convert (self.buffer[start:tag_start])
                else:
                    return self.transmogrify (list)

            elif tag[-1] == "/":
                # Treat singleton tag as empty pair

                list.append ((tag[0:-1], ""))

            else:
                # Call recursively for starting tag

                list.append ((tag, self.get_value ()))


        return self.transmogrify (list)

    #-----------------------------------------------------------------
    # Convert a list of pairs into a dictionary or a list
    #-----------------------------------------------------------------
    def transmogrify (self, list):

        # Compute a count of the different names

        count = {}
        for pair in list:
            name = pair[0]
            count[name] = count.get (name, 0) + 1

        if len (count) <= 1:
            # If all names are the same, convert to list

            output = []
            for pair in list:
                value = pair[1]
                output.append (value)

        else:
            # If at least one differs, convert to dictionary

            output = {}
            for pair in list:
                (name, value) = pair
                if count[name] == 1:
                    output[name] = value

                elif output.has_key (name):
                    output[name].append (value)
                else:
                    output[name] = [value]

        return output

class Config_writer:

    #-----------------------------------------------------------------
    # Write a data structure to a configuration file
    #-----------------------------------------------------------------
    def __init__ (self, filename, config):
        self.xcode = Transcoder (xml_symbol, xml_name)
        self.fd = open (filename, "w")
        self.level = -1

        self.fd.write ('<?xml version="1.0" standalone="yes"?>\n')
        self.put_value (config)

        self.fd.write ("\n")
        self.fd.close ()

    #-----------------------------------------------------------------
    # Write a dictionary
    #-----------------------------------------------------------------
    def put_dict (self, dict):

        spacer = " " * (2 * self.level)
        self.fd.write ("\n%s" % (spacer,))

        for name in dict.keys ():
            value = dict[name]

            self.fd.write ("<%s>" % (name,))
            self.put_value (value)
            self.fd.write ("</%s>\n%s" % (name, spacer))

    #-----------------------------------------------------------------
    # Write an array
    #-----------------------------------------------------------------
    def put_array (self, array):

        spacer = " " * (2 * self.level)
        self.fd.write ("\n%s" % (spacer,))

        for value in array:
            self.fd.write ("<val>")
            self.put_value (value)
            self.fd.write ("</val>\n%s" % (spacer,))

    #-----------------------------------------------------------------
    # Write a value in a dictionary or array
    #-----------------------------------------------------------------
    def put_value (self, value):
        self.level = self.level + 1

        if isinstance (value, types.DictType):
            self.put_dict (value)
        elif isinstance (value, types.ListType):
            self.put_array (value)
        else:
            self.fd.write (self.xcode.convert (str (value)))

        self.level = self.level - 1

class Transcoder:

    #-----------------------------------------------------------------
    # A class to convert characters with special meaning for xml
    #-----------------------------------------------------------------
    def __init__ (self, oldval, newval):
        if len (oldval) != len (newval):
            raise IndexError ("In transcoder list lengths do not agree")

        self.oldval = oldval
        self.newval = newval

    def convert (self, str):
        for i in range (len (self.oldval)):
            if string.find (str, self.oldval[i]) >= 0:
                str = string.replace (str, self.oldval[i], self.newval[i])

        return str
